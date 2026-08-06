const fs = require('fs');
const path = require('path');

// Fix locaes
const locales = ['vi.json', 'en.json', 'ko.json'];
const localePaths = locales.map(l => path.join(__dirname, 'src', 'locales', l));

const newCommonTranslations = {
  vi: {
    allLines: "Tất cả Line",
    noData: "Không có dữ liệu",
    loading: "Đang tải dữ liệu...",
    quantity: "Số lượng"
  },
  en: {
    allLines: "All Lines",
    noData: "No data",
    loading: "Loading...",
    quantity: "Quantity"
  },
  ko: {
    allLines: "모든 라인",
    noData: "데이터 없음",
    loading: "로딩 중...",
    quantity: "수량"
  }
};

localePaths.forEach((filePath, index) => {
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lang = index === 0 ? 'vi' : (index === 1 ? 'en' : 'ko');
    
    if (!data.common) data.common = {};

    Object.assign(data.common, newCommonTranslations[lang]);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated common in ${locales[index]}`);
  }
});

// Fix Vue file padding/margin & layout
const vueFilePath = path.join(__dirname, 'src', 'components', 'LineMachineOrderChart.vue');
if (fs.existsSync(vueFilePath)) {
  let content = fs.readFileSync(vueFilePath, 'utf8');
  
  // Fix grid layout
  content = content.replace(/class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"/g, 'class="flex flex-col md:flex-row gap-4 mb-4"');
  
  // Fix child cards of the grid to have flex-1
  content = content.replace(/class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-4"/g, 'class="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-4"');
  content = content.replace(/class="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-4 cursor-pointer hover:border-emerald-300 transition-colors"/g, 'class="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-start gap-4 cursor-pointer hover:border-emerald-300 transition-colors"');
  
  // Fix margin/padding > 4
  content = content.replace(/mb-6/g, 'mb-4');
  content = content.replace(/p-12/g, 'p-4');
  content = content.replace(/p-6/g, 'p-4');
  content = content.replace(/px-6/g, 'px-4');
  content = content.replace(/gap-6/g, 'gap-4');
  
  fs.writeFileSync(vueFilePath, content, 'utf8');
  console.log('Fixed UI in LineMachineOrderChart.vue');
}
