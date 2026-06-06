/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: { unoptimized: true },
    webpack: (config) => {
      // Suppress SASS deprecation warnings
      config.module.rules.forEach((rule) => {
        if (rule.oneOf) {
          rule.oneOf.forEach((oneOfRule) => {
            if (
              oneOfRule.use &&
              Array.isArray(oneOfRule.use) &&
              oneOfRule.use.some((use) => use.loader && use.loader.includes('sass-loader'))
            ) {
              const sassLoaderIndex = oneOfRule.use.findIndex(
                (use) => use.loader && use.loader.includes('sass-loader')
              );
              if (sassLoaderIndex !== -1) {
                const sassLoaderOptions = oneOfRule.use[sassLoaderIndex].options || {};
                oneOfRule.use[sassLoaderIndex].options = {
                  ...sassLoaderOptions,
                  sassOptions: {
                    ...sassLoaderOptions.sassOptions,
                    quietDeps: true,
                    logger: {
                      warn: () => {},
                      debug: () => {},
                    },
                  },
                };
              }
            }
          });
        }
      });
      return config;
    },
  };
  
  export default nextConfig;
