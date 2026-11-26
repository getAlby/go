import type { Nip47Transaction } from "@getalby/sdk";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";
import { SWRConfig } from "swr";
import { usePodcastingDetails } from "../usePodcastingDetails";

const CASTAMATIC_URL =
  "https://castamatic.com/boost/1B2C3D4E-5F60-4A7B-8C9D-0E1F2A3B4C5D";
const FOUNTAIN_URL =
  "https://fountain.fm/show/2JCkApiUwyBj2eOG7JJI?payment=DBBhBwUise1bcfoHRCC3";
const LONG_MESSAGE =
  "This episode was fantastic, the interview went much deeper than I expected and I learned a lot about value for value music. Keep it up!";
const CASTAMATIC_METADATA = {
  action: "stream",
  app_name: "Castamatic",
  feed_title: "Example Podcast",
  item_title: "Ep 1 - Example Guest",
  position: 5323,
  sender_name: "Alice",
  value_msat_total: 100000,
};

function createTransaction(
  overrides: Partial<Nip47Transaction> = {},
): Nip47Transaction {
  return {
    type: "incoming",
    state: "settled",
    invoice: "lnbc1",
    description: "",
    description_hash: "",
    preimage: "",
    payment_hash: "abc",
    amount: 33000,
    fees_paid: 0,
    settled_at: 1764000000,
    created_at: 1764000000,
    expires_at: 1764003600,
    ...overrides,
  } as Nip47Transaction;
}

function mockHeadResponse(header?: object) {
  return {
    ok: true,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "x-rss-payment" && header
          ? encodeURIComponent(JSON.stringify(header))
          : null,
    },
  } as unknown as Response;
}

function mockJsonResponse(body: unknown) {
  return { ok: true, json: async () => body } as unknown as Response;
}

const PODCAST_GURU_COMMENT =
  "V4V: https://boost.podcastguru.io/boost/Ab3xYz9Q payment::boost";
const PODCAST_GURU_BODY = {
  metadata_payload: JSON.stringify({
    podcast: "Example Podcast",
    episode: "042. An example episode",
    message: "Great show, sent through Strike",
    action: "boost",
    ts: 2,
    value_msat_total: 100000,
    sender_name: "Alice",
    app_name: "PodcastGuru",
  }),
};

function renderPodcastingDetails(
  transaction: Nip47Transaction,
  { retry = false } = {},
) {
  return renderHook(() => usePodcastingDetails(transaction), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0,
          // no "loading slow" timer that outlives the test
          loadingTimeout: 0,
          shouldRetryOnError: retry,
        }}
      >
        {children}
      </SWRConfig>
    ),
  });
}

describe("usePodcastingDetails", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("uses the keysend boostagram without loading metadata", () => {
    const boost = { action: "boost", message: "Hello", podcast: "PC 2.0" };
    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: {
          comment: `rss::payment::boost ${FOUNTAIN_URL} other`,
          tlv_records: [
            {
              type: 7629169,
              value: Buffer.from(JSON.stringify(boost)).toString("hex"),
            },
          ],
        },
      }),
    );

    expect(result.current).toEqual(boost);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("uses rss::payment when the keysend record is not a boostagram", async () => {
    fetchMock.mockResolvedValue(mockHeadResponse(CASTAMATIC_METADATA));

    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: {
          comment: `rss::payment::stream ${CASTAMATIC_URL}`,
          tlv_records: [
            { type: 7629169, value: Buffer.from("true").toString("hex") },
          ],
        },
      }),
    );

    await waitFor(() =>
      expect(result.current?.podcast).toBe("Example Podcast"),
    );
  });

  test("shows the metadata of a stream payment to a lightning address", async () => {
    fetchMock.mockResolvedValue(mockHeadResponse(CASTAMATIC_METADATA));

    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: { comment: `rss::payment::stream ${CASTAMATIC_URL}` },
      }),
    );

    await waitFor(() => expect(result.current?.podcast).toBeDefined());
    expect(result.current).toEqual({
      action: "stream",
      app_name: "Castamatic",
      podcast: "Example Podcast",
      episode: "Ep 1 - Example Guest",
      ts: 5323,
      sender_name: "Alice",
      value_msat_total: 100000,
      message: undefined,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("shows the details from the comment while the metadata loads", async () => {
    let resolveFetch: (response: Response) => void = () => {};
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: {
          comment: `rss::payment::boost ${FOUNTAIN_URL} ${LONG_MESSAGE.slice(0, 30)}`,
        },
      }),
    );

    expect(result.current?.action).toBe("boost");
    expect(result.current?.message).toBe(LONG_MESSAGE.slice(0, 30).trim());
    expect(result.current?.podcast).toBeUndefined();

    await act(async () => {
      resolveFetch(
        mockHeadResponse({ action: "BOOST", message: LONG_MESSAGE }),
      );
    });
    await waitFor(() => expect(result.current?.message).toBe(LONG_MESSAGE));
  });

  test("shows the whole message from the metadata", async () => {
    fetchMock.mockResolvedValue(
      mockHeadResponse({ action: "BOOST", message: LONG_MESSAGE }),
    );

    const { result } = renderPodcastingDetails(
      createTransaction({
        description: `rss::payment::boost ${FOUNTAIN_URL} ${LONG_MESSAGE.slice(0, 30)}`,
      }),
    );

    await waitFor(() => expect(result.current?.message).toBe(LONG_MESSAGE));
    expect(result.current?.action).toBe("boost");
  });

  test("falls back to the comment when the metadata cannot be loaded", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));

    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: {
          comment: `rss::payment::boost ${FOUNTAIN_URL} Great episode!`,
        },
      }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(result.current?.message).toBe("Great episode!");
    expect(result.current?.action).toBe("boost");
    expect(result.current?.podcast).toBeUndefined();
  });

  test("falls back to the comment when the header is missing", async () => {
    fetchMock.mockResolvedValue(mockHeadResponse());

    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: { comment: `rss::payment::stream ${CASTAMATIC_URL}` },
      }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(result.current?.action).toBe("stream");
    expect(result.current?.podcast).toBeUndefined();
  });

  test("tries again once when the metadata is not there yet", async () => {
    jest.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(mockHeadResponse())
      .mockResolvedValueOnce(mockHeadResponse(CASTAMATIC_METADATA));

    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: { comment: `rss::payment::stream ${CASTAMATIC_URL}` },
      }),
      { retry: true },
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(100);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.current?.podcast).toBeUndefined();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(10_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current?.podcast).toBe("Example Podcast");
  });

  test("tries again only once", async () => {
    jest.useFakeTimers();
    fetchMock.mockResolvedValue(mockHeadResponse());

    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: { comment: `rss::payment::stream ${CASTAMATIC_URL}` },
      }),
      { retry: true },
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current?.action).toBe("stream");
  });

  test("shows a Podcast Guru payment once its metadata is loaded", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse(PODCAST_GURU_BODY));

    const { result } = renderPodcastingDetails(
      createTransaction({
        description: PODCAST_GURU_COMMENT,
        metadata: { comment: PODCAST_GURU_COMMENT },
      }),
    );

    expect(result.current).toBeUndefined();
    await waitFor(() => expect(result.current).toBeDefined());
    expect(result.current).toEqual({
      message: "Great show, sent through Strike",
      podcast: "Example Podcast",
      episode: "042. An example episode",
      action: "boost",
      ts: 2,
      value_msat_total: 100000,
      sender_name: "Alice",
      app_name: "PodcastGuru",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://boost.podcastguru.io/boost/Ab3xYz9Q",
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("shows nothing for a Podcast Guru payment that cannot be loaded", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));

    const { result } = renderPodcastingDetails(
      createTransaction({ metadata: { comment: PODCAST_GURU_COMMENT } }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(result.current).toBeUndefined();
  });

  test("does not load metadata from an unknown domain", () => {
    const { result } = renderPodcastingDetails(
      createTransaction({
        metadata: {
          comment: "rss::payment::boost https://example.com/p/abc Hi there",
        },
      }),
    );

    expect(result.current?.message).toBe("Hi there");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns undefined for a normal payment", () => {
    const { result } = renderPodcastingDetails(
      createTransaction({
        description: "Thanks for the coffee",
        metadata: { comment: "Thanks for the coffee" },
      }),
    );

    expect(result.current).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
