const fs = require('fs');

const vi = JSON.parse(fs.readFileSync('src/locales/vi.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const ko = JSON.parse(fs.readFileSync('src/locales/ko.json', 'utf8'));

if (!vi.lineMachine) vi.lineMachine = {};
if (!en.lineMachine) en.lineMachine = {};
if (!ko.lineMachine) ko.lineMachine = {};

vi.lineMachine.machineCount = '{count} máy';
en.lineMachine.machineCount = '{count} machines';
ko.lineMachine.machineCount = '{count} 대';

fs.writeFileSync('src/locales/vi.json', JSON.stringify(vi, null, 2), 'utf8');
fs.writeFileSync('src/locales/en.json', JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync('src/locales/ko.json', JSON.stringify(ko, null, 2), 'utf8');

console.log('Successfully updated machineCount in vi, en, ko');
