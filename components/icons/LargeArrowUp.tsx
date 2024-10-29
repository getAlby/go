import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
const LargeArrowUp = (props: SvgProps) => (
  <Svg width={48} height={48} {...props} fill={"#374151"}>
    <Path
      fill="#374151"
      fillRule="evenodd"
      d="M10.231 25.149a4.334 4.334 0 0 1-.355-6.077l10.91-12.415A4.278 4.278 0 0 1 24 5.2c1.233 0 2.402.534 3.213 1.457l10.911 12.415a4.334 4.334 0 0 1-.355 6.077 4.271 4.271 0 0 1-6.072-.36l-3.408-3.877v17.572c0 2.362-1.899 4.316-4.289 4.316-2.39 0-4.29-1.954-4.29-4.316V20.912l-3.407 3.878a4.271 4.271 0 0 1-6.072.359z"
      clipRule="evenodd"
    />
  </Svg>
);

export default LargeArrowUp;
