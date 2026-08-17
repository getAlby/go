import { NWAClient, type NWAOptions } from "@getalby/sdk/nwc";
import { router } from "expo-router";
import { errorToast } from "~/lib/errorToast";
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
  "lnurlw:",
  "lnurlp:",
];

// Register exp scheme for testing during development
// https://docs.expo.dev/guides/linking/#creating-urls
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  SUPPORTED_SCHEMES.push("exp:");
}

const handleLnurl = async (lnurl: string) => {
  const lnurlDetails = await lnurlLib.getDetails(lnurl);
  if (lnurlDetails.tag === "withdrawRequest") {
    router.push({
      pathname: "/receive/withdraw",
      params: {
        url: lnurl,
      },
    });
  }
  if (lnurlDetails.tag === "payRequest") {
    router.push({
      pathname: "/send/lnurl-pay",
      params: {
        lnurlDetailsJSON: JSON.stringify(lnurlDetails),
        receiver: lnurl,
      },
    });
  }
};

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
    if (parsedUrl.protocol.startsWith("nostr+walletauth")) {
      const nwaOptions = NWAClient.parseWalletAuthUrl(url);

      router.push({
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
      const callback = params.get("callback");
      const appicon = params.get("appicon");
      if (!appname || !callback || !appicon) {
        return;
      }

      router.push({
        pathname: "/settings/wallets/connect",
        params: {
          options: JSON.stringify({
            icon: appicon,
            name: appname,
            returnTo: callback,
          } as NWAOptions),
          flow: "deeplink",
        },
      });
      return;
    }

    if (parsedUrl.protocol === "nostr+walletconnect:") {
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

    if (parsedUrl.protocol.startsWith("lnurl")) {
      handleLnurl(fullUrl);
      return;
    }

    // Opening the notification executes the linking code
    // We set the hostname on the notification deeplink so that it can be handled separately
    if (hostname === "payment_notification") {
      const urlParams = new URLSearchParams(search);
      const appPubkey = urlParams.get("app_pubkey");
      const transactionJSON = urlParams.get("transaction");
      if (!transactionJSON || !appPubkey) {
        return;
      }
      router.push({
        pathname: "/transaction",
        params: { transactionJSON, appPubkey },
      });
      return;
    }

    const schemePattern = new RegExp(
      `^(${SUPPORTED_SCHEMES.map((s) => s.replace(":", "")).join("|")}):`,
    );
    const trimmedUrl = fullUrl.replace(schemePattern, "");
    // Check for LNURLs wrapped in other protocol schemes
    const lnurl = lnurlLib.findLnurl(trimmedUrl);
    if (lnurl) {
      handleLnurl(lnurl);
      return;
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
    errorToast(new Error("Unsupported link"));
    // Redirect the user to the home screen
    // if no match was found
    router.replace({
      pathname: "/",
    });
  }
};
