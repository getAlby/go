import { Redirect, Stack } from "expo-router";
import { useRouteInfo } from "expo-router/build/hooks";
import { useHandleLinking } from "~/hooks/useHandleLinking";
import { useSession } from "~/hooks/useSession";
import { useAppStore } from "~/lib/state/appStore";

export default function AppLayout() {
  const { hasSession } = useSession();
  const isOnboarded = useAppStore((store) => store.isOnboarded);
  const wallets = useAppStore((store) => store.wallets);
  const route = useRouteInfo();
  useHandleLinking();

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (!hasSession) {
    return <Redirect href="/unlock" />;
  }

  const connectionPage = "/settings/wallets/setup";
  // Check the current pathname to prevent redirect loops
  if (!wallets.length && route.pathname !== connectionPage) {
    return <Redirect href={connectionPage} />;
  }

  return <Stack />;
}
