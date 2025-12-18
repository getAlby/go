const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// eslint-disable-next-line no-undef
const config = getSentryExpoConfig(__dirname);

const isIOS = process.env.PLATFORM === "ios";

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: isIOS ? 16 : false,
});
