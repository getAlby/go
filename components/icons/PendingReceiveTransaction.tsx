import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path, Rect, type SvgProps } from "react-native-svg";

const PendingReceiveTransactionIcon = (props: SvgProps) => {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      rectFill: "#DBEAFE",
      pathStroke: "#3B82F6",
    },
    dark: {
      rectFill: "#082F49",
      pathStroke: "#0EA5E9",
    },
  };

  const currentColors = colorScheme === "dark" ? colors.dark : colors.light;

  return (
    <Svg width={44} height={44} viewBox="0 0 40 40" fill="none" {...props}>
      <Rect width="40" height="40" rx="20" fill={currentColors.rectFill} />
      <Path
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={currentColors.pathStroke}
        d="M25 21.8745L20.5893 26.2852C20.2638 26.6107 19.7362 26.6107 19.4108 26.2852L15 21.8745M20 25.8328L20 13.3328"
      />
    </Svg>
  );
};

export default PendingReceiveTransactionIcon;
