import { bytesToHex } from "@noble/hashes/utils";
import { Link, router, useLocalSearchParams } from "expo-router";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ChevronRightIcon, ConnectIcon, XIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

import { openURL } from "expo-linking";
import { Tick } from "~/animations/Tick";
import { WalletIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function ConnectWallet() {
  const { appicon, appname, callback } = useLocalSearchParams<{
    appicon: string;
    appname: string;
    callback: string;
  }>();
  const [isLoading, setLoading] = React.useState(false);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);

  const [nwcUrl, setNwcUrl] = React.useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = React.useState<
    number | null
  >(null);

  React.useEffect(() => {
    if (redirectCountdown === null || !nwcUrl) {
      return;
    }

    if (redirectCountdown === 0) {
      (async () => {
        const callbackUrl = `${callback}?value=${nwcUrl}`;
        try {
          await openURL(callbackUrl);
        } catch (error) {
          console.error(error);
          errorToast(
            new Error("Couldn't open URL, do you have the app installed?"),
          );
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
  }, [redirectCountdown, nwcUrl, callback]);

  const confirm = async () => {
    setLoading(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      let secretKey = generateSecretKey();
      let pubkey = getPublicKey(secretKey);
      {
        /* TODO: REPLACE WITH BUDGET INFO (AND METHODS?) */
      }
      const response = await nwcClient.createConnection({
        pubkey,
        name: appname,
        budget: {
          budget: 10_000_000,
          renewal_period: "monthly",
        },
        methods: [
          "get_info",
          "get_balance",
          "get_budget",
          "make_invoice",
          "pay_invoice",
          "lookup_invoice",
          "list_transactions",
          "sign_message",
        ],
        metadata: null,
      });

      console.info("createConnection response", response);

      const newUrl = `nostr+walletconnect://${response.wallet_pubkey}?secret=${bytesToHex(
        secretKey,
      )}&relay=${nwcClient.relayUrl}`;

      setNwcUrl(newUrl);
      setRedirectCountdown(5);
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setLoading(false);
  };

  return (
    <>
      <Screen
        title={nwcUrl ? "Wallet Connected" : "Connect Wallet"}
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
      {/* TODO: CHECK IF PEOPLE CAN EXECUTE SCRIPTS FROM THE IMAGE URL */}
      <View className="flex-1 justify-center items-center gap-8 p-6">
        <View className="flex flex-row items-center justify-center gap-8">
          <View className="flex items-center">
            <View className="shadow">
              <Image
                source={require("../../../assets/hub.png")}
                className="my-4 rounded-2xl w-20 h-20"
              />
            </View>
            <Text className="text-xl font-semibold2">Alby Hub</Text>
          </View>
          <ConnectIcon
            className="text-muted-foreground rotate-45 mb-4"
            width={30}
            height={30}
          />
          <View className="flex items-center">
            <View className="shadow">
              <Image
                source={{ uri: appicon }}
                className="my-4 rounded-2xl shadow-md w-20 h-20"
              />
            </View>
            <Text className="text-xl font-semibold2">{appname}</Text>
          </View>
        </View>
        {nwcUrl ? (
          <View className="flex-1 w-full justify-center items-center">
            <Tick />
            <Text className="my-4 text-lg text-center text-foreground">
              Connected! You're being redirected in {redirectCountdown}{" "}
              seconds...
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-xl text-center text-foreground">
              <Text className="text-xl font-semibold2">{appname}</Text> is
              requesting to access your wallet{" "}
              <Text className="text-xl font-semibold2">Alby Hub</Text> for
              in-app payments.
            </Text>
            <View className="flex-1 flex mt-4 gap-8 justify-center">
              <View>
                {/* TODO: REPLACE WITH A PROPER COMPONENT */}
                <TouchableOpacity className="flex flex-row border-2 border-muted justify-between items-center rounded-2xl pl-6 pr-16 py-4">
                  <Text className="text-xl font-medium2">Monthly budget</Text>
                  <View>
                    <Text className="text-right text-lg text-foreground font-medium2">
                      100 000 sats
                    </Text>
                    <Text className="text-right text-sm text-muted-foreground">
                      ~$10.52
                    </Text>
                  </View>
                  <Link
                    href={`/settings/wallets`}
                    className="absolute right-0"
                    asChild
                  >
                    <TouchableOpacity className="p-4">
                      <ChevronRightIcon
                        className="text-muted-foreground"
                        width={24}
                        height={24}
                      />
                    </TouchableOpacity>
                  </Link>
                </TouchableOpacity>
                <Text className="mt-4 text-center text-foreground">
                  You can edit permissions and revoke access at any time in your
                  Alby Hub settings.
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
      {!nwcUrl && (
        <View className="p-6">
          <View className="flex flex-row items-center justify-center gap-2 mb-4 px-4">
            <WalletIcon className="text-muted-foreground" />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-muted-foreground font-medium2 text-xl"
            >
              {wallets[selectedWalletId].name || DEFAULT_WALLET_NAME}
            </Text>
          </View>
          <Button
            size="lg"
            onPress={confirm}
            className="flex flex-row gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loading className="text-primary-foreground" />}
            <Text>Confirm Connection</Text>
          </Button>
        </View>
      )}
    </>
  );
}
