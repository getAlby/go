import {
  Nip47GetBalanceResponse,
  Nip47ListTransactionsResponse,
} from "@getalby/sdk/dist/NWCClient";
import { useAppStore } from "lib/state/appStore";
import useSWR, { BareFetcher } from "swr";

type FetchArgs = Parameters<typeof fetch>;

const fetcher = (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  if (!nwcClient) {
    return undefined;
  }

  return nwcClient.listTransactions({
    limit: 50,
  });
};

export function useTransactions() {
  return useSWR("listTransactions", fetcher);
}
