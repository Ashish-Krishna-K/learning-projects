import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    {
        files: ["src/**/*.{ts,tsx}"], // Only lint TypeScript files in the src directory
    },
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
    ...tseslint.configs.recommended, // Recommended rules for TypeScript
];
