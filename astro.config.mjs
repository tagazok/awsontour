// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://tagazok.github.io',
  base: '/awsontour/',
  // Content validation runs via prebuild script
  // integrations: [
  //   contentValidation({
  //     failOnError: true,
  //     showWarnings: true,
  //     generateReport: false
  //   })
  // ],
  image: {
    // Configure image optimization
    domains: [],
    remotePatterns: [],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: 268402689, // ~16K x 16K pixels
      }
    }
  },
  build: {
    // Optimize assets during build
    assets: '_astro'
  },
  vite: {
    // Additional optimizations for images
    assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.avif', '**/*.svg'],
    build: {
      // Optimize asset handling
      assetsInlineLimit: 4096, // Inline assets smaller than 4KB
      rollupOptions: {
        output: {
          // Organize assets by type
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(jpe?g|png|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
              return `images/[name]-[hash][extname]`;
            }
            if (/\.(css)$/i.test(assetInfo.name)) {
              return `css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          }
        }
      }
    }
  }
});
