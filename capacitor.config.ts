import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'stadium-frontend',
  webDir: 'build',
  server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;