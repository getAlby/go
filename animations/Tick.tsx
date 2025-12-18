import { Platform, View } from "react-native";
import CheckIcon from "~/components/icons/CheckIcon";
import { useThemeColor } from "~/lib/useThemeColor";

export function Tick() {
  const { shadow } = useThemeColor("shadow");
  return (
    <View className="p-12 bg-receive rounded-full aspect-square flex items-center justify-center">
      <CheckIcon
        style={{
          ...Platform.select({
            // make sure bg color is applied to avoid RCTView errors
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
        width={80}
        height={80}
      />
    </View>
  );
}
