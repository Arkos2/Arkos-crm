const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app').concat(walk('components')).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
let found = false;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  if (content.includes('onClick') && !content.includes('"use client"') && !content.includes("'use client'")) {
    console.log("Missing use client in:", f);
    found = true;
  }
});

if (!found) {
  console.log("All good!");
}
