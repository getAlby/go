import * as LocalAuthentication from "expo-local-authentication";
import { router, Stack } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import AlbyGoLogomark from "~/components/AlbyGoLogomark";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useSession } from "~/hooks/useSession";
import { errorToast } from "~/lib/errorToast";

export function Unlock() {
  const { t } = useTranslation();
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const hasAutoPrompted = React.useRef(false);

  const { signIn } = useSession();

  const handleUnlock = useCallback(async () => {
    // The call `signIn()` below triggers a re-render of the component
    // and would prompt the user again (before the actual redirect
    // happens and the view is replaced)
    if (isUnlocking) {
      return;
    }

    try {
      setIsUnlocking(true);
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: t("unlock.promptMessage"),
      });
      if (biometricAuth.success) {
        signIn();
        router.replace("/");
      } else {
        throw new Error(t("unlock.failed"));
      }
    } catch (e) {
      errorToast(e);
    } finally {
      setIsUnlocking(false);
    }
  }, [isUnlocking, signIn, t]);

  React.useEffect(() => {
    if (!hasAutoPrompted.current) {
      hasAutoPrompted.current = true;
      handleUnlock();
    }
  }, [handleUnlock]);

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Stack.Screen
        options={{
          title: t("unlock.title"),
          headerShown: false,
        }}
      />
      <View className="flex-1 flex items-center justify-center gap-6">
        <AlbyGoLogomark className="mb-10 w-48 h-48" />
        <Text className="font-semibold2 ios:text-4xl android:text-3xl text-center">
          {t("unlock.heading")}
        </Text>
      </View>
      <Button size="lg" onPress={handleUnlock} disabled={isUnlocking}>
        <Text>
          {isUnlocking ? t("unlock.unlocking") : t("unlock.unlockWallet")}
        </Text>
      </Button>
    </View>
  );
}
