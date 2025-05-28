import { useAppStore } from "lib/state/appStore";
import useSWR from "swr";
import { createNwcFetcher } from "~/lib/createNwcFetcher";

const fetcher = createNwcFetcher(async (nwcClient) => {
  const info = await nwcClient.getInfo();
  return info;
});

export function useInfo() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  return useSWR(nwcClient && "getInfo", fetcher);
}
