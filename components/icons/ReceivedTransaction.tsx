import React from "react";
import Svg, { Path, Rect, type SvgProps } from "react-native-svg";
import { useThemeColor } from "~/lib/useThemeColor";

const ReceivedTransactionIcon = (props: SvgProps) => {
  const { receive, receiveForeground } = useThemeColor(
    "receive",
    "receiveForeground",
  );
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none" {...props}>
      <Rect width="40" height="40" rx="20" fill={receiveForeground} />
      <Path
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={receive}
        d="M25 21.8745L20.5893 26.2852C20.2638 26.6107 19.7362 26.6107 19.4108 26.2852L15 21.8745M20 25.8328L20 13.3328"
      />
    </Svg>
  );
};

export default ReceivedTransactionIcon;
