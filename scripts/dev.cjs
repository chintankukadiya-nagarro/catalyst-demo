/**
 * Turbopack on Windows hits EPERM while renaming
 * `.next/dev/static/development/_clientMiddlewareManifest.js` (antivirus / file locks).
 * Use webpack on win32; keep Turbopack elsewhere.
 */
const { spawn } = require('node:child_process');
const { resolve } = require('node:path');

const nextBin = resolve(__dirname, '../node_modules/next/dist/bin/next');
const extraArgs = process.argv.slice(2);
const bundlerArgs = process.platform === 'win32' ? ['--webpack'] : [];

const child = spawn(process.execPath, [nextBin, 'dev', ...bundlerArgs, ...extraArgs], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
