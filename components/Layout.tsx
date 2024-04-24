import React from "react";
import PolyfillCrypto from "react-native-webview-crypto";
import { SWRConfig } from "swr";
import { swrConfiguration } from "lib/swr";
import { SafeAreaView } from "react-native-safe-area-context";

export function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <SafeAreaView className="flex items-center justify-center h-full">
        <PolyfillCrypto />
        <SWRConfig value={swrConfiguration}>{children}</SWRConfig>
      </SafeAreaView>
    </>
  );
}
