import { Invoice } from "@getalby/lightning-tools/bolt11";
import { Link, router, useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Alert from "~/components/Alert";
import { AlertCircleIcon, ZapIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import { LongTextBottomSheet } from "~/components/LongTextBottomSheet";
import { Receiver } from "~/components/Receiver";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { WalletSwitcher } from "~/components/WalletSwitcher";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useTransactions } from "~/hooks/useTransactions";
import { ALBY_LIGHTNING_ADDRESS } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function ConfirmPayment() {
  const { data: transactions } = useTransactions();
  const { invoice, comment, successAction, amount, receiver } =
    useLocalSearchParams() as {
      invoice: string;
      comment: string;
      successAction: string;
      amount?: string;
      receiver?: string;
    };
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  const amountToPaySats = amount ? +amount : decodedInvoice.satoshi;

  const navigation = useNavigation();

  async function pay() {
    setLoading(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      const response = await nwcClient.payInvoice({
        invoice,
        amount: amount ? amountToPaySats * 1000 : undefined,
        metadata: {
          ...(comment && { comment }),
          ...(receiver && {
            recipient_data: { identifier: receiver },
          }),
        },
      });

      console.info("payInvoice Response", response);

      if (receiver === ALBY_LIGHTNING_ADDRESS) {
        useAppStore.getState().updateLastAlbyPayment();
      }

      if (!navigation.isFocused()) {
        return;
      }

      router.dismissAll();
      router.replace({
        pathname: "/send/success",
        params: {
          amount: amountToPaySats,
          successAction,
        },
      });
    } catch (error) {
      console.error(error);
      errorToast(error, "Failed to make payment");
    }
    setLoading(false);
  }

  const displayCharacterCount = React.useMemo(
    () =>
      Math.ceil(amountToPaySats).toString().length +
      (bitcoinDisplayFormat === "bip177" ? 1 : 4),
    [amountToPaySats, bitcoinDisplayFormat],
  );

  return (
    <>
      <Screen title="Confirm Payment" />
      <View className="flex-1 justify-around items-center p-6">
        <View className="flex flex-col gap-2">
          <Text className="text-center text-muted-foreground font-medium2 sm:text-lg">
            Send
          </Text>
          <View className="flex flex-row items-center justify-center gap-2">
            {bitcoinDisplayFormat === "bip177" && (
              <Text
                className={cn(
                  displayCharacterCount > 8 ? "text-4xl" : "text-5xl",
                  displayCharacterCount <= 10 &&
                    displayCharacterCount >= 8 &&
                    "sm:text-5xl",
                  "text-secondary-foreground !leading-[1.5] font-bold2",
                )}
              >
                ₿
              </Text>
            )}
            <Text
              className={cn(
                displayCharacterCount > 8 ? "text-4xl" : "text-5xl",
                displayCharacterCount <= 10 &&
                  displayCharacterCount >= 8 &&
                  "sm:text-5xl",
                "!leading-[1.5] font-bold2",
              )}
            >
              {new Intl.NumberFormat().format(Math.ceil(amountToPaySats))}
              {bitcoinDisplayFormat === "sats" && (
                <Text
                  className={cn(
                    displayCharacterCount > 8 ? "text-3xl" : "text-4xl",
                    displayCharacterCount <= 10 &&
                      displayCharacterCount >= 8 &&
                      "sm:text-4xl",
                    "text-secondary-foreground font-semibold2",
                  )}
                >
                  {" "}
                  sats
                </Text>
              )}
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-center text-secondary-foreground text-3xl font-semibold2">
              {getFiatAmount(amountToPaySats)}
            </Text>
          )}
        </View>
        <Receiver lightningAddress={receiver} />
        {decodedInvoice.description ? (
          <LongTextBottomSheet
            title="Description"
            content={decodedInvoice.description}
          />
        ) : (
          comment && <LongTextBottomSheet title="Comment" content={comment} />
        )}
      </View>
      <View className="p-6">
        <WalletSwitcher selectedWalletId={selectedWalletId} wallets={wallets} />
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
