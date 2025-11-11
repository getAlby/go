import type { Nip47Transaction } from "@getalby/sdk";
import { Link, router } from "expo-router";
import React from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { XIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { TransactionItem } from "~/components/TransactionItem";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useTransactions } from "~/hooks/useTransactions";
import { TRANSACTIONS_PAGE_SIZE } from "~/lib/constants";

export function Transactions() {
  const [page, setPage] = React.useState(1);
  const { data: transactions, mutate: reloadTransactions } =
    useTransactions(page);
  const [loadingNextPage, setLoadingNextPage] = React.useState(false);
  const [transactionsLoaded, setTransactionsLoaded] = React.useState(false);
  const [allTransactions, setAllTransactions] = React.useState<
    Nip47Transaction[]
  >([]);
  const [refreshingTransactions, setRefreshingTransactions] =
    React.useState(false);

  React.useEffect(() => {
    if (
      !refreshingTransactions &&
      transactions?.transactions.length &&
      !allTransactions.some((t) =>
        transactions.transactions.some(
          (other: Nip47Transaction) => t.payment_hash === other.payment_hash,
        ),
      )
    ) {
      setAllTransactions([...allTransactions, ...transactions.transactions]);
      setLoadingNextPage(false);
    }

    if (transactions) {
      setTransactionsLoaded(true);
    }
  }, [allTransactions, transactions, refreshingTransactions]);

  const onRefresh = React.useCallback(() => {
    if (refreshingTransactions) {
      return;
    }
    (async () => {
      setRefreshingTransactions(true);
      setPage(1);
      await Promise.all([reloadTransactions()]);
      setAllTransactions([]);
      setRefreshingTransactions(false);
    })();
  }, [refreshingTransactions, reloadTransactions]);

  return (
    <View className="flex-1 flex flex-col gap-3">
      <Screen
        title="Transactions"
        animation="slide_from_bottom"
        right={() => (
          <TouchableOpacity
            onPressIn={() => {
              router.back();
            }}
            className="-mr-4 px-6"
          >
            <XIcon className="text-muted-foreground" width={24} height={24} />
          </TouchableOpacity>
        )}
      />
      {allTransactions && allTransactions.length ? (
        <FlatList
          className="mt-3"
          refreshControl={
            <RefreshControl
              refreshing={refreshingTransactions}
              onRefresh={onRefresh}
            />
          }
          ListFooterComponent={
            loadingNextPage ? (
              // TODO: Replace this with animate-pulse class after Nativewind v5 migration
              <Animated.Text
                style={{
                  animationName: {
                    from: { opacity: 0.4 },
                    to: { opacity: 1 },
                  },
                  animationDuration: "1s",
                  animationIterationCount: "infinite",
                  animationTimingFunction: "ease-in-out",
                  animationDirection: "alternate",
                }}
                className="text-center mb-5"
              >
                Loading more transactions...
              </Animated.Text>
            ) : undefined
          }
          data={allTransactions}
          onEndReachedThreshold={0.8}
          onEndReached={() => {
            if (
              !refreshingTransactions &&
              allTransactions.length / TRANSACTIONS_PAGE_SIZE === page
            ) {
              setLoadingNextPage(true);
              setPage(page + 1);
            }
          }}
          renderItem={({ item: transaction }) => (
            <TransactionItem tx={transaction} />
          )}
        />
      ) : !transactionsLoaded ? (
        <ScrollView className="mt-3">
          {[...Array(20)].map((e, i) => (
            <View
              key={i}
              className="flex flex-row items-center gap-3 px-6 py-2 my-2"
            >
              <Skeleton className="rounded-full w-[44px] h-[44px]" />
              <View className="flex flex-col flex-1 gap-2 h-[44px]">
                <Skeleton className="w-32 text-lg" />
                <Skeleton className="w-16 text-base" />
              </View>
              <View className="flex items-end gap-2 h-[44px]">
                <Skeleton className="w-16 text-lg" />
                <Skeleton className="w-8 text-sm" />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="p-6 flex-1 items-center justify-center gap-5">
          <View className="flex flex-col items-center">
            <Text className="text-2xl font-semibold2">No transactions yet</Text>
            <Text className="text-muted-foreground text-xl text-center">
              Top up your wallet to get started
            </Text>
          </View>
          <Link href="/receive" asChild>
            <Button size="lg">
              <Text>Receive</Text>
            </Button>
          </Link>
        </View>
      )}
    </View>
  );
}
