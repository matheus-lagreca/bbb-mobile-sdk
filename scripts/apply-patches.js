// Applies patches/ (patch-package) to this repo's own node_modules.
//
// Skipped when the SDK is installed as a dependency of a host app (it then lives
// under node_modules/): patch-package and the patched packages belong to the
// host app there, which has to carry the same patches itself.
const path = require('path');
const { execSync } = require('child_process');

if (__dirname.split(path.sep).includes('node_modules')) {
  process.exit(0);
}

execSync('npx patch-package', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
