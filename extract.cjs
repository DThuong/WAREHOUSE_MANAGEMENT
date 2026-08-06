const fs = require('fs');
const content = fs.readFileSync('src/views/LineMachineView.vue', 'utf8');
const regex = /t\(['"](lineMachine\.[^'"]+)['"]\)/g;
let match;
const keys = new Set();
while ((match = regex.exec(content)) !== null) {
  keys.add(match[1]);
}
console.log(Array.from(keys).join('\n'));
