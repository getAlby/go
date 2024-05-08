import { fiat } from "@getalby/lightning-tools";
import React from "react";
import { useAppStore } from "~/lib/state/appStore";

export function useGetFiatAmount() {
  const fiatCurrency = useAppStore((store) => store.fiatCurrency) || "USD";
  const [rate, setRate] = React.useState<number>();
  const getFiatAmount = React.useCallback(
    (amount: number) =>
      rate
        ? `~ ${new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: fiatCurrency,
          }).format(rate * amount)}`
        : undefined,
    [rate, fiatCurrency]
  );

  React.useEffect(() => {
    (async () => {
      try {
        setRate(undefined);
        const rate = await fiat.getFiatBtcRate(fiatCurrency);
        setRate(rate);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [fiatCurrency]);

  return rate ? getFiatAmount : undefined;
}
