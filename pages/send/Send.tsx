import { NWAClient } from "@getalby/sdk/nwc";
import { Camera } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";
import { AddressIcon, ImageIcon, PasteIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";

export function Send() {
  const { url, amount } = useLocalSearchParams<{
    url: string;
    amount: string;
  }>();

  const [isLoading, setLoading] = React.useState(false);
  const [startScanning, setStartScanning] = React.useState(false);

  async function pickImage() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!",
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const scannedCodes = await Camera.scanFromURLAsync(
          result.assets[0].uri,
        );
        if (scannedCodes.length > 0 && scannedCodes[0].data) {
          await loadPayment(scannedCodes[0].data);
        } else {
          Alert.alert(
            "No QR Code Found",
            "Could not find a QR code in the selected image.",
          );
        }
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      Alert.alert(
        "Error Scanning Image",
        "An error occurred while trying to scan the image for a QR code.",
      );
    } finally {
      setLoading(false);
    }
  }

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
      const nwaOptions = NWAClient.parseWalletAuthUrl(text);
      router.replace({
        pathname: "/settings/wallets/connect",
        params: {
          options: JSON.stringify(nwaOptions),
          flow: "nwa",
        },
      });
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
      <View className="flex-1 bg-background pt-2">
        {isLoading ? (
          <View className="flex-1 flex flex-col items-center justify-center">
            <Loading className="text-primary-foreground" />
          </View>
        ) : (
          <>
            <QRCodeScanner
              onScanned={handleScanned}
              startScanning={startScanning}
            />
            <View className="flex flex-row items-stretch justify-center gap-4 p-6">
              <Button
                variant="secondary"
                className="flex-1 flex flex-col gap-2"
                onPress={pickImage}
              >
                <ImageIcon
                  width={32}
                  height={32}
                  className="text-muted-foreground"
                />
                <Text numberOfLines={1}>Import</Text>
              </Button>
              <Button
                variant="secondary"
                className="flex-1 flex flex-col gap-2"
                onPress={() => {
                  router.push("/send/address");
                }}
              >
                <AddressIcon
                  width={32}
                  height={32}
                  className="text-muted-foreground"
                />
                <Text numberOfLines={1}>Address</Text>
              </Button>
              <Button
                variant="secondary"
                className="flex-1 flex flex-col gap-2"
                onPress={paste}
              >
                <PasteIcon
                  width={32}
                  height={32}
                  className="text-muted-foreground"
                />
                <Text numberOfLines={1}>Paste</Text>
              </Button>
            </View>
          </>
        )}
      </View>
    </>
  );
}
