import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

import path from 'path'

// https://vitejs.dev/config/

// path resolving in vite
// https://javascript.plainenglish.io/how-to-set-up-path-resolving-in-vite-ad284e0d9eae

const resolvePath = (str: string) => path.resolve(__dirname, str)
export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.includes('-'),
				},
			},
		}),
		svgLoader({ svgo: false }),
	],
	resolve: {
		alias: {
			src: resolvePath('./src'),
			TrackObjects: resolvePath('./src/TrackObjects'),
			MapObjects: resolvePath('./src/MapObjects'),
		},
	},
	build: {
		lib: {
			entry: resolvePath('src/oms-track-monitor.ts'),
			name: 'oms-track-monitor',
			fileName: (format) => `oms-track-monitor.${format}.js`,
		},
		outDir: './dist',
	},
	server: {
		proxy: {
			'/api': 'http://localhost:5004',
			'/hubs': 'http://localhost:5004',
		},
	},
})
