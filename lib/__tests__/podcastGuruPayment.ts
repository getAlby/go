import {
  fetchPodcastGuruPayment,
  findPodcastGuruUrl,
  parsePodcastGuruPayment,
} from "../podcastGuruPayment";

// boost sent with Podcast Guru through Strike (no keysend) to a lightning
// address, in the format of a real response (made-up values)
const PODCAST_GURU_COMMENT =
  "V4V: https://boost.podcastguru.io/boost/Ab3xYz9Q payment::boost";
const PODCAST_GURU_URL = "https://boost.podcastguru.io/boost/Ab3xYz9Q";
const PODCAST_GURU_BODY = {
  boost_amount: "100.00000000",
  boost_currency: "sats",
  boost_hash: "Ab3xYz9Q",
  boost_id: 1001,
  created_at: 1767268800,
  episode_id: "0123456789abcdef0123456789abcdef",
  metadata_payload:
    '{"podcast":"Example Podcast","ts":2,"currency":"sats","episode_guid":"00000000-0000-4000-8000-000000000001","app_version":"1.0.40 (135)","message":"Great show, sent through Strike","speed":"1","app_name":"PodcastGuru","value_msat_total":100000,"episode":"042. An example episode","sender_name":"Alice ","action":"boost","boost_link":"https:\\/\\/app.podcastguru.io\\/podcast\\/fedcba9876543210fedcba9876543210\\/episode\\/00112233445566778899aabbccddeeff?t=2","url":"https:\\/\\/example.com\\/feed.xml","sender_id":"00000000-0000-4000-8000-000000000003","guid":"00000000-0000-4000-8000-000000000002","total_amount":100}',
  podcast_id: "imported_-1000000000",
  sender_id: "00000000-0000-4000-8000-000000000003",
  url: "https://boost.podcastguru.io/boost/Ab3xYz9Q",
};

function mockJsonResponse(
  body: unknown,
  { ok = true, url }: { ok?: boolean; url?: string } = {},
) {
  return {
    ok,
    url,
    json: async () => body,
  } as unknown as Response;
}

describe("findPodcastGuruUrl", () => {
  test("finds the url in the comment", () => {
    expect(findPodcastGuruUrl([undefined, PODCAST_GURU_COMMENT])).toBe(
      PODCAST_GURU_URL,
    );
  });

  test("finds the url after a message", () => {
    expect(findPodcastGuruUrl([`Great show! V4V: ${PODCAST_GURU_URL}`])).toBe(
      PODCAST_GURU_URL,
    );
  });

  test.each([
    undefined,
    "Thanks for the coffee",
    "V4V: https://example.com/boost/Ab3xYz9Q",
    "V4V: http://boost.podcastguru.io/boost/Ab3xYz9Q",
    "V4V: https://boost.podcastguru.io.evil.com/boost/Ab3xYz9Q",
    "V4V: https://user@boost.podcastguru.io/boost/Ab3xYz9Q",
    `V4V:${PODCAST_GURU_URL}`,
  ])("ignores %p", (comment) => {
    expect(findPodcastGuruUrl([comment])).toBeUndefined();
  });
});

describe("parsePodcastGuruPayment", () => {
  test("parses the boostagram in metadata_payload", () => {
    expect(parsePodcastGuruPayment(PODCAST_GURU_BODY)).toEqual({
      message: "Great show, sent through Strike",
      podcast: "Example Podcast",
      episode: "042. An example episode",
      action: "boost",
      ts: 2,
      value_msat_total: 100000,
      sender_name: "Alice ",
      app_name: "PodcastGuru",
    });
  });

  test("accepts a number as the episode and rounds the position down", () => {
    const payment = parsePodcastGuruPayment({
      metadata_payload: JSON.stringify({ episode: 15, ts: 61.7 }),
    });
    expect(payment?.episode).toBe(15);
    expect(payment?.ts).toBe(61);
  });

  test.each([
    null,
    "not an object",
    [1, 2],
    {},
    { metadata_payload: 42 },
    { metadata_payload: "not json" },
    { metadata_payload: "[1,2]" },
  ])("returns undefined for %p", (body) => {
    expect(parsePodcastGuruPayment(body)).toBeUndefined();
  });
});

describe("fetchPodcastGuruPayment", () => {
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

  test("loads the metadata with a GET request", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(PODCAST_GURU_BODY, { url: PODCAST_GURU_URL }),
    );

    const payment = await fetchPodcastGuruPayment(PODCAST_GURU_URL);

    expect(fetchMock).toHaveBeenCalledWith(
      PODCAST_GURU_URL,
      expect.objectContaining({ method: "GET" }),
    );
    expect(payment?.podcast).toBe("Example Podcast");
    expect(payment?.message).toBe("Great show, sent through Strike");
  });

  test("does not load a url from another domain", async () => {
    expect(
      await fetchPodcastGuruPayment("https://example.com/boost/Ab3xYz9Q"),
    ).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns undefined when the request fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));
    expect(await fetchPodcastGuruPayment(PODCAST_GURU_URL)).toBeUndefined();
  });

  test("stops reading a body that never ends after the timeout", async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      async (_url: string, { signal }: { signal: AbortSignal }) => ({
        ok: true,
        json: () =>
          new Promise((_resolve, reject) =>
            signal.addEventListener("abort", () =>
              reject(new Error("Aborted")),
            ),
          ),
      }),
    );

    const payment = fetchPodcastGuruPayment(PODCAST_GURU_URL);
    await jest.advanceTimersByTimeAsync(10_000);

    expect(await payment).toBeUndefined();
  });

  test("returns undefined for an error response", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(PODCAST_GURU_BODY, { ok: false }),
    );
    expect(await fetchPodcastGuruPayment(PODCAST_GURU_URL)).toBeUndefined();
  });

  test("ignores metadata after a redirect to another domain", async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse(PODCAST_GURU_BODY, {
        url: "https://example.com/boost/Ab3xYz9Q",
      }),
    );
    expect(await fetchPodcastGuruPayment(PODCAST_GURU_URL)).toBeUndefined();
  });
});
