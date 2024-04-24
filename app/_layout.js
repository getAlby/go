import "../lib/applyGlobalPolyfills";
import { SplashScreen } from "expo-router";

import { Slot } from "expo-router";

import React from "react";
import { NativeWindStyleSheet } from "nativewind";
import { Layout } from "../components/Layout";

//SplashScreen.preventAutoHideAsync();

NativeWindStyleSheet.setOutput({
  default: "native",
});

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  return (
    <Layout>
      <Slot />
    </Layout>
  );
}
