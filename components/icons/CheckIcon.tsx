import React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";
import { useThemeColor } from "~/lib/useThemeColor";

const CheckIcon = ({ color, fill, ...props }: SvgProps) => {
  const { background } = useThemeColor("background");
  const fillColor = color ?? fill ?? background;

  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        fill={fillColor}
        d="M15.5123 3.28998C16.4568 2.3454 17.9878 2.3454 18.9324 3.28998C19.877 4.23456 19.877 5.76554 18.9324 6.71012L8.93239 16.7101C7.98781 17.6547 6.45683 17.6547 5.51225 16.7101L1.06781 12.2657C0.12323 11.3211 0.12323 9.79011 1.06781 8.84553C2.01239 7.90095 3.54337 7.90095 4.48795 8.84553L7.22232 11.5799L15.5123 3.28998Z"
      />
    </Svg>
  );
};

export default CheckIcon;
