import React from "react";
import { useColorScheme } from "react-native";
import Svg, { Path, type SvgProps } from "react-native-svg";

const ShitcoinIcon = (props: SvgProps) => {
  const colorScheme = useColorScheme();

  const colors = {
    light: "#9BA2AE", // translates to text-muted-foreground
    dark: "#A1A1AA",
  };

  const color = colorScheme === "dark" ? colors.dark : colors.light;

  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        fill={color}
        d="M10.0001 12.8376C11.5672 12.8376 12.8376 11.5672 12.8376 10.0001C12.8376 8.43299 11.5672 7.1626 10.0001 7.1626C8.43299 7.1626 7.1626 8.43299 7.1626 10.0001C7.1626 11.5672 8.43299 12.8376 10.0001 12.8376Z"
      />
      <Path
        fill={color}
        d="M17.5 4.65625H2.5C1.46874 4.65625 0.625 5.49999 0.625 6.53125V13.4687C0.625 14.5 1.46874 15.3437 2.5 15.3437H17.5C18.5313 15.3437 19.375 14.5 19.375 13.4687V6.53125C19.375 5.49999 18.5313 4.65625 17.5 4.65625ZM18.125 10.7562C16.4062 11.025 15.05 12.3812 14.7813 14.0937H5.21874C4.94999 12.3812 3.59375 11.025 1.875 10.7562V9.24373C3.59375 8.97499 4.94999 7.61874 5.21874 5.90625H14.7813C15.05 7.61874 16.4062 8.97499 18.125 9.24373V10.7562Z"
      />
    </Svg>
  );
};

export default ShitcoinIcon;
