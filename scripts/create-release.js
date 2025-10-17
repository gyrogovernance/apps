const fs = require('fs');
const path = require('path');

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Create release directory
const releaseDir = `release-v${version}`;
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true });
}
fs.mkdirSync(releaseDir);

// Copy dist folder contents to release directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir('dist', releaseDir);

console.log(`\n✅ Release directory created: ${releaseDir}/`);
console.log(`📦 Ready for manual ZIP creation and GitHub release upload`);
console.log(`\nTo create a GitHub release:`);
console.log(`1. Manually ZIP the ${releaseDir}/ folder as gyrogovernance-extension-v${version}.zip`);
console.log(`2. Go to https://github.com/gyrogovernance/apps/releases`);
console.log(`3. Click "Create a new release"`);
console.log(`4. Tag: v${version}`);
console.log(`5. Title: GyroGovernance Extension v${version}`);
console.log(`6. Upload: gyrogovernance-extension-v${version}.zip`);
console.log(`7. Publish release`);
