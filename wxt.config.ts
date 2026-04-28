import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Cat Say Stop',
    description: 'A browser extension that forces you to take a 5-minute break from social media — with a cat as your gatekeeper.',
    permissions: ['storage', 'tabs'],
  },
});
