import { defineConfig, loadEnv, ConfigEnv, UserConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";
import viteImagemin from "vite-plugin-imagemin";
// import importToCDN from "vite-plugin-cdn-import";
import { visualizer } from "rollup-plugin-visualizer";
// import AutoImport from "unplugin-auto-import/vite";
// import Components from "unplugin-vue-components/vite";
// import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import VueSetupExtend from "vite-plugin-vue-setup-extend";

// https://vitejs.dev/config/
export default defineConfig((mode: ConfigEnv): UserConfig => {
	const env = loadEnv(mode.mode, process.cwd());

	return {
		resolve: {
			alias: {
				"@": resolve(__dirname, "./src")
			}
		},
		// global css
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@import "@/styles/var.scss";`
				}
			}
		},
		// server config
		server: {
			host: "0.0.0.0", // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
			port: env.VITE_PORT as unknown as number, // 服务器端口号
			// https: false, // is Https
			open: true, // 是否自动打开浏览器
			// cors: true, // 允许跨域
			// 代理跨域
			proxy: {
				"/api": {
					target: "https://www.fastmock.site/mock/f81e8333c1a9276214bcdbc170d9e0a0",
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api/, "")
				}
			}
		},
		// plugins
		plugins: [
			vue(),
			// demand import element（如果使用了cdn引入,没必要使用element自动导入了）
			// AutoImport({
			// 	resolvers: [ElementPlusResolver()]
			// }),
			// Components({
			// 	resolvers: [ElementPlusResolver()]
			// }),
			// cdn 引入（vue、element-plus）
			// importToCDN({
			// 	modules: [
			// 		{
			// 			name: "vue",
			// 			var: "Vue",
			// 			path: "https://unpkg.com/vue@next"
			// 		},
			// 		{
			// 			name: "element-plus",
			// 			var: "ElementPlus",
			// 			path: "https://unpkg.com/element-plus",
			// 			css: "https://unpkg.com/element-plus/dist/index.css"
			// 		}
			// 	]
			// }),
			// name 可以写在script上
			VueSetupExtend(),
			// image compress
			viteImagemin({
				gifsicle: {
					optimizationLevel: 7,
					interlaced: false
				},
				optipng: {
					optimizationLevel: 7
				},
				mozjpeg: {
					quality: 20
				},
				pngquant: {
					quality: [0.8, 0.9],
					speed: 4
				},
				svgo: {
					plugins: [
						{
							name: "removeViewBox"
						},
						{
							name: "removeEmptyAttrs",
							active: false
						}
					]
				}
			}),
			// gzip compress
			viteCompression({
				verbose: true,
				disable: false,
				threshold: 10240,
				algorithm: "gzip",
				ext: ".gz"
			}),
			// 查看打包体积大小
			visualizer()
		],
		// build configure
		build: {
			outDir: "dist",
			// assetsDir: "assets",
			minify: "terser",
			terserOptions: {
				// delete console/debugger
				compress: {
					drop_console: true,
					drop_debugger: true
				}
			},
			rollupOptions: {
				output: {
					// Static resource classification and packaging
					chunkFileNames: "assets/js/[name]-[hash].js",
					entryFileNames: "assets/js/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
				}
			}
		}
	};
});
