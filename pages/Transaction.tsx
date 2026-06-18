import type { Nip47Transaction, Nip47TransactionMetadata } from "@getalby/sdk";
import { hexToBytes } from "@noble/hashes/utils.js";
import dayjs from "dayjs";
import { Link, router, useLocalSearchParams } from "expo-router";
import { nip19 } from "nostr-tools";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { LinkIcon } from "~/components/Icons";
import AcceptedTransactionIcon from "~/components/icons/AcceptedTransaction";
import FailedTransactionIcon from "~/components/icons/FailedTransaction";
import PendingTransactionIcon from "~/components/icons/PendingTransaction";
import ReceivedTransactionIcon from "~/components/icons/ReceivedTransaction";
import SentTransactionIcon from "~/components/icons/SentTransaction";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { errorToast } from "~/lib/errorToast";
import { BitcoinDisplayFormat, useAppStore } from "~/lib/state/appStore";
import {
  cn,
  copyToClipboard,
  formatBitcoinAmount,
  safeNpubEncode,
} from "~/lib/utils";

type TransactionRouteParams = {
  transactionJSON: string;
  appPubkey?: string;
};

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
  const { transactionJSON, appPubkey } =
    useLocalSearchParams<TransactionRouteParams>();

  const transaction = React.useMemo(() => {
    try {
      return JSON.parse(transactionJSON) as Nip47Transaction;
    } catch (error) {
      console.error("Failed to parse transaction", error);
      return null;
    }
  }, [transactionJSON]);

  React.useEffect(() => {
    if (transaction) {
      return;
    }

    errorToast(
      new Error("Invalid transaction data"),
      "Failed to open transaction",
    );
    router.replace("/");
  }, [transaction]);

  React.useEffect(() => {
    if (transaction && appPubkey) {
      useAppStore.getState().setSelectedWallet(appPubkey);
    }
  }, [appPubkey, transaction]);

  if (!transaction) {
    return null;
  }

  return <TransactionScreen transaction={transaction} />;
}

function TransactionScreen({ transaction }: { transaction: Nip47Transaction }) {
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );

  return (
    <>
      <Screen title="Transaction" />
      <View className="flex-1 pt-2">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-1 p-6 pt-10 gap-12">
            <TransactionSummary
              transaction={transaction}
              bitcoinDisplayFormat={bitcoinDisplayFormat}
            />
            <TransactionDetails
              transaction={transaction}
              bitcoinDisplayFormat={bitcoinDisplayFormat}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function TransactionSummary({
  transaction,
  bitcoinDisplayFormat,
}: {
  transaction: Nip47Transaction;
  bitcoinDisplayFormat: BitcoinDisplayFormat;
}) {
  const getFiatAmount = useGetFiatAmount();
  const TransactionIcon = getTransactionIcon(transaction);
  const displayCharacterCount =
    new Intl.NumberFormat().format(Math.floor(transaction.amount / 1000))
      .length + (bitcoinDisplayFormat === "bip177" ? 1 : 4);

  return (
    <View className="flex gap-10 justify-center items-center">
      <View className="flex items-center gap-8">
        <View
          className={cn(transaction.state === "pending" && "animate-pulse")}
        >
          <TransactionIcon width={128} height={128} />
        </View>
        <Text
          className={cn(
            "ios:text-3xl android:text-2xl font-semibold2 text-secondary-foreground",
            transaction.state === "pending" && "animate-pulse",
          )}
        >
          {getTransactionStatus(transaction)}
        </Text>
      </View>
      <View className="flex items-center gap-2">
        <Text
          className={cn(
            Platform.select({
              ios: cn(
                displayCharacterCount > 11 ? "ios:text-4xl" : "ios:text-5xl",
                displayCharacterCount <= 14 &&
                  displayCharacterCount >= 11 &&
                  "ios:sm:text-5xl",
              ),
              android: cn(
                displayCharacterCount > 11
                  ? "android:text-3xl"
                  : "android:text-[42px]",
                displayCharacterCount <= 14 &&
                  displayCharacterCount >= 11 &&
                  "sm:android:text-[42px]",
              ),
            }),
            "gap-2 font-semibold2",
            transaction.type === "incoming" &&
              transaction.state === "settled" &&
              "text-receive",
          )}
        >
          {transaction.type === "incoming" ? "+" : "-"}
          {bitcoinDisplayFormat === "bip177" && " ₿"}{" "}
          {Math.floor(transaction.amount / 1000)}
          {bitcoinDisplayFormat === "sats" && (
            <Text
              className={cn(
                "ios:text-4xl android:text-3xl font-semibold2",
                transaction.type === "incoming" &&
                  transaction.state === "settled" &&
                  "text-receive",
              )}
            >
              {" "}
              sats
            </Text>
          )}
        </Text>
        {getFiatAmount && (
          <Text className="ios:text-3xl android:text-2xl font-semibold2 text-secondary-foreground">
            {getFiatAmount(Math.floor(transaction.amount / 1000))}
          </Text>
        )}
      </View>
    </View>
  );
}

function TransactionDetails({
  transaction,
  bitcoinDisplayFormat,
}: {
  transaction: Nip47Transaction;
  bitcoinDisplayFormat: BitcoinDisplayFormat;
}) {
  const encodedEventId = getEncodedEventId(transaction);
  const boostagram = React.useMemo(
    () => getBoostagram(transaction.metadata),
    [transaction.metadata],
  );
  const pubkey = transaction.metadata?.nostr?.pubkey;
  const npub = pubkey ? safeNpubEncode(pubkey) : undefined;
  const metadata = transaction.metadata as Nip47TransactionMetadata;

  return (
    <View className="flex gap-4">
      {metadata?.recipient_data?.identifier && (
        <TransactionDetailRow
          title="To"
          content={metadata.recipient_data.identifier}
        />
      )}
      {metadata?.payer_data?.name && (
        <TransactionDetailRow title="From" content={metadata.payer_data.name} />
      )}
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
      {metadata?.comment && (
        <TransactionDetailRow title="Comment" content={metadata.comment} />
      )}
      {/* for Alby lightning addresses the content of the zap request is
      automatically extracted and already displayed above as description */}
      {transaction.metadata?.nostr && encodedEventId && npub && (
        <View className="flex flex-row gap-3">
          <Text className="w-32 text-muted-foreground ios:text-lg android:text-base">
            Nostr Zap
          </Text>
          <Link href={`https://njump.me/${encodedEventId}`} asChild>
            <Pressable className="flex-row flex-1 gap-1 items-center">
              <Text className="flex-1 font-medium2 ios:text-lg android:text-base">
                From {npub}
              </Text>
              <LinkIcon width={16} className="text-primary-foreground" />
            </Pressable>
          </Link>
        </View>
      )}
      {boostagram && (
        <PodcastingInfo
          boost={boostagram}
          bitcoinDisplayFormat={bitcoinDisplayFormat}
        />
      )}
      {transaction.state === "settled" && transaction.type === "outgoing" && (
        <TransactionDetailRow
          title="Fee"
          content={
            formatBitcoinAmount(
              Math.floor(transaction.fees_paid / 1000),
              bitcoinDisplayFormat,
            ) +
            " (" +
            ((transaction.fees_paid / transaction.amount) * 100).toFixed(2) +
            "%)"
          }
        />
      )}
      <TransactionDetailRow
        title="Payment Hash"
        content={transaction.payment_hash}
      />
      {transaction.state === "settled" && (
        <TransactionDetailRow title="Preimage" content={transaction.preimage} />
      )}
      {metadata && (
        <TransactionDetailRow
          title="Metadata"
          content={JSON.stringify(metadata, null, 2)}
          className="ios:text-sm android:text-xs font-mono bg-muted p-2 rounded-md"
        />
      )}
    </View>
  );
}

function getTransactionIcon(transaction: Nip47Transaction) {
  if (transaction.type === "incoming") {
    return ReceivedTransactionIcon;
  }
  if (transaction.state === "settled") {
    return SentTransactionIcon;
  }
  if (transaction.state === "pending") {
    return PendingTransactionIcon;
  }
  if (transaction.state === "accepted") {
    return AcceptedTransactionIcon;
  }
  return FailedTransactionIcon;
}

function getTransactionStatus(transaction: Nip47Transaction) {
  if (transaction.type === "incoming") {
    return transaction.state === "settled" ? "Received" : "Receiving";
  }
  if (transaction.state === "failed") {
    return "Failed";
  }
  if (transaction.state === "pending") {
    return "Sending";
  }
  return "Sent";
}

function getEncodedEventId(transaction: Nip47Transaction) {
  const eventId = transaction.metadata?.nostr?.tags?.find(
    (tag) => tag[0] === "e",
  )?.[1];

  if (!eventId) {
    return undefined;
  }

  try {
    return nip19.neventEncode({ id: eventId });
  } catch (error) {
    console.error("Failed to encode nostr event id", error);
    return undefined;
  }
}

function getBoostagram(
  metadata?: Nip47TransactionMetadata,
): Boostagram | undefined {
  try {
    const tlvRecord = (metadata?.tlv_records as TLVRecord[])?.find(
      (record) => record.type === 7629169,
    );

    if (!tlvRecord) {
      return undefined;
    }

    return JSON.parse(
      new TextDecoder().decode(hexToBytes(tlvRecord.value)),
    ) as Boostagram;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

function TransactionDetailRow(props: {
  title: string;
  content: string;
  className?: string;
}) {
  return (
    <View className="flex flex-row gap-3">
      <Text className="w-32 text-secondary-foreground">{props.title}</Text>
      <TouchableOpacity
        className="flex-1"
        onPress={async () => {
          await copyToClipboard(props.content);
        }}
      >
        <Text className={cn("font-medium2 flex-shrink", props.className)}>
          {props.content}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function PodcastingInfo({
  boost,
  bitcoinDisplayFormat,
}: {
  boost: Boostagram;
  bitcoinDisplayFormat: BitcoinDisplayFormat;
}) {
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
          ? formatBitcoinAmount(
              Math.floor(boost.value_msat_total / 1000),
              bitcoinDisplayFormat,
            )
          : null,
      )}
      {renderDetail("Sender", boost.sender_name)}
      {renderDetail("App", boost.app_name)}
    </>
  );
}
