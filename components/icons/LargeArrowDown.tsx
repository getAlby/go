import * as React from "react";
import Svg, { Path, type SvgProps } from "react-native-svg";
const LargeArrowDown = (props: SvgProps) => (
  <Svg width={48} height={48} {...props}>
    <Path
      fill="#374151" // translates to primary foreground
      fillRule="evenodd"
      d="M37.769 22.851a4.334 4.334 0 0 1 .355 6.077l-10.91 12.415A4.278 4.278 0 0 1 24 42.8a4.278 4.278 0 0 1-3.213-1.457L9.876 28.928a4.334 4.334 0 0 1 .355-6.077 4.271 4.271 0 0 1 6.072.36l3.408 3.877V9.516C19.71 7.154 21.61 5.2 24 5.2c2.39 0 4.29 1.954 4.29 4.316v17.572l3.407-3.878a4.271 4.271 0 0 1 6.072-.359z"
      clipRule="evenodd"
    />
  </Svg>
);
export default LargeArrowDown;
