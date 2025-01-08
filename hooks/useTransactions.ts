import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { TRANSACTIONS_PAGE_SIZE } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";

type FetchArgs = Parameters<typeof fetch>;

const fetcher = async (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  if (!nwcClient) {
    throw new Error("No NWC client");
  }

  const transactionsUrl = new URL("http://" + (args[0] as string));
  const page = +(transactionsUrl.searchParams.get("page") as string);

  try {
    const transactions = await nwcClient.listTransactions({
      limit: TRANSACTIONS_PAGE_SIZE,
      offset: (page - 1) * TRANSACTIONS_PAGE_SIZE,
      unpaid_outgoing: true,
    });
    return transactions;
  } catch (error) {
    errorToast(error);
    throw error;
  }
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
