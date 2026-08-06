const fs = require('fs');
const path = 'src/views/LineMachineView.vue';
let content = fs.readFileSync(path, 'utf8');

// replace without duplicates
content = content.replace(/tracking-wide text-slate-500(\s+whitespace-nowrap)?"/g, 'tracking-wide text-slate-500 whitespace-nowrap"');
content = content.replace(/table-fixed/g, 'table-auto');

fs.writeFileSync(path, content, 'utf8');
console.log('updated table classes');
