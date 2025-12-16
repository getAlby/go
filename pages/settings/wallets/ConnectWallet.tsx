import type { NWAOptions } from "@getalby/sdk";
import { bytesToHex } from "@noble/hashes/utils";
import { openURL } from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import React from "react";
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
import { useAppStore } from "~/lib/state/appStore";
import { useThemeColor } from "~/lib/useThemeColor";
import { formatBitcoinAmount } from "~/lib/utils";

export function ConnectWallet() {
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
  let pubkey = appPubkey;
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
            console.info("opening URL", url.toString());
            await openURL(url.toString());
          } catch (error) {
            console.error(error);
            errorToast(
              new Error("Couldn't open URL, do you have the app installed?"),
            );
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

      console.info("createConnection response", response);

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
      console.error(error);
      errorToast(error, "Failed to create app");
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
        title={connectionCreated ? "App Connected" : "Connect App"}
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
              This wallet connection does not support one tap connections.
            </Text>
            <Text className="text-center text-secondary-foreground">
              {hasCreateConnectionWallet
                ? "Please switch your wallet and try again."
                : `Please re-connect Alby Go from Alby Hub using the "One Tap Connections" button.`}
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
            returnTo={returnTo}
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
            <Text>Confirm Connection</Text>
          </Button>
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
  returnTo,
  metadata,
}: Omit<NWAOptions, "appPubkey" | "relayUrls">) {
  const getFiatAmount = useGetFiatAmount();
  const [showDetails, setShowDetails] = React.useState(false);
  const onClose = () => setShowDetails(false);
  const hasPayPermissions = requestMethods.some((method) =>
    method.includes("pay_"),
  );
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
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
          <View className="p-6 mx-6 bg-background shadow-sm rounded-3xl max-h-[80vh] self-stretch">
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
              <Text className="text-xl sm:text-2xl text-center font-bold2 text-secondary-foreground">
                Connection Details
              </Text>
            </View>
            <ScrollView
              className="grow-0"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="flex flex-col gap-2"
            >
              <View className="flex gap-2">
                <Text className="font-semibold2">Requested methods</Text>
                <Text className="bg-muted p-2 rounded-md font-medium font-mono">
                  {requestMethods?.join(", ") || "all methods"}
                </Text>
              </View>
              {notificationTypes && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">Notification Types</Text>
                  <Text className="bg-muted p-2 rounded-md font-medium font-mono">
                    {notificationTypes.join(", ")}
                  </Text>
                </View>
              )}
              {isolated && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">Isolated connection</Text>
                  <Text className="font-medium2">Yes</Text>
                </View>
              )}
              {!!expiresAt && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">Expiry</Text>
                  <Text className="font-medium2">
                    {new Date(expiresAt * 1000).toDateString()}
                  </Text>
                </View>
              )}
              {!!metadata && (
                <View className="flex gap-2">
                  <Text className="font-semibold2">Metadata</Text>
                  <Text className="bg-muted p-2 rounded-md font-medium font-mono">
                    {JSON.stringify(metadata)}
                  </Text>
                </View>
              )}
              {returnTo && (
                <Text className="mt-2 text-center text-secondary-foreground text-sm">
                  You will return to {returnTo} after confirming
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Text className="sm:text-lg text-center">
        <Text className="sm:text-lg font-semibold2">{name}</Text> is requesting{" "}
        {!hasPayPermissions && (
          <Text className="sm:text-lg font-semibold2">receive-only </Text>
        )}
        access to your{" "}
        <Text className="sm:text-lg font-semibold2">Alby Hub</Text>.
      </Text>

      <View className="flex-1 flex justify-center">
        {hasPayPermissions && (
          <TouchableOpacity
            onPress={() => setShowDetails(true)}
            className="flex flex-row w-full justify-between items-center rounded-2xl p-4 bg-white dark:bg-muted"
          >
            <Text className="sm:text-lg font-medium2">
              {budgetRenewal !== "never" && (
                <Text className="sm:text-lg font-medium2 capitalize">
                  {budgetRenewal || "Monthly"}{" "}
                </Text>
              )}
              budget
            </Text>
            <View className="flex flex-row items-center gap-4">
              {maxAmount && (
                <View>
                  <Text className="text-right sm:text-lg text-secondary-foreground font-medium2">
                    {formatBitcoinAmount(
                      Math.floor(maxAmount / 1000),
                      bitcoinDisplayFormat,
                    )}
                  </Text>
                  {getFiatAmount && (
                    <Text className="text-right text-sm text-muted-foreground">
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
        <Text className="text-center text-secondary-foreground text-sm px-4 my-2">
          You can edit permissions and revoke access at any time in your Alby
          Hub settings.
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
  return (
    <View className="flex-1 items-center">
      <View className="flex-1 flex justify-center items-center">
        <Tick />
      </View>
      <Text className="text-center text-secondary-foreground">
        Connected!{"\n"}
        {returnTo
          ? `Redirecting in ${redirectCountdown} seconds...`
          : `Returning home in ${redirectCountdown} seconds...`}
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
          elevation: 2,
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
          {name || "New App"}
        </Text>
      </View>
    </View>
  );
}
