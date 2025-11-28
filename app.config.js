const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: "hypnotify-app",
    slug: "hypnotify-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV ? "de.hypnohh.hypnotify.dev" : "de.hypnohh.hypnotify"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: IS_DEV ? "de.hypnohh.hypnotify.dev" : "de.hypnohh.hypnotify",
      versionCode: 1,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [],
    extra: {
      eas: {
        projectId: "1bc4c06f-75cf-47cc-9158-aab5c3115f0f"
      },
      supabaseFunctionUrl: process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL || "",
      supabaseApiKey: process.env.EXPO_PUBLIC_SUPABASE_API_KEY || ""
    }
  }
};
