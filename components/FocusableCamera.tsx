import { type BarcodeScanningResult, CameraView } from "expo-camera";
import React from "react";
import { Platform } from "react-native";

type FocusableCameraProps = {
  onScanned(data: string): void;
};

export function FocusableCamera({ onScanned }: FocusableCameraProps) {
  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    onScanned(data);
  };
  return (
    <CameraView
      onBarcodeScanned={handleBarCodeScanned}
      style={{ flex: 1, width: "100%" }}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      // Expo Camera's iOS "off" means continuous autofocus; "on" focuses once
      // and locks. Keep the existing setting on other platforms.
      // https://github.com/expo/expo/issues/32460#issuecomment-2446904293
      autofocus={Platform.OS === "ios" ? "off" : "on"}
    />
  );
}
