import { fiat } from "@getalby/lightning-tools";
import React from "react";
import { useAppStore } from "~/lib/state/appStore";

let cachedRates: Record<string, number> = {};
function useFiatRate() {
  const fiatCurrency = useAppStore((store) => store.fiatCurrency) || "USD";
  const [rate, setRate] = React.useState<number>();

  React.useEffect(() => {
    (async () => {
      try {
        if (cachedRates[fiatCurrency]) {
          setRate(cachedRates[fiatCurrency]);
          return;
        }
        setRate(undefined);
        const rate = await fiat.getFiatBtcRate(fiatCurrency);
        setRate(rate);
        cachedRates[fiatCurrency] = rate;
      } catch (error) {
        console.error(error);
      }
    })();
  }, [fiatCurrency]);

  return rate;
}

export function useGetFiatAmount() {
  const fiatCurrency = useAppStore((store) => store.fiatCurrency) || "USD";
  const rate = useFiatRate();

  const getFiatAmount = React.useCallback(
    (amount: number, displayCurrencySign = true) => {
      if (rate) {
        if (displayCurrencySign) {
          return `${new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: fiatCurrency,
          }).format(rate * amount)}`;
        }
        const amountWithCurrencyCode = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: fiatCurrency,
          currencyDisplay: "code",
        }).format(rate * amount);

        return amountWithCurrencyCode.substring(
          amountWithCurrencyCode.search(/\s/) + 1
        );
      }
      return undefined;
    },

    [rate, fiatCurrency]
  );

  return rate ? getFiatAmount : undefined;
}

export function useGetSatsAmount() {
  const fiatCurrency = useAppStore((store) => store.fiatCurrency) || "USD";
  const rate = useFiatRate();

  const getSatsAmount = React.useCallback(
    (fiatAmount: number) => (rate ? Math.round(fiatAmount / rate) : undefined),
    [rate, fiatCurrency]
  );

  return rate ? getSatsAmount : undefined;
}
