import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import pages from "vite-plugin-pages";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [
		tailwindcss(),
		solid(),
		pages({
			dirs: "src/pages",
		}),
	],
});
