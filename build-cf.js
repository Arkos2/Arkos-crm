const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('--- ARKOS: Iniciando preparação para Cloudflare ---');

const openNextDir = path.join(__dirname, '.open-next');
const deployDir = path.join(__dirname, 'cloudflare-deploy');

// 1. Limpa ou cria pasta de deploy
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// 2. Copia a estrutura do OpenNext
if (fs.existsSync(openNextDir)) {
  console.log('Copiando arquivos do OpenNext...');
  copyRecursiveSync(openNextDir, deployDir);
  
  // 3. Move os assets para a raiz do deploy (essencial para CSS/JS)
  const assetsDir = path.join(deployDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    console.log('Organizando estilos e imagens...');
    copyRecursiveSync(assetsDir, deployDir);
  }
}

  // 4. Renomeia e Patcheia o worker para _worker.js (padrão Cloudflare)
  let workerSource = path.join(deployDir, 'worker.js');
  if (!fs.existsSync(workerSource)) {
    workerSource = path.join(deployDir, '_worker.js');
  }
  
  const workerDest = path.join(deployDir, '_worker.js');

  if (fs.existsSync(workerSource)) {
    console.log(`Patcheando ${path.basename(workerSource)} para suporte a arquivos estáticos...`);
    let workerContent = fs.readFileSync(workerSource, 'utf8');
    
    // Injeta o fallback para env.ASSETS.fetch antes do middleware
    const staticFallback = `
            // ARKOS: Servir arquivos estáticos (CSS, JS, Imagens)
            if (url.pathname.startsWith('/_next/static/') || 
                url.pathname.startsWith('/public/') || 
                url.pathname.match(/\\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)) {
                return env.ASSETS.fetch(request);
            }
    `;
    
    // Injeta o fallback para env.ASSETS.fetch usando uma busca mais flexível
    const urlLineRegex = /const url = new URL\(request\.url\);/;
    if (urlLineRegex.test(workerContent)) {
      workerContent = workerContent.replace(
        urlLineRegex,
        `const url = new URL(request.url);${staticFallback}`
      );
    } else {
      console.log('AVISO: Não foi possível encontrar a linha de URL no worker.js');
    }
    
    fs.writeFileSync(workerDest, workerContent);
    if (workerSource !== workerDest) {
      fs.unlinkSync(workerSource);
    }
  }

// 5. Garante que os arquivos da pasta 'public' original estejam lá
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  console.log('Copiando arquivos públicos originais...');
  copyRecursiveSync(publicDir, deployDir);
}

console.log('--- ARKOS: Deploy pronto na pasta /cloudflare-deploy ---');
