import { View } from "react-native";
import { type SvgProps } from "react-native-svg";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

type Props = {
  type: "error" | "warn" | "info";
  icon: React.FunctionComponent<SvgProps>;
  title: string;
  description: string;
  className?: string;
};

function Alert({ title, description, type, icon: Icon, className }: Props) {
  const textColor =
    type === "error"
      ? "text-red-700 dark:text-red-300"
      : type === "warn"
        ? "text-orange-700 dark:text-orange-300"
        : "text-blue-700 dark:text-blue-300";
  return (
    <View
      className={cn(
        "w-full mb-4 border-2 p-4 rounded-xl",
        type === "error" &&
          "bg-red-50 dark:bg-red-900 border-red-100 dark:border-red-900",
        type === "warn" &&
          "bg-orange-50 dark:bg-orange-900 border-orange-100 dark:border-orange-900",
        type === "info" &&
          "bg-blue-50 dark:bg-blue-900 border-blue-100 dark:border-blue-900",
        className,
      )}
    >
      <View className="flex flex-row items-center gap-4">
        <Icon className={textColor} width={24} height={24} />
        <View className={cn("flex flex-1 flex-col", textColor)}>
          <Text className={cn("font-semibold2", textColor)}>{title}</Text>
          <Text className={textColor}>{description}</Text>
        </View>
      </View>
    </View>
  );
}

export default Alert;
