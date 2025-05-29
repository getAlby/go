import { nwc } from "@getalby/sdk";
import { secp256k1 } from "@noble/curves/secp256k1";
import { extract as hkdf_extract } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { Buffer } from "buffer";
import { clsx, type ClassValue } from "clsx";
import { getPublicKey, nip19 } from "nostr-tools";
import { twMerge } from "tailwind-merge";

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
  return bytesToHex(hkdf_extract(sha256, sharedX, "nip44-v2"));
}

export function getPubkeyFromNWCUrl(nwcUrl: string): string | undefined {
  const nwcOptions = nwc.NWCClient.parseWalletConnectUrl(nwcUrl);
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
