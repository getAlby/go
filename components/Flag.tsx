import { cssInterop } from "nativewind";
import RNCountryFlag from "react-native-country-flag";

type CountryFlagProps = React.ComponentProps<typeof RNCountryFlag> & {
  className?: string;
};

const CountryFlag = ({ className, ...props }: CountryFlagProps) => {
  return <RNCountryFlag {...props} />;
};

cssInterop(CountryFlag, {
  className: "style",
});

export { CountryFlag };
