// Podcasting 2.0 RSS payment metadata, used by podcast apps that pay to a
// lightning address instead of sending a keysend boostagram.
// https://github.com/Podcastindex-org/podcast-namespace/blob/main/docs/examples/value/metadata.md
//
// The payment comment is `rss::payment::{action} {url} {truncated message}`
// and the url returns the full metadata in the `x-rss-payment` response
// header as a URI encoded JSON string.

import type { PodcastingDetails } from "~/lib/boostagram";
import {
  fetchMetadata,
  isAllowedMetadataUrl,
  isObject,
  toOptionalNumber,
  toOptionalSeconds,
  toOptionalString,
} from "~/lib/paymentMetadata";

// Anyone can send a payment with any comment, so the metadata is only loaded
// from known podcast apps (same list as Helipad)
export const RSS_PAYMENT_METADATA_DOMAINS = [
  "fountain.fm",
  "castamatic.com",
  "tardbox.com",
  "podfans.fm",
  "truefans.fm",
  "v4vmusic.com",
];

const RSS_PAYMENT_HEADER = "x-rss-payment";
const RSS_PAYMENT_COMMENT_REGEX =
  /^rss::payment::(\w+)\s+(https:\/\/\S+)(?:\s+([\s\S]*))?$/;

export type RssPaymentComment = {
  action: string;
  url: string;
  message?: string;
};

export type RssPayment = {
  action?: string;
  message?: string;
  app_name?: string;
  sender_name?: string;
  feed_title?: string;
  item_title?: string;
  position?: number;
  value_msat_total?: number;
};

export function parseRssPaymentComment(
  text?: string,
): RssPaymentComment | undefined {
  const match = text?.trim().match(RSS_PAYMENT_COMMENT_REGEX);
  if (!match) {
    return undefined;
  }

  const [, action, url, message] = match;
  return {
    action: action.toLowerCase(),
    url,
    message: cleanCommentMessage(message),
  };
}

function cleanCommentMessage(message?: string): string | undefined {
  const cleanMessage = message
    ?.trim()
    // some apps put a dash between the url and the message
    .replace(/^[-–—]\s+/, "");
  // some apps send the text "undefined" when there is no message
  if (!cleanMessage || cleanMessage === "undefined") {
    return undefined;
  }
  return cleanMessage;
}

export function findRssPaymentComment(
  texts: (string | undefined)[],
): RssPaymentComment | undefined {
  for (const text of texts) {
    const comment = parseRssPaymentComment(text);
    if (comment) {
      return comment;
    }
  }
  return undefined;
}

export function isAllowedRssPaymentUrl(url: string): boolean {
  return isAllowedMetadataUrl(url, RSS_PAYMENT_METADATA_DOMAINS);
}

export function parseRssPaymentHeader(
  header: string | null | undefined,
): RssPayment | undefined {
  if (!header) {
    return undefined;
  }

  let json: unknown;
  try {
    json = JSON.parse(decodeURIComponent(header));
  } catch {
    return undefined;
  }

  if (!isObject(json)) {
    return undefined;
  }

  return {
    action: toOptionalString(json.action)?.toLowerCase(),
    message: toOptionalString(json.message),
    app_name: toOptionalString(json.app_name),
    sender_name: toOptionalString(json.sender_name),
    feed_title: toOptionalString(json.feed_title),
    item_title: toOptionalString(json.item_title),
    position: toOptionalSeconds(json.position),
    value_msat_total: toOptionalNumber(json.value_msat_total),
  };
}

export async function fetchRssPayment(
  url: string,
): Promise<RssPayment | undefined> {
  try {
    return await fetchMetadata(
      url,
      "HEAD",
      RSS_PAYMENT_METADATA_DOMAINS,
      (response) =>
        parseRssPaymentHeader(response.headers.get(RSS_PAYMENT_HEADER)),
    );
  } catch (error) {
    console.error("Failed to load RSS payment metadata", error);
    return undefined;
  }
}

export function getRssPaymentPodcastingDetails(
  comment: RssPaymentComment,
  payment?: RssPayment,
): PodcastingDetails {
  return {
    // the comment only holds a truncated message
    message: payment?.message ?? comment.message,
    podcast: payment?.feed_title,
    episode: payment?.item_title,
    action: payment?.action || comment.action,
    ts: payment?.position,
    value_msat_total: payment?.value_msat_total,
    sender_name: payment?.sender_name,
    app_name: payment?.app_name,
  };
}
