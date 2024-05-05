import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";

type FetchArgs = Parameters<typeof fetch>;
const fetcher = (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  if (!nwcClient) {
    throw new Error("No NWC client");
  }
  return nwcClient.getInfo();
};

export function useInfo() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  return useSWR(nwcClient && "getInfo", fetcher);
}
