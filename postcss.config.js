module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-reporter')({
      clearReportedMessages: true,
    }),
  ],
};

