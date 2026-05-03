import { createRequire } from 'module';
import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

const require = createRequire(import.meta.url);

// Optional PostCSS configuration for applications that need it
export const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
