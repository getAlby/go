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
    const info = await nwcClient.getInfo();
    if (currentWalletId !== useAppStore.getState().selectedWalletId) {
      return;
    }
    return info;
  } catch (error: unknown) {
    console.error(error);
    if (currentWalletId === useAppStore.getState().selectedWalletId) {
      errorToast(error);
      throw error;
    }
  }
};

export function useInfo() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  return useSWR(
    nwcClient && `getInfo?selectedWalletId=${selectedWalletId}`,
    fetcher,
  );
}
