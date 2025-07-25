import { nwc } from "@getalby/sdk";
import { router, type Href } from "expo-router";
import { InteractionManager } from "react-native";
import { BOLT11_REGEX } from "./constants";
import { lnurl as lnurlLib } from "./lnurl";

const SUPPORTED_SCHEMES = [
  "lightning:",
  "bitcoin:",
  "alby:",
  "nostr+walletconnect:",
  "nostrnwc:",
  "nostrnwc+alby:",
  "nostr+walletauth:",
  "nostr+walletauth+alby:",
];

// Register exp scheme for testing during development
// https://docs.expo.dev/guides/linking/#creating-urls
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  SUPPORTED_SCHEMES.push("exp:");
}

const safeRouterPush = async (href: Href) => {
  // This resolves the action 'PUSH' with payload was not handled by any navigator errors
  await new Promise<void>((resolve) =>
    InteractionManager.runAfterInteractions(resolve),
  );
  router.push(href);
};

export const handleLink = async (url: string) => {
  if (!url) {
    console.error("no url to handle");
    return;
  }
  console.info("handling link", url);

  const parsedUrl = new URL(url);
  if (!parsedUrl.protocol) {
    console.error("no protocol in URL", url);
    return;
  }

  if (SUPPORTED_SCHEMES.indexOf(parsedUrl.protocol) > -1) {
    let { username, hostname, protocol, pathname, search } = parsedUrl;
    if (parsedUrl.protocol.startsWith("nostr+walletauth")) {
      const nwaOptions = nwc.NWAClient.parseWalletAuthUrl(url);

      safeRouterPush({
        pathname: "/settings/wallets/connect",
        params: {
          options: JSON.stringify(nwaOptions),
          flow: "nwa",
        },
      });
      return;
    }

    if (parsedUrl.protocol.startsWith("nostrnwc")) {
      const params = new URLSearchParams(search);
      const appname = params.get("appname");
      const rawCallback = params.get("callback");
      const rawAppIcon = params.get("appicon");
      if (!appname || !rawCallback || !rawAppIcon) {
        return;
      }

      const appicon = decodeURIComponent(rawAppIcon);
      const callback = decodeURIComponent(rawCallback);

      console.info("Navigating to NWA flow");
      safeRouterPush({
        pathname: "/settings/wallets/connect",
        params: {
          options: JSON.stringify({
            icon: appicon,
            name: appname,
            returnTo: callback,
          } as nwc.NWAOptions),
          flow: "deeplink",
        },
      });
      return;
    }

    if (parsedUrl.protocol === "nostr+walletconnect:") {
      console.info("Navigating to wallet setup");
      safeRouterPush({
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

    console.info("Navigating to", fullUrl);

    // Opening the notification executes the linking code
    // We set the hostname on the notification deeplink so that it can be handled separately
    if (hostname === "payment_notification") {
      const urlParams = new URLSearchParams(search);
      const walletId = urlParams.get("wallet_id");
      const transaction = urlParams.get("transaction");
      if (!transaction || !walletId) {
        return;
      }
      const transactionJSON = decodeURIComponent(transaction);
      safeRouterPush({
        pathname: "/transaction",
        params: { transactionJSON, walletId },
      });
      return;
    }

    const schemePattern = new RegExp(
      `^(${SUPPORTED_SCHEMES.map((s) => s.replace(":", "")).join("|")}):`,
    );
    const trimmedUrl = fullUrl.replace(schemePattern, "");

    // Check for LNURLs
    const lnurl = lnurlLib.findLnurl(trimmedUrl);
    if (lnurl) {
      const lnurlDetails = await lnurlLib.getDetails(lnurl);

      if (lnurlDetails.tag === "withdrawRequest") {
        safeRouterPush({
          pathname: "/withdraw",
          params: {
            url: lnurl,
          },
        });
        return;
      }

      if (lnurlDetails.tag === "payRequest") {
        safeRouterPush({
          pathname: "/send/lnurl-pay",
          params: {
            lnurlDetailsJSON: JSON.stringify(lnurlDetails),
            receiver: lnurl,
          },
        });
        return;
      }
    }

    // Check for BOLT-11 invoices (including BIP-21 unified QRs)
    const bolt11Match = trimmedUrl.match(BOLT11_REGEX);
    if (bolt11Match) {
      const bolt11 = bolt11Match[1];
      safeRouterPush({
        pathname: "/send",
        params: {
          url: bolt11,
        },
      });
    }
  } else {
    console.error("Unsupported scheme", url);
    // Redirect the user to the home screen
    // if no match was found
    router.replace({
      pathname: "/",
    });
  }
};
