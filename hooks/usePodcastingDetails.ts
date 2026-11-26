import type { Nip47Transaction } from "@getalby/sdk";
import React from "react";
import useSWR, { type SWRConfiguration } from "swr";
import { getBoostagram, type PodcastingDetails } from "~/lib/boostagram";
import {
  fetchPodcastGuruPayment,
  findPodcastGuruUrl,
} from "~/lib/podcastGuruPayment";
import {
  fetchRssPayment,
  findRssPaymentComment,
  getRssPaymentPodcastingDetails,
  isAllowedRssPaymentUrl,
} from "~/lib/rssPayment";

const PAYMENT_METADATA_RETRY_DELAY = 10_000;

const paymentMetadataSWROptions: SWRConfiguration = {
  // the metadata of a payment does not change
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  // retry once, like Helipad
  onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
    if (retryCount > 1) {
      return;
    }
    setTimeout(() => revalidate({ retryCount }), PAYMENT_METADATA_RETRY_DELAY);
  },
};

function throwIfNotFound<T>(load: (url: string) => Promise<T | undefined>) {
  return async ([, url]: [string, string]): Promise<T> => {
    const metadata = await load(url);
    if (!metadata) {
      // the app may not have saved the metadata yet when the payment arrives
      throw new Error("Payment metadata not found");
    }
    return metadata;
  };
}

const fetchRssPaymentOrThrow = throwIfNotFound(fetchRssPayment);
const fetchPodcastGuruPaymentOrThrow = throwIfNotFound(fetchPodcastGuruPayment);

export function usePodcastingDetails(
  transaction: Nip47Transaction,
): PodcastingDetails | undefined {
  const boostagram = React.useMemo(
    () => getBoostagram(transaction.metadata),
    [transaction.metadata],
  );

  const comments = React.useMemo(
    () => [transaction.metadata?.comment, transaction.description],
    [transaction.metadata?.comment, transaction.description],
  );

  const rssPaymentComment = React.useMemo(
    () => (boostagram ? undefined : findRssPaymentComment(comments)),
    [boostagram, comments],
  );

  const podcastGuruUrl = React.useMemo(
    () =>
      boostagram || rssPaymentComment
        ? undefined
        : findPodcastGuruUrl(comments),
    [boostagram, rssPaymentComment, comments],
  );

  const rssPaymentUrl =
    rssPaymentComment && isAllowedRssPaymentUrl(rssPaymentComment.url)
      ? rssPaymentComment.url
      : undefined;

  const { data: rssPayment } = useSWR(
    rssPaymentUrl ? ["rssPayment", rssPaymentUrl] : null,
    fetchRssPaymentOrThrow,
    paymentMetadataSWROptions,
  );

  const { data: podcastGuruPayment } = useSWR(
    podcastGuruUrl ? ["podcastGuruPayment", podcastGuruUrl] : null,
    fetchPodcastGuruPaymentOrThrow,
    paymentMetadataSWROptions,
  );

  if (boostagram) {
    return boostagram;
  }
  if (rssPaymentComment) {
    // show the details from the comment until the metadata is loaded
    return getRssPaymentPodcastingDetails(rssPaymentComment, rssPayment);
  }
  // the Podcast Guru comment holds no details, so they show once loaded
  return podcastGuruPayment;
}
