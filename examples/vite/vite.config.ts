import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueClickToComponent from 'vue-click-to-component/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vueClickToComponent(),
    vue()
  ],
})
