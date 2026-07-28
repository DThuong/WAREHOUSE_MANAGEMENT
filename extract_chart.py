import os
import re

reports_path = 'src/views/ReportsView.vue'
chart_path = 'src/components/AnalysisChart.vue'

with open(reports_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract Template
template_start_marker = '      <!-- FILTER BAR (TOP) -->'
template_end_marker = '    <!-- Mobile dialog -->'

template_start_idx = content.find(template_start_marker)
template_end_idx = content.find(template_end_marker)

chart_template = content[template_start_idx:template_end_idx]

# Mobile dialog and the rest
mobile_dialog_idx = template_end_idx
export_dialog_end = content.find('</Dialog>', content.find('<!-- Export Excel Dialog -->')) + 9

# We need the Export dialog, Stockin Detail dialog, Order Detail dialog
# They are from '    <!-- Stockin Detail Dialog -->' to export_dialog_end
dialogs_start_marker = '    <!-- Stockin Detail Dialog -->'
dialogs_start_idx = content.find(dialogs_start_marker)

chart_dialogs = content[dialogs_start_idx:export_dialog_end]

reports_template_new = content[:template_start_idx] + '      <AnalysisChart />\n    </div>\n    </div>\n\n' + content[template_end_idx:dialogs_start_idx] + content[export_dialog_end:]

# Now script
script_start = content.find('<script setup lang=\"ts\">')
script_end = content.find('</script>')
script_content = content[script_start+24:script_end]

# For AnalysisChart, we need everything except useRouter and navigateToReport
imports = '''import { ref, computed, onMounted, onUnmounted } from "vue";
import Chart from "primevue/chart";
import ProgressSpinner from "primevue/progressspinner";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Card from "primevue/card";
import SelectButton from "primevue/selectbutton";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chip from "primevue/chip";
import RadioButton from "primevue/radiobutton";
import { useI18n } from "vue-i18n";
import { itemAPI } from "@/services/itemAPI";
import { stockinAPI } from "@/services/stockinAPI";
import { orderAPI } from "@/services/orderAPI";
import { useDashboardStore, type AreaKey } from "@/stores/dashboard";
import * as XLSX from "xlsx";'''

body_start = script_content.find('const dashboardStore = useDashboardStore();')
# We also need isMobile inside AnalysisChart
body_content = script_content[body_start:]
# Remove the navigateToReport from body_content
nav_report_start = body_content.find('const navigateToReport =')
nav_report_end = body_content.find('};', nav_report_start) + 2
body_content = body_content[:nav_report_start] + body_content[nav_report_end:]

chart_script = f'''<script setup lang="ts">
{imports}

{body_content}
</script>'''

# For ReportsView, we keep only what's needed
reports_script = '''<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { useI18n } from "vue-i18n";
import AnalysisChart from "@/components/AnalysisChart.vue";

const router = useRouter();
const { t } = useI18n();

const isMobile = ref(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
const handleResize = () => { isMobile.value = window.innerWidth < 768; };
const showUnsupportedDialog = ref(false);
const navigateToReport = (type: string) => {
  if (isMobile.value) { showUnsupportedDialog.value = true; return; }
  router.push({ name: ${type.charAt(0).toUpperCase() + type.slice(1)}Report });
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>'''

# Style
style_start = content.find('<style scoped>')
style_content = content[style_start:]

# Write new ReportsView
new_reports = reports_template_new[:reports_template_new.find('<script')] + reports_script + '\n\n'
# ReportsView doesn't need the styles anymore, except maybe we keep an empty block or just delete it.
with open(reports_path, 'w', encoding='utf-8') as f:
    f.write(new_reports)

# Write AnalysisChart
chart_file_content = f'''<template>
{chart_template}
{chart_dialogs}
</template>

{chart_script}

{style_content}
'''
with open(chart_path, 'w', encoding='utf-8') as f:
    f.write(chart_file_content)

print("Extraction complete")
