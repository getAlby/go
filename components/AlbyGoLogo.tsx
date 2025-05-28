import { Image } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

function AlbyGoLogo({ className = "" }) {
  const { isDarkColorScheme } = useColorScheme();

  const lightModeImage = require(`../assets/alby-go-logo.png`);
  const darkModeImage = require(`../assets/alby-go-logo-dark.png`);

  const image = isDarkColorScheme ? darkModeImage : lightModeImage;

  return <Image source={image} className={className} resizeMode="contain" />;
}

export default AlbyGoLogo;
