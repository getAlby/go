import { router } from "expo-router";
import * as RN from "react-native";
import { handleLink } from "../../lib/link";

jest.spyOn(RN.InteractionManager, "runAfterInteractions").mockImplementation(
  jest.fn().mockImplementation((callback) => {
    callback();
  }),
);

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

  describe("Expo links", () => {
    test.each(Object.entries(testVectors))(
      "should parse the URL '%s' and navigate correctly",
      async (url, expectedOutput) => {
        await handleLink("exp://127.0.0.1:8081/--/" + url);
        await new Promise((resolve) => setTimeout(resolve, 100)); // due to safeRouterPush
        assertRedirect(expectedOutput.path, expectedOutput.params);
      },
    );
  });

  describe("Production links", () => {
    test.each(Object.entries(testVectors))(
      "should parse the URL '%s' and navigate correctly",
      async (url, expectedOutput) => {
        await handleLink(url);
        await new Promise((resolve) => setTimeout(resolve, 100)); // due to safeRouterPush
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
