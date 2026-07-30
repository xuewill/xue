import { sveltekit } from '@sveltejs/kit/vite';
import velite from '@velite/plugin-vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({
  plugins: [
    ...(command === 'serve' && mode !== 'test' ? [velite()] : []),
    sveltekit()
  ]
}));
