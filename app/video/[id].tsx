import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform, Pressable, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { ThemedText } from "@/components/themed-text";
import { BodyFont, ButtonFont, HeadingFont } from "@/constants/theme";
import { stopAudio } from "@/services/audio";

/**
 * Video player screen.
 *
 * WebView with Vimeo or YouTube embed. iOS-only: for Vimeo we force autoplay=0 and
 * add a big play overlay so the video actually starts (WebView inline is broken on iOS).
 * Android uses the default embed (autoplay, no overlay).
 */
export default function VideoPlayerScreen() {
  const { title, embedUrl, isPortrait } = useLocalSearchParams<{
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

  // Release the audio session so WebView video can play (stops any slang/slow-mo).
  useEffect(() => {
    stopAudio();
  }, []);

  const isIOS = Platform.OS === "ios";
  const isVimeo = typeof embedUrl === "string" && embedUrl.includes("vimeo.com");
  let iframeSrc = embedUrl || "";
  // iOS only: Vimeo disable autoplay + play overlay (inline playback is broken on iOS).
  if (isVimeo && isIOS) {
    iframeSrc = iframeSrc.replace("autoplay=1", "autoplay=0");
    if (!iframeSrc.includes("autoplay=")) {
      iframeSrc += (iframeSrc.includes("?") ? "&" : "?") + "autoplay=0";
    }
    iframeSrc = iframeSrc.replace("playsinline=0", "playsinline=1");
  }

  // iOS only: big centered play overlay for Vimeo (tap starts playback via Player API).
  const playOverlayHtml = isVimeo && isIOS
    ? `
    <div id="vimeo-play-overlay" class="play-overlay">
      <button type="button" class="play-button" aria-label="Play video">
        <span class="play-icon"></span>
      </button>
    </div>
    <script>
      (function() {
        var s = document.createElement('script');
        s.src = 'https://player.vimeo.com/api/player.js';
        s.onload = function() {
          var overlay = document.getElementById('vimeo-play-overlay');
          var iframe = document.getElementById('vimeo-iframe');
          if (!overlay || !iframe || typeof Vimeo === 'undefined') return;
          overlay.addEventListener('click', function() {
            try {
              var player = new Vimeo.Player(iframe);
              player.play();
              overlay.style.display = 'none';
            } catch (e) {}
          });
        };
        document.head.appendChild(s);
      })();
    <\/script>`
    : "";

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
    .play-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .play-button {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .play-button:active { opacity: 0.9; }
    .play-icon {
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 16px 0 16px 28px;
      border-color: transparent transparent transparent #111;
      margin-left: 6px;
    }
  </style>
</head>
<body>
  <div class="player-wrap">
    <iframe
      id="${isVimeo && isIOS ? "vimeo-iframe" : ""}"
      src="${iframeSrc}"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowfullscreen
      playsinline
      webkitallowfullscreen
      mozallowfullscreen
    ></iframe>
    ${playOverlayHtml}
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
          <Ionicons name="chevron-back" size={24} color="#fff" style={styles.backIcon} />
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
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={isIOS}
          allowsFullscreenVideo
          // --------------------------------------------------------
          allowsBackForwardNavigationGestures={false}
          bounces={false}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
    marginRight: 2,
  },
  backText: {
    color: "#fff",
    fontSize: 13,
    marginRight: 4,
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
    alignItems: "flex-end",
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
