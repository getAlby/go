import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Toast } from "toastify-react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import Loading from "~/components/Loading";
import { Receiver } from "~/components/Receiver";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { type LNURLPayServiceResponse, lnurl } from "~/lib/lnurl";
import { cn } from "~/lib/utils";

export function LNURLPay() {
  const {
    lnurlDetailsJSON,
    receiver,
    amount: amountParam,
  } = useLocalSearchParams() as {
    lnurlDetailsJSON: string;
    receiver: string;
    amount: string;
  };
  const lnurlDetails: LNURLPayServiceResponse = JSON.parse(lnurlDetailsJSON);
  const [isLoading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState(amountParam ?? "");
  const [comment, setComment] = React.useState("");
  const [isAmountReadOnly, setAmountReadOnly] = React.useState(false);

  const isAmountInvalid = React.useMemo(() => {
    const min = Math.floor(lnurlDetails.minSendable / 1000);
    const max = Math.floor(lnurlDetails.maxSendable / 1000);

    return Number(amount) < min || Number(amount) > max;
  }, [amount, lnurlDetails.minSendable, lnurlDetails.maxSendable]);

  useEffect(() => {
    // Handle fixed amount LNURLs
    if (lnurlDetails.minSendable === lnurlDetails.maxSendable) {
      setAmount((lnurlDetails.minSendable / 1000).toString());
      setAmountReadOnly(true);
      Toast.show({
        type: "success",
        text1: "You are paying a fixed amount invoice",
        position: "top",
      });
    }
  }, [lnurlDetails.minSendable, lnurlDetails.maxSendable]);

  async function requestInvoice() {
    setLoading(true);
    try {
      const callback = new URL(lnurlDetails.callback);
      callback.searchParams.append("amount", (+amount * 1000).toString());
      if (comment) {
        callback.searchParams.append("comment", comment);
      }
      let recipientIdentifier = "";
      try {
        recipientIdentifier =
          (
            JSON.parse(decodeURIComponent(lnurlDetails.metadata)) as string[][]
          ).find((t) => t[0] === "text/identifier")?.[1] || "";
      } catch (error) {
        console.error("failed to parse recipient identifier", error);
      }
      const lnurlPayInfo = await lnurl.getPayRequest(callback.toString());
      router.push({
        pathname: "/send/confirm",
        params: {
          invoice: lnurlPayInfo.pr,
          receiver: recipientIdentifier,
          comment,
          successAction: lnurlPayInfo.successAction
            ? JSON.stringify(lnurlPayInfo.successAction)
            : undefined,
        },
      });
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setLoading(false);
  }

  return (
    <>
      <Screen title="Send" />
      <DismissableKeyboardView>
        <View className="flex-1 flex flex-col">
          <View className="flex-1 justify-center items-center p-6 gap-6">
            <DualCurrencyInput
              amount={amount}
              setAmount={setAmount}
              readOnly={isAmountReadOnly}
              autoFocus={!isAmountReadOnly && !amount}
              min={Math.floor(lnurlDetails.minSendable / 1000)}
              max={Math.floor(lnurlDetails.maxSendable / 1000)}
            />
            <View className="w-full">
              <Text
                className={cn(
                  "text-muted-foreground text-center font-semibold2",
                  amount && isAmountInvalid ? "text-destructive" : "",
                )}
              >
                Between{" "}
                {new Intl.NumberFormat().format(
                  Math.floor(lnurlDetails.minSendable / 1000),
                )}
                {" and "}
                {new Intl.NumberFormat().format(
                  Math.floor(lnurlDetails.maxSendable / 1000),
                )}{" "}
                sats
              </Text>
            </View>
            {!!lnurlDetails.commentAllowed && (
              <View className="w-full">
                <Text className="text-muted-foreground text-center font-semibold2">
                  Comment
                </Text>
                <Input
                  className="w-full border-transparent bg-transparent text-center native:text-2xl font-semibold2"
                  placeholder="Enter an optional comment"
                  value={comment}
                  onChangeText={setComment}
                  returnKeyType="done"
                />
              </View>
            )}
            <Receiver lightningAddress={receiver} />
          </View>
          <View className="p-6">
            <Button
              size="lg"
              className="flex flex-row gap-2"
              onPress={requestInvoice}
              disabled={isLoading || isAmountInvalid}
            >
              {isLoading && <Loading className="text-primary-foreground" />}
              <Text>Next</Text>
            </Button>
          </View>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
