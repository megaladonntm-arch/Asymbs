export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0b",
        card: "#111111",
        accent: "#00ff9c",
        text: "#ffffff"
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 255, 156, 0.25)",
        soft: "0 8px 30px rgba(0,0,0,0.35)"
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(0,255,156,0.0)" },
          "50%": { boxShadow: "0 0 20px rgba(0,255,156,0.35)" }
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        floatIn: "floatIn 0.35s ease-out",
        blink: "blink 1s step-end infinite"
      }
    }
  },
  plugins: []
}
