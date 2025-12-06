import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { XIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

type ConnectionInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

function ConnectionInfoModal({ visible, onClose }: ConnectionInfoModalProps) {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const capabilities = wallets[selectedWalletId].nwcCapabilities;
  const nwcClient = useAppStore((store) => store.nwcClient);
  const [relayStatuses, setRelayStatuses] = React.useState<boolean[]>([]);
  React.useEffect(() => {
    if (!nwcClient) {
      return;
    }
    (async () => {
      const _relayStatuses = [];
      for (const relayUrl of nwcClient.relayUrls) {
        try {
          await nwcClient.pool.ensureRelay(relayUrl, {
            connectionTimeout: 2000,
          });
          _relayStatuses.push(true);
        } catch (error) {
          console.error("Failed to connect to relay", { relayUrl, error });
          _relayStatuses.push(false);
        }
      }
      setRelayStatuses(_relayStatuses);
    })();
  }, [nwcClient]);
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0"
        />
        <View className="w-4/5 max-w-[425px] bg-background border border-border rounded-2xl z-10">
          <View className="flex-row items-center justify-center relative p-6">
            <Text className="text-xl font-bold2 text-foreground">
              Connection Info
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 p-4"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
          </View>
          <View className="p-6 pt-0 flex flex-col">
            <View className="flex flex-col mb-4">
              <Text className="font-semibold2">Relays</Text>

              {nwcClient?.relayUrls.map((relayUrl, index) => (
                <Text key={relayUrl} className="text-muted-foreground">
                  {relayUrl} ({relayStatuses[index] ? "online" : "offline"})
                </Text>
              ))}

              <Text className="font-semibold2 mt-2">Capabilities</Text>
              <Text className="text-muted-foreground">
                {capabilities?.join(", ")}
              </Text>

              <Text className="font-semibold2 mt-2">App Pubkey</Text>
              <Text className="text-muted-foreground">
                {nwcClient?.publicKey}
              </Text>

              <Text className="font-semibold2 mt-2">Wallet Pubkey</Text>
              <Text className="text-muted-foreground">
                {nwcClient?.walletPubkey}
              </Text>
            </View>
            <Button onPress={onClose}>
              <Text className="font-bold2">OK</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ConnectionInfoModal;
