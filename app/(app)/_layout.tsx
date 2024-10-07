import { Redirect, Stack } from 'expo-router';
import { useSession } from '~/hooks/useSession';
import { useHandleLinking } from '~/hooks/useHandleLinking';
import { useAppStore } from '~/lib/state/appStore';

export default function AppLayout() {
    const { hasSession } = useSession();
    const isOnboarded = useAppStore(store => store.isOnboarded);
    useHandleLinking();

    if (!isOnboarded) {
        console.log("Not onboarded, redirecting to /onboarding")
        return <Redirect href="/onboarding" />;
    }

    if (!hasSession) {
        console.log("Not authenticated, redirecting to /unlock")
        return <Redirect href="/unlock" />;
    }

    return <Stack />;
}
