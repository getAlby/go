import * as LocalAuthentication from "expo-local-authentication";
import { router, Stack } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Image, View } from "react-native";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useSession } from "~/hooks/useSession";

export function Unlock() {
  const [isUnlocking, setIsUnlocking] = React.useState(false);
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
        promptMessage: "Unlock Alby Go",
      });
      if (biometricAuth.success) {
        signIn();
        router.replace("/");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUnlocking(false);
    }
  }, [isUnlocking, signIn]);

  useEffect(() => {
    handleUnlock();
  }, [handleUnlock]);

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Stack.Screen
        options={{
          title: "Unlock",
          headerShown: false,
        }}
      />
      <View className="flex-1 flex items-center justify-center gap-4">
        <Image
          source={require("./../assets/logo.png")}
          className="mb-10 w-52 h-52"
          resizeMode="contain"
        />
        <Text className="font-semibold2 text-4xl text-center text-foreground">
          Unlock to continue
        </Text>
      </View>
      <Button size="lg" onPress={handleUnlock} disabled={isUnlocking}>
        <Text>{isUnlocking ? "Unlocking..." : "Unlock Wallet"}</Text>
      </Button>
    </View>
  );
}
