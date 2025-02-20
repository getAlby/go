// from https://github.com/GaloyMoney/galoy-client/blob/main/src/parsing/merchants.ts

type MerchantConfig = {
  id: string;
  identifierRegex: RegExp;
  defaultDomain: string;
};

export const merchants: MerchantConfig[] = [
  {
    id: "picknpay",
    identifierRegex: /(?<identifier>.*za\.co\.electrum\.picknpay.*)/iu,
    defaultDomain: "cryptoqr.net",
  },
  {
    id: "ecentric",
    identifierRegex: /(?<identifier>.*za\.co\.ecentric.*)/iu,
    defaultDomain: "cryptoqr.net",
  },
];

export const convertMerchantQRToLightningAddress = (
  qrContent: string,
): string | null => {
  if (!qrContent) {
    return null;
  }

  for (const merchant of merchants) {
    const match = qrContent.match(merchant.identifierRegex);
    if (match?.groups?.identifier) {
      const domain = merchant.defaultDomain;
      return `${encodeURIComponent(match.groups.identifier)}@${domain}`;
    }
  }

  return null;
};
