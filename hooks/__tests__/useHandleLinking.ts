import { handleLink } from "../../lib/link";
import { router } from "expo-router";

jest.mock("expo-router");

// Mock the lnurl module
jest.mock("../../lib/lnurl", () => {
  const originalModule = jest.requireActual("../../lib/lnurl");
  return {
    ...originalModule,
    lnurl: {
      ...originalModule.lnurl,
      getDetails: jest.fn(async (lnurlString) => {
        if (lnurlString.startsWith("lnurlw")) {
          return {
            tag: 'withdrawRequest',
            callback: 'https://getalby.com/callback',
            k1: 'unused',
            defaultDescription: 'withdrawal',
            minWithdrawable: 21000,
            maxWithdrawable: 21000
          };
        } else {
          // call original function
          originalModule.getDetails(lnurlString)
        }
      }),
    },
  };
});

const testVectors: Record<string, { url: string, path: string }> = {
  "lightning:hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "lightning://hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "LIGHTNING://hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "LIGHTNING:hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "lightning:lnbc1": { url: "lightning:lnbc1", path: "/send" },
  "lightning://lnbc1": { url: "lightning:lnbc1", path: "/send" },
  "bitcoin:bitcoinaddress?lightning=invoice": { url: "bitcoin:bitcoinaddress?lightning=invoice", path: "/send" },
  "BITCOIN:bitcoinaddress?lightning=invoice": { url: "bitcoin:bitcoinaddress?lightning=invoice", path: "/send" },
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
        jest.clearAllMocks();
        await handleLink("exp://127.0.0.1:8081/--/" + url);
        assertRedirect(expectedOutput.path, expectedOutput.url);
      }
    );
  });

  describe("Production links", () => {
    test.each(Object.entries(testVectors))(
      "should parse the URL '%s' and navigate correctly",
      async (url, expectedOutput) => {
        jest.clearAllMocks();
        await handleLink(url);
        assertRedirect(expectedOutput.path, expectedOutput.url);
      }
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
