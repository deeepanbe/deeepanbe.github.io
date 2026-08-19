const fs = require('fs');
const path = require('path');

// Log levels
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const CURRENT_LEVEL = LEVELS[LOG_LEVEL] || LEVELS.info;
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');
const NODE_ENV = process.env.NODE_ENV || 'development';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (e) {}
}

function sanitize(obj) {
  if (!obj) return obj;
  const sensitive = ['password', 'token', 'secret', 'key', 'openai', 'anthropic', 'api_key', 'stripe', 'turnstile'];
  const sanitized = JSON.parse(JSON.stringify(obj));
  
  function walk(o) {
    if (typeof o !== 'object' || o === null) return;
    for (const key in o) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        o[key] = '[REDACTED]';
      } else if (typeof o[key] === 'object') {
        walk(o[key]);
      }
    }
  }
  walk(sanitized);
  return sanitized;
}

function format(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    message,
    env: NODE_ENV,
    ...(context.requestId && { requestId: context.requestId }),
    ...(context.userId && { userId: context.userId }),
    ...(context.endpoint && { endpoint: context.endpoint }),
    ...(context.method && { method: context.method }),
    ...(context.statusCode && { statusCode: context.statusCode }),
    ...(context.error && { error: context.error.message || String(context.error) }),
    ...(context.stack && { stack: context.stack }),
    ...(context.data && { data: sanitize(context.data) })
  };
  return JSON.stringify(entry);
}

function write(entry) {
  console.log(entry);
  
  // Write to file in production
  if (NODE_ENV === 'production') {
    try {
      const date = new Date().toISOString().split('T')[0];
      const logFile = path.join(LOG_DIR, `dj-ai-${date}.log`);
      fs.appendFileSync(logFile, entry + '\n', { encoding: 'utf8' });
    } catch (e) {
      console.error('Failed to write log file:', e.message);
    }
  }
}

const logger = {
  error(message, context = {}) {
    if (CURRENT_LEVEL >= LEVELS.error) {
      write(format('ERROR', message, context));
    }
  },

  warn(message, context = {}) {
    if (CURRENT_LEVEL >= LEVELS.warn) {
      write(format('WARN', message, context));
    }
  },

  info(message, context = {}) {
    if (CURRENT_LEVEL >= LEVELS.info) {
      write(format('INFO', message, context));
    }
  },

  debug(message, context = {}) {
    if (CURRENT_LEVEL >= LEVELS.debug) {
      write(format('DEBUG', message, context));
    }
  },

  // Convenience for request context
  request(level, message, req, context = {}) {
    const requestContext = {
      requestId: req.id,
      endpoint: `${req.method} ${req.path}`,
      method: req.method,
      ...(req.user && { userId: req.user.id }),
      ...context
    };
    this[level](message, requestContext);
  }
};

module.exports = logger;
