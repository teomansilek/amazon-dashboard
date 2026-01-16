import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                fba: resolve(__dirname, 'Amazon_FBA_Dashboard.html'),
                df: resolve(__dirname, 'Amazon_DF_Dashboard.html'),
                kombine: resolve(__dirname, 'Amazon_Kombine_Dashboard.html'),
            },
        },
    },
});
