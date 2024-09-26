import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function restructure() {
    try {
        // 创建 Flask 应用所需的目录结构
        await ensureDir(path.join(distDir, 'static'));
        await ensureDir(path.join(distDir, 'templates'));

        // 移动 index.html 到 templates 目录
        await fs.rename(path.join(distDir, 'index.html'), path.join(distDir, 'templates', 'index.html'));

        // 移动所有其他文件到 static 目录
        const entries = await fs.readdir(distDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name !== 'static' && entry.name !== 'templates') {
                const srcPath = path.join(distDir, entry.name);
                const destPath = path.join(distDir, 'static', entry.name);
                await fs.rename(srcPath, destPath);
            }
        }

        console.log('文件重组完成，现在符合 Flask 结构。');
    } catch (err) {
        console.error('重组过程中发生错误:', err);
    }
}

restructure();