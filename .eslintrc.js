module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  overrides: [
    {
      // E2E tests should not use Testing Library rules
      files: ['e2e/**/*.ts', 'e2e/**/*.js'],
      rules: {
        'testing-library/prefer-screen-queries': 'off',
        'testing-library/no-node-access': 'off',
        'jest/no-conditional-expect': 'off'
      }
    },
    {
      // Unit tests should allow screen usage and DOM access
      files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      rules: {
        'no-restricted-globals': 'off',
        'testing-library/no-node-access': 'off'
      }
    }
  ]
};
