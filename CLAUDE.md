# ReportsView — Refactor Plan v2

## Vấn đề hiện tại
- Gọi 1 lần duy nhất từ `01/01` → `31/12` → lãng phí, không xem được dữ liệu linh hoạt
- closingStock Tuần/Tháng tính sai vì lastDay không đủ tất cả items
- Không thể xem ngày/tuần cũ hơn mặc định

---

## Giải pháp: Date range picker + filter Ngày/Tuần/Tháng

### UI
```
[From: 01/03/2026] [To: 31/03/2026]    [Ngày] [Tuần] [Tháng]
                                        ↑ chỉ group lại, không gọi API
↑ đổi → gọi API lại
```

### Default range khi đổi Time filter
| Filter | Default fromDate | Default toDate |
|---|---|---|
| Ngày | 7 ngày trước | Hôm nay |
| Tuần | T2 của tuần cách 6 tuần | CN tuần hiện tại |
| Tháng | 01/01 năm nay | 31/12 năm nay |

---

## Khi nào gọi API

| Trigger | Gọi API? | Lý do |
|---|---|---|
| Mount lần đầu | ✅ Có | Chưa có data |
| User đổi fromDate/toDate | ✅ Có | Range thay đổi |
| Đổi Time filter (Ngày/Tuần/Tháng) | ✅ Có | Reset default range + gọi API mới |
| Đổi Total → Items trend | ❌ Không | Cùng rawData, group khác |
| Đổi item trong Items trend | ❌ Không | Cùng rawData, filter itemId khác |

---

## Tính closingStock đúng

Thay thế `lastDay.items.reduce(closingStock)` bằng công thức kế toán:

### `computeClosingStockAt(toDate)` — Total trend
```
1. Với mỗi item, lấy openingStock lần ĐẦU TIÊN xuất hiện trong rawData
2. Cộng dồn totalStockIn - totalOrdered từ đầu rawData đến toDate
→ Tổng tồn kho tại cuối toDate (đúng cho mọi chunk)
```

### `computeItemClosingStockAt(toDate, itemId)` — Items trend
```
1. Lấy openingStock lần đầu item đó xuất hiện trong rawData
2. Cộng dồn totalStockIn - totalOrdered của item đó đến toDate
→ Tồn kho item tại cuối toDate
```

---

## State mới

```ts
// Thêm vào state
const fromDate = ref<Date>(...)   // user chọn hoặc default
const toDate = ref<Date>(...)     // user chọn hoặc default
```

---

## Plan chi tiết từng bước

### Bước 1 — Thêm `getDefaultRange(type)`
```ts
// Trả về default { fromDate, toDate } cho từng filter
getDefaultRange("Ngày")  → { 7 ngày trước 00:00, hôm nay 23:59 }
getDefaultRange("Tuần")  → { T2 tuần -6 00:00, CN tuần này 23:59 }
getDefaultRange("Tháng") → { 01/01 năm nay 00:00, 31/12 23:59 }
```

### Bước 2 — Thêm Calendar UI (fromDate/toDate)
```html
<Calendar v-model="fromDate" @date-select="onRangeChange" />
<Calendar v-model="toDate"   @date-select="onRangeChange" />
```

### Bước 3 — Sửa event handlers
```ts
onTimeChange() → {
  // Reset về default range của filter mới
  const range = getDefaultRange(selectedTime.value)
  fromDate.value = range.fromDate
  toDate.value   = range.toDate
  loadReportData()   // gọi API với range mới
}

onRangeChange() → loadReportData()   // user tự chọn range
onTrendChange() → buildChartFromRawData()   // KHÔNG gọi API
onItemChange()  → buildChartFromRawData()   // KHÔNG gọi API
```

### Bước 4 — Sửa `loadReportData`
```ts
loadReportData() → {
  rawData = await getItemRange(fromDate, toDate)  // dùng fromDate/toDate state
  buildChartFromRawData()
}
```

### Bước 5 — Thêm 2 hàm compute closingStock
```ts
computeClosingStockAt(toDate)              // Total trend
computeItemClosingStockAt(toDate, itemId)  // Items trend
```

### Bước 6 — Sửa `buildChartFromRawData`
```ts
// Thay lastDay.items.reduce(closingStock) bằng:
if (isTotal) {
  closingStock = computeClosingStockAt(chunk.toDate)
} else {
  closingStock = computeItemClosingStockAt(chunk.toDate, trackedId)
}
```

### Bước 7 — Sửa `generateTimeChunks`
```ts
// Ngày: tạo chunk cho từng ngày trong range fromDate→toDate (không cố định 7 ngày)
// Tuần: tạo chunk cho từng tuần trong range
// Tháng: tạo chunk cho từng tháng trong range
// → Chunks tự động theo range user chọn
```

---

## Ví dụ flow

```
User chọn filter "Ngày":
  → default range: 24/03 → 30/03
  → gọi API getItemRange(24/03, 30/03)
  → generateTimeChunks("Ngày") tạo 7 chunks: 24/03, 25/03, ..., 30/03
  → buildChartFromRawData() group theo từng ngày

User đổi fromDate = 01/03:
  → gọi API getItemRange(01/03, 30/03)
  → generateTimeChunks("Ngày") tạo 30 chunks: 01/03, 02/03, ..., 30/03
  → buildChartFromRawData() group theo từng ngày

User đổi filter "Tuần" (giữ nguyên fromDate=01/03, toDate=30/03):
  → default range reset: T2 6 tuần trước → CN tuần này
  → gọi API getItemRange(range mới)
  → generateTimeChunks("Tuần") tạo chunks theo tuần

User đổi "Total" → "Items trend":
  → KHÔNG gọi API
  → buildChartFromRawData() với rawData cũ, filter theo itemId
```

---

## Lưu ý

- `generateTimeChunks` phải dùng `fromDate`/`toDate` state thay vì hardcode
- Chunks có thể nhiều hơn 7 (nếu user chọn range rộng) → chart scroll hoặc compress
- `computeClosingStockAt` scan từ đầu rawData → chính xác vì rawData đã đúng range
- Không cần sửa template DataTable, itemAPI, types

---

## File cần sửa
- `src/views/ReportsView.vue` — script setup + thêm Calendar UI vào toolbar