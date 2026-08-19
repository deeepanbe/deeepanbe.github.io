module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'auth.js',
    'db.js',
    'logger.js',
    'middleware.js',
    'server.js',
    'ai/**/*.js',
    'security/**/*.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/'
  ],
  testTimeout: 10000,
  verbose: true
};
