const fs = require('fs');
const path = require('path');

// Create public assets directory structure
const publicDir = path.join(__dirname, '..', 'public');
const assetsDir = path.join(publicDir, 'Assets');

// Create directories if they don't exist
const dirs = [
  'Assets',
  'Assets/Category',
  'Assets/Products', 
  'Assets/icons',
  'Assets/header',
  'Assets/font'
];

dirs.forEach(dir => {
  const fullPath = path.join(publicDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Copy assets from source to public directory
const sourceAssetsDir = path.join(__dirname, '..', 'Assets');

if (fs.existsSync(sourceAssetsDir)) {
  console.log('Copying assets to public directory...');
  
  // Copy all files from Assets to public/Assets
  const copyRecursive = (src, dest) => {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(file => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${path.relative(sourceAssetsDir, src)}`);
    }
  };
  
  copyRecursive(sourceAssetsDir, assetsDir);
  console.log('Assets copied successfully!');
} else {
  console.log('Source Assets directory not found. Please ensure assets are in the correct location.');
}

console.log('Asset setup complete!');
