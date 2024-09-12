/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
// import { light } from "daisyui/src/theming/themes";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  // daisyui: {
  //   themes: [
  //     {
  //       light: {
  //         ...light,
  //         primary: "bg-blue-600 text-white",
  //         // secondary: "teal",
  //       },
  //     },
  //   ],
  // },
};
