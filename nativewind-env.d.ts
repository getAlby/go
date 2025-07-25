/// <reference types="nativewind/types" />

declare module "react-native-country-flag" {
  import type { ComponentType } from "react";

  export interface CountryFlagProps {
    isoCode: string;
    size: number;
    style?: any;
    flags?: any;
    className?: string;
  }

  const CountryFlag: ComponentType<CountryFlagProps>;
  export default CountryFlag;
}
