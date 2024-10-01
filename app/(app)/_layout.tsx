import { Redirect, Stack } from 'expo-router';
import { useSession } from '~/hooks/useSession';
import { useHandleLinking } from '~/hooks/useHandleLinking';

export default function AppLayout() {
    const { hasSession } = useSession();
    useHandleLinking();

    // Only require authentication within the (app) group's layout as users
    // need to be able to access the (auth) group and sign in again.
    if (!hasSession) {
        console.log("Not authenticated, redirecting to /unlock")
        // On web, static rendering will stop here as the user is not authenticated
        // in the headless Node process that the pages are rendered in.
        return <Redirect href="/unlock" />;
    }

    // This layout can be deferred because it's not the root layout.
    return <Stack />;
}
