const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname, 'app');

const replacements = [
  { regex: /bg-\[#0F9E8F\]/g, replacement: 'bg-indigo-600' },
  { regex: /hover:bg-\[#0D8E80\]/g, replacement: 'hover:bg-indigo-700' },
  { regex: /bg-\[#0B9688\]/g, replacement: 'bg-indigo-600' },
  { regex: /border-\[#0B9688\]/g, replacement: 'border-indigo-600' },
  { regex: /text-\[#0B9688\]/g, replacement: 'text-indigo-600' },
  { regex: /text-\[#0F9E8F\]/g, replacement: 'text-indigo-600' },
  { regex: /shadow-teal-500\/10/g, replacement: 'shadow-indigo-500/10' },
  { regex: /focus:ring-teal-500\/20/g, replacement: 'focus:ring-indigo-500/20' },
  { regex: /focus:ring-teal-550\/20/g, replacement: 'focus:ring-indigo-500/20' },
  { regex: /focus:border-teal-500/g, replacement: 'focus:border-indigo-500' },
  { regex: /focus:border-teal-550/g, replacement: 'focus:border-indigo-500' },
  { regex: /hover:text-teal-600/g, replacement: 'hover:text-indigo-600' },
  { regex: /hover:text-teal-400/g, replacement: 'hover:text-indigo-400' },
  { regex: /text-teal-600/g, replacement: 'text-indigo-600' },
  { regex: /text-teal-400/g, replacement: 'text-indigo-400' },
  { regex: /text-teal-500/g, replacement: 'text-indigo-500' },
  { regex: /bg-teal-500/g, replacement: 'bg-indigo-500' },
  { regex: /bg-teal-50/g, replacement: 'bg-indigo-50' },
  { regex: /border-teal-500/g, replacement: 'border-indigo-500' }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
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

  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated colors in: ${file}`);
    changedFilesCount++;
  }
});

console.log(`\nFinished! Updated ${changedFilesCount} files to the new Indigo theme.`);
