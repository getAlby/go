import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React from "react";
import * as Clipboard from "expo-clipboard";
import { nwc } from "@getalby/sdk";
import { secureStorage } from "lib/secureStorage";
import { useAppStore } from "lib/state/appStore";
import { BarCodeScanningResult, Camera } from "expo-camera";

export function Setup() {
  const [isScanning, setScanning] = React.useState(false);
  const [isConnecting, setConnecting] = React.useState(false);

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setScanning(status === "granted");
  }

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    setScanning((current) => {
      if (current === true) {
        // console.log(`Bar code with data ${data} has been scanned!`);
        connect(data);
      }
      return false;
    });
  };

  async function paste() {
    let nostrWalletConnectUrl;
    try {
      nostrWalletConnectUrl = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      return;
    }
    connect(nostrWalletConnectUrl);
  }

  async function connect(nostrWalletConnectUrl: string) {
    try {
      setConnecting(true);
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
    setConnecting(false);
  }

  return (
    <>
      {isConnecting && (
        <>
          <ActivityIndicator />
          <Text className="mt-4">Connecting to your Wallet</Text>
        </>
      )}
      {!isConnecting && (
        <>
          <Text className="">Connect to your Wallet</Text>
          {isScanning && (
            <Camera
              onBarCodeScanned={handleBarCodeScanned}
              style={{ flex: 1, width: "100%" }}
            />
          )}
          {!isScanning && (
            <Pressable className="mt-4 p-4 bg-green-300" onPress={scan}>
              <Text className="">Scan</Text>
            </Pressable>
          )}
          <Pressable className="mt-4 p-4 bg-green-300" onPress={paste}>
            <Text className="">Paste</Text>
          </Pressable>
        </>
      )}
    </>
  );
}
