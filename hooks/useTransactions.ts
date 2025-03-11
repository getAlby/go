import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { TRANSACTIONS_PAGE_SIZE } from "~/lib/constants";
import { createNwcFetcher } from "~/lib/createNwcFetcher";

const fetcher = createNwcFetcher(async (nwcClient, args) => {
  const transactionsUrl = new URL("http://" + (args[0] as string));
  const page = +(transactionsUrl.searchParams.get("page") as string);
  const transactions = await nwcClient.listTransactions({
    limit: TRANSACTIONS_PAGE_SIZE,
    offset: (page - 1) * TRANSACTIONS_PAGE_SIZE,
    unpaid_outgoing: true,
  });
  return transactions;
});

export function useTransactions(page = 1) {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  return useSWR(
    nwcClient &&
      `listTransactions?page=${page}&selectedWalletId=${selectedWalletId}`,
    fetcher,
  );
}
