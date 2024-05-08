import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import * as Clipboard from "expo-clipboard";
import { nwc } from "@getalby/sdk";
import { Camera as CameraIcon } from "~/components/Icons";
import { useAppStore } from "lib/state/appStore";
import { BarCodeScanningResult, Camera } from "expo-camera";
import { Stack } from "expo-router";
import { Button } from "~/components/ui/button";
import { useInfo } from "~/hooks/useInfo";
import { useBalance } from "~/hooks/useBalance";
import Toast from "react-native-toast-message";
import { errorToast } from "~/lib/errorToast";
import { Nip47Capability } from "@getalby/sdk/dist/NWCClient";
import Loading from "~/components/Loading";

export function WalletConnection() {
  const hasConnection = useAppStore((store) => !!store.nwcClient);
  const [isScanning, setScanning] = React.useState(false);
  const [isConnecting, setConnecting] = React.useState(false);
  const [autoFocus, setAutoFocus] = React.useState(true);
  const { data: walletInfo } = useInfo();
  const { data: balance } = useBalance();

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setScanning(status === "granted");
  }

  const focusCamera = () => {
    setAutoFocus(false);
    setTimeout(() => {
      setAutoFocus(true);
    }, 200);
  };

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    setScanning((current) => {
      if (current === true) {
        // console.log(`Bar code with data ${data} has been scanned!`);
        connect(data);
      }
      return false;
    });
  };

  React.useEffect(() => {
    scan();
  }, []);

  async function paste() {
    let nostrWalletConnectUrl;
    try {
      nostrWalletConnectUrl = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      errorToast(error as Error);
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
      useAppStore.getState().setNostrWalletConnectUrl(nostrWalletConnectUrl);
      useAppStore
        .getState()
        .setNWCCapabilities(info.methods as Nip47Capability[]);
      useAppStore.getState().setNWCClient(nwcClient);
      Toast.show({
        type: "success",
        text1: "Wallet Connected",
        text2: "Your lightning wallet is ready to use",
      });
    } catch (error) {
      console.error(error);
      errorToast(error as Error);
    }
    setConnecting(false);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Setup Wallet Connection",
        }}
      />
      {hasConnection && (
        <View className="flex-1 p-3">
          <View className="flex-1 h-full flex flex-col items-center justify-center gap-5">
            <Text>Wallet Connected!</Text>
            {walletInfo ? (
              <Text className="self-start justify-self-start">
                {JSON.stringify(walletInfo, null, 2)}
              </Text>
            ) : (
              <Loading />
            )}
            {balance && (
              <Text className="self-start justify-self-start">
                {JSON.stringify(balance, null, 2)}
              </Text>
            )}
          </View>
          <Button
            variant="destructive"
            onPress={() => {
              useAppStore.getState().disconnectWallet();
              scan();
            }}
          >
            <Text>Disconnect Wallet</Text>
          </Button>
        </View>
      )}
      {!hasConnection && (
        <>
          {isConnecting && (
            <>
              <View className="flex-1 justify-center items-center">
                <Loading />
                <Text className="mt-4">Connecting to your Wallet</Text>
              </View>
            </>
          )}
          {!isConnecting && (
            <>
              {isScanning && (
                <Camera
                  onBarCodeScanned={handleBarCodeScanned}
                  style={{ flex: 1, width: "100%" }}
                  autoFocus={autoFocus}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={focusCamera}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "transparent",
                    }}
                  />
                </Camera>
              )}
              {!isScanning && (
                <>
                  <View className="flex-1 h-full flex flex-col items-center justify-center gap-5">
                    <CameraIcon className="text-black w-32 h-32" />
                    <Text className="text-2xl">Camera Permissions Needed</Text>
                    <Button onPress={scan}>
                      <Text className="text-background">Grant Permissions</Text>
                    </Button>
                  </View>
                </>
              )}
              <View className="absolute bottom-12 w-full z-10 flex flex-col items-center justify-center gap-3">
                <Button onPress={paste}>
                  <Text className="text-background">Paste from Clipboard</Text>
                </Button>
              </View>
            </>
          )}
        </>
      )}
    </>
  );
}
