// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginPromise from "eslint-plugin-promise";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      promise: pluginPromise,
    },
  },
  {
    rules: {
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "promise/prefer-await-to-then": ["error"],
    },
  }
);
