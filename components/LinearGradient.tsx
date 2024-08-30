import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

cssInterop(LinearGradient, {
  className: {
    target: "style",
  },
});

export { LinearGradient };
