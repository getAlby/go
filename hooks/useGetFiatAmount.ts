import { fiat } from "@getalby/lightning-tools";
import React from "react";
import { BTC_RATE_REFRESH_INTERVAL } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

interface RateCacheEntry {
  rate: number;
  timestamp: number;
}

let cachedRates: Record<string, RateCacheEntry> = {};

function useFiatRate() {
  const fiatCurrency = useAppStore((store) => store.fiatCurrency) || "USD";
  const [rate, setRate] = React.useState<number>();

  React.useEffect(() => {
    (async () => {
      try {
        const cacheEntry = cachedRates[fiatCurrency];
        const now = Date.now();
        if (
          cacheEntry &&
          now - cacheEntry.timestamp < BTC_RATE_REFRESH_INTERVAL
        ) {
          setRate(cacheEntry.rate);
          return;
        }
        setRate(undefined);
        const fetchedRate = await fiat.getFiatBtcRate(fiatCurrency);
        setRate(fetchedRate);
        cachedRates[fiatCurrency] = { rate: fetchedRate, timestamp: now };
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
            currencyDisplay: "narrowSymbol",
          }).format(rate * amount)}`;
        }

        const amountWithCurrencyCode = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: fiatCurrency,
          currencyDisplay: "code",
        }).format(rate * amount);

        return amountWithCurrencyCode.substring(
          amountWithCurrencyCode.search(/\s/) + 1,
        );
      }
      return undefined;
    },

    [rate, fiatCurrency],
  );

  return rate ? getFiatAmount : undefined;
}

export function useGetSatsAmount() {
  const rate = useFiatRate();

  const getSatsAmount = React.useCallback(
    (fiatAmount: number) => (rate ? Math.round(fiatAmount / rate) : undefined),
    [rate],
  );

  return rate ? getSatsAmount : undefined;
}
