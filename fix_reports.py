import codecs
import re

path = 'd:\\WEB_PROJECT_DONGYANG\\WAREHOUSE\\warehouse-dashboard\\src\\views\\ReportsView.vue'

with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Translations
content = content.replace('T?ng nh?p kho', '{{ t(\'reports.custom.totalStockin\') }}')
content = content.replace('T?ng don hàng', '{{ t(\'reports.custom.totalOrder\') }}')
content = content.replace('T?ng SP nh?p', '{{ t(\'reports.custom.totalImportedProducts\') }}')
content = content.replace('header=\"Chi ti?t s?n ph?m\"', ':header=\"t(\'reports.custom.productDetail\')\"')

content = content.replace('label: \"Ti?n nh?p kho (VND)\"', 'label: t(\"reports.custom.stockinMoney\")')
content = content.replace('label: \"Ti?n don hàng (VND)\"', 'label: t(\"reports.custom.orderMoney\")')

content = content.replace('label === \"Ti?n nh?p kho (VND)\"', 'label === t(\"reports.custom.stockinMoney\")')
content = content.replace('label === \"Ti?n don hàng (VND)\"', 'label === t(\"reports.custom.orderMoney\")')

# Export Logic
new_export = '''const onExportExcel = async () => {
  exporting.value = true;
  try {
    const allStockins: any[] = [];
    const allOrders: any[] = [];
    for (const chunk of fullReportData.value) {
      for (const s of chunk.rawStockins || []) allStockins.push(s);
      for (const o of chunk.rawOrders || []) allOrders.push(o);
    }

    const stockinRows: any[] = [];
    allStockins.forEach((s: any) => {
      const sDetails = s.stockInDetails || [];
      if (sDetails.length === 0) {
        stockinRows.push({
          "Mã phi?u": s.id,
          "Ngày nh?p": formatDate(s.stockInDate),
          "Ngu?i t?o": s.account?.username || "-",
          "Tên s?n ph?m": "-",
          "S? lu?ng": 0,
          "Ðon v?": "-",
          "Ðon giá (VNÐ)": 0,
          "Thành ti?n (VNÐ)": 0,
        });
      } else {
        sDetails.forEach((d: any) => {
          stockinRows.push({
            "Mã phi?u": s.id,
            "Ngày nh?p": formatDate(s.stockInDate),
            "Ngu?i t?o": s.account?.username || "-",
            "Tên s?n ph?m": getItemName(d.item),
            "S? lu?ng": d.quantity || 0,
            "Ðon v?": d.item?.unit || "-",
            "Ðon giá (VNÐ)": d.item?.price || 0,
            "Thành ti?n (VNÐ)": (d.quantity || 0) * (d.item?.price || 0),
          });
        });
      }
    });

    const orderRows: any[] = [];
    allOrders.forEach((o: any) => {
      const oDetails = o.orderDetails || [];
      if (oDetails.length === 0) {
        orderRows.push({
          "Mã don": o.id,
          "Ngày d?t": formatDate(o.orderDate),
          "Ngu?i d?t": o.nameWorker || o.account?.username || "-",
          "B? ph?n": o.account?.department || "-",
          "Tên s?n ph?m": "-",
          "S? lu?ng": 0,
          "Ðon v?": "-",
          "Ðon giá (VNÐ)": 0,
          "Thành ti?n (VNÐ)": 0,
        });
      } else {
        oDetails.forEach((d: any) => {
          orderRows.push({
            "Mã don": o.id,
            "Ngày d?t": formatDate(o.orderDate),
            "Ngu?i d?t": o.nameWorker || o.account?.username || "-",
            "B? ph?n": o.account?.department || "-",
            "Tên s?n ph?m": getItemName(d.item),
            "S? lu?ng": d.orderQty || 0,
            "Ðon v?": d.item?.unit || "-",
            "Ðon giá (VNÐ)": d.item?.price || 0,
            "Thành ti?n (VNÐ)": (d.orderQty || 0) * (d.item?.price || 0),
          });
        });
      }
    });

    const wb = XLSX.utils.book_new();

    const wsStockin = XLSX.utils.json_to_sheet(
      stockinRows.length
        ? stockinRows
        : [{ "Mã phi?u": "", "Ngày nh?p": "", "Ngu?i t?o": "", "Tên s?n ph?m": "", "S? lu?ng": "", "Ðon v?": "", "Ðon giá (VNÐ)": "", "Thành ti?n (VNÐ)": "" }]
    );
    wsStockin["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 60 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsStockin, "Nh?p kho");

    const wsOrder = XLSX.utils.json_to_sheet(
      orderRows.length
        ? orderRows
        : [{ "Mã don": "", "Ngày d?t": "", "Ngu?i d?t": "", "B? ph?n": "", "Tên s?n ph?m": "", "S? lu?ng": "", "Ðon v?": "", "Ðon giá (VNÐ)": "", "Thành ti?n (VNÐ)": "" }]
    );
    wsOrder["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 60 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }];

    const areaSuffix = selectedArea.value === "ALL" ? "" : "_" + selectedArea.value;
    const fileName = "bao_cao" + areaSuffix + "_" + new Date().toISOString().slice(0, 10) + ".xlsx";
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    exporting.value = false;
  }
};'''

content = re.sub(r'const onExportExcel = async \(\) => \{.*?(?=\n\n|\Z)', new_export, content, flags=re.DOTALL)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
