import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { boneyardPlugin } from "boneyard-js/vite";

const config = defineConfig({
	plugins: [
		devtools(),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		boneyardPlugin(),
	],
	optimizeDeps: {
		exclude: [
			"@tanstack/start-server-core",
			"@tanstack/react-start",
			"@tanstack/react-router",
			"@tanstack/router-core",
		],
	},
});

nitro({ preset: "bun" });

export default config;
