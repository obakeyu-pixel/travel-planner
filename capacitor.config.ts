import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tabiplan.travelapp',
  appName: '旅ぷらん',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
