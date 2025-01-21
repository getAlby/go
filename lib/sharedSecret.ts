import { secp256k1 } from "@noble/curves/secp256k1";
import { extract as hkdf_extract } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { Buffer } from "buffer";

export function computeSharedSecret(pub: string, sk: string): string {
  const sharedSecret = secp256k1.getSharedSecret(sk, "02" + pub);
  const normalizedKey = sharedSecret.slice(1);
  return Buffer.from(normalizedKey).toString("hex");
}

export function getConversationKey(pub: string, sk: string): string {
  const sharedX = secp256k1.getSharedSecret(sk, "02" + pub).subarray(1, 33);
  return bytesToHex(hkdf_extract(sha256, sharedX, "nip44-v2"));
}
