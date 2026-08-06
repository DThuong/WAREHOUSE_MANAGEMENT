const fs = require('fs');
const path = 'src/locales/ko.json';
const ko = JSON.parse(fs.readFileSync(path, 'utf8'));

if (ko.lineMachine && ko.lineMachine.modal) {
  ko.lineMachine.modal.managementCode = "관리 코드";
  ko.lineMachine.modal.managementCodePlaceholder = "관리 코드를 입력하세요...";
  ko.lineMachine.modal.modelMachine = "기계 모델";
  ko.lineMachine.modal.modelMachinePlaceholder = "기계 모델을 입력하세요...";
  ko.lineMachine.modal.seriNumber = "일련 번호";
  ko.lineMachine.modal.seriNumberPlaceholder = "일련 번호를 입력하세요...";
  ko.lineMachine.modal.dateInput = "입고일";
  
  ko.lineMachine.table = ko.lineMachine.table || {};
  ko.lineMachine.table.machineName = "기계 이름";
  ko.lineMachine.table.actions = "작업";
  ko.lineMachine.table.noMachines = "이 라인에 기계가 없습니다.";
  
  // also add some missing basic Korean translations if we just fell back to English
  ko.lineMachine.title = "라인 및 기계 관리";
  ko.lineMachine.addLine = "라인 추가";
  ko.lineMachine.addMachine = "기계 추가";
  ko.lineMachine.copyMachine = "기계 복사";
  ko.lineMachine.totalLine = "전체 라인";
  ko.lineMachine.totalMachine = "전체 기계";
  ko.lineMachine.search = "검색";
  ko.lineMachine.searchPlaceholder = "라인, 기계 검색...";
  ko.lineMachine.area = "구역";
  ko.lineMachine.all = "전체";
  ko.lineMachine.copy = "복사";
  ko.lineMachine.edit = "수정";
  ko.lineMachine.delete = "삭제";
  ko.lineMachine.viewDetailsShort = "상세 정보";
  ko.lineMachine.addMachineShort = "기계 추가";
}

fs.writeFileSync(path, JSON.stringify(ko, null, 2), 'utf8');
console.log('updated Korean translations');
