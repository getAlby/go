import withMessagingServicePlugin from "./plugins/withMessageServicePlugin";

export default ({ config }) => {
  return {
    ...config,
    name: "Alby Go",
    slug: "alby-mobile",
    version: "1.8.1",
    scheme: ["lightning", "bitcoin", "alby", "nostr+walletconnect"],
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#0F0C40",
    },
    assetBundlePatterns: ["**/*"],
    plugins: [
      [
        withMessagingServicePlugin,
        {
          androidFMSFilePath: "./assets/MessagingService.kt",
        },
      ],
      [
        "expo-notification-service-extension-plugin",
        {
          mode: "production",
          iosNSEFilePath: "./assets/NotificationService.m",
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
      "expo-router",
      "expo-secure-store",
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.getalby.mobile",
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        LSMinimumSystemVersion: "12.0",
        UIBackgroundModes: ["remote-notification"],
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