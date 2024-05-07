import { ToastConfig } from "react-native-toast-message";
import { Text } from "./ui/text";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { View } from "react-native";
import { CheckCircle } from "./Icons";

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="w-full p-3">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <CheckCircle className="text-primary" width={20} height={20} />{" "}
            {text1}
          </CardTitle>
          <CardDescription>{text2}</CardDescription>
        </CardHeader>
      </Card>
    </View>
  ),
};
