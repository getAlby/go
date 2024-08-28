import { StyleSheet } from "react-native";

// TODO: check dark mode shadows in ios
export const SHADOWS = StyleSheet.create({
  medium: {
    elevation: 2,
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowRadius: 2,
  },
  large: {
    elevation: 2,
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowRadius: 4,
  },
});

export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
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

export const CURSOR_COLOR = "hsl(47 100% 72%)";

export const TRANSACTIONS_PAGE_SIZE = 20;

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_WALLET_NAME = "Default Wallet";
