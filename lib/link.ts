import { router } from "expo-router";

const SUPPORTED_SCHEMES = ["lightning:", "bitcoin:", "alby:"];

// Register exp scheme for testing during development
// https://docs.expo.dev/guides/linking/#creating-urls
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  SUPPORTED_SCHEMES.push("exp:");
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
