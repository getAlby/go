import React from "react";
import Svg, { Path, Rect, type SvgProps } from "react-native-svg";
import { useThemeColor } from "~/lib/useThemeColor";

const PendingTransactionIcon = (props: SvgProps) => {
  const { pending, pendingForeground } = useThemeColor(
    "pending",
    "pendingForeground",
  );
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <Rect width="40" height="40" rx="20" fill={pendingForeground} />
      <Path
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={pending}
        d="M15 18.125L19.4107 13.7143C19.7362 13.3889 20.2638 13.3889 20.5892 13.7143L25 18.125M20 14.1667V26.6667"
      />
    </Svg>
  );
};

export default PendingTransactionIcon;
