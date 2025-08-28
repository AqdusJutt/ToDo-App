/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: { DEFAULT: "#4f46e5" },
          secondary: { DEFAULT: "#0ea5e9" },
          success: { DEFAULT: "#22c55e" },
          warning: { DEFAULT: "#f59e0b" },
          error:   { DEFAULT: "#ef4444" },
        },
        transitionTimingFunction: {
          'bounce-soft': 'cubic-bezier(.19,1,.22,1)',
        },
      },
    },
    plugins: [
      require("@tailwindcss/forms"),
      require("@tailwindcss/typography"),
      // ✅ enable DaisyUI
      require("daisyui"),
    ],
    daisyui: {
      themes: ["light", "dark"],
      darkTheme: "dark",
    },
    safelist: [
      // ✅ now these match DaisyUI classes
      { pattern: /btn-(ghost|outline|link|primary|secondary|accent|info|success|warning|error)/ },
      { pattern: /alert-(info|success|warning|error)/ },
      { pattern: /badge-(neutral|primary|secondary|accent|ghost|info|success|warning|error)/ },
    ],
  };
  