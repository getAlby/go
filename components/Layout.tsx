import React from "react";
import "react-native-webview";
import PolyfillCrypto from "react-native-webview-crypto";
import { SWRConfig } from "swr";
import { swrConfiguration } from "lib/swr";
import { SafeAreaView } from "react-native-safe-area-context";

export function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <SafeAreaView className="flex-1 flex items-center justify-center p-0 h-full flex-col">
        <PolyfillCrypto />
        <SWRConfig value={swrConfiguration}>{children}</SWRConfig>
      </SafeAreaView>
    </>
  );
}
