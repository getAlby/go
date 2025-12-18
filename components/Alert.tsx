import { View } from "react-native";
import { type SvgProps } from "react-native-svg";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

type Props = {
  type: "error" | "warn" | "info";
  icon: React.FunctionComponent<SvgProps>;
  title: string;
  description?: string;
  className?: string;
};

function Alert({ title, description, type, icon: Icon, className }: Props) {
  const textColor =
    type === "error"
      ? "text-destructive"
      : type === "warn"
        ? "text-warning"
        : "text-background";
  return (
    <View
      className={cn(
        "flex gap-1 mb-4 py-3 px-4 rounded-xl self-stretch",
        type === "error" && "bg-destructive-foreground",
        type === "warn" && "bg-sent-foreground",
        type === "info" && "bg-foreground",
        className,
      )}
    >
      <View className="flex flex-row items-center gap-2">
        <Icon className={textColor} width={20} height={20} />
        <Text className={cn("text-sm sm:text-base font-semibold2", textColor)}>
          {title}
        </Text>
      </View>
      {description && (
        <Text className={cn("text-xs sm:text-sm", textColor)}>
          {description}
        </Text>
      )}
    </View>
  );
}

export default Alert;
