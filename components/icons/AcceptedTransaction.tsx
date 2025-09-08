import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Line, Rect, type SvgProps } from "react-native-svg";

const AcceptedTransactionIcon = (props: SvgProps) => {
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
      <Line
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={currentColors.pathStroke}
        x1="16"
        x2="16"
        y1="14"
        y2="26"
      />
      <Line
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={currentColors.pathStroke}
        x1="24"
        x2="24"
        y1="14"
        y2="26"
      />
    </Svg>
  );
};

export default AcceptedTransactionIcon;
