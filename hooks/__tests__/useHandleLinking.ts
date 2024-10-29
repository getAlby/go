import { router } from "expo-router";
import { handleLink } from "../../lib/link";

jest.mock("expo-router");

// Mock the lnurl module
jest.mock("../../lib/lnurl", () => {
  const originalModule = jest.requireActual("../../lib/lnurl");

  const mockGetDetails = jest.fn(async (lnurlString) => {
    if (lnurlString.startsWith("lnurlw")) {
      return {
        tag: "withdrawRequest",
        callback: "https://getalby.com/callback",
        k1: "unused",
        defaultDescription: "withdrawal",
        minWithdrawable: 21000,
        maxWithdrawable: 21000,
      };
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

const testVectors: Record<string, { url: string; path: string }> = {
  // Lightning Addresses
  "lightning:hello@getalby.com": {
    url: "lightning:hello@getalby.com",
    path: "/send",
  },
  "lightning://hello@getalby.com": {
    url: "lightning:hello@getalby.com",
    path: "/send",
  },
  "LIGHTNING://hello@getalby.com": {
    url: "lightning:hello@getalby.com",
    path: "/send",
  },
  "LIGHTNING:hello@getalby.com": {
    url: "lightning:hello@getalby.com",
    path: "/send",
  },

  // Lightning invoices
  "lightning:lnbc1": { url: "lightning:lnbc1", path: "/send" },
  "lightning://lnbc1": { url: "lightning:lnbc1", path: "/send" },

  // BIP21
  "bitcoin:bitcoinaddress?lightning=invoice": {
    url: "bitcoin:bitcoinaddress?lightning=invoice",
    path: "/send",
  },
  "BITCOIN:bitcoinaddress?lightning=invoice": {
    url: "bitcoin:bitcoinaddress?lightning=invoice",
    path: "/send",
  },

  // LNURL-withdraw
  "lightning:lnurlw123": { url: "lightning:lnurlw123", path: "/withdraw" },
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
        assertRedirect(expectedOutput.path, expectedOutput.url);
      },
    );
  });

  describe("Production links", () => {
    test.each(Object.entries(testVectors))(
      "should parse the URL '%s' and navigate correctly",
      async (url, expectedOutput) => {
        await handleLink(url);
        assertRedirect(expectedOutput.path, expectedOutput.url);
      },
    );
  });
});

const assertRedirect = (expectedPath: string, expectedUrl: string) => {
  expect(router.push).toHaveBeenCalledWith({
    pathname: expectedPath,
    params: {
      url: expectedUrl,
    },
  });
};
