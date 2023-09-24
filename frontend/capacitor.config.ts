import {CapacitorConfig} from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.pp.cra',
  appName: 'ppcra.desa',
  webDir: 'dist/spa',
  bundledWebRuntime: false,
  server: {hostname: "localhost:8080", androidScheme: "http", cleartext: true},
  android: {
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    FirebaseMessaging: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Badge: {
      persist: true,
      autoClear: false
    },
    LocalNotifications: {
      smallIcon: "ic_launcher",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
}

export default config
