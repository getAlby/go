import { Platform } from "react-native";
import { IS_EXPO_GO, SUITE_NAME } from "~/lib/constants";

// this is done because accessing values stored from expo-secure-store
// is quite difficult and we do not wish to complicate the notification
// service extension (ios) or messaging service (android)
async function getUserDefaultsModule() {
  const module = await import(
    "@alevy97/react-native-userdefaults/src/ReactNativeUserDefaults.ios"
  );
  return module.default;
}

async function getSharedPreferencesModule() {
  const module = await import("@getalby/expo-shared-preferences");
  return module;
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
    const UserDefaults = await getUserDefaultsModule();
    const groupDefaults = new UserDefaults(SUITE_NAME);
    const wallets = (await groupDefaults.get("wallets")) || {};
    wallets[publicKey] = {
      ...(wallets[publicKey] || {}),
      ...walletData,
    };
    await groupDefaults.set("wallets", wallets);
  } else {
    const SharedPreferences = await getSharedPreferencesModule();
    const walletsString = await SharedPreferences.getItemAsync("wallets");
    const wallets: Wallets = walletsString ? JSON.parse(walletsString) : {};
    wallets[publicKey] = {
      ...(wallets[publicKey] || {}),
      ...walletData,
    };
    await SharedPreferences.setItemAsync("wallets", JSON.stringify(wallets));
  }
}

export async function setNotificationSettings(settings: {
  ttsEnabled: boolean;
}) {
  if (Platform.OS === "ios") {
    const groupDefaults = new UserDefaults(SUITE_NAME);
    await groupDefaults.set("settings", settings);
  } else {
    await SharedPreferences.setItemAsync("settings", JSON.stringify(settings));
  }
}

export async function removeWalletInfo(publicKey: string, walletId: number) {
  if (IS_EXPO_GO) {
    return;
  }
  if (Platform.OS === "ios") {
    const UserDefaults = await getUserDefaultsModule();
    const groupDefaults = new UserDefaults(SUITE_NAME);
    let wallets = await groupDefaults.get("wallets");
    await groupDefaults.set("wallets", wallets);
    if (wallets) {
      wallets = removeWallet(wallets, publicKey, walletId);
      await groupDefaults.set("wallets", wallets);
    }
  } else {
    const SharedPreferences = await getSharedPreferencesModule();
    const walletsString = await SharedPreferences.getItemAsync("wallets");
    let wallets: Wallets = walletsString ? JSON.parse(walletsString) : {};
    if (wallets) {
      wallets = removeWallet(wallets, publicKey, walletId);
      await SharedPreferences.setItemAsync("wallets", JSON.stringify(wallets));
    }
  }
}

export async function removeAllInfo() {
  if (IS_EXPO_GO) {
    return;
  }
  if (Platform.OS === "ios") {
    const UserDefaults = await getUserDefaultsModule();
    const groupDefaults = new UserDefaults(SUITE_NAME);
    await groupDefaults.removeAll();
  } else {
    const SharedPreferences = await getSharedPreferencesModule();
    await SharedPreferences.deleteItemAsync("wallets");
  }
}

function removeWallet(
  wallets: Wallets,
  publicKey: string,
  walletId: number,
): Wallets {
  if (wallets && wallets[publicKey]) {
    delete wallets[publicKey];
    for (const key in wallets) {
      const wallet = wallets[key];
      if (wallet && wallet.id && wallet.id > walletId) {
        wallet.id -= 1;
      }
    }
  }
  return wallets;
}
