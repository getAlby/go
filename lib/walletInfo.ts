import { Platform } from "react-native";
import { IS_EXPO_GO, SUITE_NAME } from "~/lib/constants";

let UserDefaults: any;
let SharedPreferences: any;

// this is done because accessing values stored from expo-secure-store
// is quite difficult and we do not wish to complicate the notification
// service extension (ios) or messaging service (android)
if (!IS_EXPO_GO) {
  if (Platform.OS === "ios") {
    UserDefaults =
      require("@alevy97/react-native-userdefaults/src/ReactNativeUserDefaults.ios").default;
  } else {
    SharedPreferences = require("@getalby/expo-shared-preferences");
  }
}

type WalletInfo = {
  name: string;
  sharedSecret: string;
  id: number;
  version: string;
};

type Wallets = {
  [publicKey: string]: Partial<WalletInfo>;
};

// TODO: In the future when we deprecate NIP-04 and stop
// support for version 0.0 we would have display wallets
// using 0.0 as deprecated and write a migration
export async function storeWalletInfo(
  publicKey: string,
  walletData: Partial<WalletInfo>,
) {
  if (IS_EXPO_GO) {
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
  if (IS_EXPO_GO) {
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
  if (IS_EXPO_GO) {
    return;
  }

  if (Platform.OS === "ios") {
    const groupDefaults = new UserDefaults(SUITE_NAME);
    await groupDefaults.removeAll();
  } else {
    await SharedPreferences.deleteItemAsync("wallets");
  }
}
