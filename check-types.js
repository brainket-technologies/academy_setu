const { execSync } = require('child_process');

try {
  console.log('Running type check...');
  const output = execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
  console.log(output);
  console.log('Type check passed.');
} catch (err) {
  console.log('Type check failed:');
  console.log(err.stdout);
  console.log(err.stderr);
}
