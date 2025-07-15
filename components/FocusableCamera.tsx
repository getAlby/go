import { type BarcodeScanningResult, CameraView } from "expo-camera";
import React from "react";

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
      autofocus={"on"}
    />
  );
}
