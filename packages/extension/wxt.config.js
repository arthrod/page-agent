import tailwindcss from "@tailwindcss/vite";
import { mkdirSync, readFileSync } from "node:fs";
import { defineConfig } from "wxt";

const chromeProfile = ".wxt/chrome-data";
mkdirSync(chromeProfile, { recursive: true });

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: "src",
	modules: ["@wxt-dev/module-react"],
	webExt: {
		chromiumProfile: chromeProfile,
		keepProfileChanges: true,
		chromiumArgs: ["--hide-crash-restore-bubble"],
	},
	vite: () => ({
		plugins: [tailwindcss()],
		define: {
			__VERSION__: JSON.stringify(pkg.version),
		},
		optimizeDeps: {
			force: true,
		},
		build: {
			minify: false,
			chunkSizeWarningLimit: 2000,
			cssCodeSplit: true,
			rollupOptions: {
				onwarn: function (message, handler) {
					if (message.code === "EVAL") return;
					handler(message);
				},
			},
		},
	}),
	zip: {
		artifactTemplate: "cicero-enfermeiro-digital-{{version}}-{{browser}}.zip",
	},
	manifest: {
		key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqbzT0iTYeYlnCvDJIGDnGU8oarJgZILDzSfLi/ufuSxXEPDKuMyD892GhvrMCZNVHS11Sh6NYUOc/PcUOhtaR2urHtcNkrpSJNV10zUamY7fxBdVEkOucfyLu8INVy+teis62MoRWYPaUPkfZUjrLGW8MsZ9aFzARfu9GGDEp2EAYsWDN6w6vyz9LJ82pm542EWnVT4MjmDPgvYFCWGBtaU/dfHD+GAX6URJFapsCvryVURKJ+76c/GO9/I3EX1IBfbY6dec78bLCMvVxiTmiv36KyGPwX1OpakW8IiCpXWdbAxjm+plbYlp5t5zTyyoE3sOSFeXsBH0Kg27o8GcvQIDAQAB",
		default_locale: "pt_BR",
		name: "__MSG_extName__",
		description: "__MSG_extDescription__",
		homepage_url: "https://cicero.im",
		// Curated capability set for Cícero: core + the "useful" and "niche" APIs.
		// Useful: history, downloads(+open), notifications, bookmarks, readingList,
		//         offscreen, webNavigation.
		// Niche:  debugger, tabCapture, contentSettings, topSites, activeTab.
		// Core:   tabs, tabGroups, sidePanel, storage, scripting (+ <all_urls>).
		// Excluded on purpose: nativeMessaging (per request) and the not-useful/scary
		//   ones (privacy, proxy, management, identity, webRequest/declarativeNetRequest,
		//   etc.). The microphone is NOT a manifest permission — getUserMedia prompts
		//   her at runtime. `commands` (shortcuts) and `chrome_url_overrides` are
		//   manifest KEYS, not permissions — wire them only when we add those features.
		permissions: [
			"activeTab",
			"bookmarks",
			"contentSettings",
			"debugger",
			"downloads",
			"downloads.open",
			"history",
			"notifications",
			"offscreen",
			"readingList",
			"scripting",
			"sidePanel",
			"storage",
			"tabCapture",
			"tabGroups",
			"tabs",
			"topSites",
			"webNavigation",
		],
		host_permissions: ["<all_urls>"],
		icons: {
			16: "assets/cicero-16.png",
			32: "assets/cicero-32.png",
			48: "assets/cicero-48.png",
			128: "assets/cicero-128.png",
		},
		action: {
			default_title: "__MSG_extActionTitle__",
			default_icon: {
				16: "assets/cicero-16.png",
				32: "assets/cicero-32.png",
				48: "assets/cicero-48.png",
				128: "assets/cicero-128.png",
			},
		},
		web_accessible_resources: [
			{
				resources: ["main-world.js"],
				matches: ["*://*/*"],
			},
		],
		side_panel: {
			default_path: "sidepanel/index.html",
		},
		externally_connectable: {
			matches: ["http://localhost/*"],
		},
	},
});
