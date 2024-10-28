import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
const TextEncodingPolyfill = require("text-encoding");

const applyGlobalPolyfills = () => {
  Object.assign(global, {
    TextEncoder: TextEncodingPolyfill.TextEncoder,
    TextDecoder: TextEncodingPolyfill.TextDecoder,
  });
};

applyGlobalPolyfills();
