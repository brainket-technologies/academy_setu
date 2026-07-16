const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'app/institute/teachers/add/page.tsx');
const destDir = path.join(__dirname, 'app/institute/teachers/[id]/edit');
const dest = path.join(destDir, 'page.tsx');

fs.mkdirSync(destDir, { recursive: true });

let content = fs.readFileSync(src, 'utf8');
content = content.replace(/AddTeacherPage/g, 'EditTeacherPage');
content = content.replace(/Add Teacher/g, 'Edit Teacher');
content = content.replace(/alert\('Teacher added successfully!'\)/g, "alert('Teacher updated successfully!')");

fs.writeFileSync(dest, content);
console.log('Done');
