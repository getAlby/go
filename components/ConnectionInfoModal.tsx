import { NWCClient, type Nip47Capability } from "@getalby/sdk/nwc";
import React from "react";
import {
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Alert from "~/components/Alert";
import { TriangleAlertIcon, XIcon } from "~/components/Icons";
import { toastConfig } from "~/components/ToastConfig";
import { Text } from "~/components/ui/text";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn, getPubkeyFromNWCUrl } from "~/lib/utils";

type ConnectionInfoModalProps = {
  visible: boolean;
  onClose: () => void;
  nostrWalletConnectUrl: string | undefined;
  capabilities?: Nip47Capability[];
};

function ConnectionInfoModal({
  visible,
  onClose,
  nostrWalletConnectUrl,
  capabilities,
}: ConnectionInfoModalProps) {
  const { shadow } = useThemeColor("shadow");
  const nwcInfo = React.useMemo(
    () =>
      nostrWalletConnectUrl
        ? NWCClient.parseWalletConnectUrl(nostrWalletConnectUrl)
        : undefined,
    [nostrWalletConnectUrl],
  );
  const appPubkey = nostrWalletConnectUrl
    ? getPubkeyFromNWCUrl(nostrWalletConnectUrl)
    : undefined;
  const insecureRelays =
    nwcInfo?.relayUrls.filter((relayUrl) => !relayUrl.startsWith("wss://")) ??
    [];

  const pool = React.useMemo(() => {
    if (!nwcInfo) {
      return undefined;
    }
    return new NWCClient({
      relayUrls: nwcInfo.relayUrls,
      walletPubkey: nwcInfo.walletPubkey,
    }).pool;
  }, [nwcInfo]);

  const [relayStatuses, setRelayStatuses] = React.useState<boolean[]>([]);
  React.useEffect(() => {
    if (!pool || !nwcInfo) {
      return;
    }
    let cancelled = false;
    (async () => {
      const _relayStatuses: boolean[] = [];
      for (const relayUrl of nwcInfo.relayUrls) {
        try {
          await pool.ensureRelay(relayUrl, {
            connectionTimeout: 2000,
          });
          _relayStatuses.push(true);
        } catch {
          _relayStatuses.push(false);
        }
      }
      if (!cancelled) {
        setRelayStatuses(_relayStatuses);
      }
    })();
    return () => {
      cancelled = true;
      pool.destroy();
    };
  }, [pool, nwcInfo]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
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
              <XIcon className="text-muted-foreground" width={24} height={24} />
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
              Connection Info
            </Text>
          </View>
          <ScrollView
            className="grow-0"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-2"
          >
            <View className="flex gap-2">
              <Text className="font-semibold2">Relays</Text>
              {nwcInfo?.relayUrls.map((relayUrl, index) => (
                <View
                  className="flex flex-row items-center gap-2"
                  key={relayUrl}
                >
                  <Text className="font-medium2">{relayUrl}</Text>
                  <View
                    className={cn(
                      "rounded-full w-2 h-2",
                      relayStatuses[index] ? "bg-receive" : "bg-destructive",
                    )}
                  ></View>
                </View>
              ))}
              {!!insecureRelays.length && (
                <Alert
                  type="warn"
                  title="Insecure relay"
                  description={`${insecureRelays.join(", ")} ${
                    insecureRelays.length > 1 ? "are" : "is"
                  } not using a secure (wss) connection.`}
                  icon={TriangleAlertIcon}
                />
              )}
            </View>

            {!!nwcInfo?.lud16 && (
              <View className="flex gap-2">
                <Text className="font-semibold2">Lightning Address</Text>
                <Text className="bg-muted p-2 rounded-md ios:text-sm android:text-xs font-mono">
                  {nwcInfo.lud16}
                </Text>
              </View>
            )}

            <View className="flex gap-2">
              <Text className="font-semibold2">Capabilities</Text>
              <Text className="bg-muted p-2 rounded-md ios:text-sm android:text-xs font-mono">
                {capabilities?.join(", ")}
              </Text>
            </View>

            <View className="flex gap-2">
              <Text className="font-semibold2">App Pubkey</Text>
              <Text className="bg-muted p-2 rounded-md ios:text-sm android:text-xs font-mono">
                {appPubkey}
              </Text>
            </View>

            <View className="flex gap-2">
              <Text className="font-semibold2">Wallet Pubkey</Text>
              <Text className="bg-muted p-2 rounded-md ios:text-sm android:text-xs font-mono">
                {nwcInfo?.walletPubkey}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
      <Toast
        config={toastConfig}
        position="bottom"
        bottomOffset={100}
        topOffset={100}
      />
    </Modal>
  );
}

export default ConnectionInfoModal;
