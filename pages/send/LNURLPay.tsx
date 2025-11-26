import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { type LNURLPayServiceResponse, lnurl } from "~/lib/lnurl";

export function LNURLPay() {
  const { lnurlDetailsJSON, amount: amountParam } = useLocalSearchParams() as {
    lnurlDetailsJSON: string;
    receiver: string;
    amount: string;
  };
  const lnurlDetails: LNURLPayServiceResponse = JSON.parse(lnurlDetailsJSON);
  const isFixedAmount = lnurlDetails.minSendable === lnurlDetails.maxSendable;

  const [isLoading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState(
    isFixedAmount
      ? (lnurlDetails.minSendable / 1000).toString()
      : (amountParam ?? ""),
  );
  const [isAmountReadOnly] = React.useState(isFixedAmount);
  const [comment, setComment] = React.useState("");

  const isAmountInvalid = React.useMemo(() => {
    const min = Math.floor(lnurlDetails.minSendable / 1000);
    const max = Math.floor(lnurlDetails.maxSendable / 1000);

    return Number(amount) < min || Number(amount) > max;
  }, [amount, lnurlDetails.minSendable, lnurlDetails.maxSendable]);

  useEffect(() => {
    // Handle fixed amount LNURLs
    if (isFixedAmount) {
      Toast.show({
        type: "success",
        text1: "You are paying a fixed amount invoice",
        position: "top",
      });
    }
  }, [isFixedAmount]);

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
      <View className="flex flex-1 flex-col">
        <DualCurrencyInput
          amount={amount}
          setAmount={setAmount}
          description={comment}
          setDescription={setComment}
          min={Math.floor(lnurlDetails.minSendable / 1000)}
          max={Math.floor(lnurlDetails.maxSendable / 1000)}
          isAmountReadOnly={isAmountReadOnly}
        />
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
    </>
  );
}
