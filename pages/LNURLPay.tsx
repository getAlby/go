import { Invoice } from "@getalby/lightning-tools";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import { LNURLPayServiceResponse, lnurl } from "~/lib/lnurl";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

export function LNURLPay() {
  const { lnurlDetailsJSON } = useLocalSearchParams() as unknown as {
    lnurlDetailsJSON: string;
  };
  const lnurlDetails: LNURLPayServiceResponse = JSON.parse(lnurlDetailsJSON);
  const [isLoading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [addComment, setAddComment] = React.useState(false);

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
        params: { invoice: lnurlPayInfo.pr },
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Enter Payment Details",
          //title: "LNURL Payment",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
      )}

      {!isLoading && (
        <>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View className="flex-1 justify-center items-center p-3">
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
            </View>
          </TouchableWithoutFeedback>
          <View className="flex flex-row gap-3 justify-center items-center px-3 pb-3">
            <Button
              className="flex-1"
              size="lg"
              variant="ghost"
              onPress={router.back}
            >
              <Text className="text-foreground">Back</Text>
            </Button>
            <Button className="flex-1" size="lg" onPress={requestInvoice}>
              <Text className="text-background">Next</Text>
            </Button>
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
