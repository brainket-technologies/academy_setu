export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const directoryToSearch = path.join(process.cwd(), 'app');

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
  let changedFiles: string[] = []

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace all instances of indigo- with indigo-
    content = content.replace(/indigo-/g, 'indigo-');
    
    // Some hex colors that might still be lingering
    content = content.replace(/indigo-600/gi, 'indigo-600');
    content = content.replace(/indigo-600/gi, 'indigo-600');
    content = content.replace(/indigo-700/gi, 'indigo-700');
    content = content.replace(/indigo-600/gi, 'indigo-600');
    // Also emerald if they used emerald for primary actions
    // But I will leave emerald alone in case it's used for success states.

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      changedFilesCount++;
      changedFiles.push(file)
    }
  });

  return NextResponse.json({ success: true, changedFilesCount, changedFiles })
}
