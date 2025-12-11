import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { XIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

type HelpModalProps = {
  visible: boolean;
  onClose: () => void;
};

function HelpModal({ visible, onClose }: HelpModalProps) {
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
            <Text className="text-xl font-bold2">Connect Your Wallet</Text>
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-0 p-4"
            >
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
          </View>
          <View className="p-6 pt-0 flex flex-col">
            <View className="flex flex-col mb-4">
              <Text className="text-muted-foreground">
                Follow these steps to connect Alby Go to your Hub:
              </Text>
              <Text className="text-muted-foreground">
                1. Open your Alby Hub
              </Text>
              <Text className="text-muted-foreground">
                2. Go to App Store &raquo; Alby Go
              </Text>
              <Text className="text-muted-foreground">
                3. Scan the QR code with this app
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

export default HelpModal;
