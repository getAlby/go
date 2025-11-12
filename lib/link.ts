import { NWAClient, type NWAOptions } from "@getalby/sdk/nwc";
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
  "lnurlw:",
  "lnurlp:",
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

const handleLnurl = async (lnurl: string) => {
  const lnurlDetails = await lnurlLib.getDetails(lnurl);
  if (lnurlDetails.tag === "withdrawRequest") {
    safeRouterPush({
      pathname: "/receive/withdraw",
      params: {
        url: lnurl,
      },
    });
  }
  if (lnurlDetails.tag === "payRequest") {
    safeRouterPush({
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
    console.error("no url to handle");
    return;
  }
  // to test opening a transaction:
  //url = "alby://payment_notification?app_pubkey=ffa0c4a95734243b466d406a1a3ebf4a055bd3a1ef31794e0e3705ee3e6c887b&transaction=%7B%22type%22%3A%22incoming%22%2C%22state%22%3A%22settled%22%2C%22invoice%22%3A%22lnbc200n1p5gphfudqqnp4q228a2ztxkwzaypvzrsh823qngmv97f2v9puwvtsadetypmutyscwpp55s7kzj07uefua5hygqmu34jau0jjp5ck4efvalakj8ztqxntdpkqsp5sxh7kfylhxw6lk336499dpm3w84f6c89h3w8mn95ujm2wnsl4srs9qyysgqcqpcxqyz5vq392s8kt5nhsyywxx0jtjxq3nl6m9yg4zsjqc8mnnj25wmv94hasq8tsl52cnnm02klzy249d4k57qt9pc2ujr9nhf5xq97ne0zgv02gprywph3%22%2C%22description%22%3A%22%22%2C%22description_hash%22%3A%22%22%2C%22preimage%22%3A%22f2fbb43593dd7d7e694d7e330645916c321c730055038fe48f3d6ea858aa9a14%22%2C%22payment_hash%22%3A%22a43d6149fee653ced2e44037c8d65de3e520d316ae52ceffb691c4b01a6b686c%22%2C%22amount%22%3A20000%2C%22fees_paid%22%3A0%2C%22created_at%22%3A1753275708%2C%22expires_at%22%3A1753362108%2C%22settled_at%22%3A1753275741%2C%22settle_deadline%22%3Anull%2C%22metadata%22%3Anull%7D";
  console.info("handling link", url);

  const parsedUrl = new URL(url);
  if (!parsedUrl.protocol) {
    console.error("no protocol in URL", url);
    return;
  }

  if (SUPPORTED_SCHEMES.indexOf(parsedUrl.protocol) > -1) {
    let { username, hostname, protocol, pathname, search } = parsedUrl;
    if (parsedUrl.protocol.startsWith("nostr+walletauth")) {
      const nwaOptions = NWAClient.parseWalletAuthUrl(url);

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
          } as NWAOptions),
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

    if (parsedUrl.protocol.startsWith("lnurl")) {
      handleLnurl(fullUrl);
      return;
    }

    // Opening the notification executes the linking code
    // We set the hostname on the notification deeplink so that it can be handled separately
    if (hostname === "payment_notification") {
      const urlParams = new URLSearchParams(search);
      const appPubkey = urlParams.get("app_pubkey");
      const transaction = urlParams.get("transaction");
      if (!transaction || !appPubkey) {
        return;
      }
      const transactionJSON = decodeURIComponent(transaction);
      safeRouterPush({
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
