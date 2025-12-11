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
      ? "text-error"
      : type === "warn"
        ? "text-warning"
        : "text-info";
  return (
    <View
      className={cn(
        "flex gap-1 mb-4 border py-3 px-4 rounded-xl",
        type === "error" && "bg-error-foreground border-error-border",
        type === "warn" && "bg-warning-foreground border-warning-border",
        type === "info" && "bg-info-foreground border-info-border",
        className,
      )}
    >
      <View className="flex flex-row items-center gap-2">
        <Icon className={textColor} width={20} height={20} />
        <Text className={cn("text-sm sm:text-base font-semibold2", textColor)}>
          {title}
        </Text>
      </View>
      <Text className={cn("text-xs sm:text-sm", textColor)}>{description}</Text>
    </View>
  );
}

export default Alert;
