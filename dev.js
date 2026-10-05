const { spawn } = require('child_process');

let port = process.env.PORT || '3000';
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
const child = spawn(process.execPath, [nextBin, 'dev', '-p', port], {
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
