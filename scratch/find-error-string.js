const fs = require('node:fs');
const path = require('node:path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('Failed to create checkout')) {
          results.push(fullPath);
        }
      }
    } catch (e) {}
  }
  return results;
}

const targetDir = path.join(process.cwd(), 'node_modules', '@creem_io');
if (fs.existsSync(targetDir)) {
  const matches = walk(targetDir);
  console.log('Matches:', matches);
} else {
  console.log('Directory node_modules/@creem_io does not exist');
}
