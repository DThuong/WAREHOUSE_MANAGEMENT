# 🚀 Quick Start Guide

## Bắt đầu nhanh trong 3 bước

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Chạy Development Server
```bash
npm run dev
```

Truy cập: **http://localhost:5173**

### Bước 3: Khám phá Dashboard! 🎉

---

## 📸 Screenshots

### Dashboard Chính
- 4 Stat Cards: Sales, Purchase, Expenses, Invoice Due
- Sales vs Purchase Chart (Line Chart)
- Customer Overview (Doughnut Chart)
- Top Selling Products
- Low Stock Products
- Recent Sales

### Inventory Management
- DataTable với pagination
- Sort, filter products
- Edit/Delete actions

### Add Product
- Form đầy đủ
- Upload images
- Dropdown cho Category & Supplier

---

## 🎨 Màu sắc chính

```css
Primary (Indigo):  #6366f1
Success (Green):   #10b981
Warning (Amber):   #f59e0b
Danger (Red):      #ef4444
Info (Blue):       #3b82f6
```

---

## 📦 Tech Stack

- ✅ Vue.js 3
- ✅ Pinia (State Management)
- ✅ Vue Router
- ✅ PrimeVue (UI Components)
- ✅ Chart.js (Charts)
- ✅ Composition API
- ✅ Vite (Build Tool)

---

## 🗂️ Structure

```
src/
├── components/       # Reusable components
│   ├── MainLayout.vue
│   ├── StatCard.vue
│   ├── SalesChart.vue
│   └── ...
├── views/           # Pages
│   ├── DashboardView.vue
│   ├── InventoryView.vue
│   └── ...
├── stores/          # Pinia stores
│   └── dashboard.js
├── router/          # Vue Router
│   └── index.js
└── style.css        # Global styles
```

---

## 🔗 Routes

| Path | Component | Mô tả |
|------|-----------|-------|
| `/` | DashboardView | Dashboard chính |
| `/inventory` | InventoryView | Quản lý hàng tồn kho |
| `/add-product` | AddProductView | Thêm sản phẩm mới |
| `/reports` | ReportsView | Báo cáo |
| `/suppliers` | SuppliersView | Nhà cung cấp |
| `/customers` | CustomersView | Khách hàng |

---

## 💡 Tips

### Thay đổi theme PrimeVue
Trong `main.js`:
```javascript
import 'primevue/resources/themes/lara-dark-indigo/theme.css' // Dark theme
```

### Customize màu sắc
Trong `style.css`, thay đổi CSS variables:
```css
:root {
  --primary-color: #your-color;
  --success-color: #your-color;
}
```

### Add new route
1. Tạo component trong `src/views/`
2. Add route trong `src/router/index.js`
3. Add navigation link trong `MainLayout.vue`

---

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Thay đổi port trong vite.config.js
export default defineConfig({
  server: {
    port: 3000 // your port
  }
})
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### PrimeVue components không hiển thị
Check xem đã import đúng component trong `main.js` chưa.

---

## 📚 Resources

- [Vue.js Docs](https://vuejs.org/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [PrimeVue Docs](https://primevue.org/)
- [Chart.js Docs](https://www.chartjs.org/)

---

**Happy Coding! 🚀**
