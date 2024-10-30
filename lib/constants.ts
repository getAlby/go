import { Nip47Capability } from "@getalby/sdk/dist/NWCClient";

export const NAV_THEME = {
  light: {
    background: "hsl(210 20% 98%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(210 20% 98%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export const INACTIVITY_THRESHOLD = 5 * 60 * 1000;

export const CURSOR_COLOR = "hsl(47 100% 72%)";

export const TRANSACTIONS_PAGE_SIZE = 20;

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_WALLET_NAME = "Default Wallet";
export const ALBY_LIGHTNING_ADDRESS = "go@getalby.com";
export const ALBY_URL = "https://getalby.com";

export const REQUIRED_CAPABILITIES: Nip47Capability[] = [
  "get_balance",
  "make_invoice",
  "pay_invoice",
  "list_transactions",
];

export const SATS_REGEX = /^\d*$/;

export const FIAT_REGEX = /^\d*(\.\d{0,2})?$/;
