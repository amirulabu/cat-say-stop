import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  suppressWarnings: {
    firefoxDataCollection: true,
  },
  manifest: ({ browser }) => ({
    name: 'Cat Say Stop',
    description:
      'A browser extension that forces you to take a 5-minute break from social media — with a cat as your gatekeeper.',
    permissions: ['storage', 'tabs'],
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'cat-say-stop@amirulabu.dev',
          strict_min_version: '109.0',
        },
      },
    }),
    ...(browser === 'firefox' && {
      data_collection_permissions: [],
    }),
  }),
});
