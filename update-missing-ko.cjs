const fs = require('fs');
const viPath = 'src/locales/vi.json';
const enPath = 'src/locales/en.json';
const koPath = 'src/locales/ko.json';

const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ko = JSON.parse(fs.readFileSync(koPath, 'utf8'));

// 1. Add lineListHint to all
if (vi.lineMachine) vi.lineMachine.lineListHint = 'Hiển thị {count} line';
if (en.lineMachine) en.lineMachine.lineListHint = 'Displaying {count} lines';
if (ko.lineMachine) ko.lineMachine.lineListHint = '{count}개의 라인이 있습니다';

// 2. Fix the rest of Korean translations that are falling back to English
if (ko.lineMachine) {
  ko.lineMachine.subtitle = "생산 라인 및 기계 관리";
  ko.lineMachine.loading = "데이터를 불러오는 중...";
  ko.lineMachine.noData = "데이터 없음";
  ko.lineMachine.noDataHint = "라인 데이터가 없습니다. 새 라인을 추가해주세요.";
  ko.lineMachine.lineListTitle = "라인 목록";
  ko.lineMachine.expandAll = "모두 펼치기";
  ko.lineMachine.collapseAll = "모두 접기";
  ko.lineMachine.viewDetailsShort = "상세 정보";
  
  // Make sure table translations exist
  if (!ko.lineMachine.table) ko.lineMachine.table = {};
  ko.lineMachine.table.machineName = "기계 이름";
  ko.lineMachine.table.actions = "작업";
  ko.lineMachine.table.noMachines = "이 라인에 기계가 없습니다.";

  // Make sure analytics exist
  if (!ko.lineMachine.analytics) ko.lineMachine.analytics = {};
  ko.lineMachine.analytics.button = "통계";
  ko.lineMachine.analytics.title = "기계별 자재 사용량";
  ko.lineMachine.analytics.fromDate = "시작 날짜";
  ko.lineMachine.analytics.toDate = "종료 날짜";
  ko.lineMachine.analytics.apply = "적용";
  ko.lineMachine.analytics.reset = "초기화";
  ko.lineMachine.analytics.colItemName = "자재 이름";
  ko.lineMachine.analytics.colArea = "구역";
  ko.lineMachine.analytics.colStock = "재고";
  ko.lineMachine.analytics.colUsed = "사용량";
  ko.lineMachine.analytics.colOrderCount = "주문 횟수";
  ko.lineMachine.analytics.loading = "데이터 분석 중...";
  ko.lineMachine.analytics.empty = "자재 사용 데이터가 없습니다.";
  ko.lineMachine.analytics.loadError = "통계를 불러오는 중 오류 발생";

  // Make sure copyModal exist
  if (!ko.lineMachine.copyModal) ko.lineMachine.copyModal = {};
  ko.lineMachine.copyModal.title = "기계 복사";
  ko.lineMachine.copyModal.hint = "한 라인에서 다른 라인으로 기계 복사";
  ko.lineMachine.copyModal.sourceLine = "원본 라인";
  ko.lineMachine.copyModal.machinesSuffix = "개의 기계";
  ko.lineMachine.copyModal.selecting = "선택 중";
  ko.lineMachine.copyModal.machineUnit = "개의 기계";
  ko.lineMachine.copyModal.copyListTitle = "복사 목록";
  ko.lineMachine.copyModal.noSourceMachines = "복사할 기계가 없습니다.";
  ko.lineMachine.copyModal.summary = "요약";
  ko.lineMachine.copyModal.copyFrom = "원본:";
  ko.lineMachine.copyModal.to = "대상:";
  ko.lineMachine.copyModal.targetLinesSuffix = "개의 대상 라인";
  ko.lineMachine.copyModal.newMachinesEstimate = "개의 새 기계가 생성됩니다.";
  ko.lineMachine.copyModal.targetLine = "대상 라인";
  ko.lineMachine.copyModal.targetLineHint = "하나 이상의 대상 라인을 선택하세요.";
  ko.lineMachine.copyModal.selectAll = "전체 선택";
  ko.lineMachine.copyModal.clearSelection = "선택 취소";
  ko.lineMachine.copyModal.copying = "복사 중...";
  ko.lineMachine.copyModal.copyAction = "복사 진행";
}

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(koPath, JSON.stringify(ko, null, 2), 'utf8');

console.log('Successfully added missing translations and full ko.json update');
