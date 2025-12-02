import { Platform } from "react-native";
import { IS_EXPO_GO, SUITE_NAME } from "~/lib/constants";
import { BitcoinDisplayFormat } from "~/lib/state/appStore";

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

export type WalletInfo = {
  name: string;
  sharedSecret: string;
  version: string;
};

type Wallets = {
  [publicKey: string]: WalletInfo;
};

// TODO: In the future when we deprecate NIP-04 and stop
// support for version 0.0 we would have display wallets
// using 0.0 as deprecated and write a migration
export async function storeWalletInfo(
  publicKey: string,
  walletData: WalletInfo | Pick<WalletInfo, "name" /* update name only */>,
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

export async function setNotificationSettings(
  settings: Partial<{
    ttsEnabled: boolean;
    bitcoinDisplayFormat: BitcoinDisplayFormat;
  }>,
) {
  if (Platform.OS === "ios") {
    const UserDefaults = await getUserDefaultsModule();
    const groupDefaults = new UserDefaults(SUITE_NAME);
    const oldSettings = (await groupDefaults.get("settings")) || {};
    const updatedSettings = {
      ...oldSettings,
      settings,
    };
    await groupDefaults.set("settings", updatedSettings);
  } else {
    const SharedPreferences = await getSharedPreferencesModule();
    const settingsString = await SharedPreferences.getItemAsync("settings");
    const oldSettings = settingsString ? JSON.parse(settingsString) : {};
    const updatedSettings = {
      ...oldSettings,
      settings,
    };
    await SharedPreferences.setItemAsync(
      "settings",
      JSON.stringify(updatedSettings),
    );
  }
}

export async function removeWalletInfo(publicKey: string) {
  if (IS_EXPO_GO) {
    return;
  }
  if (Platform.OS === "ios") {
    const UserDefaults = await getUserDefaultsModule();
    const groupDefaults = new UserDefaults(SUITE_NAME);
    let wallets = await groupDefaults.get("wallets");
    await groupDefaults.set("wallets", wallets);
    if (wallets) {
      wallets = removeWallet(wallets, publicKey);
      await groupDefaults.set("wallets", wallets);
    }
  } else {
    const SharedPreferences = await getSharedPreferencesModule();
    const walletsString = await SharedPreferences.getItemAsync("wallets");
    let wallets: Wallets = walletsString ? JSON.parse(walletsString) : {};
    if (wallets) {
      wallets = removeWallet(wallets, publicKey);
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

function removeWallet(wallets: Wallets, publicKey: string): Wallets {
  if (wallets && wallets[publicKey]) {
    delete wallets[publicKey];
  }
  return wallets;
}
