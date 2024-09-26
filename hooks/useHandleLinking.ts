import { StackActions } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { getInitialURL } from "expo-linking";
import { router, useNavigationContainerRef } from "expo-router";
import { useEffect } from "react";

// TESTING: ["lightning:", "bitcoin:", "alby:", "exp:"]
const SUPPORTED_SCHEMES = ["lightning", "bitcoin", "alby", "exp"];

export function useHandleLinking() {
  const rootNavigation = useNavigationContainerRef();

  useEffect(() => {
    getInitialURL().then((url) => handleLink(url ?? ""));
    const subscription = Linking.addEventListener(
      "url",
      (event: { url: string }) => handleLink(event.url),
    );
    return () => subscription.remove();
  }, []);

  function handleLink(url: string) {
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

      // Remove all items from the navigation stack
      rootNavigation.dispatch(StackActions.popToTop());

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
  }
}
