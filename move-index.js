import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPath = path.join(__dirname, 'dist', 'index.html');
const destDir = path.join(__dirname, 'dist', 'templates');
const destPath = path.join(destDir, 'index.html');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.renameSync(srcPath, destPath);

console.log('index.html has been moved to templates directory.');


const srcICOPath = path.join(__dirname, 'dist', 'favicon.ico');
const desICOtDir = path.join(__dirname, 'dist', 'static');
const destICOPath = path.join(desICOtDir, 'favicon.ico');

if (!fs.existsSync(desICOtDir)) {
    fs.mkdirSync(desICOtDir, { recursive: true });
}

fs.renameSync(srcICOPath, destICOPath);

console.log('favicon.ico has been moved to static directory.');