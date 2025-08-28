import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react', '@wxt-dev/i18n/module'],
  manifest: {
    permissions: ['storage', 'contextMenus', 'tabs', 'activeTab'],
    host_permissions: ['<all_urls>'],
    default_locale: 'zh_CN'
  },
  vite: () => ({
    plugins: [tailwindcss()]
  })
});
