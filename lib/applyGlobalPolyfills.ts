import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
const TextEncodingPolyfill = require("text-encoding");

const applyGlobalPolyfills = () => {
  Object.assign(global, {
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder,
  });
};

applyGlobalPolyfills();
