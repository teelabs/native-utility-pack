import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["components/reel-picker/src/index.ts"],
  external: ["react", "react-native"],
  format: ["cjs", "esm"],
  sourcemap: true,
});
