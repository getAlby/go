import React from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { LikeIcon, XIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Text, TextClassContext } from "~/components/ui/text";

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
              <XIcon className="text-muted-foreground" width={24} height={24} />
            </TouchableOpacity>
            <Text className="text-xl sm:text-2xl text-center font-bold2 text-secondary-foreground">
              How To Connect?
            </Text>
          </View>
          <ScrollView
            className="grow-0"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col gap-2"
          >
            <View className="flex flex-col mb-4">
              <TextClassContext.Provider value="text-secondary-foreground">
                <Text className="font-medium2 mb-2">
                  Follow these steps to connect Alby Go to your Hub:
                </Text>
                <Text>1. Open your Alby Hub</Text>
                <Text>2. Go to App Store &raquo; Alby Go</Text>
                <Text>3. Scan the QR code with this app</Text>
              </TextClassContext.Provider>
            </View>
          </ScrollView>
          <Button
            variant="secondary"
            className="flex flex-row gap-2"
            onPress={onClose}
          >
            <LikeIcon className="text-muted-foreground" />
            <Text className="text-lg">Okay</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}

export default HelpModal;
