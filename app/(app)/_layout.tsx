import { Redirect, Stack } from 'expo-router';
import { useSession } from '~/hooks/useSession';
import { useHandleLinking } from '~/hooks/useHandleLinking';
import { useAppStore } from '~/lib/state/appStore';
import { useRouteInfo } from 'expo-router/build/hooks';

export default function AppLayout() {
    const { hasSession } = useSession();
    const isOnboarded = useAppStore(store => store.isOnboarded);
    const nwcClient = useAppStore(store => store.nwcClient);
    const route = useRouteInfo();
    useHandleLinking();

    if (!isOnboarded) {
        console.log("Not onboarded, redirecting to /onboarding")
        return <Redirect href="/onboarding" />;
    }

    if (!hasSession) {
        console.log("Not authenticated, redirecting to /unlock")
        return <Redirect href="/unlock" />;
    }

    const connectionPage = "/settings/wallets/setup";
    // Check the current pathname to prevent redirect loops
    if (!nwcClient && route.pathname !== connectionPage) {
        console.log("No NWC client available, redirecting to wallet setup");
        return <Redirect href={connectionPage} />;
    }

    return <Stack />;
}
