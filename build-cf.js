const fs = require('fs');
const path = require('path');

const openNextDir = path.join(__dirname, '.open-next');
const assetsDir = path.join(openNextDir, 'assets');

// 1. Copia worker.js para _worker.js
const workerPath = path.join(openNextDir, 'worker.js');
const targetWorkerPath = path.join(openNextDir, '_worker.js');

if (fs.existsSync(workerPath)) {
  fs.copyFileSync(workerPath, targetWorkerPath);
  console.log('✅ worker.js copiado para _worker.js');
}

// 2. Copia tudo de assets para a raiz de .open-next
if (fs.existsSync(assetsDir)) {
  const copyRecursiveSync = function(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(function(childItemName) {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  copyRecursiveSync(assetsDir, openNextDir);
  console.log('✅ assets copiados para a raiz do .open-next');
}
