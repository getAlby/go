import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { errorToast } from "~/lib/errorToast";

type FetchArgs = Parameters<typeof fetch>;
const fetcher = async (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  const currentWalletId = useAppStore.getState().selectedWalletId;
  if (!nwcClient) {
    throw new Error("No NWC client");
  }
  try {
    const balance = await nwcClient.getBalance();
    if (currentWalletId !== useAppStore.getState().selectedWalletId) {
      return;
    }
    return balance;
  } catch (error) {
    console.error(error);
    if (currentWalletId === useAppStore.getState().selectedWalletId) {
      errorToast(error);
      throw error;
    }
  }
};

export function useBalance() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  return useSWR(
    nwcClient && `getBalance?selectedWalletId=${selectedWalletId}`,
    fetcher,
  );
}
