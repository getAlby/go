import { bech32 } from "bech32";
import { Buffer } from "buffer";

// from https://github.com/getAlby/lightning-browser-extension/blob/master/src/common/utils/helpers.ts
export function bech32Decode(str: string, encoding: BufferEncoding = "utf-8") {
  const { words: dataPart } = bech32.decode(str, 2000);
  const requestByteArray = bech32.fromWords(dataPart);
  return Buffer.from(requestByteArray).toString(encoding);
}
