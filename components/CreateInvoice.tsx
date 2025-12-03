import type { Nip47Transaction } from "@getalby/sdk";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React from "react";
import { Share, View } from "react-native";
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

export function CreateInvoice() {
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);
  const [invoice, setInvoice] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");

  function generateInvoice(amount?: number) {
    if (!amount) {
      errorToast(new Error("0-amount invoices are currently not supported"));
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
        errorToast(error);
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
      router.navigate({
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
        <>
          <View className="flex-1 justify-center items-center gap-6">
            <View className="flex flex-row justify-center items-center gap-3">
              <Loading />
              <Text className="text-xl">Waiting for payment</Text>
            </View>
            <QRCode value={invoice} showAvatar />
            <View className="flex flex-col items-center justify-center gap-2">
              <Text className="text-foreground text-3xl font-semibold2">
                {new Intl.NumberFormat().format(+amount)} sats
              </Text>
              {getFiatAmount && (
                <Text className="text-muted-foreground text-2xl font-medium2">
                  {getFiatAmount(+amount)}
                </Text>
              )}
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
              onPress={copy}
              className="flex-1 flex flex-col gap-2"
            >
              <CopyIcon className="text-muted-foreground" />
              <Text>Copy</Text>
            </Button>
          </View>
        </>
      ) : (
        <View className="flex flex-1 flex-col">
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
