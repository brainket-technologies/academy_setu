const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, 'app');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walkDir(directoryToSearch);
let changedFilesCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/teal-/g, 'indigo-');
  content = content.replace(/#0D9488/gi, 'indigo-600');
  content = content.replace(/#0F9E8F/gi, 'indigo-600');
  content = content.replace(/#0D8E80/gi, 'indigo-700');
  content = content.replace(/#0B9688/gi, 'indigo-600');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done! Updated ${changedFilesCount} files.`);
