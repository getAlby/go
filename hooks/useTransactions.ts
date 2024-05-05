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
    throw new Error("No NWC client");
  }

  return nwcClient.listTransactions({
    limit: 50,
  });
};

export function useTransactions() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  return useSWR(nwcClient && "listTransactions", fetcher);
}
