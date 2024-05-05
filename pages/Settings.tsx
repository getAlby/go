import { Link, Stack } from "expo-router";
import { Pressable, View } from "react-native";
import { ZapIcon, WalletIcon, Currency } from "~/components/Icons";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function Settings() {
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <Link href="/settings/lightning-address" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader className="w-full">
              <CardTitle className="">
                <ZapIcon className="text-primary" /> Lightning Address
              </CardTitle>
              <CardDescription>
                Update your Lightning Address to easily receive payments
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
      <Link href="/settings/wallet-connection" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="">
                <WalletIcon className="text-primary" /> Wallet Connection
              </CardTitle>
              <CardDescription>
                Configure your wallet connection
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
      <Link href="/settings/fiat-currency" asChild>
        <Pressable>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="">
                <Currency className="text-primary" /> Fiat Currency
              </CardTitle>
              <CardDescription>
                Configure fiat currency conversion
              </CardDescription>
            </CardHeader>
          </Card>
        </Pressable>
      </Link>
    </View>
  );
}
