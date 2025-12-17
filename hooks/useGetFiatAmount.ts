import { getFiatBtcRate } from "@getalby/lightning-tools/fiat";
import React from "react";
import { BTC_RATE_REFRESH_INTERVAL } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

interface RateCacheEntry {
  rate: number;
  timestamp: number;
}

let cachedRates: Record<string, RateCacheEntry> = {};

function useFiatRate() {
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);
  const [rate, setRate] = React.useState<number>();

  React.useEffect(() => {
    (async () => {
      if (!fiatCurrency) {
        return;
      }
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
        const fetchedRate = await getFiatBtcRate(fiatCurrency);
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
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);
  const rate = useFiatRate();

  const getFiatAmount = React.useCallback(
    (amount: number, displayCurrencySign = true) => {
      if (!fiatCurrency || !rate) {
        return undefined;
      }
      const formatterWithCode = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: fiatCurrency,
        currencyDisplay: "code",
      });
      const amountWithCode = formatterWithCode.format(rate * amount);
      const numericAmount = amountWithCode.substring(
        amountWithCode.search(/\s/) + 1,
      );

      if (!displayCurrencySign) {
        return numericAmount;
      }
      const symbol = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: fiatCurrency,
        currencyDisplay: "narrowSymbol",
      })
        .format(0)
        .replace(/[0-9.,\s]/g, "");

      return `${symbol} ${numericAmount}`;
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
