import { secp256k1 } from "@noble/curves/secp256k1";
import { Buffer } from "buffer";

export function computeSharedSecret(pub: string, sk: string): string {
  const sharedSecret = secp256k1.getSharedSecret(sk, "02" + pub);
  const normalizedKey = sharedSecret.slice(1);
  return Buffer.from(normalizedKey).toString("hex");
}
