import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";

const FailedTransactionIcon = (props: SvgProps) => {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      rectFill: "#FEE2E2",
      pathStroke: "#EF4444",
    },
    dark: {
      rectFill: "#450A0A",
      pathStroke: "#4C0519",
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
        d="M14.001 26.0002L26 14.0002M25.999 26L14 14.0002"
      />
    </Svg>
  );
};

export default FailedTransactionIcon;
