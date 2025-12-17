import { Platform } from "react-native";
import CheckIcon from "~/components/icons/CheckIcon";
import { LinearGradient } from "~/components/LinearGradient";
import { useThemeColor } from "~/lib/useThemeColor";

export function Tick() {
  const { receive, shadow } = useThemeColor("receive", "shadow");

  return (
    <LinearGradient
      className="p-12 rounded-full aspect-square flex items-center justify-center border-secondary border"
      colors={[receive, receive]}
      start={[0, 0]}
      end={[1, 1]}
    >
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
    </LinearGradient>
  );
}
