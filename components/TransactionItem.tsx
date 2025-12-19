import type { Nip47Transaction } from "@getalby/sdk";
import dayjs from "dayjs";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import FailedTransactionIcon from "~/components/icons/FailedTransaction";
import PendingTransactionIcon from "~/components/icons/PendingTransaction";
import ReceivedTransactionIcon from "~/components/icons/ReceivedTransaction";
import SentTransactionIcon from "~/components/icons/SentTransaction";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useAppStore } from "~/lib/state/appStore";
import { cn, formatBitcoinAmount, safeNpubEncode } from "~/lib/utils";

type Props = {
  tx: Nip47Transaction;
};

export function TransactionItem({ tx }: Props) {
  const metadata = tx.metadata;
  const getFiatAmount = useGetFiatAmount();
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );

  const typeStateText =
    tx.state === "failed"
      ? "Failed"
      : tx.state === "pending"
        ? "Sending"
        : tx.type === "outgoing"
          ? "Sent"
          : "Received";

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
    <TouchableOpacity
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
          tx.state === "pending" && "animate-pulse",
          "flex flex-row items-center gap-4 px-6 py-4",
        )}
      >
        <View className="w-10 h-10 bg-muted rounded-full flex flex-col items-center justify-center">
          <Icon />
        </View>
        <View className="flex flex-col flex-1">
          <View className="flex flex-row items-center gap-2">
            <Text numberOfLines={1} className="font-medium2 flex-initial">
              {typeStateText}
              {from !== undefined && <>&nbsp;{from}</>}
              {to !== undefined && <>&nbsp;{to}</>}
            </Text>
            <Text className="text-secondary-foreground text-sm">
              {dayjs.unix(tx.settled_at || tx.created_at).fromNow()}
            </Text>
          </View>
          {(tx.description || metadata?.comment) && (
            <Text
              className="text-secondary-foreground font-medium2"
              numberOfLines={1}
            >
              {tx.description || metadata?.comment}
            </Text>
          )}
        </View>
        <View>
          <Text
            className={cn(
              "text-right font-medium2",
              tx.type === "incoming" ? "text-receive" : "text-foreground",
            )}
          >
            {tx.type === "incoming" ? "+" : "-"}{" "}
            {formatBitcoinAmount(
              Math.floor(tx.amount / 1000),
              bitcoinDisplayFormat,
            )}
          </Text>
          {getFiatAmount && (
            <Text className="text-right text-secondary-foreground font-medium2">
              {getFiatAmount(Math.floor(tx.amount / 1000))}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
