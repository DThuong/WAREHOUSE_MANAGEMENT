import re

dash_path = 'src/views/DashboardView.vue'

with open(dash_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Tab 1: Biểu đồ phân tích (AnalysisChart)
# Tab 2: Cảnh báo tồn kho
# Tab 3: Top vật tư được xuất kho nhiều nhất

# We will replace everything from <!-- Alerts tab --> to </TabView>
alerts_start = content.find('<!-- Alerts tab -->')
tabview_end = content.find('</TabView>', alerts_start)

# Extract Alerts tab content
alerts_end = content.find('<!-- Activity tab -->', alerts_start)
alerts_content = content[alerts_start:alerts_end]

# Extract Top Ordered Items from Activity tab
top_ordered_start = content.find('<article class="panel list-panel wide">', alerts_end)
top_ordered_end = content.find('</article>', top_ordered_start) + 10
top_ordered_content = content[top_ordered_start:top_ordered_end]

new_tabs = f'''<!-- Analysis Chart Tab -->
          <TabPanel :header="t('dashboard.tabs.charts')">
            <AnalysisChart />
          </TabPanel>

          {alerts_content}
          <!-- Top Ordered Tab -->
          <TabPanel :header="t('dashboard.activity.topOrdered')">
            {top_ordered_content}
          </TabPanel>
        '''

content = content[:alerts_start] + new_tabs + content[tabview_end:]

# Add AnalysisChart import
import_marker = 'import LineChart from "@/components/LineChart.vue";'
if import_marker in content:
    content = content.replace(import_marker, 'import LineChart from "@/components/LineChart.vue";\nimport AnalysisChart from "@/components/AnalysisChart.vue";')
else:
    # find import MainLayout
    content = content.replace('import MainLayout from "@/components/MainLayout.vue";', 'import MainLayout from "@/components/MainLayout.vue";\nimport AnalysisChart from "@/components/AnalysisChart.vue";')

with open(dash_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("DashboardView updated successfully")
