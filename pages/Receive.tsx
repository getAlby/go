import { Link, Stack, router } from "expo-router";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import * as Clipboard from "expo-clipboard";
import React from "react";
import { useAppStore } from "~/lib/state/appStore";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import QRCode from "react-native-qrcode-svg";
import { Text } from "~/components/ui/text";
import { Copy, ZapIcon } from "~/components/Icons";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import Toast from "react-native-toast-message";
import { errorToast } from "~/lib/errorToast";
import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";

export function Receive() {
  const [isLoading, setLoading] = React.useState(false);
  const [invoice, _setInvoice] = React.useState("");
  const invoiceRef = React.useRef("");
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [addComment, setAddComment] = React.useState(false);
  const [enterCustomAmount, setEnterCustomAmount] = React.useState(false);
  const lightningAddress = useAppStore((store) => store.lightningAddress);
  const getFiatAmount = useGetFiatAmount();

  function setInvoice(invoice: string) {
    _setInvoice(invoice);
    invoiceRef.current = invoice;
  }

  function generateInvoice(amount?: number) {
    if (!amount) {
      console.error("0-amount invoices are currently not supported");
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

        console.log("makeInvoice Response", response);

        setInvoice(response.invoice);
        setEnterCustomAmount(false);
      } catch (error) {
        console.error(error);
        errorToast(error as Error);
      }
      setLoading(false);
    })();
  }

  function copy() {
    const text = invoice || lightningAddress;
    Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard",
      text2: text,
    });
  }

  // TODO: move this somewhere else to have app-wide notifications of incoming payments
  React.useEffect(() => {
    if (useAppStore.getState().nwcCapabilities.indexOf("notifications") < 0) {
      Toast.show({
        type: "error",
        text1:
          "Wallet does not support notifications capability. Using fallback",
        position: "bottom"
      });
      let polling = true;
      let pollCount = 0;
      let prevTransaction: Nip47Transaction | undefined;
      (async () => {
        while (polling) {
          const transactions = await useAppStore
            .getState()
            .nwcClient?.listTransactions({
              limit: 1,
              type: "incoming",
            });
          const receivedTransaction = transactions?.transactions[0];
          if (receivedTransaction) {
            if (
              polling &&
              pollCount > 0 &&
              receivedTransaction.payment_hash !== prevTransaction?.payment_hash
            ) {
              if (
                !invoiceRef.current ||
                receivedTransaction.invoice === invoiceRef.current
              ) {
                router.dismissAll();
                router.navigate({
                  pathname: "/receive/success",
                  params: { invoice: receivedTransaction.invoice },
                });
              } else {
                console.log("Received another payment");
              }
            }
            prevTransaction = receivedTransaction;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          ++pollCount;
        }
      })();
      return () => {
        polling = false;
      };
    }

    const nwcClient = useAppStore.getState().nwcClient;
    if (!nwcClient) {
      throw new Error("NWC client not connected");
    }
    let unsub: (() => void) | undefined = undefined;
    (async () => {
      unsub = await nwcClient.subscribeNotifications((notification) => {
        console.log("RECEIVED notification", notification);
        if (notification.notification_type === "payment_received") {
          if (
            !invoiceRef.current ||
            notification.notification.invoice === invoiceRef.current
          ) {
            router.dismissAll();
            router.navigate({
              pathname: "/receive/success",
              params: { invoice: notification.notification.invoice },
            });
          } else {
            console.log("Received another payment");
          }
        }
      });
    })();
    return () => {
      unsub?.();
    };
  }, []);

  // React.useEffect(() => {
  //   generateInvoice();
  // }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Receive",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
      )}
      {!isLoading && (
        <>
          {!invoice && !lightningAddress && (
            <View className="flex-1 h-full flex flex-col items-center justify-center gap-5">
              <ZapIcon className="text-black w-32 h-32" />
              <Text className="text-2xl max-w-64 text-center">
                Receive Quickly with a Lightning Address
              </Text>
              <Link href="/settings/lightning-address" asChild>
                <Button className="touch-none">
                  <Text className="text-background">Set Lightning Address</Text>
                </Button>
              </Link>
            </View>
          )}
          {!enterCustomAmount && (invoice.length || lightningAddress) && (
            <View className="flex-1 justify-center items-center gap-5">
              <View className="flex flex-row justify-center items-center gap-3">
                <ActivityIndicator />
                <Text>Waiting for payment</Text>
              </View>
              <QRCode value={invoice || lightningAddress} size={300} />
              <Pressable onPress={copy}>
                <View className="flex flex-row items-center justify-center gap-3">
                  <Copy
                    className="text-muted-foreground"
                    width={16}
                    height={16}
                  />
                  <Text className="text-muted-foreground">
                    {invoice ? amount + " sats" : lightningAddress}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
          {/* TODO: move to one place - this is all copied from LNURL-Pay */}
          {!invoice && enterCustomAmount && (
            <TouchableWithoutFeedback
              onPress={() => {
                Keyboard.dismiss();
              }}
            >
              <View className="flex-1 h-full flex flex-col items-center justify-center gap-5 p-3">
                <Input
                  className="w-full border-transparent text-center bg-muted"
                  placeholder="0"
                  keyboardType="number-pad"
                  value={amount}
                  onChangeText={setAmount}
                  aria-labelledbyledBy="amount"
                  style={styles.amountInput}
                // aria-errormessage="inputError"
                />
                <Label
                  nativeID="amount"
                  className="self-start justify-self-start"
                >
                  sats
                </Label>
                {getFiatAmount && <Text>{getFiatAmount(+amount)}</Text>}

                {!addComment && (
                  <Button
                    variant="ghost"
                    className="mt-3"
                    onPress={() => setAddComment(true)}
                  >
                    <Text className="text-muted-foreground">+ add comment</Text>
                  </Button>
                )}
                {addComment && (
                  <Input
                    className="w-full text-center mt-6"
                    placeholder="comment"
                    value={comment}
                    onChangeText={setComment}
                    aria-labelledbyledBy="comment"
                  // aria-errormessage="inputError"
                  />
                )}

                <Button onPress={() => generateInvoice(+amount)}>
                  <Text>Generate</Text>
                </Button>
              </View>
            </TouchableWithoutFeedback>
          )}

          <View className="w-full flex flex-col items-center justify-center gap-3">
            {!enterCustomAmount && (
              <Button
                variant="secondary"
                onPress={() => setEnterCustomAmount(true)}
              >
                <Text>Enter Custom Amount</Text>
              </Button>
            )}
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  amountInput: {
    fontSize: 80,
    height: 100,
  },
});
