import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This is the correct way to configure the base path for a Vite app on GitHub Pages.
export default defineConfig({
  // The 'base' property tells Vite to prepend the repository name to all asset paths.
  // The leading and trailing slashes are important.
  base: '/nsbm-shuttle/',
  plugins: [react()],
});
