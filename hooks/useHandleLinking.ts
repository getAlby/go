import * as Linking from "expo-linking";
import { getInitialURL } from "expo-linking";
import { useEffect } from "react";
import { handleLink } from "~/lib/link";
import { useSession } from "./useSession";

export function useHandleLinking() {
  const { hasSession } = useSession();

  useEffect(() => {
    // Do not process any deep links until the user authenticated
    // This prevents redirect loops between the deep link and /unlock
    if (!hasSession) {
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
  }, [hasSession]);
}
