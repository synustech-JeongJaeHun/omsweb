import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

const path = require('path')

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,

    // lib mode
    // https://vitejs.dev/guide/build.html#library-mode
    lib: {
      entry: path.resolve(__dirname, 'src/App.ts'),
      name: "oms-track-monitor",
      fileName: (format) => `oms-track-monitor.${format}.js`
    }
  },
});
