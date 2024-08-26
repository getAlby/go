import { Pressable, View } from "react-native";
import { SimplePool, Event } from "nostr-tools";
import React from "react";
import Loading from "~/components/Loading";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";

const JIM_INSTANCE_KIND = 38177;
// TODO: review relays
let relays = [
  "wss://relay.damus.io",
  "wss://eden.nostr.land",
  "wss://nos.lol",
  "wss://nostr.wine",
  "wss://relay.notoshi.win",
  "wss://lunchbox.sandwich.farm",
  "wss://nostr.stakey.net",
  "wss://relay.n057r.club",
];

type DemoWalletsProps = {
  connect(nwcUrl: string, lightningAddress?: string): void;
  cancel(): void;
};

type Jim = {
  url: string;
  eventId: string;
  event: Event<typeof JIM_INSTANCE_KIND>;
  recommendedBy: number;
  info: {
    name?: string;
    description?: string;
    image?: string;
  };
  reserves?: {
    numChannels: number;
    totalOutgoingCapacity: number;
    totalChannelCapacity: number;
    numApps: number;
    totalAppBalance: number;
    hasPublicChannels: boolean;
  };
};

export function DemoWallets({ connect, cancel }: DemoWalletsProps) {
  const [jims, setJims] = React.useState<Jim[]>([]);
  const [creatingWalletForJim, setCreatingWalletForJim] = React.useState("");
  const [loadingEvents, setLoadingEvents] = React.useState(false);
  const [loadingJimCount, setLoadingJimCount] = React.useState(0);
  React.useEffect(() => {
    setLoadingEvents(true);
    const pool = new SimplePool();
    const sub = pool.sub(relays, [
      {
        kinds: [JIM_INSTANCE_KIND],
      },
    ]);

    sub.on("eose", () => {
      setLoadingEvents(false);
    });
    sub.on("event", async (event) => {
      const url = event.tags.find((tag) => tag[0] === "d")?.[1];
      if (url && !url.endsWith("/")) {
        setLoadingJimCount((current) => current + 1);
        let info: Jim["info"] | undefined;
        try {
          const response = await fetch(new URL("/api/info", url));
          if (!response.ok) {
            throw new Error("non-ok response");
          }
          info = await response.json();
        } catch (error) {
          console.info("failed to fetch jim info", url, error);
        }
        /*let reserves: Jim["reserves"];
        try {
          const response = await fetch(new URL("/api/reserves", url));
          if (!response.ok) {
            throw new Error("non-ok response");
          }
          reserves = await response.json();
        } catch (error) {
          console.error("failed to fetch jim reserves", url, error);
          return;
        }*/

        if (info) {
          const jim: Jim = {
            eventId: event.id,
            url,
            recommendedBy: 0,
            event,
            info,
            //reserves,
          };

          setJims((jims) => [
            ...jims.filter((existing) => existing.eventId !== jim.eventId),
            jim,
          ]);
        }
        setLoadingJimCount((current) => current - 1);
      }
    });
    return () => {
      sub.unsub();
      pool.close(relays);
    };
  }, []);

  const isLoading = loadingEvents || loadingJimCount > 0;

  return (
    <>
      <View className="flex-1 p-4 flex flex-col gap-4">
        {(!jims.length || isLoading) && (
          <Loading className="text-muted-foreground mt-8" />
        )}
        {jims.map((jim) => (
          <Pressable
            key={jim.eventId}
            onPress={async () => {
              if (creatingWalletForJim) {
                return;
              }
              try {
                setCreatingWalletForJim(jim.eventId);
                const response = await fetch(new URL("/api/wallets", jim.url), {
                  method: "POST",
                });
                if (!response.ok) {
                  throw new Error("non-ok response");
                }
                const { connectionSecret, lightningAddress } =
                  await response.json();
                await connect(connectionSecret, lightningAddress);
              } catch (error) {
                console.error("failed to create wallet", error);
                return;
              }
              setCreatingWalletForJim("");
            }}
          >
            <Card className="w-full">
              <CardHeader className="w-full">
                {creatingWalletForJim === jim.eventId && (
                  <Loading className="absolute text-primary-foreground top-2 right-2" />
                )}
                <CardTitle>{jim.info.name || "Uncle Jim"}</CardTitle>
                <CardDescription>
                  {jim.info.description || "No description provided"}
                </CardDescription>
              </CardHeader>
            </Card>
          </Pressable>
        ))}
      </View>
    </>
  );
}
