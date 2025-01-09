import { Platform } from "react-native";
import { SUITE_NAME } from "~/lib/constants";

let UserDefaults: any;
let SharedPreferences: any;

if (Platform.OS === "ios") {
  UserDefaults =
    require("@alevy97/react-native-userdefaults/src/ReactNativeUserDefaults.ios").default;
} else {
  SharedPreferences = require("@getalby/expo-shared-preferences");
}

type WalletInfo = {
  name: string;
  sharedSecret: string;
  id: number;
};

type Wallets = {
  [publicKey: string]: Partial<WalletInfo>;
};

export async function storeWalletInfo(
  publicKey: string,
  walletData: Partial<WalletInfo>,
) {
  if (!publicKey) {
    return;
  }
  if (Platform.OS === "ios") {
    const groupDefaults = new UserDefaults(SUITE_NAME);
    const wallets = (await groupDefaults.get("wallets")) || {};
    wallets[publicKey] = {
      ...(wallets[publicKey] || {}),
      ...walletData,
    };
    await groupDefaults.set("wallets", wallets);
  } else {
    const walletsString = await SharedPreferences.getItemAsync("wallets");
    const wallets: Wallets = walletsString ? JSON.parse(walletsString) : {};
    wallets[publicKey] = {
      ...(wallets[publicKey] || {}),
      ...walletData,
    };
    await SharedPreferences.setItemAsync("wallets", JSON.stringify(wallets));
  }
}

export async function removeWalletInfo(publicKey: string, walletId: number) {
  if (!publicKey) {
    return;
  }
  if (Platform.OS === "ios") {
    const groupDefaults = new UserDefaults(SUITE_NAME);
    const wallets = await groupDefaults.get("wallets");
    await groupDefaults.set("wallets", wallets);
    if (wallets && wallets[publicKey]) {
      delete wallets[publicKey];
      for (const key in wallets) {
        const wallet = wallets[key];
        if (wallet && wallet.id && wallet.id > walletId) {
          wallet.id -= 1;
        }
      }
      await groupDefaults.set("wallets", wallets);
    }
  } else {
    const walletsString = await SharedPreferences.getItemAsync("wallets");
    const wallets: Wallets = walletsString ? JSON.parse(walletsString) : {};
    if (wallets[publicKey]) {
      delete wallets[publicKey];
      for (const key in wallets) {
        const wallet = wallets[key];
        if (wallet && wallet.id && wallet.id > walletId) {
          wallet.id -= 1;
        }
      }
      await SharedPreferences.setItemAsync("wallets", JSON.stringify(wallets));
    }
  }
}

export async function removeAllInfo() {
  if (Platform.OS === "ios") {
    const groupDefaults = new UserDefaults(SUITE_NAME);
    await groupDefaults.removeAll();
  } else {
    await SharedPreferences.deleteItemAsync("wallets");
  }
}
