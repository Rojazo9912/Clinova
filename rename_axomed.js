const fs = require('fs');
const path = require('path');

const OLD_NAME = 'AxoMed';
const NEW_NAME = 'AxoMed';
const OLD_LOWER = 'axomed';
const NEW_LOWER = 'axomed';
const OLD_UPPER = 'AXOMED';
const NEW_UPPER = 'AXOMED';

const IGNORE_DIRS = ['.git', 'node_modules', '.next', 'out', 'dist', '.vercel', '.gemini'];

// List of extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.svg'];

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (!IGNORE_DIRS.includes(entry.name)) {
                processDirectory(fullPath);
            }
        } else if (entry.isFile()) {
            const ext = path.extname(fullPath);
            if (EXTENSIONS.includes(ext) || entry.name.startsWith('.env')) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let newContent = content
                    .replaceAll(OLD_NAME, NEW_NAME)
                    .replaceAll(OLD_LOWER, NEW_LOWER)
                    .replaceAll(OLD_UPPER, NEW_UPPER);
                
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    console.log(`Updated file content: ${fullPath}`);
                }
            }
            
            // Rename file if its name contains 'axomed'
            if (entry.name.toLowerCase().includes(OLD_LOWER)) {
               const newName = entry.name
                   .replace(new RegExp(OLD_NAME, 'g'), NEW_NAME)
                   .replace(new RegExp(OLD_LOWER, 'g'), NEW_LOWER)
                   .replace(new RegExp(OLD_UPPER, 'g'), NEW_UPPER);
               const newPath = path.join(dirPath, newName);
               fs.renameSync(fullPath, newPath);
               console.log(`Renamed file: ${fullPath} -> ${newPath}`);
            }
        }
    }
}

processDirectory(__dirname);
console.log('Renaming complete.');
