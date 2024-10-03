import * as Linking from "expo-linking";
import { getInitialURL } from "expo-linking";
import { useEffect } from "react";
import { useSession } from "./useSession";
import { handleLink } from "~/lib/link";

export function useHandleLinking() {
  const { hasSession } = useSession();

  useEffect(() => {
    // Do not process any deep links until the user authenticated
    // This prevents redirect loops between the deep link and /unlock
    if (!hasSession) return;

    const processInitialURL = async () => {
      const url = await getInitialURL();
      if (url) handleLink(url);
    };

    processInitialURL();

    const subscription = Linking.addEventListener(
      "url",
      (event: { url: string }) => {
        handleLink(event.url);
      },
    );

    return () => subscription.remove();
  }, [hasSession]);
}
