import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";

type FetchArgs = Parameters<typeof fetch>;
const fetcher = (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  if (!nwcClient) {
    throw new Error("No NWC client");
  }
  return nwcClient.getBalance();
};

export function useBalance() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  return useSWR(
    nwcClient && `getBalance?selectedWalletId=${selectedWalletId}`,
    fetcher,
  );
}
