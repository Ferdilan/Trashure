const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src', 'app');
const destDir = path.join(__dirname, 'frontend-vite', 'src', 'pages');

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

function processFile(filePath, relPath) {
    if (filePath.endsWith('layout.tsx') || filePath.endsWith('.css') || filePath.endsWith('.ico')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove use client
    content = content.replace(/'use client';?\n?/g, '');
    content = content.replace(/"use client";?\n?/g, '');
    
    // Replace next/link
    content = content.replace(/import Link from 'next\/link';?/g, "import { Link } from 'react-router-dom';");
    content = content.replace(/import Link from "next\/link";?/g, "import { Link } from 'react-router-dom';");
    
    // Replace next/navigation
    content = content.replace(/import\s+{([^}]+)}\s+from\s+'next\/navigation';?/g, (match, imports) => {
        let newImports = imports;
        if (newImports.includes('useRouter')) {
            newImports = newImports.replace('useRouter', 'useNavigate');
        }
        return `import { ${newImports} } from 'react-router-dom';`;
    });
    
    // Replace router with navigate
    content = content.replace(/const router = useRouter\(\);?/g, 'const navigate = useNavigate();');
    content = content.replace(/router\.push\(/g, 'navigate(');
    content = content.replace(/router\.back\(\)/g, 'navigate(-1)');
    content = content.replace(/router\.replace\(/g, 'navigate(');
    
    // Next Image
    content = content.replace(/import Image from 'next\/image';?/g, '');
    content = content.replace(/<Image/g, '<img');
    
    // Create new filename based on route
    let baseRoute = relPath.replace(/\\/g, '/').replace(/\/page\.tsx$/, '').replace(/^page\.tsx$/, 'index');
    if (baseRoute === 'index') baseRoute = 'Landing';
    else {
        baseRoute = baseRoute.split('/').map(part => {
            if (part.startsWith('[')) return part.replace(/\[|\]/g, '') + 'Detail';
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');
    }
    
    const newFileName = `${baseRoute}Page.tsx`;
    fs.writeFileSync(path.join(destDir, newFileName), content);
    console.log(`Migrated ${relPath} -> ${newFileName}`);
}

function walkDir(dir, rel = '') {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const relPath = path.join(rel, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, relPath);
        } else if (file.endsWith('.tsx')) {
            processFile(fullPath, relPath);
        }
    }
}

walkDir(srcDir);
