import withMessagingServicePlugin from "./plugins/android/withMessageServicePlugin";
import withOpenSSLPlugin from "./plugins/ios/withOpenSSLPlugin";

export default ({ config }) => {
  return {
    ...config,
    name: "Alby Go",
    slug: "alby-mobile",
    version: "1.14.0",
    scheme: [
      "lightning",
      "bitcoin",
      "alby",
      "nostr+walletconnect",
      "nostrnwc",
      "nostrnwc+alby",
      "nostr+walletauth",
      "nostr+walletauth+alby",
    ],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    assetBundlePatterns: ["**/*"],
    plugins: [
      [
        withMessagingServicePlugin,
        {
          androidFMSFilePath: "./assets/android/MessagingService.kt",
        },
      ],
      [withOpenSSLPlugin],
      [
        "expo-notification-service-extension-plugin",
        {
          mode: "production",
          iosNSEFilePath: "./assets/ios/NotificationService.m",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#0B0930",
          image: "./assets/icon.png",
          imageWidth: "150",
        },
      ],
      [
        "expo-local-authentication",
        {
          faceIDPermission: "Allow Alby Go to use Face ID.",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow Alby Go to use the camera to scan wallet connection and payment QR codes",
          recordAudioAndroid: false,
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/OpenRunde-Regular.otf",
            "./assets/fonts/OpenRunde-Medium.otf",
            "./assets/fonts/OpenRunde-Semibold.otf",
            "./assets/fonts/OpenRunde-Bold.otf",
          ],
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/notification.png",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow Alby Go to access your photos to load invoice and lightning address QRs",
        },
      ],
      "expo-location",
      "expo-router",
      "expo-secure-store",
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "alby-go",
          organization: "getalby",
        },
      ],
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.getalby.mobile",
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        LSMinimumSystemVersion: "13.0",
        UIBackgroundModes: ["audio", "remote-notification"],
      },
      userInterfaceStyle: "automatic",
    },
    android: {
      package: "com.getalby.mobile",
      icon: "./assets/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundImage: "./assets/adaptive-icon-bg.png",
        monochromeImage: "./assets/monochromatic.png",
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT",
      ],
      userInterfaceStyle: "automatic",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },
    extra: {
      eas: {
        projectId: "294965ec-3a67-4994-8794-5cc1117ef155",
      },
    },
    owner: "roland_alby",
  };
};
