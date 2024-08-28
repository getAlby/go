import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import QRCodeLibrary from "react-native-qrcode-svg";
import { SHADOWS } from "~/lib/constants";

function QRCode({ value }: { value: string }) {
  return (
    <LinearGradient
      className="p-2 rounded-3xl flex items-center justify-center"
      colors={["#FFC453", "#FFE951"]}
      start={[0, 1]}
      end={[1, 0]}
      style={SHADOWS.medium}
    >
      <View className="flex items-center justify-center p-3 rounded-2xl bg-white w-96 h-96">
        <QRCodeLibrary value={value} size={300} />
      </View>
    </LinearGradient>
  );
}

export default QRCode;
