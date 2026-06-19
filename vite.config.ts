import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { boneyardPlugin } from "boneyard-js/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const config = defineConfig({
	plugins: [
		devtools(),
		tailwindcss(),
		tanstackStart(),
		nitro({ preset: "bun" }),
		viteReact(),
		boneyardPlugin(),
	],
	resolve: {
		tsconfigPaths: true,
	},
	build: {
		chunkSizeWarningLimit: 2000,
	},
	optimizeDeps: {
		exclude: [
			"@tanstack/start-server-core",
			"@tanstack/react-start",
			"@tanstack/react-router",
			"@tanstack/router-core",
		],
	},
});

export default config;
