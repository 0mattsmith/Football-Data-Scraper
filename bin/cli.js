#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const cliPath = path.join(__dirname, '../src/cli.ts');

let tsxCli;
try {
  tsxCli = require.resolve('tsx/cli');
  const result = spawnSync(process.execPath, [tsxCli, cliPath, ...process.argv.slice(2)], {
    stdio: 'inherit'
  });
  process.exit(result.status ?? 0);
} catch (err) {
  // Fallback if tsx is not locally resolved in cache
  const result = spawnSync('npx', ['--yes', 'tsx', cliPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true
  });
  process.exit(result.status ?? 0);
}
