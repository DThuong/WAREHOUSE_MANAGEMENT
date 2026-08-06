const fs = require('fs');

const vi = JSON.parse(fs.readFileSync('src/locales/vi.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const ko = JSON.parse(fs.readFileSync('src/locales/ko.json', 'utf8'));

Object.assign(vi.lineMachine.analytics, {
  machineLabel: "MACHINE",
  selectMachine: "Chọn máy...",
  itemTypes: "loại VT",
  scanning: "Đang quét...",
  totalItems: "Tổng: {count} loại VT",
  totalUsed: "Tổng sử dụng: {count}"
});

Object.assign(en.lineMachine.analytics, {
  machineLabel: "MACHINE",
  selectMachine: "Select machine...",
  itemTypes: "item types",
  scanning: "Scanning...",
  totalItems: "Total: {count} items",
  totalUsed: "Total used: {count}"
});

Object.assign(ko.lineMachine.analytics, {
  machineLabel: "기계",
  selectMachine: "기계 선택...",
  itemTypes: "개의 품목",
  scanning: "스캔 중...",
  totalItems: "총 {count}개의 품목",
  totalUsed: "총 사용량: {count}"
});

fs.writeFileSync('src/locales/vi.json', JSON.stringify(vi, null, 2), 'utf8');
fs.writeFileSync('src/locales/en.json', JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync('src/locales/ko.json', JSON.stringify(ko, null, 2), 'utf8');

console.log('Successfully updated analytics translations');
