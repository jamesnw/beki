import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/components/**", "src/lib/**", "src/optionStore.ts"],
      reporter: ["text-summary", "html"],
    },
  },
});
