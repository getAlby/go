import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { createNwcFetcher } from "~/lib/createNwcFetcher";

const fetcher = createNwcFetcher(async (nwcClient) => {
  const balance = await nwcClient.getBalance();
  return balance;
});

export function useBalance() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  return useSWR(
    nwcClient && `getBalance?selectedWalletId=${selectedWalletId}`,
    fetcher,
  );
}
