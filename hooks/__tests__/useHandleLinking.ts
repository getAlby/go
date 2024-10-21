import { handleLink } from "../../lib/link";
import { router } from "expo-router";

jest.mock("expo-router");

const lnurlWithdrawLink = "" // "lnurl1dp68gurn8ghj7mrfva58gumpw3ejucm0d5hkzurf9amkjargv3exzampd3xxjmntwvhkvepcvcckvc3s94jnqerz956r2wtr95urqcfc95urqcnpxd3rqc3evv6kx5kckkv"

const testVectors: Record<string, { url: string, path: string }> = {
  "lightning:hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "lightning://hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "LIGHTNING://hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "LIGHTNING:hello@getalby.com": { url: "lightning:hello@getalby.com", path: "/send" },
  "lightning:lnbc1": { url: "lightning:lnbc1", path: "/send" },
  "lightning://lnbc1": { url: "lightning:lnbc1", path: "/send" },
  "bitcoin:bitcoinaddress?lightning=invoice": { url: "bitcoin:bitcoinaddress?lightning=invoice", path: "/send" },
  "BITCOIN:bitcoinaddress?lightning=invoice": { url: "bitcoin:bitcoinaddress?lightning=invoice", path: "/send" },
  ...(lnurlWithdrawLink ? {
    [`lightning:${lnurlWithdrawLink}`]: { url: `lightning:${lnurlWithdrawLink}`, path: "/withdraw" },
  } : {})
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
