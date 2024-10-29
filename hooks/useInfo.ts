import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { errorToast } from "~/lib/errorToast";

type FetchArgs = Parameters<typeof fetch>;
const fetcher = async (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  if (!nwcClient) {
    throw new Error("No NWC client");
  }
  try {
    const info = await nwcClient.getInfo();
    return info;
  } catch (error) {
    errorToast(error);
    throw error;
  }
};

export function useInfo() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  return useSWR(nwcClient && "getInfo", fetcher);
}
