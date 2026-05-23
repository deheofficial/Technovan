module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        mist: '#f5f7f4',
        clay: '#d97706',
        moss: '#2f5d50',
        sand: '#ede5d8',
      },
      boxShadow: {
        panel: '0 24px 80px rgba(17, 24, 39, 0.12)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
