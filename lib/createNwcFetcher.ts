import { NWCClient } from "@getalby/sdk/dist/NWCClient";
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
        console.info(
          "app was backgrounded while doing NWC request, ignoring error",
          { error },
        );
        throw new Error("app was backgrounded");
      }
      console.error("NWC request failed", { error });
      errorToast(error);
      throw error;
    }
  };
}
