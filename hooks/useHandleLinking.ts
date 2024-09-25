import * as Linking from "expo-linking";
import { router, useRootNavigationState } from "expo-router";
import React from "react";

// TESTING: ["lightning:", "bitcoin:", "alby:", "exp:"]
const SUPPORTED_SCHEMES = ["lightning:", "bitcoin:", "alby:"];

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

        // TESTING:
        // currentUrl = currentUrl.replace("exp:127.0.0.1:8081/--/", "lightning:");

        // Instead of dismissing all screens, we'll use replace to avoid navigation stack issues
        router.replace({
          pathname: "/send",
          params: {
            url: currentUrl,
          },
        });
        return;
      }
    }

    // Redirect the user to the home screen
    // if no match was found
    router.replace({
      pathname: "/",
    });
  }, [url, hasNavigationState]);
}
