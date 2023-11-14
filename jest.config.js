module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: ['**/*.service.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['html'],
  modulePathIgnorePatterns: [
    'src/core/database/',
    'src/main.ts',
    'src/lambda.ts'
  ],
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  globalSetup: './global-setup.js',
  // Suppress console output during test runs
  silent: true
};
