import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const directoryToSearch = path.join(process.cwd(), 'app');

  const replacements = [
    { regex: /bg-\[indigo-600\]/g, replacement: 'bg-indigo-600' },
    { regex: /hover:bg-\[indigo-700\]/g, replacement: 'hover:bg-indigo-700' },
    { regex: /bg-\[indigo-600\]/g, replacement: 'bg-indigo-600' },
    { regex: /border-\[indigo-600\]/g, replacement: 'border-indigo-600' },
    { regex: /text-\[indigo-600\]/g, replacement: 'text-indigo-600' },
    { regex: /text-\[indigo-600\]/g, replacement: 'text-indigo-600' },
    { regex: /shadow-indigo-500\/10/g, replacement: 'shadow-indigo-500/10' },
    { regex: /focus:ring-indigo-500\/20/g, replacement: 'focus:ring-indigo-500/20' },
    { regex: /focus:ring-indigo-550\/20/g, replacement: 'focus:ring-indigo-500/20' },
    { regex: /focus:border-indigo-500/g, replacement: 'focus:border-indigo-500' },
    { regex: /focus:border-indigo-500/g, replacement: 'focus:border-indigo-500' },
    { regex: /hover:text-indigo-600/g, replacement: 'hover:text-indigo-600' },
    { regex: /hover:text-indigo-400/g, replacement: 'hover:text-indigo-400' },
    { regex: /text-indigo-600/g, replacement: 'text-indigo-600' },
    { regex: /text-indigo-400/g, replacement: 'text-indigo-400' },
    { regex: /text-indigo-500/g, replacement: 'text-indigo-500' },
    { regex: /bg-indigo-500/g, replacement: 'bg-indigo-500' },
    { regex: /bg-indigo-50/g, replacement: 'bg-indigo-50' },
    { regex: /border-indigo-500/g, replacement: 'border-indigo-500' }
  ];

  function walkDir(dir: string): string[] {
    let results: string[] = [];
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
  let changedFiles = []

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      changedFilesCount++;
      changedFiles.push(file)
    }
  });

  return NextResponse.json({ success: true, changedFilesCount, changedFiles, allFiles: files.slice(0, 10) })
}
