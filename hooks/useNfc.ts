import React from "react";
import { Platform } from "react-native";
import NfcManager, {
  Ndef,
  NfcEvents,
  NfcTech,
  TagEvent,
} from "react-native-nfc-manager";

let nfcManagerStarted = false;

async function ensureNfcStarted() {
  if (!nfcManagerStarted) {
    await NfcManager.start();
    nfcManagerStarted = true;
  }
}

/**
 * Decodes NDEF records from a tag and returns the first URI or text value found.
 */
function decodeNdefTag(tag: TagEvent): string | null {
  if (!tag.ndefMessage?.length) {
    return null;
  }
  for (const record of tag.ndefMessage) {
    const tnf = record.tnf;
    const type = record.type;

    console.info(
      "[NFC] record tnf=" +
        tnf +
        " type=" +
        JSON.stringify(type) +
        " payload=" +
        JSON.stringify(record.payload),
    );

    // URI record (TNF=1, type="U" or [0x55])
    if (tnf === Ndef.TNF_WELL_KNOWN) {
      const typeStr =
        typeof type === "string"
          ? type
          : Ndef.util.bytesToString(type as number[]);
      if (typeStr === "U") {
        const uri = Ndef.uri.decodePayload(
          new Uint8Array(record.payload as number[]),
        );
        if (uri) {
          return uri;
        }
      }
      // Text record (TNF=1, type="T" or [0x54])
      if (typeStr === "T") {
        const text = Ndef.text.decodePayload(
          new Uint8Array(record.payload as number[]),
        );
        if (text) {
          return text;
        }
      }
    }

    // Absolute URI (TNF=3): the URI is encoded in the type field, not payload
    if (tnf === Ndef.TNF_ABSOLUTE_URI) {
      const uri =
        typeof type === "string"
          ? type
          : Ndef.util.bytesToString(type as number[]);
      if (uri) {
        return uri;
      }
    }

    // External type (TNF=4): payload contains the data
    if (tnf === Ndef.TNF_EXTERNAL_TYPE) {
      const text =
        typeof record.payload === "string"
          ? record.payload
          : Ndef.util.bytesToString(record.payload as number[]);
      if (text) {
        return text;
      }
    }
  }
  return null;
}

/**
 * Attempts to read a lightning invoice from an HCE (Host Card Emulation) device
 * via IsoDep APDU exchange. Tries the standard NDEF Tag Application AID and
 * common lightning wallet AIDs.
 */
async function readIsoDepTag(): Promise<string | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.IsoDep);

    // Standard NDEF Tag Application AID (NFC Forum Type 4 Tag)
    const ndefAid = [0xd2, 0x76, 0x00, 0x00, 0x85, 0x01, 0x01];
    // SELECT AID APDU: CLA=00 INS=A4 P1=04 P2=00 Lc=len AID Le=00
    const selectNdefApdu = [
      0x00,
      0xa4,
      0x04,
      0x00,
      ndefAid.length,
      ...ndefAid,
      0x00,
    ];

    console.info("[NFC] Sending SELECT NDEF AID APDU");
    const selectResponse =
      await NfcManager.isoDepHandler.transceive(selectNdefApdu);
    console.info("[NFC] SELECT response=" + JSON.stringify(selectResponse));

    // Check SW1 SW2 = 90 00 (success)
    const sw1 = selectResponse[selectResponse.length - 2];
    const sw2 = selectResponse[selectResponse.length - 1];

    if (sw1 === 0x90 && sw2 === 0x00) {
      // SELECT Capability Container (CC) file: file ID 0xE103
      const selectCcApdu = [0x00, 0xa4, 0x00, 0x0c, 0x02, 0xe1, 0x03];
      await NfcManager.isoDepHandler.transceive(selectCcApdu);

      // READ BINARY CC file (15 bytes)
      const readCcApdu = [0x00, 0xb0, 0x00, 0x00, 0x0f];
      const ccData = await NfcManager.isoDepHandler.transceive(readCcApdu);
      console.info("[NFC] CC data=" + JSON.stringify(ccData));

      // CC[9..10] = NDEF file ID, CC[11..12] = NDEF file size
      const ndefFileId = [ccData[9], ccData[10]];
      const ndefFileSize = (ccData[11] << 8) | ccData[12];
      console.info(
        "[NFC] NDEF file ID=" +
          JSON.stringify(ndefFileId) +
          " size=" +
          ndefFileSize,
      );

      // SELECT NDEF file
      const selectNdefFileApdu = [0x00, 0xa4, 0x00, 0x0c, 0x02, ...ndefFileId];
      await NfcManager.isoDepHandler.transceive(selectNdefFileApdu);

      // READ BINARY NDEF file (first 2 bytes = NDEF length, then NDEF message)
      const readNdefLenApdu = [0x00, 0xb0, 0x00, 0x00, 0x02];
      const ndefLenData =
        await NfcManager.isoDepHandler.transceive(readNdefLenApdu);
      const ndefLen = (ndefLenData[0] << 8) | ndefLenData[1];
      console.info("[NFC] NDEF message length=" + ndefLen);

      if (ndefLen > 0 && ndefLen <= ndefFileSize) {
        // READ BINARY NDEF message
        const readNdefApdu = [0x00, 0xb0, 0x00, 0x02, Math.min(ndefLen, 0xfe)];
        const ndefData =
          await NfcManager.isoDepHandler.transceive(readNdefApdu);
        console.info("[NFC] NDEF data=" + JSON.stringify(ndefData));

        // Parse NDEF message manually (strip SW bytes at end)
        const ndefBytes = ndefData.slice(0, ndefData.length - 2);
        const decoded = Ndef.decodeMessage(ndefBytes);
        if (decoded?.length) {
          // Wrap in a fake TagEvent to reuse decodeNdefTag
          const fakeTag = { ndefMessage: decoded } as unknown as TagEvent;
          const result = decodeNdefTag(fakeTag);
          if (result) {
            return result;
          }
        }
      }
    }
  } catch (e) {
    console.info("[NFC] IsoDep APDU error=" + String(e));
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
  return null;
}

/**
 * Reads an NDEF text/URI record from an NFC tag and returns the decoded string.
 * Handles both passive NFC tags and phone-to-phone HCE (Android Beam / SNEP).
 * Returns null if the user cancels or no supported record is found.
 *
 * Returns a tuple of [promise, cancel] so callers can cancel the scan.
 */
export function readNfcTag(): [Promise<string | null>, () => void] {
  let settled = false;
  let resolveRef: ((value: string | null) => void) | null = null;

  function cleanup() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => {});
  }

  const promise = new Promise<string | null>((resolve) => {
    resolveRef = resolve;

    ensureNfcStarted()
      .then(() => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
          if (settled) {
            return;
          }
          console.info("[NFC] DiscoverTag event tag=" + JSON.stringify(tag));

          // If the tag has an NDEF message, decode it directly
          if (tag.ndefMessage?.length) {
            settled = true;
            const result = decodeNdefTag(tag);
            cleanup();
            resolve(result);
            return;
          }

          // If the tag supports IsoDep (HCE phone), try APDU exchange
          const techTypes = tag.techTypes ?? [];
          if (techTypes.includes("android.nfc.tech.IsoDep")) {
            // Don't mark settled yet — readIsoDepTag will settle it
            // Do NOT call cleanup() here — unregistering the tag event before
            // requestTechnology() causes the tag connection to be lost.
            // readIsoDepTag's own finally block calls cancelTechnologyRequest,
            // and we call cleanup() after it resolves.
            readIsoDepTag().then((result) => {
              if (settled) {
                return;
              }
              settled = true;
              cleanup();
              resolve(result);
            });
            return;
          }

          // No usable data
          settled = true;
          cleanup();
          resolve(null);
        });

        return NfcManager.registerTagEvent();
      })
      .catch((e: unknown) => {
        if (settled) {
          return;
        }
        settled = true;
        console.info("[NFC] registerTagEvent error=" + String(e));
        cleanup();
        resolve(null);
      });
  });

  function cancel() {
    if (settled) {
      return;
    }
    settled = true;
    cleanup();
    resolveRef?.(null);
  }

  return [promise, cancel];
}

/**
 * Writes a lightning invoice or lightning address as an NDEF URI record to an
 * NFC tag. The value should be a bare invoice / address (no scheme prefix) or
 * already include a `lightning:` prefix.
 */
export async function writeNfcTag(value: string): Promise<void> {
  await ensureNfcStarted();
  // Normalise: always write with lightning: scheme so any NFC-aware app can
  // handle it, but keep bitcoin: and lnurl URIs as-is.
  let uri = value;
  if (
    !uri.startsWith("lightning:") &&
    !uri.startsWith("bitcoin:") &&
    !uri.startsWith("lnurl") &&
    !uri.startsWith("LNURL")
  ) {
    uri = `lightning:${value}`;
  }

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const bytes = Ndef.encodeMessage([Ndef.uriRecord(uri)]);
    if (bytes) {
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
    }
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

/**
 * Returns whether NFC is supported and enabled on this device.
 */
export async function isNfcSupported(): Promise<boolean> {
  try {
    const supported = await NfcManager.isSupported();
    if (!supported) {
      return false;
    }
    await ensureNfcStarted();
    if (Platform.OS === "android") {
      return NfcManager.isEnabled();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Hook that exposes NFC availability and helpers.
 */
export function useNfc() {
  const [nfcAvailable, setNfcAvailable] = React.useState<boolean>(false);

  React.useEffect(() => {
    isNfcSupported()
      .then(setNfcAvailable)
      .catch(() => setNfcAvailable(false));
  }, []);

  return { nfcAvailable, readNfcTag, writeNfcTag };
}
