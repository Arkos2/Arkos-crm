const fs = require('fs');
const path = require('path');

const files = [
  'app/api/agents/analyst/route.ts',
  'app/api/agents/coach/route.ts',
  'app/api/agents/followup/suggest/route.ts',
  'app/api/agents/prospector/enrich/route.ts',
  'app/api/agents/prospector/search/route.ts',
  'app/api/agents/qualifier/route.ts',
  'app/api/agents/writer/route.ts',
  'lib/ai/agent.ts'
];

// Move gemini.ts if it was put in src/lib but the app doesn't use src
if (fs.existsSync('src/lib/gemini.ts') && fs.existsSync('lib') && fs.existsSync('app')) {
  fs.renameSync('src/lib/gemini.ts', 'lib/gemini.ts');
  console.log('Moved src/lib/gemini.ts to lib/gemini.ts');
}

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix rawText redeclaration
  content = content.replace(/const rawText =\s*response\.content\[0\]\.type === ['"]text['"] \? response\.content\[0\]\.text : ['"](?:\[\]|\{\})?['"];/g, '');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed redeclaration in', f);
});
