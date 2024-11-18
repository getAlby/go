import * as Linking from "expo-linking";
import { getInitialURL } from "expo-linking";
import { useEffect } from "react";
import { handleLink } from "~/lib/link";
import { useAppStore } from "~/lib/state/appStore";
import { useSession } from "./useSession";

export function useHandleLinking() {
  const { hasSession } = useSession();
  const isOnboarded = useAppStore((store) => store.isOnboarded);
  const wallets = useAppStore((store) => store.wallets);

  useEffect(() => {
    // Do not process any deep links until the user is onboarded and authenticated
    // This prevents redirect loops between the deep link and /unlock, /onboarding
    if (!hasSession || !isOnboarded || !wallets.length) {
      return;
    }

    const processInitialURL = async () => {
      const url = await getInitialURL();
      if (url) {
        await handleLink(url);
      }
    };

    processInitialURL();

    const subscription = Linking.addEventListener(
      "url",
      async (event: { url: string }) => {
        await handleLink(event.url);
      },
    );

    return () => subscription.remove();
  }, [hasSession, isOnboarded, wallets.length]);
}
