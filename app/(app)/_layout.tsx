import { Redirect, Stack } from "expo-router";
import { useRouteInfo } from "expo-router/build/hooks";
import { useHandleLinking } from "~/hooks/useHandleLinking";
import { useSession } from "~/hooks/useSession";
import { WidgetSync } from "~/hooks/useWidgetSync";
import { useAppStore } from "~/lib/state/appStore";

export default function AppLayout() {
  const { hasSession } = useSession();
  const isOnboarded = useAppStore((store) => store.isOnboarded);
  const wallets = useAppStore((store) => store.wallets);
  const route = useRouteInfo();
  useHandleLinking();

  if (!isOnboarded) {
    console.info("Not onboarded, redirecting to /onboarding");
    return <Redirect href="/onboarding" />;
  }

  if (!hasSession) {
    console.info("Not authenticated, redirecting to /unlock");
    return <Redirect href="/unlock" />;
  }

  const connectionPage = "/settings/wallets/setup";
  // Check the current pathname to prevent redirect loops
  if (!wallets.length && route.pathname !== connectionPage) {
    console.info("No wallets available, redirecting to setup");
    return <Redirect href={connectionPage} />;
  }

  return (
    <>
      <WidgetSync />
      <Stack />
    </>
  );
}
