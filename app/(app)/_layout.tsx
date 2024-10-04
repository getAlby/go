import { Redirect, Stack } from 'expo-router';
import { useSession } from '~/hooks/useSession';
import { useHandleLinking } from '~/hooks/useHandleLinking';
import { secureStorage } from '~/lib/secureStorage';
import { hasOnboardedKey } from '~/lib/state/appStore';
import { useMemo } from 'react'; // Add useMemo

export default function AppLayout() {
    const { hasSession } = useSession();
    useHandleLinking();

    // Memoize the onboarded status to prevent unnecessary reads from storage
    const isOnboarded = useMemo(() => {
        return secureStorage.getItem(hasOnboardedKey);
    }, []);

    // Don't render while the onboarding state is loaded
    if (isOnboarded === null) {
        return null;
    }

    if (!isOnboarded) {
        return <Redirect href="/onboarding" />;
    }

    if (!hasSession) {
        console.log("Not authenticated, redirecting to /unlock")
        return <Redirect href="/unlock" />;
    }

    return <Stack />;
}
