import { useHeaderHeight } from "@react-navigation/elements";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from "react-native";

function AndroidDismissableKeyboardView({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1" style={{ paddingBottom: keyboardHeight }}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}

function IOSDismissableKeyboardView({
  children,
}: {
  children?: React.ReactNode;
}) {
  const height = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={height}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {children}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function DismissableKeyboardView({ children }: { children?: React.ReactNode }) {
  const isIOS = Platform.OS === "ios";

  if (isIOS) {
    return <IOSDismissableKeyboardView>{children}</IOSDismissableKeyboardView>;
  }

  return (
    <AndroidDismissableKeyboardView>{children}</AndroidDismissableKeyboardView>
  );
}

export default DismissableKeyboardView;
