import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Importante para que Docker lo vea
        port: 5173,
        strictPort: true,
        // Eliminamos la sección 'proxy' para evitar el error ERR_EMPTY_RESPONSE
    }
});