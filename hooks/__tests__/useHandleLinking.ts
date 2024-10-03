import { handleLink } from "../../lib/link";
import { router } from "expo-router";

jest.mock("expo-router");

const testVectors: Record<string, string> = {
  "lightning:hello@getalby.com": "lightning:hello@getalby.com",
  "lightning://hello@getalby.com": "lightning:hello@getalby.com",
  "LIGHTNING://hello@getalby.com": "lightning:hello@getalby.com",
  "LIGHTNING:hello@getalby.com": "lightning:hello@getalby.com",
  "lightning:lnbc1": "lightning:lnbc1",
  "lightning://lnbc1": "lightning:lnbc1",
  "bitcoin:bitcoinaddress?lightning=invoice":
    "bitcoin:bitcoinaddress?lightning=invoice",
  "BITCOIN:bitcoinaddress?lightning=invoice":
    "bitcoin:bitcoinaddress?lightning=invoice",
};

describe("handleLink", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return early if url is empty", () => {
    handleLink("");
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("should return early if scheme is not supported", () => {
    handleLink("mailto:hello@getalby.com");
    expect(router.replace).toHaveBeenCalledWith({
      pathname: "/",
    });
    expect(router.push).not.toHaveBeenCalled();
  });

  it("should parse the URL and navigate correctly for expo links", () => {
    Object.entries(testVectors).forEach(([url, expectedOutput]) => {
      jest.clearAllMocks();
      handleLink("exp://127.0.0.1:8081/--/" + url);
      assertRedirect(expectedOutput);
    });
  });

  it("should parse the URL and navigate correctly for production links", () => {
    Object.entries(testVectors).forEach(([url, expectedOutput]) => {
      jest.clearAllMocks();
      handleLink(url);
      assertRedirect(expectedOutput);
    });
  });
});

const assertRedirect = (expectedUrl: string) => {
  expect(router.push).toHaveBeenCalledWith({
    pathname: "/send",
    params: {
      url: expectedUrl,
    },
  });
};
