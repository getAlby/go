import * as Linking from "expo-linking";
import { router, useRootNavigationState } from "expo-router";
import React from "react";

const SUPPORTED_SCHEMES = ["lightning:", "bitcoin:", "alby:", "exp:"];

export function useHandleLinking() {
  const rootNavigationState = useRootNavigationState();
  const url = Linking.useURL();
  const hasNavigationState = !!rootNavigationState?.key;

  React.useEffect(() => {
    if (!hasNavigationState || !url) {
      return;
    }

    console.log("useHandleLinking", url);

    for (const scheme of SUPPORTED_SCHEMES) {
      if (url.startsWith(scheme)) {
        let currentUrl = url.startsWith(scheme + "//")
          ? url.replace(scheme + "//", scheme)
          : url;
        currentUrl = currentUrl.replace("exp:127.0.0.1:8081/--/", "lightning:");

        console.log("navigating to send screen", currentUrl);

        // Instead of dismissing all screens, we'll use replace to avoid navigation stack issues
        router.replace({
          pathname: "/send",
          params: {
            url: currentUrl,
          },
        });
        break;
      }
    }
  }, [url, hasNavigationState]);
}
