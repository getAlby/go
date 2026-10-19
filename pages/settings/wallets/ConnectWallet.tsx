import type { NWAOptions } from "@getalby/sdk";
import { bytesToHex } from "@noble/hashes/utils.js";
import { openURL } from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

import { Tick } from "~/animations/Tick";
import { ChevronRightIcon, XIcon } from "~/components/Icons";
import NWCIcon from "~/components/icons/NWCIcon";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { WalletSwitcher } from "~/components/WalletSwitcher";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { errorToast } from "~/lib/errorToast";
import i18n from "~/lib/i18n";
import { useAppStore } from "~/lib/state/appStore";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn, formatBitcoinAmount } from "~/lib/utils";

export function ConnectWallet() {
  const { t } = useTranslation();
  let { options: optionsJSON, flow } = useLocalSearchParams<{
    options: string;
    flow: "nwa" | "deeplink";
  }>();
  const options = JSON.parse(optionsJSON) as Partial<NWAOptions>;
  const {
    appPubkey,
    name,
    icon,
    returnTo,
    notificationTypes,
    expiresAt,
    isolated,
    metadata,
  } = options;
  const budgetRenewal = options.budgetRenewal || "monthly";
  const requestMethods = options.requestMethods || [
    "get_info",
    "get_balance",
    "get_budget",
    "make_invoice",
    "pay_invoice",
    "lookup_invoice",
    "list_transactions",
    "sign_message",
  ];
  const maxAmount = options.maxAmount || 100_000_000;

  const [isCreatingConnection, setCreatingConnection] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);

  const [deeplinkConnectionSecret, setDeeplinkConnectionSecret] =
    React.useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = React.useState<number>();
  const [connectionCreated, setConnectionCreated] = React.useState(false);

  React.useEffect(() => {
    if (redirectCountdown === undefined) {
      return;
    }

    if (redirectCountdown === 0) {
      (async () => {
        if (returnTo) {
          let url = new URL(returnTo);
          if (deeplinkConnectionSecret) {
            url.searchParams.set("value", deeplinkConnectionSecret);
          }
          try {
            await openURL(url.toString());
          } catch {
            errorToast(new Error(i18n.t("wallets.connectApp.openUrlFailed")));
          }
        }
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/");
      })();
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev ? prev - 1 : prev));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown, deeplinkConnectionSecret, returnTo]);

  const confirm = async () => {
    setCreatingConnection(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }

      let secretKey: string | undefined;
      let pubkey = appPubkey;
      if (!pubkey) {
        const secretKeyBytes = generateSecretKey();
        secretKey = bytesToHex(secretKeyBytes);
        pubkey = getPublicKey(secretKeyBytes);
      }

      const response = await nwcClient.createConnection({
        pubkey,
        name: name as string,
        max_amount: maxAmount,
        budget_renewal: budgetRenewal,
        request_methods: requestMethods,
        notification_types: notificationTypes,
        expires_at: expiresAt,
        isolated,
        metadata,
      });

      if (flow === "deeplink") {
        setDeeplinkConnectionSecret(
          `nostr+walletconnect://${response.wallet_pubkey}?secret=${
            secretKey
          }&relay=${nwcClient.relayUrls.join("&relay=")}`,
        );
      }
      setRedirectCountdown(3);
      setConnectionCreated(true);
    } catch (error) {
      errorToast(error, t("wallets.connectApp.createFailed"));
    }
    setCreatingConnection(false);
  };

  const supportsCreateConnection = useAppStore
    .getState()
    .wallets[
      useAppStore.getState().selectedWalletId
    ]?.nwcCapabilities?.includes("create_connection");

  const hasCreateConnectionWallet = wallets.some((wallet) =>
    wallet.nwcCapabilities?.includes("create_connection"),
  );

  return (
    <>
      <Screen
        title={
          connectionCreated
            ? t("wallets.connectApp.connectedTitle")
            : t("wallets.connectApp.title")
        }
        right={() => (
          <TouchableOpacity
            onPressIn={() => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/");
            }}
            className="-mr-4 px-6"
          >
            <XIcon
              className="text-secondary-foreground"
              width={24}
              height={24}
            />
          </TouchableOpacity>
        )}
      />
      <View className="flex-1 p-6 justify-center items-center gap-8">
        <PlugView
          connectionCreated={connectionCreated}
          name={name}
          icon={icon}
        />
        {!supportsCreateConnection ? (
          <View className="flex-1 justify-center items-center gap-4">
            <Text className="text-center text-secondary-foreground">
              {t("wallets.connectApp.notSupported")}
            </Text>
            <Text className="text-center text-secondary-foreground">
              {hasCreateConnectionWallet
                ? t("wallets.connectApp.switchWallet")
                : t("wallets.connectApp.reconnectFromHub")}
            </Text>
          </View>
        ) : connectionCreated ? (
          <ConnectedView
            returnTo={returnTo}
            redirectCountdown={redirectCountdown}
          />
        ) : (
          <ConnectView
            name={name}
            requestMethods={requestMethods}
            notificationTypes={notificationTypes}
            isolated={isolated}
            budgetRenewal={budgetRenewal}
            maxAmount={maxAmount}
            expiresAt={expiresAt}
            metadata={metadata}
          />
        )}
      </View>
      {!connectionCreated && (
        <View className="p-6">
          <WalletSwitcher
            selectedWalletId={selectedWalletId}
            wallets={wallets}
          />
          <Button
            size="lg"
            onPress={confirm}
            className="flex flex-row gap-2"
            disabled={!supportsCreateConnection || isCreatingConnection}
          >
            {isCreatingConnection && (
              <Loading className="text-primary-foreground" />
            )}
            <Text>{t("wallets.connectApp.confirmConnection")}</Text>
          </Button>
          {returnTo && (
            <Text className="px-4 mt-2 text-center text-secondary-foreground ios:text-sm android:text-xs">
              <Trans
                i18nKey="wallets.connectApp.redirectNotice"
                values={{ returnTo }}
                components={{
                  bold: (
                    <Text className="font-semibold2 ios:text-sm android:text-xs" />
                  ),
                }}
              />
            </Text>
          )}
        </View>
      )}
    </>
  );
}

function ConnectView({
  name,
  requestMethods,
  notificationTypes,
  isolated,
  budgetRenewal,
  maxAmount,
  expiresAt,
  metadata,
}: Omit<NWAOptions, "appPubkey" | "relayUrls">) {
  const { t } = useTranslation();
  const { shadow } = useThemeColor("shadow");
  const getFiatAmount = useGetFiatAmount();
  const [showDetails, setShowDetails] = React.useState(false);
  const onClose = () => setShowDetails(false);
  const hasPayPermissions = requestMethods.some((method) =>
    method.includes("pay_"),
  );
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
  const boldText = (
    <Text
      className={cn(
        Platform.select({
          ios: "ios:text-base ios:sm:text-lg",
          android: "android:text-base",
        }),
        "font-semibold2",
      )}
    />
  );
  // the renewal period is displayed in lowercase and capitalized by the style
  const budgetRenewalLabels: Record<string, string> = {
    daily: t("wallets.connectApp.budgetRenewal.daily"),
    weekly: t("wallets.connectApp.budgetRenewal.weekly"),
    monthly: t("wallets.connectApp.budgetRenewal.monthly"),
    yearly: t("wallets.connectApp.budgetRenewal.yearly"),
  };
  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={showDetails}
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-center items-center bg-overlay">
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            className="absolute inset-0"
          />
          <View
            style={{
              ...Platform.select({
                ios: {
                  shadowColor: shadow,
                  shadowOpacity: 0.4,
                  shadowOffset: {
                    width: 1.5,
                    height: 1.5,
                  },
                  shadowRadius: 2,
                },
                android: {
                  shadowColor: shadow,
                  elevation: 3,
                },
              }),
            }}
            className="p-6 mx-6 bg-background rounded-3xl max-h-[80vh] self-stretch"
          >
            <View className="mb-4 relative flex flex-row items-center justify-center">
              <TouchableOpacity
                onPress={onClose}
                className="absolute -right-6 p-4"
              >
                <XIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-xl ios:sm:text-2xl",
                    android: "android:text-xl",
                  }),
                  "text-center font-bold2 text-secondary-foreground",
                )}
              >
                {t("wallets.connectApp.connectionDetails")}
              </Text>
            </View>
            <ScrollView
              className="grow-0"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="flex flex-col gap-2"
            >
              <View className="flex gap-2">
                <Text className="font-semibold2">
                  {t("wallets.connectApp.requestedMethods")}
                </Text>
                <Text className="bg-muted p-2 rounded-md ios:text-sm android:text-xs font-mono">
                  {requestMethods?.join(", ") ||
                    t("wallets.connectApp.allMethods")}
                </Text>
              </View>
              {notificationTypes && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">
                    {t("wallets.connectApp.notificationTypes")}
                  </Text>
                  <Text className="bg-muted p-2 rounded-md ios:text-sm android:text-xs font-mono">
                    {notificationTypes.join(", ")}
                  </Text>
                </View>
              )}
              {isolated && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">
                    {t("wallets.connectApp.isolatedConnection")}
                  </Text>
                  <Text className="font-medium2">
                    {t("wallets.connectApp.yes")}
                  </Text>
                </View>
              )}
              {!!expiresAt && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">
                    {t("wallets.connectApp.expiry")}
                  </Text>
                  <Text className="font-medium2">
                    {new Date(expiresAt * 1000).toDateString()}
                  </Text>
                </View>
              )}
              {!!metadata && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">
                    {t("wallets.connectApp.metadata")}
                  </Text>
                  <Text className="bg-muted p-2 rounded-md ios:text-sm android:text-xs font-mono">
                    {JSON.stringify(metadata)}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Text
        className={cn(
          Platform.select({
            ios: "ios:text-base ios:sm:text-lg",
            android: "android:text-base",
          }),
          "text-center",
        )}
      >
        {hasPayPermissions ? (
          <Trans
            i18nKey="wallets.connectApp.requestingAccess"
            values={{ name }}
            components={{ bold: boldText }}
          />
        ) : (
          <Trans
            i18nKey="wallets.connectApp.requestingReceiveOnlyAccess"
            values={{ name }}
            components={{ bold: boldText }}
          />
        )}
      </Text>

      <View className="flex-1 flex justify-center">
        {hasPayPermissions && (
          <TouchableOpacity
            onPress={() => setShowDetails(true)}
            className="flex flex-row w-full justify-between items-center rounded-2xl p-4 bg-white dark:bg-muted"
          >
            <Text
              className={cn(
                Platform.select({
                  ios: "ios:text-base ios:sm:text-lg",
                  android: "android:text-base",
                }),
                "font-medium2",
              )}
            >
              {budgetRenewal !== "never" ? (
                <Trans
                  i18nKey="wallets.connectApp.renewingBudget"
                  values={{
                    period:
                      budgetRenewalLabels[budgetRenewal || "monthly"] ??
                      budgetRenewal,
                  }}
                  components={{
                    period: (
                      <Text
                        className={cn(
                          Platform.select({
                            ios: "ios:text-base ios:sm:text-lg",
                            android: "android:text-base",
                          }),
                          "font-medium2 capitalize",
                        )}
                      />
                    ),
                  }}
                />
              ) : (
                t("wallets.connectApp.budget")
              )}
            </Text>
            <View className="flex flex-row items-center gap-4">
              {maxAmount && (
                <View>
                  <Text
                    className={cn(
                      Platform.select({
                        ios: "ios:text-base ios:sm:text-lg",
                        android: "android:text-base",
                      }),
                      "text-right text-secondary-foreground font-medium2",
                    )}
                  >
                    {formatBitcoinAmount(
                      Math.floor(maxAmount / 1000),
                      bitcoinDisplayFormat,
                    )}
                  </Text>
                  {getFiatAmount && (
                    <Text className="text-right ios:text-sm android:text-xs text-muted-foreground">
                      {getFiatAmount(Math.floor(maxAmount / 1000))}
                    </Text>
                  )}
                </View>
              )}
              <ChevronRightIcon
                className="ml-auto text-muted-foreground"
                width={24}
                height={24}
              />
            </View>
          </TouchableOpacity>
        )}
        <Text className="text-center text-secondary-foreground ios:text-sm android:text-xs px-4 my-2">
          {t("wallets.connectApp.editPermissionsHint")}
        </Text>
      </View>
    </>
  );
}

function ConnectedView({
  returnTo,
  redirectCountdown,
}: {
  returnTo?: string;
  redirectCountdown?: number;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center">
      <View className="flex-1 flex justify-center items-center">
        <Tick />
      </View>
      <Text className="text-center text-secondary-foreground">
        {t("wallets.connectApp.connected")}
        {"\n"}
        {returnTo
          ? t("wallets.connectApp.redirecting", {
              seconds: redirectCountdown,
            })
          : t("wallets.connectApp.returningHome", {
              seconds: redirectCountdown,
            })}
      </Text>
    </View>
  );
}

function PlugView({
  connectionCreated,
  icon,
  name,
}: {
  connectionCreated: boolean;
  icon?: string;
  name?: string;
}) {
  const { t } = useTranslation();
  const { shadow: shadowColor } = useThemeColor("shadow");
  const shadow = React.useMemo(() => {
    return {
      ...Platform.select({
        // make sure bg color is applied to avoid RCTView errors
        ios: {
          shadowColor,
          shadowOpacity: 0.4,
          shadowOffset: {
            width: 1.5,
            height: 1.5,
          },
          shadowRadius: 2,
        },
        android: {
          shadowColor,
          elevation: 3,
        },
      }),
    };
  }, [shadowColor]);

  const leftPlugTranslateX = useDerivedValue(() =>
    connectionCreated ? -43 : -55,
  );
  const leftPlugAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(leftPlugTranslateX.value, { duration: 400 }) },
    ],
  }));

  const rightPlugTranslateX = useDerivedValue(() =>
    connectionCreated ? 47 : 60,
  );
  const rightPlugAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(rightPlugTranslateX.value, { duration: 400 }) },
    ],
  }));

  return (
    <View className="flex flex-row items-start justify-center">
      <View className="flex items-center flex-1">
        <View style={shadow}>
          <Image
            source={require("../../../assets/hub.png")}
            className="my-4 rounded-2xl w-20 h-20"
          />
        </View>
        <Text className="font-semibold2 text-center">Alby Hub</Text>
      </View>

      <View className="z-[-1] relative w-36 h-28 mb-4 items-center justify-center">
        <Animated.Image
          resizeMode="contain"
          source={require("../../../assets/left-plug.png")}
          className="absolute w-24 h-24"
          style={leftPlugAnimatedStyle}
        />
        <Animated.Image
          resizeMode="contain"
          source={require("../../../assets/right-plug.png")}
          className="absolute w-24 h-24"
          style={rightPlugAnimatedStyle}
        />
      </View>

      <View className="flex items-center flex-1">
        <View style={shadow}>
          {icon ? (
            <Image
              source={{ uri: icon }}
              className="my-4 rounded-2xl w-20 h-20 bg-background"
            />
          ) : (
            <View className="my-4 rounded-2xl w-20 h-20 bg-muted flex items-center justify-center">
              <NWCIcon width={40} height={40} opacity={0.5} />
            </View>
          )}
        </View>
        <Text className="font-semibold2 text-center" numberOfLines={1}>
          {name || t("wallets.connectApp.newApp")}
        </Text>
      </View>
    </View>
  );
}
