import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React from "react";
import { Share, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { CreateInvoice } from "~/components/CreateInvoice";
import {
  AddressIcon,
  CopyIcon,
  EditIcon,
  ScanIcon,
  ShareIcon,
} from "~/components/Icons";
import RedeemIcon from "~/components/icons/RedeemIcon";
import QRCode from "~/components/QRCode";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function Receive() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const lightningAddress = wallets[selectedWalletId].lightningAddress;

  function copy() {
    const text = lightningAddress;
    if (!text) {
      errorToast(new Error("Nothing to copy"));
      return;
    }
    Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
    });
  }

  async function share() {
    const message = lightningAddress;
    try {
      if (!message) {
        throw new Error("no lightning address set");
      }
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      errorToast(error);
    }
  }

  return (
    <>
      <Screen
        title="Receive"
        animation="slide_from_left"
        right={() =>
          !lightningAddress && (
            <>
              <TouchableOpacity
                className="px-4"
                onPressIn={() => {
                  router.push("/receive/lightning-address");
                }}
              >
                <AddressIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="-mr-2 px-4"
                onPressIn={() => {
                  router.push("receive/withdraw");
                }}
              >
                <ScanIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
            </>
          )
        }
      />
      {!lightningAddress ? (
        <CreateInvoice />
      ) : (
        <View className="flex-1">
          <View className="flex-1 justify-center items-center gap-4">
            <QRCode value={lightningAddress} />
            <View className="flex flex-col items-center justify-center">
              <TouchableOpacity
                onPress={copy}
                className="flex flex-row items-center gap-2 mt-2"
              >
                <Text className="text-xl font-medium2">{lightningAddress}</Text>
                <CopyIcon className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex flex-row gap-4 p-6">
            <Button
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
              onPress={() => {
                router.push("/receive/withdraw");
              }}
            >
              <RedeemIcon width={32} height={32} />
              <Text numberOfLines={1}>Redeem</Text>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
              onPress={share}
            >
              <ShareIcon
                width={32}
                height={32}
                className="text-muted-foreground"
              />
              <Text numberOfLines={1}>Share</Text>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
              onPress={() => {
                router.push("/receive/invoice");
              }}
            >
              <EditIcon
                width={32}
                height={32}
                className="text-muted-foreground"
              />
              <Text numberOfLines={1}>Amount</Text>
            </Button>
          </View>
        </View>
      )}
    </>
  );
}
