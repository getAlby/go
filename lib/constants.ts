import type { Nip47Capability } from "@getalby/sdk/nwc";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform, StyleSheet } from "react-native";

export const THEME_COLORS = {
  light: {
    background: "#F9FAFB",
    foreground: "#374151",
    secondaryForeground: "#6B7280",
    mutedForeground: "#9BA2AE",
    muted: "#E4E6EA",
    destructive: "#EF4444",
    destructiveForeground: "#FEE2E2",
    receive: "#22C45E",
    receiveForeground: "#DBFBE6",
    sent: "#F97316",
    sentForeground: "#FFEDD5",
    pending: "#3B82F6",
    pendingForeground: "#DBEAFE",
    primary: "#FFC800",
    primaryForeground: "#374151",
    secondary: "#FFE480",
    card: "",
    text: "",
    border: "#E2E7ED",
    notification: "",
    logoPrimary: "#202020",
    logoSecondary: "#FFC800",
  },
  dark: {
    background: "#0A0B0C",
    foreground: "#FAFBFB",
    secondaryForeground: "#BFBFC2",
    mutedForeground: "#7E7E88",
    muted: "#1F2937",
    destructive: "#F43F5E",
    destructiveForeground: "#4C0519",
    receive: "#14B8A6",
    receiveForeground: "#022C22",
    sent: "#F59E0B",
    sentForeground: "#451A03",
    pending: "#0EA5E9",
    pendingForeground: "#082F49",
    primary: "#FFC800",
    primaryForeground: "#374151",
    secondary: "#FFE480",
    card: "",
    text: "",
    border: "#E2E7ED",
    notification: "",
    logoPrimary: "#FFFFFF",
    logoSecondary: "#FFE480",
  },
};

export const SHADOWS = StyleSheet.create({
  small: {
    ...Platform.select({
      // make sure bg color is applied to avoid RCTView errors
      ios: {
        shadowColor: "#6F8CB0",
        shadowOpacity: 0.4,
        shadowOffset: {
          width: 1.5,
          height: 1.5,
        },
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  large: {
    ...Platform.select({
      // make sure bg color is applied to avoid RCTView errors
      ios: {
        shadowColor: "#6F8CB0",
        shadowOpacity: 0.4,
        shadowOffset: {
          width: 1.5,
          height: 1.5,
        },
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

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
