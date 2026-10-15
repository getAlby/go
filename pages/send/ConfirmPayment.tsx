import { Invoice } from "@getalby/lightning-tools/bolt11";
import { Link, router, useLocalSearchParams, useNavigation } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, View } from "react-native";
import Alert from "~/components/Alert";
import { AlertCircleIcon, ZapIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import { LongTextBottomSheet } from "~/components/LongTextBottomSheet";
import { Receiver } from "~/components/Receiver";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { WalletSwitcher } from "~/components/WalletSwitcher";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useTransactions } from "~/hooks/useTransactions";
import { ALBY_LIGHTNING_ADDRESS } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { formatNumber, formatSatsUnit } from "~/lib/format";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function ConfirmPayment() {
  const { t } = useTranslation();
  const { data: transactions } = useTransactions();
  const { invoice, comment, successAction, amount, receiver } =
    useLocalSearchParams() as {
      invoice: string;
      comment: string;
      successAction: string;
      amount?: string;
      receiver?: string;
    };
  const getFiatAmount = useGetFiatAmount();
  const [isLoading, setLoading] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  const amountToPaySats = amount ? +amount : decodedInvoice.satoshi;

  const navigation = useNavigation();

  async function pay() {
    setLoading(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      await nwcClient.payInvoice({
        invoice,
        amount: amount ? amountToPaySats * 1000 : undefined,
        metadata: {
          ...(comment && { comment }),
          ...(receiver && {
            recipient_data: { identifier: receiver },
          }),
        },
      });

      if (receiver === ALBY_LIGHTNING_ADDRESS) {
        useAppStore.getState().updateLastAlbyPayment();
      }

      if (!navigation.isFocused()) {
        return;
      }

      router.dismissAll();
      router.replace({
        pathname: "/send/success",
        params: {
          amount: amountToPaySats,
          successAction,
        },
      });
    } catch (error) {
      errorToast(error, t("send.confirm.failed"));
    }
    setLoading(false);
  }

  const displayCharacterCount = React.useMemo(
    () =>
      formatNumber(Math.ceil(amountToPaySats)).length +
      (bitcoinDisplayFormat === "bip177" ? 1 : 4),
    [amountToPaySats, bitcoinDisplayFormat],
  );

  return (
    <>
      <Screen title={t("send.confirm.title")} />
      <View className="flex-1 justify-around items-center p-6">
        <View className="flex flex-col gap-2">
          <Text
            className={cn(
              Platform.select({
                ios: "ios:text-base ios:sm:text-lg",
                android: "android:text-base",
              }),
              "text-center text-muted-foreground font-medium2",
            )}
          >
            {t("send.confirm.sendLabel")}
          </Text>
          <View className="flex flex-row items-center justify-center gap-2">
            {bitcoinDisplayFormat === "bip177" && (
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
                  "text-secondary-foreground !leading-[1.5] font-bold2",
                )}
              >
                ₿
              </Text>
            )}
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
                "!leading-[1.5] font-bold2",
              )}
            >
              {formatNumber(Math.ceil(amountToPaySats))}
              {bitcoinDisplayFormat === "sats" && (
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
                    "text-secondary-foreground font-semibold2",
                  )}
                >
                  {" "}
                  {formatSatsUnit(Math.ceil(amountToPaySats))}
                </Text>
              )}
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-center text-secondary-foreground ios:text-3xl android:text-2xl font-semibold2">
              {getFiatAmount(amountToPaySats)}
            </Text>
          )}
        </View>
        <Receiver lightningAddress={receiver} />
        {decodedInvoice.description ? (
          <LongTextBottomSheet
            title={t("common.description")}
            content={decodedInvoice.description}
          />
        ) : (
          comment && (
            <LongTextBottomSheet
              title={t("common.comment")}
              content={comment}
            />
          )
        )}
      </View>
      <View className="p-6">
        <WalletSwitcher selectedWalletId={selectedWalletId} wallets={wallets} />
        {transactions?.transactions.some(
          (transaction) => transaction.state === "pending",
        ) && (
          <Link href="/transactions" asChild>
            <Pressable>
              <Alert
                type="info"
                title={t("send.confirm.pendingPaymentsTitle")}
                description={t("send.confirm.pendingPaymentsDescription")}
                icon={AlertCircleIcon}
              />
            </Pressable>
          </Link>
        )}
        <Button
          size="lg"
          onPress={pay}
          className="flex flex-row gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loading className="text-primary-foreground" />
          ) : (
            <ZapIcon className="text-primary-foreground" />
          )}
          <Text>{t("send.confirm.pay")}</Text>
        </Button>
      </View>
    </>
  );
}
