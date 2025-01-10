import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";

const ReceivedTransactionIcon = (props: SvgProps) => {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      rectFill: "#DCFCE7",
      pathStroke: "#22C55E",
    },
    dark: {
      rectFill: "#022C22",
      pathStroke: "#14B8A6",
    },
  };

  const currentColors = colorScheme === "dark" ? colors.dark : colors.light;

  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
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

export default ReceivedTransactionIcon;
