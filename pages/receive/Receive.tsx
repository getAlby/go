import * as Clipboard from "expo-clipboard";
import { Link, router } from "expo-router";
import React from "react";
import { Pressable, Share, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ShareIcon, WithdrawIcon, ZapIcon } from "~/components/Icons";
import QRCode from "~/components/QRCode";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
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
      <Screen title="Receive" animation="slide_from_left" />
      {lightningAddress ? (
        <>
          <View className="flex-1 justify-center items-center gap-8">
            <QRCode value={lightningAddress} />
            <View className="flex flex-col items-center justify-center gap-2">
              <TouchableOpacity onPress={copy}>
                <Text className="text-foreground text-xl font-medium2">
                  {lightningAddress}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex flex-row gap-3 p-6">
            <Button
              onPress={share}
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
            >
              <ShareIcon className="text-muted-foreground" />
              <Text>Share</Text>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
              onPress={() => {
                router.push("/receive/withdraw");
              }}
            >
              <WithdrawIcon className="text-muted-foreground" />
              <Text>Withdraw</Text>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
              onPress={() => {
                router.push("/receive/invoice");
              }}
            >
              <ZapIcon className="text-muted-foreground" />
              <Text>Invoice</Text>
            </Button>
          </View>
        </>
      ) : (
        <>
          <View className="flex-1 flex flex-col p-3 gap-3">
            <Link href="/receive/invoice" asChild>
              <Pressable>
                <Card className="w-full">
                  <CardContent className="flex flex-row items-center gap-4">
                    <ZapIcon className="text-muted-foreground" />
                    <View className="flex flex-1 flex-col">
                      <CardTitle>Lightning invoice</CardTitle>
                      <CardDescription>
                        Request instant and specific amount bitcoin payments
                      </CardDescription>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            </Link>
            <Link href="/receive/withdraw" asChild>
              <Pressable>
                <Card className="w-full">
                  <CardContent className="flex flex-row items-center gap-4">
                    <WithdrawIcon className="text-muted-foreground" />
                    <View className="flex flex-1 flex-col">
                      <CardTitle>Redeem</CardTitle>
                      <CardDescription>
                        Withdraw a bitcoin voucher instantly via an LNURL code
                      </CardDescription>
                    </View>
                  </CardContent>
                </Card>
              </Pressable>
            </Link>
          </View>
        </>
      )}
    </>
  );
}
