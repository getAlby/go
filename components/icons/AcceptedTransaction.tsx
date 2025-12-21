import React from "react";
import Svg, { Line, Rect, type SvgProps } from "react-native-svg";
import { useThemeColor } from "~/lib/useThemeColor";

const AcceptedTransactionIcon = (props: SvgProps) => {
  const { pending, pendingForeground } = useThemeColor(
    "pending",
    "pendingForeground",
  );
  return (
    <Svg width={44} height={44} viewBox="0 0 40 40" fill="none" {...props}>
      <Rect width="40" height="40" rx="20" fill={pendingForeground} />
      <Line
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={pending}
        x1="16"
        x2="16"
        y1="14"
        y2="26"
      />
      <Line
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={pending}
        x1="24"
        x2="24"
        y1="14"
        y2="26"
      />
    </Svg>
  );
};

export default AcceptedTransactionIcon;
