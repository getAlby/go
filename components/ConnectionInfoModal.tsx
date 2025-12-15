import React from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { XIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

type ConnectionInfoModalProps = {
  visible: boolean;
  onClose: () => void;
};

function ConnectionInfoModal({ visible, onClose }: ConnectionInfoModalProps) {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  const capabilities = wallets[selectedWalletId].nwcCapabilities;
  const nwcClient = useAppStore((store) => store.nwcClient);
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
        <View className="p-6 mx-6 bg-background shadow-sm rounded-3xl max-h-[80vh]">
          <View className="mb-4 relative flex flex-row items-center justify-center">
            <TouchableOpacity
              onPress={onClose}
              className="absolute -right-6 p-4"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
            <Text className="text-xl sm:text-2xl text-center font-bold2 text-secondary-foreground">
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
              {nwcClient?.relayUrls.map((relayUrl) => (
                <View
                  className="flex flex-row items-center gap-2"
                  key={relayUrl}
                >
                  <Text className="font-medium2">{relayUrl}</Text>
                  <View
                    className={cn(
                      "rounded-full w-2 h-2",
                      nwcClient.pool.listConnectionStatus().get(relayUrl)
                        ? "bg-success"
                        : "bg-destructive",
                    )}
                  ></View>
                </View>
              ))}
            </View>

            <View className="flex gap-2">
              <Text className="font-semibold2">Capabilities</Text>
              <Text className="bg-muted p-2 rounded-md font-medium font-mono">
                {capabilities?.join(", ")}
              </Text>
            </View>

            <View className="flex gap-2">
              <Text className="font-semibold2">App Pubkey</Text>
              <Text className="bg-muted p-2 rounded-md font-medium font-mono">
                {nwcClient?.publicKey}
              </Text>
            </View>

            <View className="flex gap-2">
              <Text className="font-semibold2">Wallet Pubkey</Text>
              <Text className="bg-muted p-2 rounded-md font-medium font-mono">
                {nwcClient?.walletPubkey}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default ConnectionInfoModal;
