import { Image, ImageProps } from "react-native";
import { useColorScheme } from "~/lib/useColorScheme";

function AlbyGoLogomark({ ...props }: ImageProps) {
  const { isDarkColorScheme } = useColorScheme();

  const lightModeImage = require(`../assets/logomark.png`);
  const darkModeImage = require(`../assets/logomark-dark.png`);

  const image = isDarkColorScheme ? darkModeImage : lightModeImage;

  return <Image source={image} resizeMode="contain" {...props} />;
}

export default AlbyGoLogomark;
