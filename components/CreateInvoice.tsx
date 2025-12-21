import type { Nip47Transaction } from "@getalby/sdk";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React from "react";
import { Platform, Share, View } from "react-native";
import Toast from "react-native-toast-message";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import { CopyIcon, ShareIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCode from "~/components/QRCode";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";
import { cn, formatBitcoinAmount } from "~/lib/utils";

export function CreateInvoice() {
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);
  const [invoice, setInvoice] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );

  function generateInvoice(amount?: number) {
    if (!amount) {
      errorToast(new Error("0-amount invoices are not supported"));
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const nwcClient = useAppStore.getState().nwcClient;
        if (!nwcClient) {
          throw new Error("NWC client not connected");
        }
        const response = await nwcClient.makeInvoice({
          amount: amount * 1000 /*FIXME: allow 0-amount invoices */,
          ...(comment ? { description: comment } : {}),
        });

        console.info("makeInvoice Response", response);

        setInvoice(response.invoice);
      } catch (error) {
        console.error(error);
        errorToast(error, "Failed to create invoice");
      }
      setLoading(false);
    })();
  }

  function copy() {
    const text = invoice;
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
    const message = invoice;
    if (!message) {
      errorToast(new Error("No invoice set"));
    }
    await Share.share({
      message,
    });
  }

  React.useEffect(() => {
    if (!invoice) {
      return;
    }

    let polling = true;
    let unsubscribe: (() => void) | undefined;
    const nwcClient = useAppStore.getState().nwcClient;

    const handlePaymentReceived = (transaction: Nip47Transaction) => {
      if (!polling) {
        return;
      }
      polling = false;
      unsubscribe?.();
      router.dismissAll();
      router.replace({
        pathname: "/receive/success",
        params: { invoice: transaction.invoice },
      });
    };

    (async () => {
      if (!nwcClient) {
        return;
      }

      try {
        const info = await nwcClient.getWalletServiceInfo();
        if (info.notifications?.includes("payment_received")) {
          unsubscribe = await nwcClient.subscribeNotifications(
            (notification) => {
              if (
                notification.notification_type === "payment_received" &&
                notification.notification.invoice === invoice
              ) {
                handlePaymentReceived(notification.notification);
              }
            },
            ["payment_received"],
          );
          return;
        }
      } catch (error) {
        console.error("Failed to subscribe to payment notifications", error);
      }

      while (polling) {
        try {
          const transaction = await nwcClient.lookupInvoice({
            invoice,
          });
          if (transaction.state === "settled") {
            handlePaymentReceived(transaction);
          }
          if (!polling) {
            break;
          }
        } catch (error) {
          console.error("Failed to poll invoice status", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    })();
    return () => {
      polling = false;
      unsubscribe?.();
    };
  }, [invoice]);

  return (
    <>
      {invoice ? (
        <View className="flex-1">
          <View className="flex-1 justify-center items-center gap-6 mt-4">
            <View className="flex flex-row justify-center items-center gap-2">
              <Loading />
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-lg ios:sm:text-xl",
                    android: "android:text-lg",
                  }),
                  "font-medium2",
                )}
              >
                Waiting for payment
              </Text>
            </View>
            <QRCode value={invoice} showAvatar />
            <View className="flex flex-col items-center justify-center gap-2">
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-3xl ios:sm:text-4xl",
                    android: "android:text-3xl",
                  }),
                  "font-semibold2",
                )}
              >
                {formatBitcoinAmount(+amount, bitcoinDisplayFormat)}
              </Text>
              {getFiatAmount && (
                <Text
                  className={cn(
                    Platform.select({
                      ios: "ios:text-xl ios:sm:text-2xl",
                      android: "android:text-xl",
                    }),
                    "text-secondary-foreground font-semibold2",
                  )}
                >
                  {getFiatAmount(+amount)}
                </Text>
              )}
            </View>
          </View>
          <View className="flex flex-row gap-3 p-6">
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
              <Text>Share</Text>
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex flex-col gap-2"
              onPress={copy}
            >
              <CopyIcon
                width={32}
                height={32}
                className="text-muted-foreground"
              />
              <Text>Copy</Text>
            </Button>
          </View>
        </View>
      ) : (
        <View className="flex-1">
          <DualCurrencyInput
            amount={amount}
            setAmount={setAmount}
            description={comment}
            setDescription={setComment}
          />
          <View className="m-6">
            <Button
              size="lg"
              className="flex flex-row gap-2"
              onPress={() => generateInvoice(+amount)}
              disabled={!+amount || isLoading}
            >
              {isLoading && <Loading className="text-primary-foreground" />}
              <Text>Create Invoice</Text>
            </Button>
          </View>
        </View>
      )}
    </>
  );
}
