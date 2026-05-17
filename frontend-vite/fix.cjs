const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function fixFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixFiles(fullPath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix <Link href="..." to <Link to="..."
            content = content.replace(/<Link([^>]+)href=/g, '<Link$1to=');
            
            // Fix imgIcon to ImageIcon
            content = content.replace(/<imgIcon/g, '<ImageIcon');
            content = content.replace(/<\/imgIcon>/g, '</ImageIcon>');
            
            // Fix imgPlus to ImagePlus
            content = content.replace(/<imgPlus/g, '<ImagePlus');
            content = content.replace(/<\/imgPlus>/g, '</ImagePlus>');
            
            // Fix useSearchParams
            content = content.replace(/const searchParams = useSearchParams\(\);/g, 'const [searchParams] = useSearchParams();');
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

fixFiles(pagesDir);
console.log('Fixed syntax errors.');
