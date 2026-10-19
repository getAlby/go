import { NWCClient } from "@getalby/sdk/nwc";
import { secp256k1 } from "@noble/curves/secp256k1.js";
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
import i18n from "~/lib/i18n";

// moved to lib/format.ts, re-exported so existing imports keep working
export { formatBitcoinAmount } from "~/lib/format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeSharedSecret(pub: string, sk: string): string {
  const sharedSecret = secp256k1.getSharedSecret(
    hexToBytes(sk),
    hexToBytes("02" + pub),
  );
  const normalizedKey = sharedSecret.slice(1);
  return Buffer.from(normalizedKey).toString("hex");
}

export function getConversationKey(pub: string, sk: string): string {
  const sharedX = secp256k1
    .getSharedSecret(hexToBytes(sk), hexToBytes("02" + pub))
    .subarray(1, 33);
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

export async function copyToClipboard(text: string, successMessage?: string) {
  // Clipboard.setStringAsync always resolves to true in iOS and
  // android so we don't have to add a catch block for errors
  await Clipboard.setStringAsync(text);
  Toast.show({
    type: "success",
    // resolved at call time so that the current language is used
    text1: successMessage ?? i18n.t("common.copiedToClipboard"),
  });
}

export async function readClipboardText() {
  try {
    const text = await Clipboard.getStringAsync();
    if (!text) {
      errorToast(new Error(i18n.t("errors.clipboardEmpty")));
      return undefined;
    }
    return text;
  } catch (error) {
    errorToast(error, i18n.t("errors.clipboardReadFailed"));
    return undefined;
  }
}
