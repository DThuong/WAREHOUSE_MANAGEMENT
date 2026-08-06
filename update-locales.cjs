const fs = require('fs');
const path = require('path');

const locales = ['vi.json', 'en.json', 'ko.json'];
const localePaths = locales.map(l => path.join(__dirname, 'src', 'locales', l));

const newTranslations = {
  vi: {
    tabs: {
      lineMachineChart: "Phân tích Line & Máy"
    },
    insights: {
      topQuantity: "Tiêu thụ nhiều vật tư nhất",
      bottomQuantity: "Tiêu thụ ít vật tư nhất",
      topMoney: "Tiêu thụ nhiều tiền nhất"
    }
  },
  en: {
    tabs: {
      lineMachineChart: "Line & Machine Analysis"
    },
    insights: {
      topQuantity: "Highest Material Usage",
      bottomQuantity: "Lowest Material Usage",
      topMoney: "Highest Cost Consumption"
    }
  },
  ko: {
    tabs: {
      lineMachineChart: "라인 및 기계 분석"
    },
    insights: {
      topQuantity: "최고 자재 사용량",
      bottomQuantity: "최저 자재 사용량",
      topMoney: "최고 비용 소비"
    }
  }
};

localePaths.forEach((filePath, index) => {
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lang = index === 0 ? 'vi' : (index === 1 ? 'en' : 'ko');
    
    if (!data.dashboard) data.dashboard = {};
    if (!data.dashboard.tabs) data.dashboard.tabs = {};
    if (!data.dashboard.insights) data.dashboard.insights = {};

    Object.assign(data.dashboard.tabs, newTranslations[lang].tabs);
    Object.assign(data.dashboard.insights, newTranslations[lang].insights);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locales[index]}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
