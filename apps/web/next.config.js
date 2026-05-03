import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
