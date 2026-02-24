import { router } from "expo-router";
import { initiatePaymentFlow } from "../initiatePaymentFlow";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("expo-router");

const mockLNURLPayResponse = {
  tag: "payRequest",
  callback: "https://getalby.com/callback",
  commentAllowed: 255,
  minSendable: 1000,
  maxSendable: 10_000_000,
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
  minWithdrawable: 21_000,
  maxWithdrawable: 21_000,
};

jest.mock("../lnurl", () => {
  const originalModule = jest.requireActual("../lnurl");

  const mockGetDetails = jest.fn(async (lnurlString: string) => {
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

// Minimal Invoice stub – we only need satoshi & description.
// Throws for inputs that don't look like BOLT11 invoices (lnbc…), mirroring
// the real Invoice constructor behaviour.
jest.mock("@getalby/lightning-tools/bolt11", () => {
  return {
    Invoice: jest.fn().mockImplementation(({ pr }: { pr: string }) => {
      // zero-amount invoice sentinel
      if (pr === "lnbc0_zero_amount") {
        return { satoshi: 0, description: "zero amount invoice" };
      }
      // Reject anything that doesn't look like a BOLT11 invoice
      if (!pr || !pr.startsWith("lnbc")) {
        throw new Error(`Invalid invoice: ${pr}`);
      }
      return { satoshi: 1000, description: "test invoice" };
    }),
  };
});

jest.mock("../merchants", () => ({
  convertMerchantQRToLightningAddress: jest.fn(() => null),
}));

jest.mock("../errorToast", () => ({
  errorToast: jest.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── BIP21 bitcoin: URI tests ─────────────────────────────────────────────────

describe("initiatePaymentFlow – BIP21 bitcoin: URIs", () => {
  it("handles bitcoin:<address>?lightning=<invoice> (standard BIP21)", async () => {
    const result = await initiatePaymentFlow(
      "bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq?lightning=lnbc1000",
    );
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/confirm",
      params: { invoice: "lnbc1000" },
    });
  });

  it("handles bitcoin:?lightning=<invoice> (no address – Phoenix wallet BIP21)", async () => {
    const result = await initiatePaymentFlow("bitcoin:?lightning=lnbc1000");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/confirm",
      params: { invoice: "lnbc1000" },
    });
  });

  it("handles BITCOIN:?lightning=<invoice> (uppercased scheme)", async () => {
    const result = await initiatePaymentFlow("BITCOIN:?lightning=lnbc1000");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/confirm",
      params: { invoice: "lnbc1000" },
    });
  });

  it("handles BITCOIN:<address>?lightning=<invoice> (uppercased scheme + address)", async () => {
    const result = await initiatePaymentFlow(
      "BITCOIN:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq?lightning=lnbc1000",
    );
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/confirm",
      params: { invoice: "lnbc1000" },
    });
  });

  it("returns false and shows error when bitcoin: URI has no lightning param", async () => {
    const { errorToast } = jest.requireMock("../errorToast");
    const result = await initiatePaymentFlow(
      "bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
    );
    expect(result).toBe(false);
    expect(errorToast).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

// ─── lightning: URI tests ─────────────────────────────────────────────────────

describe("initiatePaymentFlow – lightning: URIs", () => {
  it("handles lightning:<invoice> and navigates to confirm", async () => {
    const result = await initiatePaymentFlow("lightning:lnbc1000");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/confirm",
      params: { invoice: "lnbc1000" },
    });
  });

  it("handles LIGHTNING:<invoice> (uppercased)", async () => {
    const result = await initiatePaymentFlow("LIGHTNING:lnbc1000");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/confirm",
      params: { invoice: "lnbc1000" },
    });
  });

  it("handles bare invoice (no scheme)", async () => {
    const result = await initiatePaymentFlow("lnbc1000");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/confirm",
      params: { invoice: "lnbc1000" },
    });
  });

  it("navigates to /send/0-amount for zero-amount invoice", async () => {
    const result = await initiatePaymentFlow("lnbc0_zero_amount");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/0-amount",
      params: {
        invoice: "lnbc0_zero_amount",
        comment: "zero amount invoice",
      },
    });
  });
});

// ─── Lightning address / LNURL tests ─────────────────────────────────────────

describe("initiatePaymentFlow – Lightning addresses & LNURL", () => {
  it("handles a lightning address (lnurl-pay)", async () => {
    const result = await initiatePaymentFlow("hello@getalby.com");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/lnurl-pay",
      params: {
        lnurlDetailsJSON: JSON.stringify(mockLNURLPayResponse),
        receiver: "hello@getalby.com",
        amount: "",
      },
    });
  });

  it("passes amount through to lnurl-pay", async () => {
    const result = await initiatePaymentFlow("hello@getalby.com", "21000");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/send/lnurl-pay",
      params: {
        lnurlDetailsJSON: JSON.stringify(mockLNURLPayResponse),
        receiver: "hello@getalby.com",
        amount: "21000",
      },
    });
  });

  it("handles lnurlw (withdraw) and navigates to /receive/withdraw", async () => {
    const result = await initiatePaymentFlow("lightning:lnurlw123");
    expect(result).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith({
      pathname: "/receive/withdraw",
      params: { url: "lnurlw123" },
    });
  });
});

// ─── Edge / error cases ───────────────────────────────────────────────────────

describe("initiatePaymentFlow – edge cases", () => {
  it("returns false and shows error for empty string", async () => {
    const { errorToast } = jest.requireMock("../errorToast");
    const result = await initiatePaymentFlow("");
    expect(result).toBe(false);
    expect(errorToast).toHaveBeenCalled();
  });

  it("returns false and shows error for completely invalid input", async () => {
    const { errorToast } = jest.requireMock("../errorToast");
    const result = await initiatePaymentFlow("not-a-payment-string");
    expect(result).toBe(false);
    expect(errorToast).toHaveBeenCalled();
  });
});
