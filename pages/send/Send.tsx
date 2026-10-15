import { NWAClient } from "@getalby/sdk/nwc";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { AddressIcon, ImageIcon, PasteIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCodeScanner from "~/components/QRCodeScanner";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";
import { readClipboardText } from "~/lib/utils";

export function Send() {
  const { t } = useTranslation();
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
      errorToast(new Error(t("send.scan.cameraRollPermission")));
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
            t("send.scan.noQrCodeTitle"),
            t("send.scan.noQrCodeMessage"),
          );
        }
      }
    } catch {
      Alert.alert(
        t("send.scan.scanImageErrorTitle"),
        t("send.scan.scanImageErrorMessage"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function paste() {
    const clipboardText = await readClipboardText();
    if (clipboardText) {
      await loadPayment(clipboardText);
    }
  }

  const handleScanned = async (data: string) => {
    return loadPayment(data);
  };

  const loadPayment = async (text: string, amount = "") => {
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
        await loadPayment(url, amount);
        // Delay the camera to show the error message
        setTimeout(() => {
          setStartScanning(true);
        }, 2000);
      })();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the async branch above, which must stay in this effect
      setStartScanning(true);
    }
  }, [url, amount]);

  return (
    <>
      <Screen title={t("send.title")} />
      <View className="flex-1 pt-2">
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
                <Text numberOfLines={1}>{t("send.scan.import")}</Text>
              </Button>
              <Button
                variant="secondary"
                className="flex-1 flex flex-col gap-2"
                onPress={() => {
                  router.navigate("/send/address");
                }}
              >
                <AddressIcon
                  width={32}
                  height={32}
                  className="text-muted-foreground"
                />
                <Text numberOfLines={1}>{t("send.scan.address")}</Text>
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
                <Text numberOfLines={1}>{t("common.paste")}</Text>
              </Button>
            </View>
          </>
        )}
      </View>
    </>
  );
}
