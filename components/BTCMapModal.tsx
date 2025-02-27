import { openURL } from "expo-linking";
import React from "react";
import { Image, Modal, TouchableOpacity, View } from "react-native";
import { XIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";

type BTCMapModalProps = {
  visible: boolean;
  onClose: () => void;
};

function BTCMapModal({ visible, onClose }: BTCMapModalProps) {
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
        <View className="flex flex-col items-center w-4/5 max-w-[425px] bg-background border border-border p-6 rounded-2xl z-10">
          <TouchableOpacity onPress={onClose} className="absolute right-0 p-2">
            <XIcon className="text-muted-foreground" width={32} height={32} />
          </TouchableOpacity>
          <Image
            source={require("./../assets/btc-map.png")}
            className="w-24 h-24"
            resizeMode="contain"
          />
          <View className="mt-8 flex flex-col items-center gap-4">
            <Text className="text-3xl font-semibold2 text-muted-foreground">
              BTC Map
            </Text>
            <Text className="text-lg text-center text-muted-foreground">
              BTC Map is an open-source project with the goal of mapping and
              maintaining all the merchants accepting Bitcoin around the world.
            </Text>
            <Text className="text-lg text-center text-muted-foreground">
              Find merchants nearby, pay for goods and services, and help
              improve the map by contributing!
            </Text>
            <Text
              onPress={() => openURL("https://btcmap.org/")}
              className="text-lg underline font-semibold2 text-muted-foreground"
            >
              Visit btcmap.org
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default BTCMapModal;
