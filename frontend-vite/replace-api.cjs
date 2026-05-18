const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Khusus untuk Socket.io: io('http://localhost:5000') -> io(import.meta.env.VITE_API_URL)
  content = content.replace(/io\(['"`]http:\/\/localhost:5000['"`]\)/g, 'io(import.meta.env.VITE_API_URL)');
  
  // Untuk fetch dengan kutip satu ('http://localhost:5000/api/...')
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  // Untuk fetch dengan kutip dua ("http://localhost:5000/api/...")
  content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  // Untuk fetch dengan template literal (`http://localhost:5000/api/${id}`)
  content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath);
    } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      replaceInFile(dirPath);
    }
  });
}

console.log("Mulai memindai file...");
walkDir(path.join(__dirname, 'src'));
console.log("Selesai mengganti localhost dengan import.meta.env.VITE_API_URL");
