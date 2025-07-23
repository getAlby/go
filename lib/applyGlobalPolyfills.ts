import "message-port-polyfill";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import TextEncodingPolyfill from "text-encoding";

const applyGlobalPolyfills = () => {
  Object.assign(global, {
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder,
  });
};

applyGlobalPolyfills();
