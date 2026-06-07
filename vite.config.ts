import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { boneyardPlugin } from "boneyard-js/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		devtools(),
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

export default config;
