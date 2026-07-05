const fs = require('fs');
const dirs = ['daily', 'monthly', 'revenue', 'routes', 'yearly'];
dirs.forEach(d => {
  const content = fs.readFileSync(`app/(app)/reports/${d}/page.tsx`, 'utf8');
  console.log(`\n\n================= ${d} =================\n`);
  const lines = content.split('\n');
  console.log(lines.slice(0, 100).join('\n'));
});
