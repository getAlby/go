import React from "react";
import Svg, { Path, Rect, type SvgProps } from "react-native-svg";
import { useThemeColor } from "~/lib/useThemeColor";

const FailedTransactionIcon = (props: SvgProps) => {
  const { destructive, destructiveForeground } = useThemeColor(
    "destructive",
    "destructiveForeground",
  );
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <Rect width="40" height="40" rx="20" fill={destructiveForeground} />
      <Path
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={destructive}
        d="M14.001 26.0002L26 14.0002M25.999 26L14 14.0002"
      />
    </Svg>
  );
};

export default FailedTransactionIcon;
