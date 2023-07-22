import typescript from '@rollup/plugin-typescript';
import reactRefresh from '@vitejs/plugin-react-refresh';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig, loadEnv} from 'vite';
import {resolve} from 'path';
import analyze from 'rollup-plugin-analyzer';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, 'env');

  // Default deploy-version to npm package version when the environment variable
  // is not set (e.g. local build)
  env['VITE_REACT_APP_DEPLOY_VERSION'] ??= process.env.npm_package_version!;

  // Plugin so we can use default %env_variable%
  const htmlEnvPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/%(.*?)%/g, (_, p1) => {
          return env[p1];
        });
      },
    };
  };

  return {
    base: '',
    plugins: [
      htmlEnvPlugin(),
      reactRefresh(),
      tsconfigPaths(),
      typescript({tsconfig: './tsconfig.json'}),
    ],
    optimizeDeps: {
      // 👈 optimizedeps
      optimizeDeps: {
        esbuildOptions: {
          target: 'es2020',
        },
      },
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          nested: resolve(__dirname, 'ipfs-404.html'),
        },
        plugins: [
          analyze({
            stdout: true,
            summaryOnly: true,
          }),
        ],
        output: {
          manualChunks: {
            'osx-ethers': ['@aragon/osx-ethers'],
            tiptap: [
              '@tiptap/extension-link',
              '@tiptap/extension-placeholder',
              '@tiptap/react',
              '@tiptap/starter-kit',
            ],
          },
        },
      },
      // minify: false,
      // ↓ Needed for build if using WalletConnect and other providers
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      resolve: {
        preserveSymlinks: true,
      },
    },
  };
});
