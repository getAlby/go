import * as Linking from "expo-linking";
import { getInitialURL } from "expo-linking";
import { router, useRootNavigationState } from "expo-router";
import { useEffect, useCallback, useRef } from "react";

// TESTING: ["lightning:", "bitcoin:", "alby:", "exp:"]
const SUPPORTED_SCHEMES = ["lightning", "bitcoin", "alby"];

// Register exp scheme for testing during development
// https://docs.expo.dev/guides/linking/#creating-urls
if (process.env.NODE_ENV === "development") {
  SUPPORTED_SCHEMES.push("exp");
}

export function useHandleLinking() {
  console.log(process.env.NODE_ENV);
  const navigationState = useRootNavigationState();
  const pendingLinkRef = useRef<string | null>(null);

  const handleLink = useCallback(
    (url: string) => {
      if (!url) return;

      const { hostname, path, queryParams, scheme } = Linking.parse(url);

      if (!scheme) return;

      if (SUPPORTED_SCHEMES.indexOf(scheme) > -1) {
        let fullUrl = scheme === "exp" ? path : `${scheme}:${hostname}`;

        // Add query parameters to the URL if they exist
        if (queryParams && Object.keys(queryParams).length > 0) {
          const queryString = new URLSearchParams(
            queryParams as Record<string, string>,
          ).toString();
          fullUrl += `?${queryString}`;
        }

        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.push({
          pathname: "/send",
          params: {
            url: fullUrl,
          },
        });
        return;
      }

      // Redirect the user to the home screen
      // if no match was found
      router.replace({
        pathname: "/",
      });
    },
    [navigationState?.key],
  );

  useEffect(() => {
    const processInitialURL = async () => {
      const url = await getInitialURL();
      if (url) pendingLinkRef.current = url;
    };

    processInitialURL();

    const subscription = Linking.addEventListener(
      "url",
      (event: { url: string }) => {
        if (navigationState?.key) {
          handleLink(event.url);
        } else {
          pendingLinkRef.current = event.url;
        }
      },
    );

    return () => subscription.remove();
  }, [handleLink]);

  useEffect(() => {
    if (navigationState?.key && pendingLinkRef.current) {
      handleLink(pendingLinkRef.current);
      pendingLinkRef.current = null;
    }
  }, [navigationState?.key, handleLink]);
}
