/**
 * Romantic Surprise Website - Media Manifest Generator
 * Scans directories (images, videos, music) and compiles a media-manifest.json file.
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, 'media-manifest.json');

const DIRS = {
  images: path.join(__dirname, 'images'),
  videos: path.join(__dirname, 'videos'),
  music: path.join(__dirname, 'music')
};

// Natural sort for files (so 10.png comes after 2.png, not after 1.png)
function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function scanDirectories() {
  const manifest = {
    images: [],
    videos: [],
    music: []
  };

  for (const [key, dirPath] of Object.entries(DIRS)) {
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory not found: ${dirPath}. Creating empty...`);
      fs.mkdirSync(dirPath, { recursive: true });
      continue;
    }

    try {
      const files = fs.readdirSync(dirPath);
      // Filter out hidden files or manifest scripts themselves
      const filteredFiles = files.filter(file => {
        const stats = fs.statSync(path.join(dirPath, file));
        return stats.isFile() && !file.startsWith('.');
      });

      // Sort natural-numerically
      filteredFiles.sort(naturalSort);

      // We only store the filename itself, the client script will prepend the directory
      manifest[key] = filteredFiles;
      console.log(`Scanned ${filteredFiles.length} files in /${key}`);
    } catch (err) {
      console.error(`Error scanning directory ${dirPath}:`, err);
    }
  }

  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`Successfully generated media manifest at: ${MANIFEST_PATH}`);
  } catch (err) {
    console.error('Error writing manifest file:', err);
  }
}

scanDirectories();
