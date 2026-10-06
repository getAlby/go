import { CameraView, type BarcodeScanningResult } from "expo-camera";
import { Platform } from "react-native";
import { FocusableCamera } from "../FocusableCamera";

jest.mock("expo-camera", () => ({ CameraView: "CameraView" }));

describe("FocusableCamera", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(["ios", "android", "web"] as const)(
    "leaves autofocus at Expo's default on %s",
    (platform) => {
      jest.replaceProperty(Platform, "OS", platform);

      const camera = FocusableCamera({ onScanned: jest.fn() });

      expect(camera.type).toBe(CameraView);
      // Verify the prop contract, not native camera focus behavior.
      expect(camera.props).not.toHaveProperty("autofocus");
    },
  );

  it("preserves QR-only scanning and forwards the scanned data", () => {
    const onScanned = jest.fn();
    const camera = FocusableCamera({ onScanned });
    const result: BarcodeScanningResult = {
      type: "qr",
      data: "lightning:lnbc123",
      cornerPoints: [],
      bounds: {
        origin: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
      },
    };

    expect(camera.props.barcodeScannerSettings).toEqual({
      barcodeTypes: ["qr"],
    });
    camera.props.onBarcodeScanned(result);
    expect(onScanned).toHaveBeenCalledTimes(1);
    expect(onScanned).toHaveBeenCalledWith(result.data);
  });
});
