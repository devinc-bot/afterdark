import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  envDir: "../..",
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      srcDirectory: "app",
    }),
  ],
  server: {
    port: 3002,
  },
});
