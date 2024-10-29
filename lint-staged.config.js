module.exports = {
  "*.ts": () => "tsc --noEmit",
  "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"],
  "*.{css,md,json}": ["prettier --write"],
};
