import { LinearGradient } from "components/LinearGradient";
import { Dimensions, Image, View } from "react-native";
import QRCodeLibrary from "react-native-qrcode-svg";

function QRCode({
  value,
  showAvatar,
}: {
  value: string;
  showAvatar?: boolean;
}) {
  const dimensions = Dimensions.get("window");
  const qrSize = Math.round((dimensions.width * 5) / 7);
  const avatarSize = qrSize * 0.19;

  return (
    <View className="justify-center">
      <LinearGradient
        className="p-2 rounded-2xl flex items-center justify-center"
        colors={["#FFC453", "#FFE951"]}
        start={[0, 1]}
        end={[1, 0]}
        style={{ borderRadius: 28, elevation: 2 }}
      >
        <View className="flex items-center justify-center p-4 rounded-3xl bg-white">
          <QRCodeLibrary value={value} size={qrSize} />
        </View>
      </LinearGradient>
      {showAvatar && (
        <View className="absolute self-center p-2 rounded-2xl bg-white">
          <Image
            source={require("../assets/icon.png")}
            className="rounded-xl"
            resizeMode="contain"
            style={{
              width: avatarSize,
              height: avatarSize,
            }}
          />
        </View>
      )}
    </View>
  );
}

export default QRCode;
