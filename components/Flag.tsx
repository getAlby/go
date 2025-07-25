import { cssInterop } from "nativewind";
import CountryFlag from "react-native-country-flag";

cssInterop(CountryFlag, {
  className: {
    target: "style",
  },
});

export { CountryFlag };
