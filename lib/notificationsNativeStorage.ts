import { Platform } from "react-native";
import { IS_EXPO_GO, SUITE_NAME } from "~/lib/constants";
import type { BitcoinDisplayFormat } from "~/lib/state/appStore";

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

// Removes any stored wallet notification data whose public key does not
// belong to a currently-configured wallet. This catches entries left behind
// by earlier app versions or edge cases (e.g. a crash between removing a
// wallet and its notification data being cleared).
export async function sweepOrphanedWalletInfo(activePublicKeys: string[]) {
  if (IS_EXPO_GO) {
    return;
  }
  const activeSet = new Set(activePublicKeys);
  if (Platform.OS === "ios") {
    const UserDefaults = await getUserDefaultsModule();
    const groupDefaults = new UserDefaults(SUITE_NAME);
    const wallets: Wallets | undefined = await groupDefaults.get("wallets");
    if (!wallets) {
      return;
    }
    const orphanedPublicKeys = Object.keys(wallets).filter(
      (publicKey) => !activeSet.has(publicKey),
    );
    if (!orphanedPublicKeys.length) {
      return;
    }
    for (const publicKey of orphanedPublicKeys) {
      delete wallets[publicKey];
    }
    await groupDefaults.set("wallets", wallets);
  } else {
    const SharedPreferences = await getSharedPreferencesModule();
    const walletsString = await SharedPreferences.getItemAsync("wallets");
    if (!walletsString) {
      return;
    }
    const wallets: Wallets = JSON.parse(walletsString);
    const orphanedPublicKeys = Object.keys(wallets).filter(
      (publicKey) => !activeSet.has(publicKey),
    );
    if (!orphanedPublicKeys.length) {
      return;
    }
    for (const publicKey of orphanedPublicKeys) {
      delete wallets[publicKey];
    }
    await SharedPreferences.setItemAsync("wallets", JSON.stringify(wallets));
  }
}
