/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#194F89'; // Australian blue
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/** Card background palette used for feed and other cards app-wide (~2% less bright for a softer look) */
export const CardPalette = {
  /** Slang / G'day card – light yellow */
  slang: '#faf6e3',
  /** Quiz card – light green */
  quiz: '#e3f9e3',
  /** Video of the day card – light red */
  video: '#fae3e3',
  /** Quote card – light blue */
  quote: '#e3effa',
} as const;

/** Shared card layout (border radius, etc.) for consistency */
export const CardLayout = {
  borderRadius: 20,
} as const;

/** Pale blue content background used on Games, Videos, Quotes, etc. */
export const ContentBg = '#e0ebf6';

/** Standard font sizes – small: 14, body and up: 16+ */
export const FontSizes = {
  /** Small text (hints, meta, attribution) – minimum size */
  small: 14,
  /** Body text, buttons, options */
  body: 16,
  /** Card titles, headings */
  title: 18,
  /** Large display (e.g. featured slang term) */
  display: 28,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/** Heading font – Nunito 900 Black. Load in root layout. */
export const HeadingFont = 'Nunito_900Black';
/** Body text – Nunito Regular. Load in root layout. */
export const BodyFont = 'Nunito_400Regular';
/** Button text – Nunito Bold. Load in root layout. */
export const ButtonFont = 'Nunito_700Bold';
/** Card body text (explanation, notes, examples) – Nunito Medium, no 400 in cards. Load in root layout. */
export const CardBodyFont = 'Nunito_500Medium';
/** Slang phrases only (e.g. "G'day", "How ya goin'?") – Fredoka One. Load in root layout. */
export const SlangDisplayFont = 'FredokaOne_400Regular';
