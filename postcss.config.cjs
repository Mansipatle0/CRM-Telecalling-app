/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, // ✅ correct plugin for Tailwind v4
    autoprefixer: {},
  },
};
