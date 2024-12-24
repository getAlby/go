import { Invoice } from "@getalby/lightning-tools";

import { Link, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Alert from "~/components/Alert";
import { AlertCircleIcon, WalletIcon, ZapIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import { Receiver } from "~/components/Receiver";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useTransactions } from "~/hooks/useTransactions";
import { ALBY_LIGHTNING_ADDRESS, DEFAULT_WALLET_NAME } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function ConfirmPayment() {
  const { data: transactions } = useTransactions();
  const { invoice, originalText, comment, successAction } =
    useLocalSearchParams() as {
      invoice: string;
      originalText: string;
      comment: string;
      successAction: string;
    };
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);

  async function pay() {
    setLoading(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      const response = await nwcClient.payInvoice({
        invoice,
      });

      console.info("payInvoice Response", response);

      if (originalText === ALBY_LIGHTNING_ADDRESS) {
        useAppStore.getState().updateLastAlbyPayment();
      }

      router.dismissAll();
      router.replace({
        pathname: "/send/success",
        params: {
          preimage: response.preimage,
          originalText,
          invoice,
          amount: decodedInvoice.satoshi,
          successAction,
        },
      });
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setLoading(false);
  }

  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  return (
    <>
      <Screen title="Confirm Payment" />
      <View className="flex-1 justify-center items-center gap-8 p-6">
        <View className="flex flex-col gap-2">
          <View className="flex flex-row items-center justify-center gap-2">
            <Text className="text-5xl font-bold2 text-foreground">
              {new Intl.NumberFormat().format(
                Math.ceil(decodedInvoice.satoshi),
              )}
            </Text>
            <Text className="text-3xl font-bold2 text-muted-foreground">
              sats
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-center text-muted-foreground text-3xl font-semibold2">
              {getFiatAmount(decodedInvoice.satoshi)}
            </Text>
          )}
        </View>
        {decodedInvoice.description ? (
          <View className="flex flex-col gap-2 justify-center items-center">
            <Text className="text-muted-foreground text-center font-semibold2">
              Description
            </Text>
            <Text className="text-center text-foreground text-2xl font-medium2">
              {decodedInvoice.description}
            </Text>
          </View>
        ) : (
          comment && (
            <View className="flex flex-col gap-2">
              <Text className="text-muted-foreground text-center font-semibold2">
                Comment
              </Text>
              <Text className="text-center text-foreground text-2xl font-medium2">
                {comment}
              </Text>
            </View>
          )
        )}
        <Receiver originalText={originalText} invoice={invoice} />
      </View>
      <View className="p-6 bg-background">
        <View className="flex flex-row items-center justify-center gap-2 mb-4 px-4">
          <WalletIcon className="text-muted-foreground" />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-muted-foreground font-medium2 text-xl"
          >
            {wallets[selectedWalletId].name || DEFAULT_WALLET_NAME}
          </Text>
        </View>
        {transactions?.transactions.some(
          (transaction) => transaction.state === "pending",
        ) && (
          <Link href="/transactions" asChild>
            <Pressable>
              <Alert
                type="info"
                title="One or more pending payments"
                description="Please check your transaction list before paying to ensure you do not make a payment twice."
                icon={AlertCircleIcon}
              />
            </Pressable>
          </Link>
        )}
        <Button
          size="lg"
          onPress={pay}
          className="flex flex-row gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loading className="text-primary-foreground" />
          ) : (
            <ZapIcon className="text-primary-foreground" />
          )}
          <Text>Pay</Text>
        </Button>
      </View>
    </>
  );
}
