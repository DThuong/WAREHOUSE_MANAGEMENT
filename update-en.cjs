const fs = require('fs');

const engPath = 'src/locales/en.json';
const koPath = 'src/locales/ko.json';

const engData = JSON.parse(fs.readFileSync(engPath, 'utf8'));
const koData = JSON.parse(fs.readFileSync(koPath, 'utf8'));

const engLineMachine = {
  title: "Line & Machine Management",
  subtitle: "Manage production lines and machines",
  addLine: "Add Line",
  addMachine: "Add Machine",
  copyMachine: "Copy Machine",
  totalLine: "Total Lines",
  totalMachine: "Total Machines",
  search: "Search",
  searchPlaceholder: "Search lines, machines...",
  area: "Area",
  all: "All",
  loading: "Loading data...",
  noData: "No data",
  noDataHint: "No line data available, please add a new line",
  lineListTitle: "Line List",
  expandAll: "Expand All",
  collapseAll: "Collapse All",
  viewDetailsShort: "Details",
  addMachineShort: "Add Machine",
  copy: "Copy",
  edit: "Edit",
  delete: "Delete",
  table: {
    machineName: "MACHINE NAME",
    actions: "ACTIONS",
    noMachines: "No machines in this line."
  },
  analytics: {
    button: "Analytics",
    title: "Material Usage by Machine",
    fromDate: "From Date",
    toDate: "To Date",
    apply: "Apply",
    reset: "Reset",
    colItemName: "Item Name",
    colArea: "Area",
    colStock: "In Stock",
    colUsed: "Used",
    colOrderCount: "Order Count",
    loading: "Analyzing data...",
    empty: "No material usage data.",
    loadError: "Error loading analytics"
  },
  modal: {
    addLine: "Add New Line",
    editLine: "Edit Line",
    addLineHint: "Create a new line for the area",
    editLineHint: "Update line information",
    close: "Close",
    lineName: "Line Name",
    lineNamePlaceholder: "Enter line name...",
    area: "Area Part",
    cancel: "Cancel",
    saving: "Saving...",
    save: "Save",
    addMachine: "Add Machine",
    editMachine: "Edit Machine",
    machineHint: "Select the line this machine belongs to.",
    machineName: "Machine Name",
    machineNamePlaceholder: "Enter machine name...",
    belongsToLine: "Belongs to Line",
    managementCode: "Management Code",
    managementCodePlaceholder: "Enter management code...",
    modelMachine: "Machine Model",
    modelMachinePlaceholder: "Enter machine model...",
    seriNumber: "Serial Number",
    seriNumberPlaceholder: "Enter serial number...",
    dateInput: "Import Date"
  },
  copyModal: {
    title: "Copy Machines",
    hint: "Copy machines from one line to another",
    sourceLine: "Source Line",
    machinesSuffix: "machines",
    selecting: "Selecting",
    machineUnit: "machines",
    copyListTitle: "Copy List",
    noSourceMachines: "No machines available",
    summary: "Summary",
    copyFrom: "From:",
    to: "To:",
    targetLinesSuffix: "target lines",
    newMachinesEstimate: "new machines will be created",
    targetLine: "Target Line",
    targetLineHint: "Select one or more target lines",
    selectAll: "Select All",
    clearSelection: "Clear",
    copying: "Copying...",
    copyAction: "Proceed to Copy"
  },
  confirmModal: {
    cancel: "Cancel",
    deleting: "Deleting...",
    delete: "Delete"
  },
  deleteConfirm: {
    noSourceLine: "Source line not found.",
    confirmLineNoMachines: "Are you sure you want to delete this line?",
    confirmMachineMessage: "Are you sure you want to delete this machine?"
  },
  toast: {
    loadErrorTitle: "Load Error",
    loadErrorDetail: "Error loading lines and machines.",
    notRefreshedTitle: "Refresh Error",
    notRefreshedDetail: "Cannot refresh data.",
    missingInfoTitle: "Missing Information",
    missingLineName: "Please enter line name.",
    missingLineIdTitle: "ID Error",
    missingLineIdDetail: "Line ID not found.",
    addLineSuccessTitle: "Line added successfully",
    updateLineSuccessTitle: "Line updated successfully",
    addLineFailTitle: "Error adding line",
    updateLineFailTitle: "Error updating line",
    checkInfoRetry: "Please check information and retry.",
    noLineTitle: "Line not found",
    noLineDetail: "Cannot identify target line.",
    missingMachineName: "Please enter machine name.",
    missingLineSelect: "Please select a line.",
    missingMachineIdTitle: "ID Error",
    missingMachineIdDetail: "Machine ID not found.",
    addMachineSuccessTitle: "Machine added successfully",
    updateMachineSuccessTitle: "Machine updated successfully",
    addMachineFailTitle: "Error adding machine",
    updateMachineFailTitle: "Error updating machine",
    notEnoughLinesTitle: "Not enough lines",
    notEnoughLinesDetail: "Need at least 2 lines to copy.",
    noSourceLineTitle: "Source line not found",
    noSourceLineDetail: "Source line does not exist.",
    sourceNoMachinesTitle: "Source line empty",
    sourceNoMachinesDetail: "No machines to copy.",
    noTargetLineTitle: "Target line not selected",
    noTargetLineDetail: "Please select at least 1 target line.",
    noNewMachinesTitle: "No new machines",
    noNewMachinesDetail: "No machines were copied.",
    copySuccessTitle: "Copy successful",
    copyIncompleteTitle: "Copy incomplete",
    deleteLineSuccessTitle: "Line deleted successfully",
    deleteMachineSuccessTitle: "Machine deleted successfully",
    deleteLineFailTitle: "Error deleting line",
    deleteMachineFailTitle: "Error deleting machine",
    deleteFailDetail: "An error occurred during deletion."
  }
};

engData.lineMachine = engLineMachine;
koData.lineMachine = engLineMachine; // Fallback to English for Korean for now

fs.writeFileSync(engPath, JSON.stringify(engData, null, 2), 'utf8');
fs.writeFileSync(koPath, JSON.stringify(koData, null, 2), 'utf8');
console.log('en.json and ko.json updated!');
