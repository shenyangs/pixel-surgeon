import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
export default defineConfig({plugins:[react()],build:{rollupOptions:{input:{app:resolve('index.html'),demo:resolve('fixtures/demo-site/index.html')}}},server:{proxy:{'/api':'http://127.0.0.1:5203'}}});
