import localFont from "next/font/local";

/**
 * Polices auto-hébergées (aucun appel réseau au build ni au runtime).
 * Sous-ensemble latin de Inter, Anton et Permanent Marker (Google Fonts, OFL).
 */

export const sans = localFont({
  src: "./Inter-var.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
});

export const display = localFont({
  src: "./Anton-400.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "400",
  fallback: ["Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
});

export const brush = localFont({
  src: "./PermanentMarker-400.woff2",
  variable: "--font-brush",
  display: "swap",
  weight: "400",
  fallback: ["Bradley Hand", "Brush Script MT", "cursive"],
});
