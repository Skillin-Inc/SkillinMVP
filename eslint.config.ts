import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginPromise from "eslint-plugin-promise";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      promise: pluginPromise,
    },
  },
  {
    languageOptions: {
      globals: {
        console: "readonly", // Add other globals as needed (e.g., process, window, etc.)
      },
    },
    rules: {
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "promise/prefer-await-to-then": "error",
    },
  }
);
