import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...pluginVue.configs["flat/recommended"],

  {
    languageOptions: {
      globals: globals.browser,
    },
  },

  {
    rules: {
      "no-console": "warn",
      "no-debugger": "warn",
    },
  },
];