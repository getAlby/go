import { Invoice } from "@getalby/lightning-tools";
import { router } from "expo-router";
import { lnurl as lnurlLib } from "lib/lnurl";
import { errorToast } from "~/lib/errorToast";
import { convertMerchantQRToLightningAddress } from "~/lib/merchants";

export async function initiatePaymentFlow(
  text: string,
  amount: string,
): Promise<boolean> {
  // Some apps use uppercased LIGHTNING: prefixes
  text = text.toLowerCase();
  console.info("loading payment", text);
  const originalText = text;

  try {
    if (text.startsWith("bitcoin:")) {
      const universalUrl = text.replace("bitcoin:", "http://");
      const url = new URL(universalUrl);
      const lightningParam = url.searchParams.get("lightning");
      if (!lightningParam) {
        throw new Error("No lightning param found in bitcoin payment link");
      }
      text = lightningParam;
    }

    if (text.startsWith("lightning:")) {
      text = text.substring("lightning:".length);
    }

    // convert picknpay QRs to lighnting addresses
    const merchantLightningAddress = convertMerchantQRToLightningAddress(text);
    if (merchantLightningAddress) {
      text = merchantLightningAddress;
    }

    const lnurl = lnurlLib.findLnurl(text);
    console.info("Checked lnurl value", text, lnurl);

    if (lnurl) {
      const lnurlDetails = await lnurlLib.getDetails(lnurl);

      if (
        lnurlDetails.tag !== "payRequest" &&
        lnurlDetails.tag !== "withdrawRequest"
      ) {
        throw new Error("LNURL tag not supported");
      }

      if (lnurlDetails.tag === "withdrawRequest") {
        router.replace({
          pathname: "/withdraw",
          params: { url: lnurl },
        });
        return true;
      }

      if (lnurlDetails.tag === "payRequest") {
        router.replace({
          pathname: "/send/lnurl-pay",
          params: {
            lnurlDetailsJSON: JSON.stringify(lnurlDetails),
            receiver: lnurl,
            amount,
          },
        });
        return true;
      }
    } else {
      // Check if this is a valid invoice
      const invoice = new Invoice({ pr: text });

      if (invoice.satoshi === 0) {
        router.replace({
          pathname: "/send/0-amount",
          params: {
            invoice: text,
            comment: invoice.description,
          },
        });
        return true;
      }

      router.replace({
        pathname: "/send/confirm",
        params: { invoice: text },
      });
      return true;
    }
  } catch (error) {
    console.error("failed to load payment", originalText, error);
    errorToast(error);
  }

  return false;
}
