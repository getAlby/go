import type { Nip47Transaction } from "@getalby/sdk";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import FailedTransactionIcon from "~/components/icons/FailedTransaction";
import PendingTransactionIcon from "~/components/icons/PendingTransaction";
import ReceivedTransactionIcon from "~/components/icons/ReceivedTransaction";
import SentTransactionIcon from "~/components/icons/SentTransaction";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { formatBitcoinAmount, formatRelativeTime } from "~/lib/format";
import { useAppStore } from "~/lib/state/appStore";
import { cn, safeNpubEncode } from "~/lib/utils";

type Props = {
  tx: Nip47Transaction;
};

export function TransactionItem({ tx }: Props) {
  const { t } = useTranslation();
  const metadata = tx.metadata;
  const getFiatAmount = useGetFiatAmount();
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );

  const typeStateText =
    tx.type === "incoming"
      ? t("transactions.status.received")
      : tx.state === "settled"
        ? t("transactions.status.sent")
        : tx.state === "pending"
          ? t("transactions.status.sending")
          : t("transactions.status.failed");

  const Icon =
    tx.type === "incoming"
      ? ReceivedTransactionIcon
      : tx.state === "settled"
        ? SentTransactionIcon
        : tx.state === "pending"
          ? PendingTransactionIcon
          : FailedTransactionIcon;

  const pubkey = tx.metadata?.nostr?.pubkey;
  const npub = pubkey ? safeNpubEncode(pubkey) : undefined;

  const payerName = tx.metadata?.payer_data?.name;
  const from = payerName
    ? t("transactions.item.from", { name: payerName })
    : npub
      ? t("transactions.item.zapFrom", { npub: npub.substring(0, 12) })
      : undefined;

  const recipientIdentifier = tx.metadata?.recipient_data?.identifier;
  const to = recipientIdentifier
    ? tx.state === "failed"
      ? t("transactions.item.paymentTo", { recipient: recipientIdentifier })
      : t("transactions.item.to", { recipient: recipientIdentifier })
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
        <View className="w-[40px] h-[40px] bg-muted rounded-full flex flex-col items-center justify-center">
          <Icon />
        </View>
        <View className="flex flex-col flex-1">
          <View className="flex flex-row items-center gap-2">
            <Text numberOfLines={1} className="font-medium2 flex-initial">
              {typeStateText}
              {from !== undefined && <>&nbsp;{from}</>}
              {to !== undefined && <>&nbsp;{to}</>}
            </Text>
            <Text className="text-secondary-foreground ios:text-sm android:text-xs">
              {formatRelativeTime(tx.settled_at || tx.created_at)}
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
