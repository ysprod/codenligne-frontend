const fs = require('fs');
const path = require('path');

const target = process.argv[2];
const root = path.resolve(__dirname, '..');

const map = {
  local: '.env.local.dev',
  prod: '.env.local.prod',
};

if (!map[target]) {
  console.error('Usage: node scripts/switch-env.js <local|prod>');
  process.exit(1);
}

const sourcePath = path.join(root, map[target]);
const destPath = path.join(root, '.env.local');

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing file: ${map[target]}`);
  process.exit(1);
}

fs.copyFileSync(sourcePath, destPath);
console.log(`Switched .env.local to ${map[target]}`);
