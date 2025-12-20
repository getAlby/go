import { openURL } from "expo-linking";
import type { ReactNode } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { LinkIcon } from "~/components/Icons";
import { LongTextBottomSheet } from "~/components/LongTextBottomSheet";
import { Text } from "~/components/ui/text";
import { type LNURLPaymentSuccessAction } from "~/lib/lnurl";
import { cn } from "~/lib/utils";

interface SuccessMessageProps {
  lnurlSuccessAction?: LNURLPaymentSuccessAction;
  children?: ReactNode;
}

export function SuccessMessage({ lnurlSuccessAction }: SuccessMessageProps) {
  if (!lnurlSuccessAction) {
    return null;
  }

  if (lnurlSuccessAction.tag === "message" && lnurlSuccessAction.message) {
    return (
      <LongTextBottomSheet
        title="Message From Receiver"
        content={lnurlSuccessAction.message}
      />
    );
  }

  if (lnurlSuccessAction.tag === "url" && lnurlSuccessAction.description) {
    return (
      <LongTextBottomSheet
        title="Message From Receiver"
        content={lnurlSuccessAction.description}
      >
        <Text
          className={cn(
            Platform.select({
              ios: "ios:text-base ios:sm:text-lg",
              android: "android:text-base",
            }),
            "text-center text-secondary-foreground p-3",
          )}
        >
          {lnurlSuccessAction.description}
        </Text>
        {lnurlSuccessAction.url && (
          <TouchableOpacity
            className="mt-4 flex flex-row gap-2 justify-center items-center"
            onPress={() => openURL(lnurlSuccessAction.url ?? "")}
          >
            <Text className="font-semibold2">Open Link</Text>
            <LinkIcon width={16} className="text-primary-foreground" />
          </TouchableOpacity>
        )}
      </LongTextBottomSheet>
    );
  }

  return null;
}
