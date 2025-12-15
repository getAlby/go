import { LinearGradient } from "components/LinearGradient";
import { Dimensions, View } from "react-native";
import QRCodeLibrary from "react-native-qrcode-svg";
import AlbyGoLogomark from "~/components/AlbyGoLogomark";
import { useThemeColor } from "~/lib/useThemeColor";

function QRCode({
  value,
  showAvatar,
}: {
  value: string;
  showAvatar?: boolean;
}) {
  const { primary, secondary } = useThemeColor("primary", "secondary");
  const dimensions = Dimensions.get("window");
  const qrSize = Math.round((dimensions.width * 5) / 7);
  const avatarSize = qrSize * 0.15;

  return (
    <View className="justify-center">
      <LinearGradient
        className="p-2 rounded-2xl flex items-center justify-center"
        colors={[secondary, primary]}
        start={[0, 1]}
        end={[1, 0]}
        style={{ borderRadius: 28, elevation: 2 }}
      >
        <View className="flex items-center justify-center p-4 rounded-3xl bg-white">
          <QRCodeLibrary value={value} size={qrSize} />
        </View>
      </LinearGradient>
      {showAvatar && (
        <View className="absolute self-center p-3 rounded-full bg-background">
          <AlbyGoLogomark
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
