import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React from "react";
import { Image, View } from "react-native";
import Toast from "react-native-toast-message";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import { CopyIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import QRCode from "~/components/QRCode";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const lightningAddress = wallets[selectedWalletId].lightningAddress;

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
    const text = invoice || lightningAddress;
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

  React.useEffect(() => {
    let polling = true;
    let pollCount = 0;
    let prevTransaction: Nip47Transaction | undefined;
    (async () => {
      while (polling) {
        try {
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
              if (invoice && receivedTransaction.invoice === invoice) {
                router.dismissAll();
                router.navigate({
                  pathname: "/receive/success",
                  params: { invoice: receivedTransaction.invoice },
                });
              } else {
                console.info("Received another payment");
              }
            }
            prevTransaction = receivedTransaction;
          }
          ++pollCount;
        } catch (error) {
          console.error("Failed to list transactions", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();
    return () => {
      polling = false;
    };
  }, [invoice]);

  return (
    <>
      <Screen title="Invoice" animation="slide_from_left" />
      {invoice ? (
        <>
          <View className="flex-1 justify-center items-center gap-8">
            <View className="justify-center">
              <QRCode value={invoice} />
              <View className="absolute self-center p-2 rounded-2xl bg-white">
                <Image
                  source={require("../../assets/icon.png")}
                  className="w-20 h-20 rounded-xl"
                  resizeMode="contain"
                />
              </View>
            </View>
            <View className="flex flex-col items-center justify-center gap-2">
              <View className="flex flex-row items-end">
                <Text className="text-foreground text-3xl font-semibold2">
                  {new Intl.NumberFormat().format(+amount)}{" "}
                </Text>
                <Text className="text-muted-foreground text-2xl font-semibold2">
                  sats
                </Text>
              </View>
              {getFiatAmount && (
                <Text className="text-muted-foreground text-2xl font-medium2">
                  {getFiatAmount(+amount)}
                </Text>
              )}
            </View>
            <View className="flex flex-row justify-center items-center gap-3">
              <Loading />
              <Text className="text-xl">Waiting for payment</Text>
            </View>
          </View>
          <View className="flex flex-row gap-3 p-6">
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
        <DismissableKeyboardView>
          <View className="flex-1 flex flex-col">
            <View className="flex-1 h-full flex flex-col justify-center gap-5 p-3">
              <DualCurrencyInput
                amount={amount}
                setAmount={setAmount}
                autoFocus
              />
              <View>
                <Text className="text-muted-foreground text-center mt-6">
                  Description (optional)
                </Text>
                <Input
                  className="w-full text-center border-transparent bg-transparent native:text-2xl font-semibold2"
                  placeholder="No description"
                  value={comment}
                  onChangeText={setComment}
                  returnKeyType="done"
                />
              </View>
            </View>
            <View className="m-6">
              <Button
                size="lg"
                className="flex flex-row gap-2"
                onPress={() => generateInvoice(+amount)}
                disabled={isLoading}
              >
                {isLoading && <Loading className="text-primary-foreground" />}
                <Text>Create Invoice</Text>
              </Button>
            </View>
          </View>
        </DismissableKeyboardView>
      )}
    </>
  );
}
