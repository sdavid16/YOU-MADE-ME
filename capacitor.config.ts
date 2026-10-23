import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sdavid16.youmademe',
  appName: 'YOU MADE ME',
  webDir: 'dist',
  android: {
    allowMixedContent: false
  }
};

export default config;
