import { NWCClient } from "@getalby/sdk/nwc";
import { secp256k1 } from "@noble/curves/secp256k1";
import { extract as hkdf_extract } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";
import { Buffer } from "buffer";
import { clsx, type ClassValue } from "clsx";
import * as Clipboard from "expo-clipboard";
import { getPublicKey, nip19 } from "nostr-tools";
import Toast from "react-native-toast-message";
import { twMerge } from "tailwind-merge";
import { errorToast } from "~/lib/errorToast";
import { BitcoinDisplayFormat } from "~/lib/state/appStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeSharedSecret(pub: string, sk: string): string {
  const sharedSecret = secp256k1.getSharedSecret(sk, "02" + pub);
  const normalizedKey = sharedSecret.slice(1);
  return Buffer.from(normalizedKey).toString("hex");
}

export function getConversationKey(pub: string, sk: string): string {
  const sharedX = secp256k1.getSharedSecret(sk, "02" + pub).subarray(1, 33);
  return bytesToHex(hkdf_extract(sha256, sharedX, utf8ToBytes("nip44-v2")));
}

export function getPubkeyFromNWCUrl(nwcUrl: string): string | undefined {
  const nwcOptions = NWCClient.parseWalletConnectUrl(nwcUrl);
  if (nwcOptions.secret) {
    return getPublicKey(hexToBytes(nwcOptions.secret));
  }
}

export function safeNpubEncode(hex: string): string | undefined {
  try {
    return nip19.npubEncode(hex);
  } catch {
    return undefined;
  }
}

export async function copyToClipboard(
  text: string,
  successMessage = "Copied to clipboard",
) {
  // Clipboard.setStringAsync always resolves to true in iOS and
  // android so we don't have to add a catch block for errors
  await Clipboard.setStringAsync(text);
  Toast.show({
    type: "success",
    text1: successMessage,
  });
}

export async function readClipboardText() {
  try {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      errorToast(new Error("Your clipboard is empty."));
      return undefined;
    }
    return text;
  } catch (error) {
    errorToast(error, "Failed to read clipboard");
    return undefined;
  }
}

export function formatBitcoinAmount(
  amount: number,
  displayFormat: BitcoinDisplayFormat = "bip177",
  showSymbol: boolean = true,
): string {
  const formattedNumber = new Intl.NumberFormat().format(+amount);

  if (!showSymbol) {
    return formattedNumber;
  }

  if (displayFormat === "bip177") {
    return `₿ ${formattedNumber}`;
  } else {
    return `${formattedNumber} ${amount === 1 ? "sat" : "sats"}`;
  }
}
