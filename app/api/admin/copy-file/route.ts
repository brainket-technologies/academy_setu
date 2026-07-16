import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const src = path.join(process.cwd(), 'app/institute/teachers/add/page.tsx');
    const destDir = path.join(process.cwd(), 'app/institute/teachers/[id]/edit');
    const dest = path.join(destDir, 'page.tsx');

    fs.mkdirSync(destDir, { recursive: true });

    let content = fs.readFileSync(src, 'utf8');
    content = content.replace(/AddTeacherPage/g, 'EditTeacherPage');
    content = content.replace(/Add Teacher/g, 'Edit Teacher');
    content = content.replace(/alert\('Teacher added successfully!'\)/g, "alert('Teacher updated successfully!')");

    fs.writeFileSync(dest, content);
    return NextResponse.json({ success: true, dest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
