const crypto = require('crypto');
const logger = require('./logger');

// Request ID middleware - assign unique ID to every request for tracing
function requestIdMiddleware(req, res, next) {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  logger.info('Request received', {
    requestId: req.id,
    method: req.method,
    endpoint: req.path,
    ip: req.ip
  });
  next();
}

// Configuration validator - runs at startup before binding port
async function validateConfig() {
  const errors = [];
  const warnings = [];
  const env = process.env;
  const nodeEnv = env.NODE_ENV || 'development';

  // CRITICAL - must exist
  const critical = [
    { name: 'JWT_SECRET', minLength: 32 },
    { name: 'DATABASE_URL', pattern: 'postgres' },
    { name: 'TURNSTILE_SECRET', minLength: 10 }
  ];

  for (const check of critical) {
    const value = env[check.name];
    if (!value) {
      errors.push(`❌ ${check.name} is not set`);
    } else if (check.minLength && value.length < check.minLength) {
      errors.push(`❌ ${check.name} must be at least ${check.minLength} characters (got ${value.length})`);
    } else if (check.pattern && !value.includes(check.pattern)) {
      errors.push(`❌ ${check.name} must contain '${check.pattern}'`);
    }
  }

  // REQUIRED for production
  if (nodeEnv === 'production') {
    const prodRequired = [
      'RESEND_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'CORS_ORIGINS',
      'AI_PROVIDER'
    ];
    for (const key of prodRequired) {
      if (!env[key]) {
        errors.push(`❌ PRODUCTION: ${key} is required but not set`);
      }
    }
  }

  // WARNINGS - should be set
  if (!env.LOG_LEVEL) warnings.push(`⚠️  LOG_LEVEL not set, defaulting to 'info'`);
  if (!env.PORT) warnings.push(`⚠️  PORT not set, defaulting to 8787`);
  if (!env.AI_PROVIDER) warnings.push(`⚠️  AI_PROVIDER not set, defaulting to 'openai'`);

  // AI Provider checks
  const aiProvider = env.AI_PROVIDER || 'openai';
  const providerKeys = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GEMINI_API_KEY'
  };

  if (providerKeys[aiProvider] && !env[providerKeys[aiProvider]]) {
    errors.push(`❌ AI_PROVIDER is '${aiProvider}' but ${providerKeys[aiProvider]} is not set`);
  }

  // CORS validation
  const corsOrigins = (env.CORS_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
  if (corsOrigins.length === 0 && nodeEnv === 'production') {
    errors.push(`❌ CORS_ORIGINS is empty in production`);
  } else if (corsOrigins.length === 0) {
    warnings.push(`⚠️  CORS_ORIGINS is empty, only non-origin requests will be allowed`);
  }

  // Display results
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DJ AI BACKEND — Configuration Validation');
  console.log('='.repeat(60));
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Port: ${env.PORT || 8787}`);
  console.log(`AI Provider: ${aiProvider}`);
  console.log(`Database: ${env.DATABASE_URL ? '✅ Configured' : '❌ NOT SET'}`);
  console.log(`Log Level: ${env.LOG_LEVEL || 'info'}`);
  console.log(`CORS Origins: ${corsOrigins.length} allowed`);

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`  ${w}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`  ${e}`));
    console.log('\n' + '='.repeat(60));
    throw new Error(`Configuration validation failed: ${errors.length} error(s)`);
  }

  console.log('\n✅ All critical configuration checks passed');
  console.log('='.repeat(60) + '\n');
}

module.exports = { requestIdMiddleware, validateConfig };
