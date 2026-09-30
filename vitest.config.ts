import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "react-native": resolve(__dirname, "tests/react-native.tsx"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["tests/setup.ts"],
  },
});
