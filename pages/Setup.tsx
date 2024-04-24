import { Pressable, Text, TextInput } from "react-native";
import React from "react";
import * as Clipboard from "expo-clipboard";
import { nwc } from "@getalby/sdk";
import { secureStorage } from "lib/secureStorage";
import { useAppStore } from "lib/state/appStore";

export function Setup() {
  async function paste() {
    try {
      const nostrWalletConnectUrl = await Clipboard.getStringAsync();

      // make sure connection is valid
      const nwcClient = new nwc.NWCClient({
        nostrWalletConnectUrl,
      });
      const info = await nwcClient.getInfo();
      console.log("NWC connected", info);
      secureStorage.setItem("nostrWalletConnectUrl", nostrWalletConnectUrl);
      useAppStore.getState().setNWCClient(nwcClient);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Text className="">Connect to your Wallet</Text>
      <Pressable className="mt-4 p-4 bg-green-300" onPress={paste}>
        <Text className="">Paste</Text>
      </Pressable>
    </>
  );
}
