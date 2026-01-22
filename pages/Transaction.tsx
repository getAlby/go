import type { Nip47Transaction, Nip47TransactionMetadata } from "@getalby/sdk";
import { hexToBytes } from "@noble/hashes/utils";
import dayjs from "dayjs";
import * as Clipboard from "expo-clipboard";
import { Link, useLocalSearchParams } from "expo-router";
import { nip19 } from "nostr-tools";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { LinkIcon } from "~/components/Icons";
import AcceptedTransactionIcon from "~/components/icons/AcceptedTransaction";
import FailedTransactionIcon from "~/components/icons/FailedTransaction";
import PendingTransactionIcon from "~/components/icons/PendingTransaction";
import ReceivedTransactionIcon from "~/components/icons/ReceivedTransaction";
import SentTransactionIcon from "~/components/icons/SentTransaction";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { BitcoinDisplayFormat, useAppStore } from "~/lib/state/appStore";
import { cn, formatBitcoinAmount, safeNpubEncode } from "~/lib/utils";

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
  const { transactionJSON, appPubkey } = useLocalSearchParams() as {
    transactionJSON: string;
    appPubkey?: string; // only specified when opening from push notification
  };
  const transaction: Nip47Transaction = JSON.parse(transactionJSON);
  const getFiatAmount = useGetFiatAmount();
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );

  React.useEffect(() => {
    if (appPubkey) {
      useAppStore.getState().setSelectedWallet(appPubkey);
    }
  }, [appPubkey]);

  const TransactionIcon = React.useMemo(() => {
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
  }, [transaction.state, transaction.type]);

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

  const eventId = transaction.metadata?.nostr?.tags?.find(
    (t) => t[0] === "e",
  )?.[1];

  const pubkey = transaction.metadata?.nostr?.pubkey;
  const npub = pubkey ? safeNpubEncode(pubkey) : undefined;

  const metadata = transaction.metadata as Nip47TransactionMetadata;

  const displayCharacterCount = React.useMemo(
    () =>
      new Intl.NumberFormat().format(Math.floor(transaction.amount / 1000))
        .length + (bitcoinDisplayFormat === "bip177" ? 1 : 4),
    [transaction.amount, bitcoinDisplayFormat],
  );

  return (
    <>
      <Screen title="Transaction" />
      <View className="flex-1 pt-2">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex-1 p-6 pt-10 gap-12">
            <View className="flex gap-10 justify-center items-center">
              <View className="flex items-center gap-8">
                <View
                  className={cn(
                    transaction.state === "pending" && "animate-pulse",
                  )}
                >
                  <TransactionIcon width={128} height={128} />
                </View>
                <Text
                  className={cn(
                    "ios:text-3xl android:text-2xl font-semibold2 text-secondary-foreground",
                    transaction.state === "pending" && "animate-pulse",
                  )}
                >
                  {transaction.type === "incoming"
                    ? transaction.state === "settled"
                      ? "Received"
                      : "Receiving"
                    : transaction.state === "failed"
                      ? "Failed"
                      : transaction.state === "pending"
                        ? "Sending"
                        : "Sent"}
                </Text>
              </View>
              <View className="flex items-center gap-2">
                <Text
                  className={cn(
                    Platform.select({
                      ios: cn(
                        displayCharacterCount > 11
                          ? "ios:text-4xl"
                          : "ios:text-5xl",
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
            <View className="flex gap-4">
              {metadata?.recipient_data?.identifier && (
                <TransactionDetailRow
                  title="To"
                  content={metadata.recipient_data.identifier}
                />
              )}
              {metadata?.payer_data?.name && (
                <TransactionDetailRow
                  title="From"
                  content={metadata.payer_data.name}
                />
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
                <TransactionDetailRow
                  title="Comment"
                  content={metadata.comment}
                />
              )}
              {/* for Alby lightning addresses the content of the zap request is
            automatically extracted and already displayed above as description */}
              {transaction.metadata?.nostr && eventId && npub && (
                <View className="flex flex-row gap-3">
                  <Text className="w-32 text-muted-foreground ios:text-lg android:text-base">
                    Nostr Zap
                  </Text>
                  <Link
                    href={`https://njump.me/${nip19.neventEncode({
                      id: eventId,
                    })}`}
                    asChild
                  >
                    <Pressable className="flex-row flex-1 gap-1 items-center">
                      <Text className="flex-1 font-medium2 ios:text-lg android:text-base">
                        From {npub}
                      </Text>
                      <LinkIcon
                        width={16}
                        className="text-primary-foreground"
                      />
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
              {transaction.state === "settled" &&
                transaction.type === "outgoing" && (
                  <TransactionDetailRow
                    title="Fee"
                    content={
                      formatBitcoinAmount(
                        Math.floor(transaction.fees_paid / 1000),
                        bitcoinDisplayFormat,
                      ) +
                      " (" +
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
              {metadata && (
                <TransactionDetailRow
                  title="Metadata"
                  content={JSON.stringify(metadata, null, 2)}
                  className="ios:text-sm android:text-xs font-mono bg-muted p-2 rounded-md"
                  copy
                />
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

function TransactionDetailRow(props: {
  title: string;
  content: string;
  copy?: boolean;
  className?: string;
}) {
  return (
    <View className="flex flex-row gap-3">
      <Text className="w-32 text-secondary-foreground">{props.title}</Text>
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
          <Text className={cn("font-medium2 flex-shrink", props.className)}>
            {props.content}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text className={cn("font-medium2 flex-shrink", props.className)}>
          {props.content}
        </Text>
      )}
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
