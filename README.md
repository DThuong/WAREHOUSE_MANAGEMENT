# Dashboard Quản Lý Kho

Dashboard quản lý kho hiện đại được xây dựng với **Vue.js 3**, **Pinia**, **Composition API**, **Vue Router**, và **PrimeVue**.

## Tính năng

### Dashboard Chính
- 4 stat cards hiển thị metrics chính (Sales, Purchase, Expenses, Invoice Due)
- 3 detailed stats cards với icons và thay đổi phần trăm
- **Sales vs Purchase Chart** - Line chart với animation mượt mà
- **Overall Information** - Stats cards cho Suppliers, Customers, Orders
- **Customer Overview** - Doughnut chart phân tích khách hàng mới/cũ
- **Top Selling Products** - List sản phẩm bán chạy nhất
- **Low Stock Products** - Cảnh báo sản phẩm tồn kho thấp
- **Recent Sales** - Đơn hàng gần đây với trạng thái

### Quản lý hàng tồn kho
- DataTable với pagination, sorting, filtering
- Hiển thị hình ảnh, thông tin chi tiết sản phẩm
- Badges cho trạng thái và số lượng tồn kho
- Actions: Edit, Delete

### Thêm sản phẩm
- Form validation hoàn chỉnh
- Upload hình ảnh (drag & drop)
- Dropdowns cho Category và Supplier
- Grid layout responsive

### Báo cáo
- Cards hiển thị các loại báo cáo
- Ready for implementation

### Nhà cung cấp & Khách hàng
- DataTable quản lý danh sách
- Avatar cho customers
- Badges phân loại (VIP, Regular)

## Design System

### Colors
- **Primary**: `#6366f1` (Indigo)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)
- **Info**: `#3b82f6` (Blue)

### Typography
- **Headings**: Plus Jakarta Sans (700-800)
- **Body**: Inter (300-600)

### Layout
- Sidebar: 280px fixed
- Navbar: 72px sticky
- Content: Max-width 1600px, centered
- Grid: 4 columns responsive

## Tech Stack

- **Vue.js 3** - Progressive JavaScript Framework
- **Pinia** - State Management
- **Vue Router** - Client-side routing
- **PrimeVue** - UI Component Library
- **Chart.js** - Charts & Visualizations
- **Vue-ChartJS** - Vue wrapper cho Chart.js
- **Vite** - Build tool

## Cài đặt

### 1. Clone project
```bash
cd warehouse-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5173`

### 4. Build for production
```bash
npm run build
```

### 5. Preview production build
```bash
npm run preview
```

## 📁 Cấu trúc thư mục

```
warehouse-dashboard/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable components
│   │   ├── MainLayout.vue
│   │   ├── StatCard.vue
│   │   ├── SalesChart.vue
│   │   ├── DoughnutChart.vue
│   │   ├── ProductList.vue
│   │   └── RecentSales.vue
│   ├── router/            # Vue Router configuration
│   │   └── index.js
│   ├── stores/            # Pinia stores
│   │   └── dashboard.js
│   ├── views/             # Page components
│   │   ├── DashboardView.vue
│   │   ├── InventoryView.vue
│   │   ├── AddProductView.vue
│   │   ├── ReportsView.vue
│   │   ├── SuppliersView.vue
│   │   └── CustomersView.vue
│   ├── App.vue            # Root component
│   ├── main.js            # Entry point
│   └── style.css          # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Các trang chính

1. **Dashboard** (`/`) - Trang chủ với overview metrics
2. **Inventory** (`/inventory`) - Quản lý hàng tồn kho
3. **Add Product** (`/add-product`) - Thêm sản phẩm mới
4. **Reports** (`/reports`) - Báo cáo và thống kê
5. **Suppliers** (`/suppliers`) - Quản lý nhà cung cấp
6. **Customers** (`/customers`) - Quản lý khách hàng

## Pinia Store

### Dashboard Store
```javascript
// State
stats                 // 4 stat cards chính
detailedStats         // 3 detailed stats
topProducts           // Top selling products
lowStockProducts      // Sản phẩm tồn kho thấp
recentSales           // Đơn hàng gần đây
overviewStats         // Suppliers, Customers, Orders
customerOverview      // First time vs Return customers

// Getters
totalRevenue          // Computed total revenue

// Actions
updateStats()         // Cập nhật stats
```

## Custom CSS Classes

```css
.stat-card            // Card cho statistics
.chart-container      // Container cho charts
.product-card         // Card cho product items
.nav-link             // Sidebar navigation links
.badge                // Status badges
.badge-success        // Green badge
.badge-warning        // Yellow badge
.badge-danger         // Red badge
.badge-info           // Blue badge
```

## Responsive Design

- **Desktop**: 1280px+ (4 columns)
- **Tablet**: 768px-1279px (2 columns)
- **Mobile**: <768px (1 column, collapsible sidebar)

## Performance

- **Lazy loading** cho routes
- **Code splitting** automatic bởi Vite
- **Tree shaking** loại bỏ unused code
- **CSS optimization** với custom properties

## Tính năng tiếp theo (TODO)

- [ ] Authentication & Authorization
- [ ] Real-time updates với WebSocket
- [ ] Export data to Excel/PDF
- [ ] Advanced filtering & search
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Mobile app với Capacitor

## Notes

- Tất cả data hiện tại là **mock data**
- Cần kết nối với backend API để lấy real data
- Charts sử dụng Chart.js 4 (latest version)
- PrimeVue theme: Lara Light Indigo
- Icons: PrimeIcons

