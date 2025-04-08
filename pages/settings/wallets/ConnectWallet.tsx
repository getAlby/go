import { NWAOptions } from "@getalby/sdk/dist/NWAClient";
import { bytesToHex } from "@noble/hashes/utils";
import { openURL } from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import React from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { Tick } from "~/animations/Tick";
import { XIcon } from "~/components/Icons";
import NWCIcon from "~/components/icons/NWCIcon";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { WalletSwitcher } from "~/components/WalletSwitcher";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

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
  const satsAmount = maxAmount / 1000;

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
          }&relay=${nwcClient.relayUrl}`,
        );
      }
      setRedirectCountdown(3);
      setConnectionCreated(true);
    } catch (error) {
      console.error(error);
      errorToast(error);
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
            <XIcon className="text-muted-foreground" width={24} height={24} />
          </TouchableOpacity>
        )}
      />
      <View className="flex-1 justify-center items-center gap-8 p-6">
        <PlugView
          connectionCreated={connectionCreated}
          name={name}
          icon={icon}
        />
        {!supportsCreateConnection ? (
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-center">
              This wallet connection does not support one tap connections.
            </Text>
            <Text className="text-center mt-4">
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
            satsAmount={satsAmount}
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
  satsAmount,
  expiresAt,
  returnTo,
  metadata,
}: Omit<NWAOptions, "appPubkey" | "relayUrl"> & { satsAmount: number }) {
  const getFiatAmount = useGetFiatAmount();
  const [showDetails, setShowDetails] = React.useState(false);
  const closeModal = () => setShowDetails(false);
  const hasPayPermissions = requestMethods.some((method) =>
    method.includes("pay_"),
  );
  return (
    <>
      <Modal
        transparent
        animationType="fade"
        visible={showDetails}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeModal}
            className="absolute inset-0"
          />
          <View className="w-4/5 max-h-[80vh] max-w-[425px] bg-background border border-border rounded-2xl z-10">
            <View className="flex-row items-center justify-center relative p-6">
              <Text className="text-xl font-bold2 text-foreground">
                Connection Details
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                className="absolute right-0 p-4"
              >
                <XIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
            </View>
            <ScrollView className="px-6">
              <View className="pb-6 flex flex-col gap-8">
                <Text className="text-xl text-center text-foreground mt-4">
                  Requested methods:{" "}
                  <Text className="text-xl font-semibold2 p-8">
                    {requestMethods?.join(", ") || "all methods"}
                  </Text>
                </Text>
                {notificationTypes && (
                  <Text className="text-xl text-center text-foreground">
                    Requested notification types:{" "}
                    <Text className="text-xl font-semibold2 p-8">
                      {notificationTypes.join(", ")}
                    </Text>
                  </Text>
                )}
                {isolated && (
                  <Text className="text-xl text-center text-foreground font-semibold2">
                    isolated connection
                  </Text>
                )}
                {!!expiresAt && (
                  <Text className="text-center mt-4">
                    Expires {new Date(expiresAt * 1000).toDateString()}
                  </Text>
                )}
                {returnTo && (
                  <Text className="mt-4 text-center text-foreground">
                    You will return to {returnTo} after confirming
                  </Text>
                )}
                {!!metadata && (
                  <Text className="mt-4 text-center text-foreground">
                    Metadata: {JSON.stringify(metadata)}
                  </Text>
                )}
                <Text className="mt-4 text-center text-foreground">
                  You can edit permissions and revoke access at any time in your
                  Alby Hub settings.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Text className="text-xl text-center text-foreground mt-8">
        <Text className="text-xl font-semibold2">{name}</Text> is requesting{" "}
        {!hasPayPermissions && (
          <Text className="text-xl font-semibold2">receive-only </Text>
        )}
        access to your <Text className="text-xl font-semibold2">Alby Hub</Text>.
      </Text>

      <View className="flex-1 flex mt-4 gap-8 justify-center">
        <View>
          {hasPayPermissions && (
            <View className="flex flex-row w-full border-2 border-muted justify-between items-center rounded-2xl p-6 py-4">
              <Text className="text-xl font-medium2">
                {budgetRenewal !== "never" && (
                  <Text className="text-xl font-medium2 capitalize">
                    {budgetRenewal || "Monthly"}{" "}
                  </Text>
                )}
                budget
              </Text>
              <View>
                <Text className="text-right text-lg text-foreground font-medium2">
                  {new Intl.NumberFormat().format(satsAmount) + " sats"}
                </Text>
                {getFiatAmount && (
                  <Text className="text-right text-sm text-muted-foreground">
                    {getFiatAmount(satsAmount)}
                  </Text>
                )}
              </View>
            </View>
          )}
          <TouchableOpacity onPress={() => setShowDetails(true)}>
            <Text className="text-center p-8">View details</Text>
          </TouchableOpacity>
        </View>
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
    <View className="flex-1 w-full justify-center items-center">
      <Tick />

      <Text className="my-4 text-lg text-center text-foreground">
        Connected!{" "}
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
  const leftPlugAnim = React.useRef(new Animated.Value(0)).current;
  const rightPlugAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (connectionCreated) {
      Animated.parallel([
        Animated.timing(leftPlugAnim, {
          toValue: 15,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(rightPlugAnim, {
          toValue: -15,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start();
    } else {
      leftPlugAnim.setValue(0);
      rightPlugAnim.setValue(0);
    }
  }, [leftPlugAnim, rightPlugAnim, connectionCreated]);

  return (
    <View className="flex flex-row items-start justify-center">
      <View className="flex items-center flex-1">
        <View className="shadow">
          <Image
            source={require("../../../assets/hub.png")}
            className="my-4 rounded-2xl w-20 h-20"
          />
        </View>
        <Text className="text-xl font-semibold2 w-40 text-center">
          Alby Hub
        </Text>
      </View>

      <View className="z-[-1] relative w-36 h-28 mb-4 items-center justify-center">
        <Animated.Image
          resizeMode="contain"
          source={require("../../../assets/left-plug.png")}
          className="absolute w-28 h-28"
          style={{
            left: -45,
            transform: [
              {
                translateX: leftPlugAnim,
              },
            ],
          }}
        />
        <Animated.Image
          resizeMode="contain"
          source={require("../../../assets/right-plug.png")}
          className="absolute w-28 h-28"
          style={{
            right: -45,
            transform: [
              {
                translateX: rightPlugAnim,
              },
            ],
          }}
        />
      </View>

      <View className="flex items-center flex-1">
        <View className="shadow">
          {icon ? (
            <Image
              source={{ uri: icon }}
              className="my-4 rounded-2xl w-20 h-20 bg-white"
            />
          ) : (
            <View className="my-4 rounded-2xl w-20 h-20 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <NWCIcon width={40} height={40} opacity={0.5} />
            </View>
          )}
        </View>
        <Text className="text-xl font-semibold2 w-40 text-center">
          {name || "New App"}
        </Text>
      </View>
    </View>
  );
}
