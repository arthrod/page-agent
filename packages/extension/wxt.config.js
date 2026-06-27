import tailwindcss from '@tailwindcss/vite'
import { mkdirSync, readFileSync } from 'node:fs'
import { defineConfig } from 'wxt'

const chromeProfile = '.wxt/chrome-data'
mkdirSync(chromeProfile, { recursive: true })

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: 'src',
	modules: ['@wxt-dev/module-react'],
	webExt: {
		chromiumProfile: chromeProfile,
		keepProfileChanges: true,
		chromiumArgs: ['--hide-crash-restore-bubble'],
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
					if (message.code === 'EVAL') return
					handler(message)
				},
			},
		},
	}),
	zip: {
		artifactTemplate: 'cicero-enfermeiro-digital-{{version}}-{{browser}}.zip',
	},
	manifest: {
		key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqbzT0iTYeYlnCvDJIGDnGU8oarJgZILDzSfLi/ufuSxXEPDKuMyD892GhvrMCZNVHS11Sh6NYUOc/PcUOhtaR2urHtcNkrpSJNV10zUamY7fxBdVEkOucfyLu8INVy+teis62MoRWYPaUPkfZUjrLGW8MsZ9aFzARfu9GGDEp2EAYsWDN6w6vyz9LJ82pm542EWnVT4MjmDPgvYFCWGBtaU/dfHD+GAX6URJFapsCvryVURKJ+76c/GO9/I3EX1IBfbY6dec78bLCMvVxiTmiv36KyGPwX1OpakW8IiCpXWdbAxjm+plbYlp5t5zTyyoE3sOSFeXsBH0Kg27o8GcvQIDAQAB',
		default_locale: 'pt_BR',
		name: '__MSG_extName__',
		description: '__MSG_extDescription__',
		homepage_url: 'https://alibaba.github.io/page-agent/',
		// Maximal capability set so the agent can do everything for her.
		// NOTE: the microphone is NOT a manifest permission in Chrome — getUserMedia
		// prompts her at runtime the first time she taps the mic (see INSTALACAO.md).
		// Excluded (would break MV3 unpacked load or are ChromeOS/printing/hardware
		// only): webRequestBlocking, enterprise.*, wallpaper, vpnProvider,
		// certificateProvider, documentScan, fileBrowserHandler, fileSystemProvider,
		// platformKeys, printing*, loginState, mdns.
		permissions: [
			'accessibilityFeatures.read',
			'activeTab',
			'alarms',
			'background',
			'bookmarks',
			'browsingData',
			'clipboardRead',
			'clipboardWrite',
			'contentSettings',
			'contextMenus',
			'cookies',
			'debugger',
			'declarativeContent',
			'declarativeNetRequest',
			'desktopCapture',
			'dns',
			'downloads',
			'downloads.open',
			'downloads.ui',
			'favicon',
			'fontSettings',
			'gcm',
			'geolocation',
			'history',
			'identity',
			'idle',
			'management',
			'nativeMessaging',
			'notifications',
			'offscreen',
			'pageCapture',
			'power',
			'privacy',
			'processes',
			'proxy',
			'readingList',
			'scripting',
			'search',
			'sessions',
			'sidePanel',
			'storage',
			'system.cpu',
			'system.display',
			'system.memory',
			'system.storage',
			'tabCapture',
			'tabGroups',
			'tabs',
			'topSites',
			'tts',
			'ttsEngine',
			'unlimitedStorage',
			'userScripts',
			'webAuthenticationProxy',
			'webNavigation',
			'webRequest',
		],
		// Extra capabilities requested on demand via chrome.permissions.request()
		// (no install-time warning). accessibilityFeatures.modify + identity.email
		// are sensitive, so they're opt-in; audio is the chrome.audio device API.
		optional_permissions: ['accessibilityFeatures.modify', 'audio', 'identity.email'],
		host_permissions: ['<all_urls>'],
		icons: {
			16: 'assets/cicero-16.png',
			32: 'assets/cicero-32.png',
			48: 'assets/cicero-48.png',
			128: 'assets/cicero-128.png',
		},
		action: {
			default_title: '__MSG_extActionTitle__',
			default_icon: {
				16: 'assets/cicero-16.png',
				32: 'assets/cicero-32.png',
				48: 'assets/cicero-48.png',
				128: 'assets/cicero-128.png',
			},
		},
		web_accessible_resources: [
			{
				resources: ['main-world.js'],
				matches: ['*://*/*'],
			},
		],
		side_panel: {
			default_path: 'sidepanel/index.html',
		},
		externally_connectable: {
			matches: ['http://localhost/*'],
		},
	},
})
