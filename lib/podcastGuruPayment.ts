// Podcast Guru pays a lightning address that does not support keysend with
// the comment `V4V: https://boost.podcastguru.io/boost/{id} payment::{action}`.
// The url returns JSON with the boostagram as a JSON string in
// `metadata_payload` (Helipad reads it the same way).

import type { PodcastingDetails } from "~/lib/boostagram";
import {
  fetchMetadata,
  isAllowedMetadataUrl,
  isObject,
  toOptionalNumber,
  toOptionalSeconds,
  toOptionalString,
} from "~/lib/paymentMetadata";

const PODCAST_GURU_DOMAINS = ["boost.podcastguru.io"];
const PODCAST_GURU_COMMENT_REGEX = /(?:^|\s)V4V:\s+(https:\/\/\S+)/;

export function isAllowedPodcastGuruUrl(url: string): boolean {
  return isAllowedMetadataUrl(url, PODCAST_GURU_DOMAINS);
}

export function findPodcastGuruUrl(
  texts: (string | undefined)[],
): string | undefined {
  for (const text of texts) {
    const url = text?.match(PODCAST_GURU_COMMENT_REGEX)?.[1];
    if (url && isAllowedPodcastGuruUrl(url)) {
      return url;
    }
  }
  return undefined;
}

export function parsePodcastGuruPayment(
  body: unknown,
): PodcastingDetails | undefined {
  if (!isObject(body) || typeof body.metadata_payload !== "string") {
    return undefined;
  }

  let boost: unknown;
  try {
    boost = JSON.parse(body.metadata_payload);
  } catch {
    return undefined;
  }

  if (!isObject(boost)) {
    return undefined;
  }

  return {
    message: toOptionalString(boost.message),
    podcast: toOptionalString(boost.podcast),
    episode: toOptionalString(boost.episode) ?? toOptionalNumber(boost.episode),
    action: toOptionalString(boost.action)?.toLowerCase(),
    ts: toOptionalSeconds(boost.ts),
    value_msat_total: toOptionalNumber(boost.value_msat_total),
    sender_name: toOptionalString(boost.sender_name),
    app_name: toOptionalString(boost.app_name),
  };
}

export async function fetchPodcastGuruPayment(
  url: string,
): Promise<PodcastingDetails | undefined> {
  try {
    return await fetchMetadata(
      url,
      "GET",
      PODCAST_GURU_DOMAINS,
      async (response) => parsePodcastGuruPayment(await response.json()),
    );
  } catch (error) {
    console.error("Failed to load Podcast Guru payment metadata", error);
    return undefined;
  }
}
