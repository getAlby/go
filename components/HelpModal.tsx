import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
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
        <View className="w-4/5 max-w-[425px] bg-background border border-border p-6 rounded-2xl z-10">
          <Text className="text-xl text-foreground font-bold2 mb-2">
            Connect Your Wallet
          </Text>
          <View className="flex flex-col mb-4">
            <Text className="text-muted-foreground">
              Follow these steps to connect Alby Go to your Hub:
            </Text>
            <Text className="text-muted-foreground">1. Open your Alby Hub</Text>
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
    </Modal>
  );
}

export default HelpModal;
