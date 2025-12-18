import { openURL } from "expo-linking";
import React from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { LinkIcon, XIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { useThemeColor } from "~/lib/useThemeColor";

type BTCMapModalProps = {
  visible: boolean;
  onClose: () => void;
};

function BTCMapModal({ visible, onClose }: BTCMapModalProps) {
  const { shadow } = useThemeColor("shadow");
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
          className="p-6 mx-6 relative bg-background rounded-3xl max-h-[80vh] self-stretch"
        >
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-0 p-4 z-10"
          >
            <XIcon className="text-muted-foreground" width={24} height={24} />
          </TouchableOpacity>
          <ScrollView
            className="my-4 grow-0"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex flex-col items-center gap-6"
          >
            {/* <View className="pt-0 flex flex-col items-center gap-6"> */}
            <Image
              source={require("./../assets/btc-map.png")}
              className="w-16 h-16"
              resizeMode="contain"
            />
            <Text className="text-3xl font-semibold2 text-secondary-foreground">
              BTC Map
            </Text>
            <View className="flex flex-col items-center gap-4">
              <Text className="text-center">
                BTC Map is an open-source project with the goal of mapping and
                maintaining all the merchants accepting Bitcoin around the
                world.
              </Text>
              <Text className="text-center">
                Find merchants nearby, pay for goods and services, and help
                improve the map by contributing!
              </Text>
              <TouchableOpacity
                className="my-2 flex flex-row gap-2 justify-center items-center"
                onPress={() => openURL("https://btcmap.org/")}
              >
                <Text className="font-semibold2">Visit btcmap.org</Text>
                <LinkIcon width={16} className="text-primary-foreground" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default BTCMapModal;
