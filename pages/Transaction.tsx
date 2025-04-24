import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import { hexToBytes } from "@noble/hashes/utils";
import dayjs from "dayjs";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import FailedTransactionIcon from "~/components/icons/FailedTransaction";
import PendingTransactionIcon from "~/components/icons/PendingTransaction";
import ReceivedTransactionIcon from "~/components/icons/ReceivedTransaction";
import SentTransactionIcon from "~/components/icons/SentTransaction";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useAppStore } from "~/lib/state/appStore";
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
  episode?: string | number;
  itemID?: string | number;
  ts?: string | number;
  message?: string;
  sender_id: string | number;
  sender_name: string;
  time: string;
  action: string;
  value_msat_total: number;
};

export function Transaction() {
  const { transactionJSON, walletId } = useLocalSearchParams() as unknown as {
    transactionJSON: string;
    walletId?: string;
  };
  const transaction: Nip47Transaction = JSON.parse(transactionJSON);
  const getFiatAmount = useGetFiatAmount();

  React.useEffect(() => {
    if (walletId) {
      useAppStore.getState().setSelectedWalletId(Number(walletId));
    }
  }, [walletId]);

  const boostagram = React.useMemo(() => {
    let parsedBoostagram;
    try {
      const tlvRecord = (
        transaction.metadata?.tlv_records as TLVRecord[]
      )?.find((record) => record.type === 7629169);
      if (tlvRecord) {
        parsedBoostagram = JSON.parse(
          new TextDecoder().decode(hexToBytes(tlvRecord.value)),
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
              "my-8 bg-muted rounded-full",
              transaction.state === "pending" && "animate-pulse",
            )}
            style={{ elevation: 2 }}
          >
            {!(
              transaction.state === "failed" || transaction.state === "pending"
            ) && (
              <>
                {transaction.type === "incoming" && (
                  <ReceivedTransactionIcon width={128} height={128} />
                )}
                {transaction.type === "outgoing" && (
                  <SentTransactionIcon width={128} height={128} />
                )}
              </>
            )}
            {transaction.state === "pending" && (
              <PendingTransactionIcon width={128} height={128} />
            )}
            {transaction.state === "failed" && (
              <FailedTransactionIcon width={128} height={128} />
            )}
          </View>
          <Text
            className={cn(
              "text-4xl font-bold2 text-muted-foreground",
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
                  "text-5xl gap-2 font-semibold2",
                  transaction.type === "incoming"
                    ? "text-receive"
                    : "text-foreground",
                )}
              >
                {transaction.type === "incoming" ? "+" : "-"}{" "}
                {Math.floor(transaction.amount / 1000)}
              </Text>
              <Text className="text-3xl font-semibold2 text-muted-foreground mb-1">
                {" "}
                sats
              </Text>
            </View>
            {getFiatAmount && (
              <Text className="text-3xl font-semibold2 text-muted-foreground">
                {getFiatAmount(Math.floor(transaction.amount / 1000))}
              </Text>
            )}
          </View>
          <View className="flex flex-col gap-4 w-full mt-10">
            <TransactionDetailRow
              title="Date & Time"
              content={dayjs
                .unix(transaction.settled_at || transaction.created_at)
                .format("D MMMM YYYY, HH:mm")}
            />
            <TransactionDetailRow
              title="Description"
              content={transaction.description || "-"}
            />
            <TransactionDetailRow
              title="Fees"
              content={
                transaction.fees_paid
                  ? Math.floor(transaction.fees_paid / 1000) + " sats"
                  : "-"
              }
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
      <Text className="w-32 text-muted-foreground text-lg">{props.title}</Text>
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
          <Text className="text-foreground font-medium2 text-lg">
            {props.content}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text className="flex-1 text-foreground font-medium2 text-lg">
          {props.content}
        </Text>
      )}
    </View>
  );
}

function PodcastingInfo({ boost }: { boost: Boostagram }) {
  const renderDetail = (title: string, content: any) => {
    if (content === 0 || !!content) {
      return <TransactionDetailRow title={title} content={String(content)} />;
    }
    return null;
  };
  return (
    <>
      {renderDetail("Message", boost.message)}
      {renderDetail("Podcast", boost.podcast)}
      {renderDetail("Episode", boost.episode)}
      {renderDetail("Action", boost.action)}
      {renderDetail("Timestamp", boost.ts)}
      {renderDetail(
        "Total amount",
        boost.value_msat_total
          ? Math.floor(boost.value_msat_total / 1000) +
              (Math.floor(boost.value_msat_total / 1000) === 1
                ? " sat"
                : " sats")
          : null,
      )}
      {renderDetail("Sender", boost.sender_name)}
      {renderDetail("App", boost.app_name)}
    </>
  );
}
