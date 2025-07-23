import { type nwc } from "@getalby/sdk";
import dayjs from "dayjs";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import FailedTransactionIcon from "~/components/icons/FailedTransaction";
import PendingTransactionIcon from "~/components/icons/PendingTransaction";
import ReceivedTransactionIcon from "~/components/icons/ReceivedTransaction";
import SentTransactionIcon from "~/components/icons/SentTransaction";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { cn, safeNpubEncode } from "~/lib/utils";

type Props = {
  tx: nwc.Nip47Transaction;
};

export function TransactionItem({ tx }: Props) {
  const metadata = tx.metadata;
  const type = tx.type;
  const getFiatAmount = useGetFiatAmount();

  const typeStateText =
    type === "incoming"
      ? "Received"
      : tx.state === "settled" // we only fetch settled incoming payments
        ? "Sent"
        : tx.state === "pending"
          ? "Sending"
          : "Failed";

  const Icon =
    tx.state === "failed"
      ? FailedTransactionIcon
      : tx.state === "pending"
        ? PendingTransactionIcon
        : tx.type === "outgoing"
          ? SentTransactionIcon
          : ReceivedTransactionIcon;

  const pubkey = tx.metadata?.nostr?.pubkey;
  const npub = pubkey ? safeNpubEncode(pubkey) : undefined;

  const payerName = tx.metadata?.payer_data?.name;
  const from = payerName
    ? `from ${payerName}`
    : npub
      ? `zap from ${npub.substring(0, 12)}...`
      : undefined;

  const recipientIdentifier = tx.metadata?.recipient_data?.identifier;
  const to = recipientIdentifier
    ? `${tx.state === "failed" ? "payment " : ""}to ${recipientIdentifier}`
    : undefined;

  return (
    <Pressable
      key={tx.payment_hash}
      onPress={() =>
        router.navigate({
          pathname: "/transaction",
          params: {
            transactionJSON: encodeURIComponent(JSON.stringify(tx)),
          },
        })
      }
    >
      <View
        className={cn(
          "flex flex-row items-center gap-3 px-6 py-2 my-2",
          tx.state === "pending" && "animate-pulse",
        )}
      >
        <View className="w-[44px] h-[44px] bg-muted rounded-full flex flex-col items-center justify-center">
          <Icon />
        </View>
        <View className="flex flex-col flex-1">
          <View className="flex flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className="font-medium2 text-lg flex-initial"
            >
              {typeStateText}
              {from !== undefined && <>&nbsp;{from}</>}
              {to !== undefined && <>&nbsp;{to}</>}
            </Text>
            <Text className="text-muted-foreground text-sm">
              {dayjs.unix(tx.settled_at || tx.created_at).fromNow()}
            </Text>
          </View>
          {(tx.description || metadata?.comment) && (
            <Text numberOfLines={1}>{tx.description || metadata?.comment}</Text>
          )}
        </View>
        <View>
          <Text
            className={cn(
              "text-right font-medium2 text-lg",
              tx.type === "incoming" ? "text-receive" : "text-foreground",
            )}
          >
            {tx.type === "incoming" ? "+" : "-"}{" "}
            {new Intl.NumberFormat().format(Math.floor(tx.amount / 1000))}
            <Text className="text-muted-foreground text-lg">
              {" "}
              {Math.floor(tx.amount / 1000) === 1 ? "sat" : "sats"}
            </Text>
          </Text>
          <Text className="text-right text-sm text-muted-foreground font-medium2">
            {getFiatAmount && getFiatAmount(Math.floor(tx.amount / 1000))}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
