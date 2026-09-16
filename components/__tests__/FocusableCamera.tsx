import { CameraView, type BarcodeScanningResult } from "expo-camera";
import { Platform } from "react-native";
import { FocusableCamera } from "../FocusableCamera";

jest.mock("expo-camera", () => ({ CameraView: "CameraView" }));

describe("FocusableCamera", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uses Expo's continuous autofocus mode on iOS", () => {
    jest.replaceProperty(Platform, "OS", "ios");

    const camera = FocusableCamera({ onScanned: jest.fn() });

    expect(camera.type).toBe(CameraView);
    // In expo-camera 57, iOS "off" maps to continuousAutoFocus; "on" locks
    // focus after one adjustment. This only tests the prop, not native optics.
    expect(camera.props.autofocus).toBe("off");
  });

  it.each(["android", "web"] as const)(
    "preserves the existing autofocus setting on %s",
    (platform) => {
      jest.replaceProperty(Platform, "OS", platform);

      const camera = FocusableCamera({ onScanned: jest.fn() });

      expect(camera.props.autofocus).toBe("on");
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
