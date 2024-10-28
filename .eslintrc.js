// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-ignore": "allow-with-description",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "none",
      },
    ],
    "no-console": ["error", { allow: ["info", "warn", "error"] }],
    "no-constant-binary-expression": "error",
    curly: "error",
  },
};
