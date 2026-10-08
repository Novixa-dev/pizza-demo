const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let port = process.env.PORT;
if (!port) {
  try {
    const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    const match = envContent.match(/^PORT=(\d+)/m);
    if (match) port = match[1];
  } catch (e) {}
}
if (!port) port = '3000';
const rawArgs = process.argv.slice(2);

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '-p' || arg === '--port') {
    if (rawArgs[i + 1]) {
      port = rawArgs[i + 1];
      i++;
    }
  } else if (/^\d+$/.test(arg)) {
    port = arg;
  }
}

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev', '-p', port, '-H', '0.0.0.0'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code || 0);
  }
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});
