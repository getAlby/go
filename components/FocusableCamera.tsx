import { BarcodeScanningResult, CameraView } from "expo-camera";
import React from "react";
import { TouchableOpacity } from "react-native";

type FocusableCameraProps = {
  onScanned(data: string): void;
};

export function FocusableCamera({ onScanned }: FocusableCameraProps) {
  const [autoFocus, setAutoFocus] = React.useState(true);

  const focusCamera = () => {
    setAutoFocus(false);
    setTimeout(() => {
      setAutoFocus(true);
    }, 200);
  };

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
      autofocus={autoFocus ? "on" : "off"}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={focusCamera}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
      />
    </CameraView>
  );
}
