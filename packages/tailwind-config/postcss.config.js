import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

// Optional PostCSS configuration for applications that need it
export const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
