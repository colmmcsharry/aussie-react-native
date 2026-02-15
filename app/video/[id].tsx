import { Audio, InterruptionModeIOS } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { ThemedText } from "@/components/themed-text";
import { BodyFont, ButtonFont, HeadingFont } from "@/constants/theme";

/**
 * Video player screen.
 *
 * Uses a WebView with the Vimeo embed player. The key differences from a
 * Capacitor WebView that make iPhone playback reliable:
 *
 *  - `allowsInlineMediaPlayback` — lets the video play inline instead of
 *    forcing the native fullscreen player (the main cause of issues on iOS).
 *  - `mediaPlaybackRequiresUserAction={false}` — enables autoplay.
 *  - `allowsFullscreenVideo` — still lets the user go fullscreen if they want.
 *  - Proper viewport meta tag in the injected HTML.
 */
export default function VideoPlayerScreen() {
  const { id, title, embedUrl, isPortrait, source } = useLocalSearchParams<{
    id: string;
    title: string;
    embedUrl: string;
    duration?: string;
    isPortrait: string;
    source?: string;
  }>();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const portrait = isPortrait === "1";

  // Reset audio session so WebView video can play (expo-av slow-mo can leave iOS session in a state that blocks video)
  useEffect(() => {
    Audio.setAudioModeAsync({
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      playsInSilentModeIOS: true,
    }).catch(() => {});
  }, []);

  // Build an HTML page that embeds the Vimeo player with optimal settings
  const playerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%;
      background: #000;
      overflow: hidden;
    }
    .player-wrap {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    iframe {
      border: none;
      ${
        portrait
          ? "width: 100%; height: 100%; max-width: 100vw; max-height: 100vh;"
          : "width: 100%; height: 100%;"
      }
    }
  </style>
</head>
<body>
  <div class="player-wrap">
    <iframe
      src="${embedUrl}"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen
      playsinline
      webkitallowfullscreen
      mozallowfullscreen
    ></iframe>
  </div>
</body>
</html>`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={16}
        >
          <ThemedText style={styles.backIcon}>{"‹"}</ThemedText>
          <ThemedText style={styles.backText}>Back</ThemedText>
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {title || "Video"}
          </ThemedText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* WebView player */}
      <View style={styles.playerContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: playerHtml }}
          style={styles.webview}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          // -- These three props are critical for iOS video playback --
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          // --------------------------------------------------------
          allowsBackForwardNavigationGestures={false}
          bounces={false}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          mediaContentMode="recommended"
          contentMode="mobile"
          // Allow mixed content for Vimeo CDN assets
          mixedContentMode="compatibility"
          // Transparent background while loading
          containerStyle={styles.webviewContainer}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ThemedText style={styles.loadingText}>
                Loading player...
              </ThemedText>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#000",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 70,
  },
  backIcon: {
    color: "#fff",
    fontSize: 32,
    top: 7,
    fontWeight: "500",
    marginRight: 4,
  },
  backText: {
    color: "#fff",
    fontSize: 17,
    fontFamily: ButtonFont,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: HeadingFont,
  },
  headerSpacer: {
    minWidth: 70,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  webviewContainer: {
    backgroundColor: "#000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    fontSize: 15,
    fontFamily: BodyFont,
  },
});
