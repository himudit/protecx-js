import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    client: "src/client/index.ts",
    server: "src/server/index.ts",
    index: "src/index.ts"
  },
  format: ["cjs", "esm"],
  dts: true, // Generate declaration files
  clean: true,
  treeshake: true,
  splitting: false, // Prevents code sharing chunks to ensure client/server isolation
});
