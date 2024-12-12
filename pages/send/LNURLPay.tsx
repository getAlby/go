import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import { AlertCircle } from "~/components/Icons";
import Loading from "~/components/Loading";
import { Receiver } from "~/components/Receiver";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { LNURLPayServiceResponse, lnurl } from "~/lib/lnurl";

export function LNURLPay() {
  const {
    lnurlDetailsJSON,
    originalText,
    amount: amountParam,
  } = useLocalSearchParams() as unknown as {
    lnurlDetailsJSON: string;
    originalText: string;
    amount: string;
  };
  const lnurlDetails: LNURLPayServiceResponse = JSON.parse(lnurlDetailsJSON);
  const [isLoading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState(amountParam ?? 0);
  const [comment, setComment] = React.useState("");
  const [isAmountReadOnly, setAmountReadOnly] = React.useState(false);

  useEffect(() => {
    // Handle fixed amount LNURLs
    if (lnurlDetails.minSendable === lnurlDetails.maxSendable) {
      setAmount((lnurlDetails.minSendable / 1000).toString());
      setAmountReadOnly(true);
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
      //callback.searchParams.append("payerdata", JSON.stringify({ test: 1 }));
      const lnurlPayInfo = await lnurl.getPayRequest(callback.toString());
      //console.log("Got pay request", lnurlPayInfo.pr);
      router.push({
        pathname: "/send/confirm",
        params: {
          invoice: lnurlPayInfo.pr,
          originalText,
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
            <Receiver originalText={originalText} />
          </View>
          <View className="p-6">
            {lnurlDetails.minSendable !== lnurlDetails.maxSendable && (
              <Card className="mb-4">
                <CardContent className="flex flex-row items-center gap-4">
                  <AlertCircle className="text-muted-foreground" />
                  <View className="flex flex-1 flex-col">
                    <CardTitle>Sending Limit</CardTitle>
                    <CardDescription>
                      Enter an amount between{" "}
                      <Text className="font-bold2 text-sm">
                        {Math.floor(lnurlDetails.minSendable / 1000)} sats
                      </Text>{" "}
                      and{" "}
                      <Text className="font-bold2 text-sm">
                        {Math.floor(lnurlDetails.maxSendable / 1000)} sats
                      </Text>
                    </CardDescription>
                  </View>
                </CardContent>
              </Card>
            )}
            <Button
              size="lg"
              className="flex flex-row gap-2"
              onPress={requestInvoice}
              disabled={
                isLoading ||
                Number(amount) < Math.floor(lnurlDetails.minSendable / 1000) ||
                Number(amount) > Math.floor(lnurlDetails.maxSendable / 1000)
              }
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
