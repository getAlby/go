import * as Linking from "expo-linking";
import { useEffect } from "react";
import { handleLink } from "~/lib/link";
import { useAppStore } from "~/lib/state/appStore";
import { useSession } from "./useSession";

export function useHandleLinking() {
  const { hasSession } = useSession();
  const isOnboarded = useAppStore((store) => store.isOnboarded);
  const wallets = useAppStore((store) => store.wallets);
  const url = Linking.useLinkingURL();

  useEffect(() => {
    // Do not process any deep links until the user is onboarded and authenticated
    // This prevents redirect loops between the deep link and /unlock, /onboarding
    if (!hasSession || !isOnboarded || !wallets.length) {
      return;
    }

    (async () => {
      if (url) {
        await handleLink(url);
      }
    })();
  }, [url, hasSession, isOnboarded, wallets.length]);
}
