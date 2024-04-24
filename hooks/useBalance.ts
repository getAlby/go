import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";

type FetchArgs = Parameters<typeof fetch>;
const fetcher = (...args: FetchArgs) => {
  const nwcClient = useAppStore.getState().nwcClient;
  if (!nwcClient) {
    return undefined;
  }
  return nwcClient.getBalance();
};

export function useBalance() {
  return useSWR("getBalance", fetcher);
}
