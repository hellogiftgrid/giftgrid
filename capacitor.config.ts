import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hellogiftgrid.app',
  appName: 'GiftGrid',
  webDir: 'out',
  server: {
    url: 'https://www.degiftgrid.com',
    cleartext: false,
  },
};

export default config;
