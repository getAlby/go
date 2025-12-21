import type { Nip47Capability } from "@getalby/sdk/nwc";
import Constants, { ExecutionEnvironment } from "expo-constants";

export const THEME_COLORS = {
  light: {
    background: "#F9FAFB",
    foreground: "#374151",
    overlay: "#00000060",
    border: "#E2E7ED",
    shadow: "#6F8CB0",
    logoPrimary: "#202020",
    logoSecondary: "#FFC800",
    primary: "#FFC800",
    secondary: "#FFE480",
    primaryForeground: "#374151",
    secondaryForeground: "#6B7280",
    muted: "#E4E6EA",
    mutedForeground: "#9BA2AE",
    receive: "#22C45E",
    receiveForeground: "#DBFBE6",
    sent: "#F97316",
    sentForeground: "#FFEDD5",
    destructive: "#EF4444",
    destructiveForeground: "#FEE2E2",
    pending: "#3B82F6",
    pendingForeground: "#DBEAFE",
    info: "#1D4ED8",
    infoForeground: "#EFF6FF",
    infoBorder: "#DBEAFE",
    warning: "#C2410C",
    warningForeground: "#FFF7ED",
    warningBorder: "#FFEDD5",
    error: "#B91C1C",
    errorForeground: "#FEF2F2",
    errorBorder: "#FEE2E2",
    card: "",
    text: "",
    notification: "",
  },
  dark: {
    background: "#0A0B0C",
    foreground: "#E3E3E3",
    overlay: "#FFFFFF20",
    border: "#E2E7ED",
    shadow: "#000000",
    logoPrimary: "#FFFFFF",
    logoSecondary: "#FFE480",
    primary: "#FFC800",
    secondary: "#FFE480",
    primaryForeground: "#374151",
    secondaryForeground: "#BABABA",
    muted: "#242424",
    mutedForeground: "#858585",
    receive: "#14B8A6",
    receiveForeground: "#022C22",
    sent: "#F59E0B",
    sentForeground: "#451A03",
    destructive: "#F43F5E",
    destructiveForeground: "#4C0519",
    pending: "#0EA5E9",
    pendingForeground: "#082F49",
    info: "#93C5FD",
    infoForeground: "#1E3A8A",
    infoBorder: "#3659b9",
    warning: "#FDBA74",
    warningForeground: "#7C2D12",
    warningBorder: "#C16242",
    error: "#FCA5A5",
    errorForeground: "#7F1D1D",
    errorBorder: "#C24141",
    card: "",
    text: "",
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
