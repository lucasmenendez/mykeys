import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

import { solidStart } from "@solidjs/start/config";

export default defineConfig({
  plugins: [
    solidStart({ ssr: false, devOverlay: false }),
    nitro({
      // Emit a static SPA shell (index.html) so the build output is also
      // servable by nginx without a Node runtime. `npm start` still serves
      // the same files through the Nitro node server.
      routeRules: {
        "/": { prerender: true },
      },
    })
  ]
});
