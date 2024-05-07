import { BarCodeScanningResult, Camera } from "expo-camera";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { lnurl } from "lib/lnurl";
import { Button } from "~/components/ui/button";
import { Camera as CameraIcon } from "~/components/Icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { errorToast } from "~/lib/errorToast";

export function Send() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [isScanning, setScanning] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [autoFocus, setAutoFocus] = React.useState(true);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [keyboardText, setKeyboardText] = React.useState("");

  useEffect(() => {
    if (url) {
      loadPayment(url);
    } else {
      scan();
    }
  }, [url]);

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

  function openKeyboard() {
    setScanning(false);
    setKeyboardOpen(true);
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

  function submitKeyboardText() {
    loadPayment(keyboardText);
  }

  async function loadPayment(text: string) {
    const originalText = text;
    setLoading(true);
    try {
      if (text.startsWith("bitcoin:")) {
        const universalUrl = text.replace("bitcoin:", "http://");
        const url = new URL(universalUrl);
        const lightningParam = url.searchParams.get("lightning");
        if (!lightningParam) {
          throw new Error("No lightning param found in bitcoin payment link");
        }
        text = lightningParam;
      }
      const lnurlValue = lnurl.findLnurl(text);
      console.log("Checked lnurl value", text, lnurlValue);
      if (lnurlValue) {
        const lnurlDetails = await lnurl.getDetails(lnurlValue);

        if (lnurlDetails.tag !== "payRequest") {
          throw new Error("LNURL tag " + lnurlDetails.tag + " not supported");
        }

        router.push({
          pathname: "/send/lnurl-pay",
          params: {
            lnurlDetailsJSON: JSON.stringify(lnurlDetails),
            originalText,
          },
        });
      } else {
        router.push({
          pathname: "/send/confirm",
          params: { invoice: text, originalText },
        });
      }
    } catch (error) {
      console.error(error);
      errorToast(error as Error);
    }
    setLoading(false);
  }

  const focusCamera = () => {
    setAutoFocus(false);
    setTimeout(() => {
      setAutoFocus(true);
    }, 200);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Send",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
      )}
      {!isLoading && (
        <>
          {isScanning && (
            <>
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
              <View className="absolute bottom-12 w-full z-10 flex flex-col items-center justify-center gap-3">
                <Button onPress={paste}>
                  <Text className="text-background">Paste from Clipboard</Text>
                </Button>
                <Button onPress={openKeyboard}>
                  <Text className="text-background">Type an Address</Text>
                </Button>
              </View>
            </>
          )}
          {keyboardOpen && (
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss();
              }}
            >
              <View className="flex-1 h-full flex flex-col items-center justify-center gap-5 p-3">
                <Input
                  className="w-full text-center mt-6"
                  placeholder="hello@getalby.com"
                  value={keyboardText}
                  onChangeText={setKeyboardText}
                  // aria-errormessage="inputError"
                />
                <Button onPress={submitKeyboardText}>
                  <Text>Next</Text>
                </Button>
              </View>
            </TouchableWithoutFeedback>
          )}
          {!isScanning && !keyboardOpen && (
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
        </>
      )}
    </>
  );
}
