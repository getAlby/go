import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { BookUserIcon, KeyboardIcon, PasteIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";
import { handleLink } from "~/lib/link";

export function Send() {
  const { url, amount } = useLocalSearchParams<{
    url: string;
    amount: string;
  }>();

  const [isLoading, setLoading] = React.useState(false);
  const [startScanning, setStartScanning] = React.useState(false);

  async function paste() {
    let clipboardText;
    try {
      clipboardText = await Clipboard.getStringAsync();
    } catch (error) {
      console.error("Failed to read clipboard", error);
      return;
    }
    await loadPayment(clipboardText);
  }

  const handleScanned = async (data: string) => {
    return loadPayment(data);
  };

  const loadPayment = async (text: string, amount = "") => {
    if (!text) {
      errorToast(new Error("Your clipboard is empty."));
      return false;
    }

    if (text.startsWith("nostr+walletauth") /* can have : or +alby: */) {
      handleLink(text);
      return true;
    }
    setLoading(true);
    const result = await initiatePaymentFlow(text, amount);
    setLoading(false);
    return result;
  };

  React.useEffect(() => {
    if (url) {
      (async () => {
        const result = await loadPayment(url, amount);
        // Delay the camera to show the error message
        if (!result) {
          setTimeout(() => {
            setStartScanning(true);
          }, 2000);
        }
      })();
    } else {
      setStartScanning(true);
    }
  }, [url, amount]);

  return (
    <>
      <Screen title="Send" />
      {isLoading && (
        <View className="flex-1 flex flex-col items-center justify-center">
          <Loading className="text-primary-foreground" />
        </View>
      )}
      {!isLoading && (
        <>
          <QRCodeScanner
            onScanned={handleScanned}
            startScanning={startScanning}
          />
          <View className="flex flex-row items-stretch justify-center gap-4 p-6">
            <Button
              onPress={() => {
                router.push("/send/manual");
              }}
              variant="secondary"
              className="flex flex-col gap-2 flex-1"
            >
              <KeyboardIcon className="text-muted-foreground" />
              <Text numberOfLines={1}>Manual</Text>
            </Button>
            <Button
              variant="secondary"
              className="flex flex-col gap-2 flex-1"
              onPress={() => {
                router.push("/send/address-book");
              }}
            >
              <BookUserIcon className="text-muted-foreground" />
              <Text numberOfLines={1}>Contacts</Text>
            </Button>
            <Button
              onPress={paste}
              variant="secondary"
              className="flex flex-col gap-2 flex-1"
            >
              <PasteIcon className="text-muted-foreground" />
              <Text numberOfLines={1}>Paste</Text>
            </Button>
          </View>
        </>
      )}
    </>
  );
}
