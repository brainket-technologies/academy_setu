const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/fammu/Desktop/academic-app/app/institute/fees-setup';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Add import if not present
  if (content.includes('Select Multiple Class') || content.includes('Select Class')) {
    if (!content.includes("import { useClasses } from '@/lib/mastersData'")) {
      content = content.replace(
        "import React, { useState } from 'react'",
        "import React, { useState } from 'react'\nimport { useClasses } from '@/lib/mastersData'"
      );
      changed = true;
    }

    if (!content.includes('const classesData = useClasses()')) {
      content = content.replace(
        /export default function \w+\(\) \{/,
        "$& \n  const classesData = useClasses();"
      );
      changed = true;
    }

    // Replace Select Multiple Class
    content = content.replace(
      /<select([^>]*)>\s*<option>Select Multiple Class<\/option>\s*<\/select>/g,
      `<select$1>
                <option>Select Multiple Class</option>
                {classesData.map((c: any) => (
                  <option key={c.className} value={c.className}>{c.className}</option>
                ))}
              </select>`
    );
    // Replace Select Class
    content = content.replace(
      /<select([^>]*)>\s*<option>Select Class<\/option>\s*<\/select>/g,
      `<select$1>
                <option>Select Class</option>
                {classesData.map((c: any) => (
                  <option key={c.className} value={c.className}>{c.className}</option>
                ))}
              </select>`
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + filePath);
  }
}

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(dir);
console.log('Done');
