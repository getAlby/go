import * as Linking from "expo-linking";
import { router, useRootNavigationState } from "expo-router";
import React from "react";

// TODO: Remove exp://
const SUPPORTED_SCHEMES = ["lightning:", "bitcoin:", "alby:", "exp:"];

export function useHandleLinking() {
  const rootNavigationState = useRootNavigationState();
  const url = Linking.useURL();
  const hasNavigationState = !!rootNavigationState?.key;

  React.useEffect(() => {
    if (!hasNavigationState || !url) {
      return;
    }

    for (const scheme of SUPPORTED_SCHEMES) {
      if (url.startsWith(scheme)) {
        let currentUrl = url.startsWith(scheme + "//")
          ? url.replace(scheme + "//", scheme)
          : url;

        // TODO: Remove, only for debugging purposes
        currentUrl = currentUrl.replace("exp:127.0.0.1:8081/--/", "lightning:");

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
