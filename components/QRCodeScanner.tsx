import { CameraView, useCameraPermissions } from "expo-camera";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CameraOffIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import Loading from "./Loading";

const styles = StyleSheet.create({
  icon: {
    width: 64,
    height: 64,
  },
});

interface QRCodeScannerProps {
  onScanned: (data: string) => Promise<boolean>;
  startScanning: boolean;
}

function QRCodeScanner({
  onScanned,
  startScanning = true,
}: QRCodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();

  console.info(onScanned, startScanning);

  if (!permission) {
    return (
      <View className="flex-1">
        <View className="flex-1 justify-center items-center">
          <Loading className="text-primary-foreground" />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1">
        <View className="flex-1 h-full flex flex-col items-center justify-center gap-2 p-6">
          <CameraOffIcon className="text-foreground" style={styles.icon} />
          <Text className="text-2xl text-foreground text-center">
            Camera Permission Denied
          </Text>
          <Text className="text-muted-foreground text-xl text-center">
            It seems you denied permissions to use your camera. You might need
            to go to your device settings to allow access to your camera again.
          </Text>
          <Button onPress={requestPermission}>
            <Text>Grant Permissions</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        active
        style={{ flex: 1, width: "100%" }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
    </View>
  );
}

export default QRCodeScanner;
