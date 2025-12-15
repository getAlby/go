import type { Nip47Capability } from "@getalby/sdk/nwc";
import Constants, { ExecutionEnvironment } from "expo-constants";

export const THEME = {
  light: {
    background: "#F9FAFB",
    foreground: "#374151",
    secondaryForeground: "#6B7280",
    mutedForeground: "#9BA2AE",
    muted: "#E4E6EA",
    destructive: "#EF4444",
    destructiveForeground: "#FEE2E2",
    success: "#22C45E",
    successForeground: "#DBFBE6",
    primary: "#FFC800",
    primaryForeground: "#374151",
    secondary: "#FFE480",
    card: "",
    text: "",
    border: "",
    notification: "",
  },
  dark: {
    background: "#0a0b0c",
    foreground: "#FAFBFB",
    secondaryForeground: "#BFBFC2",
    mutedForeground: "#7E7E88",
    muted: "#1f2937",
    destructive: "#B41818",
    destructiveForeground: "#1C0202",
    success: "#44D579",
    successForeground: "#062310",
    primary: "#FFC800",
    primaryForeground: "#374151",
    secondary: "#FFE480",
    card: "",
    text: "",
    border: "",
    notification: "",
  },
};

export const SUITE_NAME = "group.com.getalby.mobile.nse";

export const INACTIVITY_THRESHOLD = 5 * 60 * 1000;

export const CURSOR_COLOR = "hsl(47 100% 72%)";

export const TRANSACTIONS_PAGE_SIZE = 20;

export const DEFAULT_CURRENCY = "USD";
export const BTC_RATE_REFRESH_INTERVAL = 5 * 60 * 1000;
export const DEFAULT_WALLET_NAME = "Default Wallet";
export const ALBY_LIGHTNING_ADDRESS = "go@getalby.com";
export const ALBY_URL = "https://getalby.com";
export const NOSTR_API_URL = "https://api.getalby.com/nwc";

export const REQUIRED_CAPABILITIES: Nip47Capability[] = [
  "get_balance",
  "make_invoice",
  "pay_invoice",
  "list_transactions",
];

export const SATS_REGEX = /^\d*$/;

export const FIAT_REGEX = /^\d*((\.|,)\d{0,2})?$/;

export const BOLT11_REGEX = /.*?((lnbcrt|lntb|lnbc)([0-9]{1,}[a-z0-9]+){1})/;

export const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const MAX_SATS_THRESHOLD = 1_000_000_000;
