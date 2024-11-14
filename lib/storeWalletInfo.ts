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
    let wallets = (await groupDefaults.get("wallets")) || [];
    wallets[publicKey] = {
      ...(wallets[publicKey] || {}),
      ...walletData,
    };
    await groupDefaults.set("wallets", wallets);
  } else {
    let wallets = [];
    const walletsString = await SharedPreferences.getItemAsync("wallets");
    wallets = walletsString ? JSON.parse(walletsString) : [];
    wallets[publicKey] = {
      ...(wallets[publicKey] || {}),
      ...walletData,
    };
    await SharedPreferences.setItemAsync("wallets", JSON.stringify(wallets));
  }
}
