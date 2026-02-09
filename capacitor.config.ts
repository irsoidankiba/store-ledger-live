import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b05d7bee3438472db363d82633834f5c',
  appName: 'RecovTrack',
  webDir: 'dist',
  server: {
    url: 'https://b05d7bee-3438-472d-b363-d82633834f5c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
