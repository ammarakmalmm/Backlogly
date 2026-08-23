import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({ plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Backlogly', short_name: 'Backlogly', description: 'Your backlog. Your next adventure.', theme_color: '#635bff', background_color: '#f7f7ff', display: 'standalone', icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] } })] });
