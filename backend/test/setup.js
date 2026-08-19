require('dotenv').config({ path: require('path').join(__dirname, '../.env.test') });

global.testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/djai_test';

// Suppress console logs during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  };
}
