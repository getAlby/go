import { BarCodeScanningResult, Camera } from "expo-camera";
import React, { useEffect } from "react";
import { ActivityIndicator, Text as RNText, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAppStore } from "lib/state/appStore";
import { lnurl } from "lib/lnurl";
import { Invoice } from "@getalby/lightning-tools";
import { Button } from "~/components/ui/button";
import { Camera as CameraIcon } from "~/components/Icons";
import { Stack, router } from "expo-router";
import { Text } from "~/components/ui/text";

export function Send() {
  const [isScanning, setScanning] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);

  useEffect(() => {
    scan();
  }, []);

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setScanning(status === "granted");
  }

  async function paste() {
    let clipboardText;
    try {
      clipboardText = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      return;
    }
    loadPayment(clipboardText);
  }

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    setScanning((current) => {
      if (current === true) {
        loadPayment(data);
      }
      return false;
    });
    console.log(`Bar code with data ${data} has been scanned!`);
  };

  async function loadPayment(text: string) {
    setLoading(true);
    try {
      const lnurlValue = lnurl.findLnurl(text);
      if (lnurlValue) {
        /*const lnurlDetails = await lnurl.getDetails(lnurlValue);

        if (lnurlDetails.tag !== "payRequest") {
          throw new Error("LNURL tag " + lnurlDetails.tag + " not supported");
        }

        // TODO: allow user to enter these
        const callback = new URL(lnurlDetails.callback);
        callback.searchParams.append("amount", "1000");
        callback.searchParams.append("comment", "Test");
        callback.searchParams.append("payerdata", JSON.stringify({ test: 1 }));
        const lnurlPayInfo = await lnurl.getPayRequest(callback.toString());
        console.log("Got pay request", lnurlPayInfo.pr);
        text = lnurlPayInfo.pr;*/
        console.error("TODO");
      } else {
        router.push({ pathname: "/send/confirm", params: { invoice: text } });
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Send",
        }}
      />
      {isLoading && <ActivityIndicator />}
      {!isLoading && (
        <>
          {isScanning && (
            <>
              <Camera
                onBarCodeScanned={handleBarCodeScanned}
                style={{ flex: 1, width: "100%" }}
              />
              <View className="absolute bottom-12 w-full z-10 flex flex-row items-center justify-center gap-3">
                <Button onPress={paste}>
                  <RNText className="text-background">
                    Paste from Clipboard
                  </RNText>
                </Button>
              </View>
            </>
          )}
          {!isScanning && (
            <>
              <View className="flex-1 h-full flex flex-col items-center justify-center gap-5">
                <CameraIcon className="text-black w-32 h-32" />
                <Text className="text-2xl">Camera Permissions Needed</Text>
                <Button onPress={scan}>
                  <RNText className="text-background">Grant Permissions</RNText>
                </Button>
              </View>
            </>
          )}
        </>
      )}
    </>
  );
}
