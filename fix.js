const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('@anthropic-ai/sdk')) return;

  // Replace import
  content = content.replace(/import Anthropic from ['"]@anthropic-ai\/sdk['"];?/g, 'import { analyzeText } from "@/lib/gemini";');
  
  // Remove anthropic instantiation
  content = content.replace(/const anthropic = new Anthropic\(\{\s*apiKey:\s*process\.env\.ANTHROPIC_API_KEY!?,?\s*\}\);?/g, '');
  
  // Replace messages.create block
  content = content.replace(/const response = await anthropic\.messages\.create\(\{[\s\S]*?system:\s*([^,]+),[\s\S]*?messages:\s*\[\{ role: ['"]user['"], content: (.*?) \}\],[\s\S]*?\}\);/g, 'const rawText = await analyzeText($1 + "\\n\\n" + $2);\n    const response = { usage: { input_tokens: 0, output_tokens: 0 } };');

  // Fix rawText parsing code
  content = content.replace(/const rawText =\s*response\.content\[0\]\.type === ['"]text['"] \? response\.content\[0\]\.text : ['"](?:\[\])?['"];/g, '');

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

const dirs = [
  'app/api/agents/analyst/route.ts',
  'app/api/agents/coach/route.ts',
  'app/api/agents/followup/suggest/route.ts',
  'app/api/agents/prospector/enrich/route.ts',
  'app/api/agents/prospector/search/route.ts',
  'app/api/agents/qualifier/route.ts',
  'app/api/agents/writer/route.ts',
  'lib/ai/agent.ts'
];

dirs.forEach(f => processFile(path.join(__dirname, f)));

// Also delete (2).ts files to avoid compilation issues
function deleteDuplicates(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      deleteDuplicates(fullPath);
    } else if (file.includes('(2)')) {
      fs.unlinkSync(fullPath);
      console.log('Deleted duplicate', fullPath);
    }
  }
}
deleteDuplicates(path.join(__dirname, 'app'));
deleteDuplicates(path.join(__dirname, 'lib'));
