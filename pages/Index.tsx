import { router } from "expo-router";
import React, { useEffect } from "react";
import Loading from "~/components/Loading";
import { secureStorage } from "~/lib/secureStorage";
import { hasOnboardedKey } from "~/lib/state/appStore";

export function Index() {

    useEffect(() => {
        async function checkOnboardingStatus() {
            const hasOnboarded = await secureStorage.getItem(hasOnboardedKey);
            router.replace(!hasOnboarded ? "/onboarding" : "/home");
        };
        checkOnboardingStatus();
    })

  return (
    <><Loading /></>
  );
}
