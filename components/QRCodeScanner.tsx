import { useIsFocused } from "@react-navigation/native";
import { Camera, PermissionStatus } from "expo-camera";
import React, { useEffect } from "react";
import { View } from "react-native";
import { CameraOffIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { FocusableCamera } from "./FocusableCamera";
import Loading from "./Loading";

interface QRCodeScannerProps {
  onScanned: (data: string) => Promise<boolean>;
  startScanning: boolean;
}

function QRCodeScanner({
  onScanned,
  startScanning = true,
}: QRCodeScannerProps) {
  const isFocused = useIsFocused();
  const [isScanning, setScanning] = React.useState(startScanning);
  const [isLoading, setLoading] = React.useState(false);
  const [permissionStatus, setPermissionStatus] = React.useState(
    PermissionStatus.UNDETERMINED,
  );

  useEffect(() => {
    // Add some timeout to allow the screen transition to finish before
    // starting the camera to avoid stutters
    if (startScanning) {
      setLoading(true);
      window.setTimeout(async () => {
        await scan();
        setLoading(false);
      }, 200);
    }
  }, [startScanning]);

  async function scan() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermissionStatus(status);
    setScanning(status === "granted");
  }

  const handleScanned = async (data: string) => {
    if (isScanning) {
      console.info(`Bar code with data ${data} has been scanned!`);
      const result = await onScanned(data);
      setScanning(!result);
    }
  };

  return (
    <View className="flex-1">
      {(isLoading ||
        (!isScanning &&
          permissionStatus === PermissionStatus.UNDETERMINED)) && (
        <View className="flex-1 justify-center items-center">
          <Loading className="text-primary-foreground" />
        </View>
      )}
      {!isLoading && (
        <>
          {!isScanning && permissionStatus === PermissionStatus.DENIED && (
            <View className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              <CameraOffIcon
                className="text-secondary-foreground"
                width={64}
                height={64}
              />
              <Text className="text-xl font-medium2 text-center">
                Camera Permission Denied
              </Text>
              <Text className="text-secondary-foreground text-center">
                It seems you denied permissions to use your camera. You might
                need to go to your device settings to allow access to your
                camera again.
              </Text>
            </View>
          )}
          {isScanning && isFocused && (
            <FocusableCamera onScanned={handleScanned} />
          )}
        </>
      )}
    </View>
  );
}

export default QRCodeScanner;
