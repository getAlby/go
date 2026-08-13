import type { NWCClient } from "@getalby/sdk/nwc";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

type FetchArgs = Parameters<typeof fetch>;

export function createNwcFetcher<T>(
  fetcherFunc: (nwcClient: NWCClient, args: FetchArgs) => Promise<T>,
) {
  return async (...args: FetchArgs) => {
    const nwcClient = useAppStore.getState().nwcClient;
    if (!nwcClient) {
      throw new Error("No NWC client");
    }
    const lastAppStateChangeTime =
      useAppStore.getState().lastAppStateChangeTime;
    try {
      const result = await fetcherFunc(nwcClient, args);
      return result;
    } catch (error) {
      if (
        lastAppStateChangeTime !== useAppStore.getState().lastAppStateChangeTime
      ) {
        // the user backgrounded the app, on iOS the websocket connection
        // is severed
        throw new Error("app was backgrounded");
      }
      errorToast(error, "NWC request failed");
      throw error;
    }
  };
}
