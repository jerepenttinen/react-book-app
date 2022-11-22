/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  daisyui: {
    themes: [
      {
        booktheme: {
          primary: "#1d4ed8",
          secondary: "#f97316",
          accent: "#aa04d3",
          "base-100": "#181818",
          "base-200": "#141414",
          "base-300": "#101010",
          "base-content": "#cecece",
          neutral: "#181818",
          "neutral-content": "#cecece",
          info: "#06b6d4",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#dc2626",

          "--btn-text-case": "normal-case",
        },
      },
    ],
  },
  theme: {
    colors: {
      medium: "#555",
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("@headlessui/tailwindcss")({ prefix: "ui" }),
  ],
};
