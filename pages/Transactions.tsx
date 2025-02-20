import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import dayjs from "dayjs";
import { Link, router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { XIcon } from "~/components/Icons";
import FailedTransactionIcon from "~/components/icons/FailedTransaction";
import PendingTransactionIcon from "~/components/icons/PendingTransaction";
import ReceivedTransactionIcon from "~/components/icons/ReceivedTransaction";
import SentTransactionIcon from "~/components/icons/SentTransaction";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useTransactions } from "~/hooks/useTransactions";
import { TRANSACTIONS_PAGE_SIZE } from "~/lib/constants";
import { cn } from "~/lib/utils";

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
  const getFiatAmount = useGetFiatAmount();

  React.useEffect(() => {
    if (
      !refreshingTransactions &&
      transactions?.transactions.length &&
      !allTransactions.some((t) =>
        transactions.transactions.some(
          (other) => t.payment_hash === other.payment_hash,
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
              <Text className="text-center mb-5 animate-pulse">
                Loading more transactions...
              </Text>
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
            <Pressable
              key={transaction.payment_hash}
              onPress={() =>
                router.navigate({
                  pathname: "/transaction",
                  params: { transactionJSON: JSON.stringify(transaction) },
                })
              }
            >
              <View
                className={cn(
                  "flex flex-row items-center gap-3 px-6 py-2 my-2",
                  transaction.state === "pending" && "animate-pulse",
                )}
              >
                <View className="w-10 h-10 bg-muted rounded-full flex flex-col items-center justify-center">
                  {!(
                    transaction.state === "failed" ||
                    transaction.state === "pending"
                  ) && (
                    <>
                      {transaction.type === "incoming" && (
                        <ReceivedTransactionIcon />
                      )}
                      {transaction.type === "outgoing" && (
                        <SentTransactionIcon />
                      )}
                    </>
                  )}
                  {transaction.state === "pending" && (
                    <PendingTransactionIcon />
                  )}
                  {transaction.state === "failed" && <FailedTransactionIcon />}
                </View>
                <View className="flex flex-col flex-1">
                  <View className="flex flex-row flex-1 items-center gap-2">
                    <Text numberOfLines={1} className="font-medium2 text-lg">
                      {transaction.type === "incoming"
                        ? "Received"
                        : transaction.state === "failed"
                          ? "Failed"
                          : transaction.state === "pending"
                            ? "Sending"
                            : "Sent"}
                    </Text>
                    <Text className="text-muted-foreground text-sm">
                      {dayjs
                        .unix(transaction.settled_at || transaction.created_at)
                        .fromNow()}
                    </Text>
                  </View>
                  {transaction.description && (
                    <Text numberOfLines={1}>{transaction.description}</Text>
                  )}
                </View>
                <View>
                  <Text
                    className={cn(
                      "text-right font-medium2 text-lg",
                      transaction.type === "incoming"
                        ? "text-receive"
                        : "text-foreground",
                    )}
                  >
                    {transaction.type === "incoming" ? "+" : "-"}{" "}
                    {Math.floor(transaction.amount / 1000)}
                    <Text className="text-muted-foreground text-lg"> sats</Text>
                  </Text>
                  <Text className="text-right text-sm text-muted-foreground font-medium2">
                    {getFiatAmount &&
                      getFiatAmount(Math.floor(transaction.amount / 1000))}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      ) : !transactionsLoaded ? (
        <ScrollView className="mt-3">
          {[...Array(20)].map((e, i) => (
            <View
              key={i}
              className="flex flex-row items-center text-sm gap-x-6 px-4 mb-4"
            >
              <Skeleton className="rounded-full w-10 h-10" />
              <View className="flex flex-col flex-1 gap-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-16 h-4" />
              </View>
              <View className="flex items-center">
                <Skeleton className="w-8 h-4" />
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
