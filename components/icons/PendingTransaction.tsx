import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";

const PendingTransactionIcon = (props: SvgProps) => {
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
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <Rect width="40" height="40" rx="20" fill={currentColors.rectFill} />
      <Path
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={currentColors.pathStroke}
        d="M15 18.125L19.4107 13.7143C19.7362 13.3889 20.2638 13.3889 20.5892 13.7143L25 18.125M20 14.1667V26.6667"
      />
    </Svg>
  );
};

export default PendingTransactionIcon;
