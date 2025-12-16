import * as Location from "expo-location";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import BTCMapModal from "~/components/BTCMapModal";
import { HelpCircleLineIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";

import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { useThemeColor } from "~/lib/useThemeColor";

export function BitcoinMap() {
  const { background } = useThemeColor("background");
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [mapUrl, setMapUrl] = React.useState("https://btcmap.org/map");

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== Location.PermissionStatus.GRANTED) {
          throw new Error("Enable permissions to access location");
        }

        const location = await Location.getCurrentPositionAsync({});
        setMapUrl(
          `https://btcmap.org/map#18/${location.coords.latitude}/${location.coords.longitude}`,
        );
      } catch (error) {
        errorToast(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <View className="flex-1 pt-2">
      <Screen
        title="Bitcoin Map"
        right={() => (
          <>
            <TouchableOpacity
              onPressIn={() => setShowModal(true)}
              className="-mr-4 px-6"
            >
              <HelpCircleLineIcon
                className="text-secondary-foreground"
                width={24}
                height={24}
              />
            </TouchableOpacity>
            <BTCMapModal
              visible={showModal}
              onClose={() => setShowModal(false)}
            />
          </>
        )}
      />

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
          <Text className="mt-4">Loading BTC Map</Text>
        </View>
      ) : (
        <WebView
          source={{ uri: mapUrl }}
          style={{
            backgroundColor: background,
          }}
          className="flex-1"
          geolocationEnabled
        />
      )}
    </View>
  );
}
