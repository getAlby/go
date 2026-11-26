import type { Nip47TransactionMetadata } from "@getalby/sdk";
import { getBoostagram } from "../boostagram";

const boost = {
  action: "boost",
  app_name: "Fountain",
  podcast: "Podcasting 2.0",
  episode: "Episode 241",
  message: "Great show!",
  sender_name: "oscar",
  ts: 120,
  value_msat_total: 100000,
};

function toHex(text: string) {
  return Buffer.from(text, "utf8").toString("hex");
}

describe("getBoostagram", () => {
  test("parses the keysend boostagram TLV record", () => {
    const metadata = {
      tlv_records: [
        { type: 7629169, value: toHex(JSON.stringify(boost)) },
        { type: 7629175, value: toHex("123") },
      ],
    } as Nip47TransactionMetadata;

    expect(getBoostagram(metadata)).toEqual(boost);
  });

  test("returns undefined without a boostagram TLV record", () => {
    expect(getBoostagram(undefined)).toBeUndefined();
    expect(getBoostagram({ comment: "hi" })).toBeUndefined();
    expect(
      getBoostagram({
        tlv_records: [{ type: 7629175, value: toHex("123") }],
      } as Nip47TransactionMetadata),
    ).toBeUndefined();
  });

  test("returns undefined for an invalid TLV record", () => {
    expect(
      getBoostagram({
        tlv_records: [{ type: 7629169, value: toHex("not json") }],
      } as Nip47TransactionMetadata),
    ).toBeUndefined();
  });
});
