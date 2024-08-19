import { BarCodeScanningResult, Camera } from "expo-camera/legacy"; // TODO: check if Android camera detach bug is fixed and update camera
import React, { useEffect } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { lnurl } from "lib/lnurl";
import { Button } from "~/components/ui/button";
import {
  BookUser,
  Camera as CameraIcon,
  ClipboardPaste,
  Keyboard as KeyboardIcon,
} from "~/components/Icons";
import { Link, Stack, router, useLocalSearchParams } from "expo-router";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { errorToast } from "~/lib/errorToast";
import Loading from "~/components/Loading";
import { FocusableCamera } from "~/components/FocusableCamera";

export function Send() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [isScanning, setScanning] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [keyboardOpen, setKeyboardOpen] = React.useState(false);
  const [keyboardText, setKeyboardText] = React.useState("");

  useEffect(() => {
    if (url) {
      loadPayment(url);
    } else {
      // Add some timeout to allow the screen transition to finish before
      // starting the camera to avoid stutters
      setLoading(true);
      window.setTimeout(async () => {
        await scan();
        setLoading(false);
      }, 200);
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

  const handleScanned = (data: string) => {
    setScanning((current) => {
      if (current === true) {
        loadPayment(data);
      }
      return false;
    });
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
      if (text.startsWith("lightning:")) {
        text = text.substring("lightning:".length);
      }
      const lnurlValue = lnurl.findLnurl(text);
      console.log("Checked lnurl value", text, lnurlValue);
      if (lnurlValue) {
        const lnurlDetails = await lnurl.getDetails(lnurlValue);

        if (lnurlDetails.tag !== "payRequest") {
          throw new Error("LNURL tag " + lnurlDetails.tag + " not supported");
        }

        router.replace({
          pathname: "/send/lnurl-pay",
          params: {
            lnurlDetailsJSON: JSON.stringify(lnurlDetails),
            originalText,
          },
        });
      } else {
        router.replace({
          pathname: "/send/confirm",
          params: { invoice: text, originalText },
        });
      }
    } catch (error) {
      console.error(error);
      errorToast(error as Error);
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Send",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <Loading />
        </View>
      )}
      {!isLoading && (
        <>
          {isScanning && (
            <>
              <FocusableCamera onScanned={handleScanned} />
              <View className="flex flex-row items-stretch justify-center gap-3 p-6">
                <Button onPress={paste} variant="secondary">
                  <ClipboardPaste className="text-background" />
                  <Text>Clipboard</Text>
                </Button>
                <Button onPress={openKeyboard} variant="secondary">
                  <KeyboardIcon className="text-background" />
                  <Text>Manual</Text>
                </Button>
                <Link href="/send/address-book" asChild>
                  <Button variant="secondary">
                    <BookUser className="text-background" />
                    <Text>Contacts</Text>
                  </Button>
                </Link>
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
