import { router } from "expo-router";
import { handleLink } from "../../lib/link";

jest.mock("expo-router");

const mockLNURLPayResponse = {
  tag: "payRequest",
  callback: "https://getalby.com/callback",
  commentAllowed: 255,
  minSendable: 1000,
  maxSendable: 10000000,
  payerData: {
    name: { mandatory: false },
    email: { mandatory: false },
    pubkey: { mandatory: false },
  },
};

const mockLNURLWithdrawResponse = {
  tag: "withdrawRequest",
  callback: "https://getalby.com/callback",
  k1: "unused",
  defaultDescription: "withdrawal",
  minWithdrawable: 21000,
  maxWithdrawable: 21000,
};

// Mock the lnurl module
jest.mock("../../lib/lnurl", () => {
  const originalModule = jest.requireActual("../../lib/lnurl");

  const mockGetDetails = jest.fn(async (lnurlString) => {
    if (lnurlString === "hello@getalby.com") {
      return mockLNURLPayResponse;
    }
    if (lnurlString.startsWith("lnurlw")) {
      return mockLNURLWithdrawResponse;
    }
    return originalModule.lnurl.getDetails(lnurlString);
  });

  return {
    ...originalModule,
    lnurl: {
      ...originalModule.lnurl,
      getDetails: mockGetDetails,
    },
  };
});

const testVectors: Record<string, { path: string; params: any }> = {
  // Lightning Addresses
  "lightning:hello@getalby.com": {
    path: "/send/lnurl-pay",
    params: {
      lnurlDetailsJSON: JSON.stringify(mockLNURLPayResponse),
      receiver: "hello@getalby.com",
    },
  },
  "lightning://hello@getalby.com": {
    path: "/send/lnurl-pay",
    params: {
      lnurlDetailsJSON: JSON.stringify(mockLNURLPayResponse),
      receiver: "hello@getalby.com",
    },
  },
  "LIGHTNING://hello@getalby.com": {
    path: "/send/lnurl-pay",
    params: {
      lnurlDetailsJSON: JSON.stringify(mockLNURLPayResponse),
      receiver: "hello@getalby.com",
    },
  },
  "LIGHTNING:hello@getalby.com": {
    path: "/send/lnurl-pay",
    params: {
      lnurlDetailsJSON: JSON.stringify(mockLNURLPayResponse),
      receiver: "hello@getalby.com",
    },
  },

  // Lightning invoices
  "lightning:lnbc123": {
    path: "/send",
    params: { url: "lnbc123" },
  },
  "lightning://lnbc123": {
    path: "/send",
    params: { url: "lnbc123" },
  },

  // BIP21
  "bitcoin:bitcoinaddress?lightning=lnbc123": {
    path: "/send",
    params: { url: "lnbc123" },
  },
  "BITCOIN:bitcoinaddress?lightning=lnbc123": {
    path: "/send",
    params: { url: "lnbc123" },
  },

  // LNURL-withdraw
  "lightning:lnurlw123": {
    path: "/receive/withdraw",
    params: { url: "lnurlw123" },
  },
  "lightning://lnurlw123": {
    path: "/receive/withdraw",
    params: { url: "lnurlw123" },
  },
};

describe("handleLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return early if url is empty", async () => {
    await handleLink("");
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("should return early if scheme is not supported", async () => {
    await handleLink("mailto:hello@getalby.com");
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/",
    });
    expect(router.push).not.toHaveBeenCalled();
  });

  it("should preserve decoded callback and app icon params", async () => {
    await handleLink(
      "nostrnwc://connect?appname=Test%20App&callback=myapp%3A%2F%2Fopen%3Fredirect%3Dhttps%253A%252F%252Fdev.example.com%252Fdone&appicon=https%3A%2F%2Fcdn.example.com%2Ficon.png",
    );

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/settings/wallets/connect",
      params: {
        options: JSON.stringify({
          icon: "https://cdn.example.com/icon.png",
          name: "Test App",
          returnTo:
            "myapp://open?redirect=https%3A%2F%2Fdev.example.com%2Fdone",
        }),
        flow: "deeplink",
      },
    });
  });

  it("should open payment notifications without decoding nested payloads twice", async () => {
    await handleLink(
      "alby://payment_notification?app_pubkey=abc&transaction=%7B%22type%22%3A%22incoming%22%2C%22state%22%3A%22settled%22%2C%22invoice%22%3A%22lnbc123%22%2C%22description%22%3A%22myapp%3A%2F%2Fopen%3Fredirect%3Dhttps%253A%252F%252Fdev.example.com%252Fdone%26payload%3D%257B%2522screen%2522%253A%2522payment%2522%257D%22%2C%22description_hash%22%3A%22%22%2C%22preimage%22%3A%22abc%22%2C%22payment_hash%22%3A%22def%22%2C%22amount%22%3A21000%2C%22fees_paid%22%3A0%2C%22created_at%22%3A1753275708%2C%22expires_at%22%3A1753362108%2C%22settled_at%22%3A1753275741%2C%22settle_deadline%22%3Anull%2C%22metadata%22%3Anull%7D",
    );

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/transaction",
      params: {
        appPubkey: "abc",
        transactionJSON:
          '{"type":"incoming","state":"settled","invoice":"lnbc123","description":"myapp://open?redirect=https%3A%2F%2Fdev.example.com%2Fdone&payload=%7B%22screen%22%3A%22payment%22%7D","description_hash":"","preimage":"abc","payment_hash":"def","amount":21000,"fees_paid":0,"created_at":1753275708,"expires_at":1753362108,"settled_at":1753275741,"settle_deadline":null,"metadata":null}',
      },
    });
  });

  describe("Expo links", () => {
    test.each(Object.entries(testVectors))(
      "should parse the URL '%s' and navigate correctly",
      async (url, expectedOutput) => {
        await handleLink("exp://127.0.0.1:8081/--/" + url);
        // handleLnurl is fire-and-forget from handleLink, so wait for its
        // internal lnurlLib.getDetails() lookup to resolve before asserting
        await new Promise((resolve) => setTimeout(resolve, 100));
        assertRedirect(expectedOutput.path, expectedOutput.params);
      },
    );
  });

  describe("Production links", () => {
    test.each(Object.entries(testVectors))(
      "should parse the URL '%s' and navigate correctly",
      async (url, expectedOutput) => {
        await handleLink(url);
        // handleLnurl is fire-and-forget from handleLink, so wait for its
        // internal lnurlLib.getDetails() lookup to resolve before asserting
        await new Promise((resolve) => setTimeout(resolve, 100));
        assertRedirect(expectedOutput.path, expectedOutput.params);
      },
    );
  });
});

const assertRedirect = (expectedPath: string, expectedParams: any) => {
  expect(router.push).toHaveBeenCalledWith({
    pathname: expectedPath,
    params: expectedParams,
  });
};
