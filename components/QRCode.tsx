import { LinearGradient } from "components/LinearGradient";
import { View } from "react-native";
import QRCodeLibrary from "react-native-qrcode-svg";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";

function QRCode({ value }: { value: string }) {
  const { isDarkColorScheme } = useColorScheme();
  return (
    <LinearGradient
      className="p-2 rounded-2xl flex items-center justify-center"
      colors={["#FFC453", "#FFE951"]}
      start={[0, 1]}
      end={[1, 0]}
      style={{ borderRadius: 28, elevation: 2 }}
    >
      <View
        className={cn(
          "flex items-center justify-center p-3 rounded-3xl w-96 h-96 bg-background",
        )}
      >
        <QRCodeLibrary
          color={isDarkColorScheme ? "white" : "black"}
          backgroundColor={isDarkColorScheme ? "black" : "white"}
          value={value}
          size={300}
          ecl="H"
        />
      </View>
    </LinearGradient>
  );
}

export default QRCode;
