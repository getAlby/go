import {
  fetchRssPayment,
  findRssPaymentComment,
  getRssPaymentPodcastingDetails,
  isAllowedRssPaymentUrl,
  parseRssPaymentComment,
  parseRssPaymentHeader,
} from "../rssPayment";

// stream payment sent with Castamatic to a lightning address (made-up values)
const CASTAMATIC_COMMENT =
  "rss::payment::stream https://castamatic.com/boost/1B2C3D4E-5F60-4A7B-8C9D-0E1F2A3B4C5D";
const CASTAMATIC_URL =
  "https://castamatic.com/boost/1B2C3D4E-5F60-4A7B-8C9D-0E1F2A3B4C5D";
const CASTAMATIC_HEADER =
  "%7B%22action%22:%22stream%22,%22app_name%22:%22Castamatic%22,%22app_version%22:%2214.0.5%22,%22feed_guid%22:%225a1b2c3d-4e5f-5a6b-8c7d-9e0f1a2b3c4d%22,%22feed_title%22:%22Example%20Podcast%22,%22group%22:%222C3D4E5F-6A7B-4C8D-9E0F-1A2B3C4D5E6F%22,%22item_guid%22:%223d4e5f6a-7b8c-4d9e-8f0a-1b2c3d4e5f6a%22,%22item_title%22:%22Ep%201%20-%20Example%20Guest%22,%22position%22:5323,%22recipient_address%22:%22podcaster@getalby.com%22,%22recipient_name%22:%22ExamplePodcast%22,%22sender_name%22:%22Alice%22,%22split%22:35,%22timestamp%22:%222026-01-01T12:00:00.000Z%22,%22value_msat%22:33000,%22value_msat_total%22:100000%7D";

// example boost from the rss::payment spec, header as returned by fountain.fm
const FOUNTAIN_URL =
  "https://fountain.fm/show/2JCkApiUwyBj2eOG7JJI?payment=DBBhBwUise1bcfoHRCC3";
const FOUNTAIN_HEADER =
  "%7B%22id%22%3A%22DBBhBwUise1bcfoHRCC3%22%2C%22action%22%3A%22BOOST%22%2C%22split%22%3A0.25%2C%22group%22%3A%22EoL2Qp52RMOSiF1rmGGs%22%2C%22message%22%3A%22Test%202%22%2C%22link%22%3A%22https%3A%2F%2Ffountain.fm%2Fshow%2F2JCkApiUwyBj2eOG7JJI%3Fpayment%3DDBBhBwUise1bcfoHRCC3%22%2C%22app_name%22%3A%22Fountain%22%2C%22sender_id%22%3A%22IIaS9X2JuH75yvrRcFoL%22%2C%22sender_name%22%3A%22oscar%40fountain.fm%22%2C%22sender_npub%22%3A%22npub1nl9s4es5mtvcavayz3cj8ts9yfddr0pgka2rqq36nc3gqg5zwh3s8df8nk%22%2C%22recipient_address%22%3A%22merryoscar%40primal.net%22%2C%22value_msat%22%3A25000%2C%22value_usd%22%3A0.025797%2C%22value_msat_total%22%3A100000%2C%22timestamp%22%3A%222025-11-05T15%3A09%3A10.174Z%22%2C%22feed_guid%22%3A%22824e153c-2137-50ec-8813-461526a7574e%22%2C%22feed_title%22%3A%22Blue%20Production%20Show%22%2C%22item_guid%22%3Anull%2C%22item_title%22%3Anull%2C%22publisher_guid%22%3Anull%2C%22publisher_title%22%3Anull%2C%22remote_item_guid%22%3Anull%2C%22remote_feed_guid%22%3Anull%2C%22remote_publisher_guid%22%3Anull%7D";

// comments as the apps send them (made-up ids): a Fountain stream without a
// message, and a BoostMeBitch boost through BoostBox (tardbox.com) that puts a
// dash before the message
const FOUNTAIN_TRACK_COMMENT =
  "rss::payment::stream https://fountain.fm/track/aB3dE5gH7jK9mN1pQ2rS?payment=tU4vW6xY8zA0bC2dE4fG undefined";
const TARDBOX_COMMENT =
  "rss::payment::boost https://tardbox.com/boost/01HZX4K7Q2M9V3T8B6N5C1D0EF — loved this episode";

const LONG_MESSAGE =
  "This episode was fantastic, the interview went much deeper than I expected and I learned a lot about value for value music. Keep it up!";

function encodeRssPaymentHeader(payment: object) {
  return encodeURIComponent(JSON.stringify(payment));
}

function mockHeadResponse(
  headers: Record<string, string>,
  { ok = true, url }: { ok?: boolean; url?: string } = {},
) {
  return {
    ok,
    url,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as Response;
}

describe("parseRssPaymentComment", () => {
  test("parses a stream payment without a message", () => {
    expect(parseRssPaymentComment(CASTAMATIC_COMMENT)).toEqual({
      action: "stream",
      url: CASTAMATIC_URL,
      message: undefined,
    });
  });

  test("parses a boost with a truncated message", () => {
    expect(
      parseRssPaymentComment(
        `rss::payment::boost ${FOUNTAIN_URL} Great episode! Loved the part about`,
      ),
    ).toEqual({
      action: "boost",
      url: FOUNTAIN_URL,
      message: "Great episode! Loved the part about",
    });
  });

  test("lowercases the action", () => {
    expect(
      parseRssPaymentComment(`rss::payment::BOOST ${FOUNTAIN_URL} hi`)?.action,
    ).toBe("boost");
  });

  test("keeps a multi-line message", () => {
    expect(
      parseRssPaymentComment(
        `rss::payment::boost ${FOUNTAIN_URL} line 1\nline 2`,
      )?.message,
    ).toBe("line 1\nline 2");
  });

  test("drops the text undefined that some apps send without a message", () => {
    expect(parseRssPaymentComment(FOUNTAIN_TRACK_COMMENT)).toEqual({
      action: "stream",
      url: "https://fountain.fm/track/aB3dE5gH7jK9mN1pQ2rS?payment=tU4vW6xY8zA0bC2dE4fG",
      message: undefined,
    });
  });

  test.each(["- ", "– "])(
    "removes the separator %p before the message",
    (dash) => {
      expect(
        parseRssPaymentComment(`rss::payment::boost ${FOUNTAIN_URL} ${dash}Hi`)
          ?.message,
      ).toBe("Hi");
    },
  );

  test("removes the dash before the message", () => {
    expect(parseRssPaymentComment(TARDBOX_COMMENT)).toEqual({
      action: "boost",
      url: "https://tardbox.com/boost/01HZX4K7Q2M9V3T8B6N5C1D0EF",
      message: "loved this episode",
    });
  });

  test.each([
    undefined,
    "",
    "Thanks for the coffee",
    "rss::payment::boost",
    "rss::payment::boost not-a-url message",
    `rss::payment::boost http://fountain.fm/p/abc`,
    `Payment for rss::payment::boost ${FOUNTAIN_URL}`,
  ])("ignores %p", (comment) => {
    expect(parseRssPaymentComment(comment)).toBeUndefined();
  });

  test("findRssPaymentComment returns the first rss::payment text", () => {
    expect(
      findRssPaymentComment([undefined, "not a payment", CASTAMATIC_COMMENT])
        ?.url,
    ).toBe(CASTAMATIC_URL);
    expect(findRssPaymentComment([undefined, "hello"])).toBeUndefined();
  });
});

describe("isAllowedRssPaymentUrl", () => {
  test.each([
    CASTAMATIC_URL,
    FOUNTAIN_URL,
    "https://tardbox.com/boost/01HZX4K7Q2M9V3T8B6N5C1D0EF",
    "https://FOUNTAIN.fm/p/abc",
  ])("allows %p", (url) => {
    expect(isAllowedRssPaymentUrl(url)).toBe(true);
  });

  test.each([
    "http://fountain.fm/p/abc",
    "https://fountain.fm.evil.com/",
    "https://fountain.fm@evil.com/",
    "https://user@fountain.fm/",
    "https://fountain.fm:8080/",
    "https://evil.fountain.fm/",
    "https://127.0.0.1/",
    "https://example.com/p/abc",
    "not a url",
  ])("rejects %p", (url) => {
    expect(isAllowedRssPaymentUrl(url)).toBe(false);
  });
});

describe("parseRssPaymentHeader", () => {
  test("parses the Castamatic header", () => {
    expect(parseRssPaymentHeader(CASTAMATIC_HEADER)).toEqual({
      action: "stream",
      message: undefined,
      app_name: "Castamatic",
      sender_name: "Alice",
      feed_title: "Example Podcast",
      item_title: "Ep 1 - Example Guest",
      position: 5323,
      value_msat_total: 100000,
    });
  });

  test("parses the Fountain header", () => {
    expect(parseRssPaymentHeader(FOUNTAIN_HEADER)).toEqual({
      action: "boost",
      message: "Test 2",
      app_name: "Fountain",
      sender_name: "oscar@fountain.fm",
      feed_title: "Blue Production Show",
      item_title: undefined,
      position: undefined,
      value_msat_total: 100000,
    });
  });

  test("rounds the position down to whole seconds", () => {
    expect(
      parseRssPaymentHeader(encodeRssPaymentHeader({ position: 5323.48 }))
        ?.position,
    ).toBe(5323);
  });

  test("accepts value_msat_total as a string", () => {
    expect(
      parseRssPaymentHeader(
        encodeRssPaymentHeader({ value_msat_total: "21000" }),
      )?.value_msat_total,
    ).toBe(21000);
  });

  test("drops fields with an unexpected type", () => {
    expect(
      parseRssPaymentHeader(
        encodeRssPaymentHeader({
          message: { text: "hi" },
          feed_title: 42,
          value_msat_total: "lots",
        }),
      ),
    ).toEqual({
      action: undefined,
      message: undefined,
      app_name: undefined,
      sender_name: undefined,
      feed_title: undefined,
      item_title: undefined,
      position: undefined,
      value_msat_total: undefined,
    });
  });

  test.each([
    null,
    undefined,
    "",
    "%E0%A4%A",
    "not json",
    "%5B1%2C2%5D",
    "null",
  ])("returns undefined for %p", (header) => {
    expect(parseRssPaymentHeader(header)).toBeUndefined();
  });
});

describe("fetchRssPayment", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("loads the header with a HEAD request", async () => {
    fetchMock.mockResolvedValue(
      mockHeadResponse(
        { "x-rss-payment": CASTAMATIC_HEADER },
        { url: CASTAMATIC_URL },
      ),
    );

    const payment = await fetchRssPayment(CASTAMATIC_URL);

    expect(fetchMock).toHaveBeenCalledWith(
      CASTAMATIC_URL,
      expect.objectContaining({ method: "HEAD" }),
    );
    expect(payment?.feed_title).toBe("Example Podcast");
    expect(payment?.item_title).toBe("Ep 1 - Example Guest");
  });

  test("does not load a url from an unknown domain", async () => {
    expect(await fetchRssPayment("https://example.com/p/abc")).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns undefined when the header is missing", async () => {
    fetchMock.mockResolvedValue(mockHeadResponse({}));
    expect(await fetchRssPayment(FOUNTAIN_URL)).toBeUndefined();
  });

  test("returns undefined when the request fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));
    expect(await fetchRssPayment(FOUNTAIN_URL)).toBeUndefined();
  });

  test("returns undefined for an error response", async () => {
    fetchMock.mockResolvedValue(
      mockHeadResponse({ "x-rss-payment": FOUNTAIN_HEADER }, { ok: false }),
    );
    expect(await fetchRssPayment(FOUNTAIN_URL)).toBeUndefined();
  });

  test("ignores metadata after a redirect to another domain", async () => {
    fetchMock.mockResolvedValue(
      mockHeadResponse(
        { "x-rss-payment": FOUNTAIN_HEADER },
        { url: "https://example.com/p/abc" },
      ),
    );
    expect(await fetchRssPayment(FOUNTAIN_URL)).toBeUndefined();
  });
});

describe("getRssPaymentPodcastingDetails", () => {
  test("shows the full message from the metadata, not the truncated comment", () => {
    const comment = parseRssPaymentComment(
      `rss::payment::boost ${FOUNTAIN_URL} ${LONG_MESSAGE.slice(0, 40)}`,
    )!;
    const payment = parseRssPaymentHeader(
      encodeRssPaymentHeader({ action: "BOOST", message: LONG_MESSAGE }),
    );

    expect(getRssPaymentPodcastingDetails(comment, payment).message).toBe(
      LONG_MESSAGE,
    );
  });

  test("maps the metadata to the podcasting details", () => {
    const comment = parseRssPaymentComment(CASTAMATIC_COMMENT)!;
    const payment = parseRssPaymentHeader(CASTAMATIC_HEADER);

    expect(getRssPaymentPodcastingDetails(comment, payment)).toEqual({
      message: undefined,
      podcast: "Example Podcast",
      episode: "Ep 1 - Example Guest",
      action: "stream",
      ts: 5323,
      value_msat_total: 100000,
      sender_name: "Alice",
      app_name: "Castamatic",
    });
  });

  test("keeps the comment message when the metadata has none", () => {
    const comment = parseRssPaymentComment(
      `rss::payment::boost ${FOUNTAIN_URL} Great episode!`,
    )!;
    const payment = parseRssPaymentHeader(
      encodeRssPaymentHeader({ action: "BOOST", message: null }),
    );

    expect(getRssPaymentPodcastingDetails(comment, payment).message).toBe(
      "Great episode!",
    );
  });

  test("shows no message for a Fountain stream without one", () => {
    const comment = parseRssPaymentComment(FOUNTAIN_TRACK_COMMENT)!;
    const payment = parseRssPaymentHeader(
      encodeRssPaymentHeader({ action: "STREAM", message: null }),
    );

    expect(
      getRssPaymentPodcastingDetails(comment, payment).message,
    ).toBeUndefined();
  });

  test("falls back to the comment without metadata", () => {
    const comment = parseRssPaymentComment(
      `rss::payment::boost ${FOUNTAIN_URL} Great episode!`,
    )!;

    expect(getRssPaymentPodcastingDetails(comment)).toEqual({
      message: "Great episode!",
      podcast: undefined,
      episode: undefined,
      action: "boost",
      ts: undefined,
      value_msat_total: undefined,
      sender_name: undefined,
      app_name: undefined,
    });
  });
});
