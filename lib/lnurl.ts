// modified from https://github.com/getAlby/lightning-browser-extension/blob/master/src/common/lib/lnurl.ts

import { bech32Decode } from "./bech32";

interface LNURLError {
  status: "ERROR";
  reason: string;
}

export interface LNURLPayServiceResponse {
  callback: string; // The URL from LN SERVICE which will accept the pay request parameters
  maxSendable: number; // Max amount LN SERVICE is willing to receive
  minSendable: number; // Min amount LN SERVICE is willing to receive, can not be less than 1 or more than `maxSendable`
  domain: string;
  metadata: string; // Metadata json which must be presented as raw string here, this is required to pass signature verification at a later step
  tag: "payRequest"; // Type of LNURL
  payerData?: {
    name: { mandatory: boolean };
    pubkey: { mandatory: boolean };
    identifier: { mandatory: boolean };
    email: { mandatory: boolean };
    auth: { mandatory: boolean; k1: string };
  };
  commentAllowed?: number;
  url: string;
}

type LNURLDetails = LNURLPayServiceResponse;
//| LNURLAuthServiceResponse
//| LNURLWithdrawServiceResponse;

interface LNURLPaymentSuccessAction {
  tag: string;
  description?: string;
  message?: string;
  url?: string;
}

interface LNURLPaymentInfo {
  pr: string;
  successAction?: LNURLPaymentSuccessAction;
}

const fromInternetIdentifier = (address: string) => {
  // email regex: https://emailregex.com/
  // modified to allow _ in subdomains
  if (
    address.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-_0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    let [name, host] = address.split("@");
    // remove invisible characters %EF%B8%8F
    name = name.replace(/[^ -~]+/g, "");
    host = host.replace(/[^ -~]+/g, "");
    return `https://${host}/.well-known/lnurlp/${name}`;
  }
  return null;
};

const normalizeLnurl = (lnurlString: string) => {
  // maybe it's bech32 encoded?
  try {
    const url = bech32Decode(lnurlString);
    return new URL(url);
  } catch (e) {
    console.info("ignoring bech32 parsing error", e);
  }

  // maybe it's a lightning address?
  const urlFromAddress = fromInternetIdentifier(lnurlString);
  if (urlFromAddress) {
    return new URL(urlFromAddress);
  }

  //maybe it's already a URL?
  return new URL(`https://${lnurlString.replace(/^lnurl[pwc]/i, "")}`);
};

export const lnurl = {
  isLightningAddress(address: string) {
    return Boolean(fromInternetIdentifier(address));
  },
  isLNURLDetailsError(
    res: LNURLError | LNURLDetails | LNURLPaymentInfo
  ): res is LNURLError {
    return "status" in res && res.status.toUpperCase() === "ERROR";
  },
  findLnurl(text: string) {
    const stringToText = text.trim().toLowerCase().replace("lightning:", "");
    let match;

    // look for a LNURL with protocol scheme
    if ((match = stringToText.match(/lnurl[pwc]:(\S+)/i))) {
      return match[1];
    }

    // look for LNURL bech32 in the string
    if ((match = stringToText.match(/(lnurl[a-z0-9]+)/i))) {
      return match[1];
    }

    if (this.isLightningAddress(stringToText)) {
      return stringToText;
    }

    return null;
  },

  async getDetails(lnurlString: string): Promise<LNURLDetails> {
    const url = normalizeLnurl(lnurlString);

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          "Non-OK response from request to " + url + ": " + response.status
        );
      }

      const data: LNURLDetails | LNURLError = await response.json();

      console.log("Got LNURL details", data);

      const lnurlDetails = data as LNURLDetails;

      if (this.isLNURLDetailsError(lnurlDetails)) {
        throw new Error(`LNURL Error: ${lnurlDetails.reason}`);
      }

      lnurlDetails.domain = url.hostname;
      lnurlDetails.url = url.toString();

      return lnurlDetails;
    } catch (e) {
      throw new Error(
        `Connection problem or invalid lnurl / lightning address: ${
          e instanceof Error ? e.message : ""
        }`
      );
    }
  },

  async getPayRequest(url: string): Promise<LNURLPaymentInfo> {
    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(
          "Non-OK response from request to " + url + ": " + response.status
        );
      }

      // Tests:
      // lnurl1dp68gurn8ghj7em9w3skccne9e3k7mf09emk2mrv944kummhdchkcmn4wfk8qtmjdak85mn6dk7p2p
      const data: LNURLPaymentInfo | LNURLError = await response.json();

      console.log("Got LNURL payment info", data);

      const lnurlPaymentInfo = data as LNURLPaymentInfo;

      if (this.isLNURLDetailsError(lnurlPaymentInfo)) {
        throw new Error(`LNURL Error: ${lnurlPaymentInfo.reason}`);
      }

      if (!lnurlPaymentInfo.pr) {
        throw new Error("No pr in LNURL callback response data");
      }

      return lnurlPaymentInfo;
    } catch (e) {
      throw new Error(
        `Connection problem or invalid lnurl / lightning address: ${
          e instanceof Error ? e.message : ""
        }`
      );
    }
  },
};
