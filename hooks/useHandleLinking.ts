import * as Linking from "expo-linking";
import { router, useRootNavigationState } from "expo-router";
import React from "react";

const SUPPORTED_SCHEMES = ["lightning:", "bitcoin:", "alby:"];

export function useHandleLinking() {
  const rootNavigationState = useRootNavigationState();
  let url = Linking.useURL();
  let hasNavigationState = !!rootNavigationState?.key;

  React.useEffect(() => {
    if (!hasNavigationState) {
      return;
    }
    console.log("Received linking URL", url);

    for (const scheme of SUPPORTED_SCHEMES) {
      if (url?.startsWith(scheme)) {
        console.log("Linking URL matched scheme", url, scheme);
        if (url.startsWith(scheme + "//")) {
          url = url.replace(scheme + "//", scheme);
        }

        // TODO: it should not always navigate to send,
        // but that's the only linking functionality supported right now
        router.dismissAll();
        router.navigate({
          pathname: "/send",
          params: {
            url,
          },
        });
        break;
      }
    }
  }, [url, hasNavigationState]);
}
