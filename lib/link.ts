import { router } from "expo-router";
import { BOLT11_REGEX } from "./constants";
import { lnurl as lnurlLib } from "./lnurl";

const SUPPORTED_SCHEMES = [
  "lightning:",
  "bitcoin:",
  "alby:",
  "nostr+walletconnect:",
];

// Register exp scheme for testing during development
// https://docs.expo.dev/guides/linking/#creating-urls
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  SUPPORTED_SCHEMES.push("exp:");
}

export const handleLink = async (url: string) => {
  if (!url) {
    return;
  }

  const parsedUrl = new URL(url);
  if (!parsedUrl.protocol) {
    return;
  }

  if (SUPPORTED_SCHEMES.indexOf(parsedUrl.protocol) > -1) {
    let { username, hostname, protocol, pathname, search } = parsedUrl;
    if (parsedUrl.protocol === "nostr+walletconnect:") {
      if (router.canDismiss()) {
        router.dismissAll();
      }
      console.info("Navigating to wallet setup");
      router.push({
        pathname: "/settings/wallets/setup",
        params: {
          nwcUrl: protocol + hostname + search,
        },
      });
      return;
    }

    if (parsedUrl.protocol === "exp:") {
      if (!parsedUrl.pathname) {
        return;
      }

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

    console.info("Navigating to", fullUrl);

    const schemePattern = new RegExp(
      `^(${SUPPORTED_SCHEMES.map((s) => s.replace(":", "")).join("|")}):`,
    );
    const trimmedUrl = fullUrl.replace(schemePattern, "");

    // Check for LNURLs
    const lnurl = lnurlLib.findLnurl(trimmedUrl);
    if (lnurl) {
      const lnurlDetails = await lnurlLib.getDetails(lnurl);

      if (lnurlDetails.tag === "withdrawRequest") {
        router.push({
          pathname: "/withdraw",
          params: {
            url: lnurl,
          },
        });
        return;
      }

      if (lnurlDetails.tag === "payRequest") {
        router.push({
          pathname: "/send",
          params: {
            url: lnurl,
          },
        });
        return;
      }
    }

    // Check for BOLT-11 invoices (including BIP-21 unified QRs)
    const bolt11Match = trimmedUrl.match(BOLT11_REGEX);
    if (bolt11Match) {
      const bolt11 = bolt11Match[1];
      router.push({
        pathname: "/send",
        params: {
          url: bolt11,
        },
      });
    }
  } else {
    // Redirect the user to the home screen
    // if no match was found
    router.replace({
      pathname: "/",
    });
  }
};
