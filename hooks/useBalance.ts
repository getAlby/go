import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { errorToast } from "~/lib/errorToast";

type FetchArgs = Parameters<typeof fetch>;
const fetcher = async (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  // Capture the current appStateChangeCount before making the request
  const initialAppStateChangeCount = useAppStore.getState().appStateChangeCount;

  if (!nwcClient) {
    throw new Error("No NWC client");
  }
  try {
    const balance = await nwcClient.getBalance();
    return balance;
  } catch (error) {
    // Compare the stored count with the current value
    const currentAppStateChangeCount =
      useAppStore.getState().appStateChangeCount;
    if (currentAppStateChangeCount === initialAppStateChangeCount) {
      errorToast(error);
    }
    throw error;
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
