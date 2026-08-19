const logger = require('../../logger');

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log at appropriate levels', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    process.env.LOG_LEVEL = 'info';
    logger.info('Test message', { userId: 'user-123' });

    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).toContain('Test message');
    expect(logOutput).toContain('user-123');

    consoleSpy.mockRestore();
  });

  it('should sanitize sensitive data', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    logger.error('Error occurred', {
      data: { password: 'secret123', apiKey: 'sk-test', normalField: 'visible' }
    });

    const logOutput = consoleSpy.mock.calls[0][0];
    expect(logOutput).not.toContain('secret123');
    expect(logOutput).not.toContain('sk-test');
    expect(logOutput).toContain('[REDACTED]');
    expect(logOutput).toContain('visible');

    consoleSpy.mockRestore();
  });

  it('should respect LOG_LEVEL environment variable', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    process.env.LOG_LEVEL = 'error';

    // Reload logger module to respect new LOG_LEVEL
    jest.resetModules();
    const reloadedLogger = require('../../logger');

    reloadedLogger.debug('Debug message');
    // Debug should not be logged at 'error' level
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
