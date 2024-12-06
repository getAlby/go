import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import dayjs from "dayjs";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { MoveDownLeft, MoveUpRight, X } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { cn } from "~/lib/utils";

type TLVRecord = {
  type: number;
  value: string;
};

type Boostagram = {
  app_name: string;
  name: string;
  podcast: string;
  url: string;
  episode?: string;
  itemID?: string;
  ts?: string;
  message?: string;
  sender_id: string;
  sender_name: string;
  time: string;
  action: string;
  value_msat_total: number;
};

export function Transaction() {
  const { transactionJSON } = useLocalSearchParams() as unknown as {
    transactionJSON: string;
  };
  // TODO: undo when JS SDK includes state property
  const transaction: Nip47Transaction & {
    state: "settled" | "pending" | "failed";
  } = JSON.parse(transactionJSON);
  const getFiatAmount = useGetFiatAmount();

  const boostagram = React.useMemo(() => {
    let parsedBoostagram;
    try {
      const tlvRecord = (
        transaction.metadata?.tlv_records as TLVRecord[]
      )?.find((record) => record.type === 7629169);
      if (tlvRecord) {
        parsedBoostagram = JSON.parse(
          Utf8.stringify(Hex.parse(tlvRecord.value)),
        );
      }
    } catch (e) {
      console.error(e);
    }
    return parsedBoostagram;
  }, [transaction.metadata]);

  return (
    <View className="flex-1 flex flex-col gap-3">
      <Screen title="Transaction" />
      <ScrollView className="p-6">
        <View className="flex flex-col gap-5 justify-center items-center mb-12">
          <View
            className={cn(
              "my-8 bg-muted rounded-full p-8",
              transaction.state === "pending" && "animate-pulse",
            )}
            style={{ elevation: 2 }}
          >
            {transaction.state !== "failed" && (
              <>
                {transaction.type === "incoming" && (
                  <MoveDownLeft
                    className="text-receive"
                    width={100}
                    height={100}
                  />
                )}
                {transaction.type === "outgoing" && (
                  <MoveUpRight className="text-send" width={100} height={100} />
                )}
              </>
            )}
            {transaction.state === "failed" && (
              <X className="text-destructive" width={100} height={100} />
            )}
          </View>
          <Text
            className={cn(
              "text-3xl font-bold2 text-foreground",
              transaction.state === "pending" && "animate-pulse",
            )}
          >
            {transaction.type === "incoming"
              ? "Received"
              : transaction.state === "failed"
                ? "Failed"
                : transaction.state === "pending"
                  ? "Sending"
                  : "Sent"}
          </Text>
          <View className="flex flex-col items-center justify-center gap-2">
            <View className="flex flex-row items-end mt-5">
              <Text
                className={cn(
                  "text-4xl gap-2 font-semibold2",
                  transaction.type === "incoming"
                    ? "text-receive"
                    : "text-foreground",
                )}
              >
                {transaction.type === "incoming" ? "+" : "-"}{" "}
                {Math.floor(transaction.amount / 1000)}
              </Text>
              <Text className="text-2xl font-semibold2 text-muted-foreground">
                {" "}
                sats
              </Text>
            </View>
            {getFiatAmount && (
              <Text className="text-2xl font-semibold2 text-muted-foreground ">
                {getFiatAmount(Math.floor(transaction.amount / 1000))}
              </Text>
            )}
          </View>
          <View className="flex flex-col gap-2 w-full mt-8">
            <TransactionDetailRow
              title="Date & Time"
              content={dayjs
                .unix(transaction.settled_at || transaction.created_at)
                .fromNow()}
            />
            <TransactionDetailRow
              title="Description"
              content={transaction.description || "-"}
            />

            {boostagram && <PodcastingInfo boost={boostagram} />}

            {transaction.state === "settled" &&
              transaction.type === "outgoing" && (
                <TransactionDetailRow
                  title="Fee"
                  content={
                    Math.floor(transaction.fees_paid / 1000).toString() +
                    " sats (" +
                    (
                      (transaction.fees_paid / transaction.amount) *
                      100
                    ).toFixed(2) +
                    "%)"
                  }
                />
              )}
            <TransactionDetailRow
              title="Payment Hash"
              content={transaction.payment_hash}
              copy
            />
            {transaction.state === "settled" && (
              <TransactionDetailRow
                title="Preimage"
                content={transaction.preimage}
                copy
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TransactionDetailRow(props: {
  title: string;
  content: string;
  copy?: boolean;
}) {
  return (
    <View className="flex flex-row gap-3">
      <Text className="w-32 text-muted-foreground">{props.title}</Text>
      {props.copy ? (
        <TouchableOpacity
          className="flex-1"
          onPress={() => {
            Clipboard.setStringAsync(props.content);
            Toast.show({
              type: "success",
              text1: "Copied to clipboard",
            });
          }}
        >
          <Text className="text-foreground font-medium2">{props.content}</Text>
        </TouchableOpacity>
      ) : (
        <Text className="flex-1 text-foreground font-medium2">
          {props.content}
        </Text>
      )}
    </View>
  );
}

function PodcastingInfo({ boost }: { boost: Boostagram }) {
  return (
    <>
      {boost.message && (
        <TransactionDetailRow title="Message" content={boost.message} />
      )}
      {boost.podcast && (
        <TransactionDetailRow title="Podcast" content={boost.podcast} />
      )}
      {boost.episode && (
        <TransactionDetailRow title="Episode" content={boost.episode} />
      )}
      {boost.action && (
        <TransactionDetailRow title="Action" content={boost.action} />
      )}
      {boost.ts && (
        <TransactionDetailRow title="Timestamp" content={boost.ts} />
      )}
      {boost.value_msat_total && (
        <TransactionDetailRow
          title="Total amount"
          content={
            Math.floor(boost.value_msat_total / 1000) +
            (Math.floor(boost.value_msat_total / 1000) === 1 ? " sat" : " sats")
          }
        />
      )}
      {boost.sender_name && (
        <TransactionDetailRow title="Sender" content={boost.sender_name} />
      )}
      {boost.app_name && (
        <TransactionDetailRow title="App" content={boost.app_name} />
      )}
    </>
  );
}

export default PodcastingInfo;
