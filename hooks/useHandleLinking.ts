import * as Linking from "expo-linking";
import { getInitialURL } from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";
import { useSession } from "./useSession";

const SUPPORTED_SCHEMES = ["lightning:", "bitcoin:", "alby:"];

// Register exp scheme for testing during development
// https://docs.expo.dev/guides/linking/#creating-urls
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  SUPPORTED_SCHEMES.push("exp:");
}

export function useHandleLinking() {
  const { hasSession } = useSession();

  useEffect(() => {
    // Do not process any deep links until the user authenticated
    // This prevents redirect loops between the deep link and /unlock
    if (!hasSession) return;

    const processInitialURL = async () => {
      const url = await getInitialURL();
      if (url) handleLink(url);
    };

    processInitialURL();

    const subscription = Linking.addEventListener(
      "url",
      (event: { url: string }) => {
        handleLink(event.url);
      },
    );

    return () => subscription.remove();
  }, [hasSession]);
}

export const handleLink = (url: string) => {
  if (!url) return;

  const parsedUrl = new URL(url);
  if (!parsedUrl.protocol) return;

  if (SUPPORTED_SCHEMES.indexOf(parsedUrl.protocol) > -1) {
    let { username, hostname, protocol, pathname, search } = parsedUrl;

    if (parsedUrl.protocol === "exp:") {
      if (!parsedUrl.pathname) return;

      // Extract the pathname from the URL
      const pathnameUrl = new URL(new URL(url).pathname.substring(4));
      const pathnameContentUrl = new URL(pathnameUrl);
      username = pathnameContentUrl.username;
      hostname = pathnameContentUrl.hostname;
      protocol = pathnameContentUrl.protocol;
      pathname = pathnameContentUrl.pathname;
    }

    let fullUrl = `${protocol}${username ? username + "@" : ""}${hostname}${pathname}${search}`;

    if (router.canDismiss()) {
      router.dismissAll();
    }

    console.log("Navigating to", fullUrl);

    router.push({
      pathname: "/send",
      params: {
        url: fullUrl,
      },
    });
  } else {
    // Redirect the user to the home screen
    // if no match was found
    router.replace({
      pathname: "/",
    });
  }
};
