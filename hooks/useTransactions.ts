import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { TRANSACTIONS_PAGE_SIZE } from "~/lib/constants";

type FetchArgs = Parameters<typeof fetch>;

const fetcher = (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  if (!nwcClient) {
    throw new Error("No NWC client");
  }

  const transactionsUrl = new URL("http://" + (args[0] as string));
  const page = +(transactionsUrl.searchParams.get("page") as string);

  return nwcClient.listTransactions({
    limit: TRANSACTIONS_PAGE_SIZE,
    offset: (page - 1) * TRANSACTIONS_PAGE_SIZE,
  });
};

export function useTransactions(page = 1) {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  return useSWR(
    nwcClient &&
      `listTransactions?page=${page}&selectedWalletId=${selectedWalletId}`,
    fetcher,
  );
}
