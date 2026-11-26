import type { Nip47TransactionMetadata } from "@getalby/sdk";
import { hexToBytes } from "@noble/hashes/utils.js";

type TLVRecord = {
  type: number;
  value: string;
};

export type Boostagram = {
  app_name: string;
  name: string;
  podcast: string;
  url: string;
  episode?: string | number;
  itemID?: string | number;
  ts?: string | number;
  message?: string;
  sender_id: string | number;
  sender_name: string;
  time: string;
  action: string;
  value_msat_total: number;
};

// the fields shown in the podcasting section of a transaction
export type PodcastingDetails = Partial<
  Pick<
    Boostagram,
    | "message"
    | "podcast"
    | "episode"
    | "action"
    | "ts"
    | "value_msat_total"
    | "sender_name"
    | "app_name"
  >
>;

export function getBoostagram(
  metadata?: Nip47TransactionMetadata,
): Boostagram | undefined {
  try {
    const tlvRecord = (metadata?.tlv_records as TLVRecord[])?.find(
      (record) => record.type === 7629169,
    );

    if (!tlvRecord) {
      return undefined;
    }

    return JSON.parse(
      new TextDecoder().decode(hexToBytes(tlvRecord.value)),
    ) as Boostagram;
  } catch {
    return undefined;
  }
}
