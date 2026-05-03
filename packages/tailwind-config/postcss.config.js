import { createRequire } from 'module';

const require = createRequire(import.meta.url);

var require = createRequire(import.meta.url);
var module = { exports: {} };

// Optional PostCSS configuration for applications that need it
export const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
