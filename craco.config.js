const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Resolve deprecation warnings for webpack 5
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "util": false
      };

      // Suppress specific deprecation warnings
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /Critical dependency: the request of a dependency is an expression/,
        /Module not found: Error: Can't resolve/
      ];

      // Configure module rules to handle source maps properly
      webpackConfig.module.rules.forEach(rule => {
        if (rule.oneOf) {
          rule.oneOf.forEach(oneOfRule => {
            if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
              oneOfRule.use.forEach(use => {
                if (use.loader && use.loader.includes('source-map-loader')) {
                  use.options = {
                    ...use.options,
                    filterSourceMappingUrl: () => false
                  };
                }
              });
            }
          });
        }
      });

      return webpackConfig;
    }
  },
  devServer: {
    // Suppress webpack dev server deprecation warnings
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  },
  jest: {
    configure: (jestConfig) => {
      // Suppress Jest deprecation warnings
      jestConfig.testEnvironment = 'jsdom';
      return jestConfig;
    }
  }
};
