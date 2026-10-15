import type { Nip47Transaction, Nip47TransactionMetadata } from "@getalby/sdk";
import { hexToBytes } from "@noble/hashes/utils.js";
import { Link, router, useLocalSearchParams } from "expo-router";
import type { TFunction } from "i18next";
import { nip19 } from "nostr-tools";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { type SvgProps } from "react-native-svg";
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
import {
  formatBitcoinAmount,
  formatDateTime,
  formatNumber,
  formatSatsUnit,
} from "~/lib/format";
import { BitcoinDisplayFormat, useAppStore } from "~/lib/state/appStore";
import { cn, copyToClipboard, safeNpubEncode } from "~/lib/utils";

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
  const { t } = useTranslation();
  const { transactionJSON, appPubkey } =
    useLocalSearchParams<TransactionRouteParams>();

  const transaction = React.useMemo(() => {
    try {
      return JSON.parse(transactionJSON) as Nip47Transaction;
    } catch (error) {
      errorToast(error, t("transactions.detail.loadFailed"));
      return null;
    }
  }, [transactionJSON, t]);

  React.useEffect(() => {
    if (transaction) {
      return;
    }

    errorToast(
      new Error(t("transactions.detail.invalidData")),
      t("transactions.detail.openFailed"),
    );
    router.replace("/");
  }, [transaction, t]);

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
  const { t } = useTranslation();
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );

  return (
    <>
      <Screen title={t("transactions.detail.title")} />
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
  const { t } = useTranslation();
  const getFiatAmount = useGetFiatAmount();
  const displayCharacterCount =
    formatNumber(Math.floor(transaction.amount / 1000)).length +
    (bitcoinDisplayFormat === "bip177" ? 1 : 4);

  return (
    <View className="flex gap-10 justify-center items-center">
      <View className="flex items-center gap-8">
        <View
          className={cn(transaction.state === "pending" && "animate-pulse")}
        >
          {renderTransactionIcon(transaction, { width: 128, height: 128 })}
        </View>
        <Text
          className={cn(
            "ios:text-3xl android:text-2xl font-semibold2 text-secondary-foreground",
            transaction.state === "pending" && "animate-pulse",
          )}
        >
          {getTransactionStatus(transaction, t)}
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
              {formatSatsUnit(Math.floor(transaction.amount / 1000))}
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
  const { t } = useTranslation();
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
          title={t("transactions.detail.to")}
          content={metadata.recipient_data.identifier}
        />
      )}
      {metadata?.payer_data?.name && (
        <TransactionDetailRow
          title={t("transactions.detail.from")}
          content={metadata.payer_data.name}
        />
      )}
      <TransactionDetailRow
        title={t("transactions.detail.dateTime")}
        content={formatDateTime(
          transaction.settled_at || transaction.created_at,
        )}
      />
      <TransactionDetailRow
        title={t("common.description")}
        content={transaction.description || "-"}
      />
      {metadata?.comment && (
        <TransactionDetailRow
          title={t("common.comment")}
          content={metadata.comment}
        />
      )}
      {/* for Alby lightning addresses the content of the zap request is
      automatically extracted and already displayed above as description */}
      {transaction.metadata?.nostr && encodedEventId && npub && (
        <View className="flex flex-row gap-3">
          <Text className="w-32 text-muted-foreground ios:text-lg android:text-base">
            {t("transactions.detail.nostrZap")}
          </Text>
          <Link href={`https://njump.me/${encodedEventId}`} asChild>
            <Pressable className="flex-row flex-1 gap-1 items-center">
              <Text className="flex-1 font-medium2 ios:text-lg android:text-base">
                {t("transactions.detail.zapFrom", { npub })}
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
          title={t("transactions.detail.fee")}
          content={t("transactions.detail.feeValue", {
            amount: formatBitcoinAmount(
              Math.floor(transaction.fees_paid / 1000),
              bitcoinDisplayFormat,
            ),
            percent: formatNumber(
              (transaction.fees_paid / transaction.amount) * 100,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: false,
              },
            ),
          })}
        />
      )}
      <TransactionDetailRow
        title={t("transactions.detail.paymentHash")}
        content={transaction.payment_hash}
      />
      {transaction.state === "settled" && (
        <TransactionDetailRow
          title={t("transactions.detail.preimage")}
          content={transaction.preimage}
        />
      )}
      {metadata && (
        <TransactionDetailRow
          title={t("transactions.detail.metadata")}
          content={JSON.stringify(metadata, null, 2)}
          className="ios:text-sm android:text-xs font-mono bg-muted p-2 rounded-md"
        />
      )}
    </View>
  );
}

function renderTransactionIcon(transaction: Nip47Transaction, props: SvgProps) {
  if (transaction.type === "incoming") {
    return <ReceivedTransactionIcon {...props} />;
  }
  if (transaction.state === "settled") {
    return <SentTransactionIcon {...props} />;
  }
  if (transaction.state === "pending") {
    return <PendingTransactionIcon {...props} />;
  }
  if (transaction.state === "accepted") {
    return <AcceptedTransactionIcon {...props} />;
  }
  return <FailedTransactionIcon {...props} />;
}

function getTransactionStatus(transaction: Nip47Transaction, t: TFunction) {
  if (transaction.type === "incoming") {
    return transaction.state === "settled"
      ? t("transactions.status.received")
      : t("transactions.status.receiving");
  }
  if (transaction.state === "failed") {
    return t("transactions.status.failed");
  }
  if (transaction.state === "pending") {
    return t("transactions.status.sending");
  }
  return t("transactions.status.sent");
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
  } catch {
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
  } catch {
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
  const { t } = useTranslation();
  const renderDetail = (title: string, content: any) => {
    if (content === 0 || !!content) {
      return <TransactionDetailRow title={title} content={String(content)} />;
    }
    return null;
  };

  return (
    <>
      {renderDetail(t("transactions.detail.boostagram.message"), boost.message)}
      {renderDetail(t("transactions.detail.boostagram.podcast"), boost.podcast)}
      {renderDetail(t("transactions.detail.boostagram.episode"), boost.episode)}
      {renderDetail(t("transactions.detail.boostagram.action"), boost.action)}
      {renderDetail(t("transactions.detail.boostagram.timestamp"), boost.ts)}
      {renderDetail(
        t("transactions.detail.boostagram.totalAmount"),
        boost.value_msat_total
          ? formatBitcoinAmount(
              Math.floor(boost.value_msat_total / 1000),
              bitcoinDisplayFormat,
            )
          : null,
      )}
      {renderDetail(
        t("transactions.detail.boostagram.sender"),
        boost.sender_name,
      )}
      {renderDetail(t("transactions.detail.boostagram.app"), boost.app_name)}
    </>
  );
}
