// Runs automatically after `npm install`. Scaffolds a local .env from .env.example
// so a fresh clone is one step from running. Must never throw — a failure here
// would break `npm install` for everyone.
const fs = require('fs');
const path = require('path');

try {
  if (process.env.CI) process.exit(0);

  const root = path.resolve(__dirname, '..');
  const env = path.join(root, '.env');
  const example = path.join(root, '.env.example');

  if (!fs.existsSync(env) && fs.existsSync(example)) {
    fs.copyFileSync(example, env);
    console.log('\n[setup] Created .env from .env.example.');
    console.log('[setup] Fill in your EXPO_PUBLIC_SUPABASE_* values, then run `npm start`.\n');
  }
} catch (err) {
  console.warn('[setup] postinstall skipped:', err && err.message);
}

process.exit(0);
