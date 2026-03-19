const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    }
    return results;
}

const files = walk(path.join(process.cwd(), 'app', 'api'));
for (const f of files) {
    const originalContent = fs.readFileSync(f, 'utf-8');
    const lines = originalContent.split('\n');
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('import {') && (line.includes('readDB') || line.includes('writeDB'))) {
            continue; // Skip import lines
        }

        if (line.match(/(?<!await\s)readDB/)) {
            lines[i] = lines[i].replace(/(?<!await\s)readDB/g, 'await readDB');
            changed = true;
        }
        if (lines[i].match(/(?<!await\s)writeDB/)) {
            lines[i] = lines[i].replace(/(?<!await\s)writeDB/g, 'await writeDB');
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(f, lines.join('\n'), 'utf-8');
        console.log('Updated:', f);
    }
}
