import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useItemStore } from "./itemStore";
import { useOrderStore } from "./orderStore";
import { useStockinStore } from "./stockinStore";
import { useLineMachineStore } from "./line_machine";
import type { Item } from "@/types/item.types";
import type { Order, OrderStatus } from "@/types/order.types";
import type { Stockin } from "@/types/stockin.types";
import type { Line, Machine } from "@/types/line_machine.types";

export type AreaKey = "ALL" | "SMD" | "MAINLINE";

interface StatItem {
  value: number;
}

interface DashboardStats {
  totalPurchase: StatItem;
  totalOrders: StatItem;
  totalStockins: StatItem;
  totalStock: StatItem;
}

interface StockStatusCount {
  normal: number;
  warning: number;
  low: number;
  critical: number;
  outOfStock: number;
  notConfigured: number;
  total: number;
}

interface TopItem {
  id: number;
  name: string;
  code: string;
  areaPart: AreaKey;
  totalOrdered: number;
  percentage: number;
  image: string;
  stockQty: number;
  safetyStock: number;
  unit: string;
}

interface LowStockItem {
  id: number;
  name: string;
  code: string;
  areaPart: AreaKey;
  stockQty: number;
  safetyStock: number;
  image: string;
  status: "critical" | "low" | "warning" | "out-of-stock" | "not-configured";
  unit: string;
}

interface RecentOrderItem {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  areaPart: AreaKey;
  totalItems: number;
  totalQty: number;
  workerName: string;
}

interface RecentStockinItem {
  id: number;
  stockInDate: string;
  areaPart: AreaKey;
  totalItems: number;
  totalQty: number;
  creatorName: string;
}

interface OrderStatusSummary {
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  total: number;
}

export interface AreaSummary {
  areaPart: AreaKey;
  totalItems: number;
  totalStockQty: number;
  totalStockValue: number;
  engineerItems: number;
  consumerItems: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  totalOrderQty: number;
  totalStockins: number;
  totalStockinQty: number;
  totalLines: number;
  totalMachines: number;
  linesWithoutMachine: number;
  stockStatus: StockStatusCount;
  totalOrderValue: number;
  totalOrderItems: number;
  shortageItems: number;
  shortageQty: number;
  shortageValue: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string | string[];
    borderWidth?: number;
    hoverOffset?: number;
    tension?: number;
    fill?: boolean;
  }>;
}

const AREA_VALUES: AreaKey[] = ["SMD", "MAINLINE"];

export const useDashboardStore = defineStore("dashboard", () => {
  const itemStore = useItemStore();
  const orderStore = useOrderStore();
  const stockinStore = useStockinStore();
  const lineMachineStore = useLineMachineStore();

  const selectedArea = ref<AreaKey>("ALL");

  // =========================
  // BASIC HELPERS
  // =========================

  const normalizeAreaPart = (value?: string | null): AreaKey | null => {
    if (!value) return null;

    const normalized = String(value)
      .trim()
      .replace(/\s+/g, "")
      .replace(/_/g, "")
      .replace(/-/g, "")
      .toUpperCase();

    if (normalized === "SMD") return "SMD";
    if (normalized === "MAINLINE" || normalized === "MAIN") return "MAINLINE";

    return null;
  };

  const formatCodeArea = (code?: string | null): AreaKey | null => {
    if (!code) return null;

    const upperCode = code.toUpperCase();

    if (upperCode.startsWith("SMD-") || upperCode.startsWith("SMD_")) {
      return "SMD";
    }

    if (
      upperCode.startsWith("MAINLINE-") ||
      upperCode.startsWith("MAINLINE_") ||
      upperCode.startsWith("MAIN-")
    ) {
      return "MAINLINE";
    }

    return null;
  };

  const getItemArea = (item?: Item | null): AreaKey => {
    if (!item) return "MAINLINE";

    return (
      normalizeAreaPart(item.areaPart) ||
      formatCodeArea(item.itemIndentifyId) ||
      "MAINLINE"
    );
  };

  const getOrderArea = (order?: Order | null): AreaKey => {
    if (!order) return "MAINLINE";

    return (
      normalizeAreaPart(order.account?.areaPart) ||
      normalizeAreaPart((order as any).areaPart) ||
      getItemArea(order.orderDetails?.[0]?.item) ||
      "MAINLINE"
    );
  };

  const getStockinArea = (stockin?: Stockin | null): AreaKey => {
    if (!stockin) return "MAINLINE";

    return (
      normalizeAreaPart(stockin.areaPart) ||
      getItemArea(stockin.stockInDetails?.[0]?.item) ||
      "MAINLINE"
    );
  };

  const getLineArea = (line?: Line | null): AreaKey => {
    if (!line) return "MAINLINE";
    return normalizeAreaPart(line.areaPart) || "MAINLINE";
  };

  const getMachineArea = (machine: Machine): AreaKey => {
    const line = lineMachineStore.lines.find(
      (line: { id: number }) => line.id === machine.lineId,
    );
    return getLineArea(line);
  };

  const isAreaMatch = (current: AreaKey, area: AreaKey) => {
    return current === "ALL" || current === area;
  };

  const getItemName = (item: Item): string => {
    return item.eng?.partname || item.com?.name || `Item #${item.id || "-"}`;
  };

  const getItemCode = (item: Item): string => {
    return (
      item.itemIndentifyId || `ITEM-${String(item.id || 0).padStart(5, "0")}`
    );
  };

  const getItemPrice = (item: Item): number => {
    const price = Number.parseFloat(String(item.price || "0"));
    return Number.isFinite(price) ? price : 0;
  };

  const getItemImageUrl = (item: Item): string => {
    if (!item.picture || item.picture.length === 0) {
      return "/placeholder-item.png";
    }

    const firstPicture = item.picture[0];

    if (firstPicture.startsWith("http")) {
      return firstPicture;
    }

    const baseUrl =
      import.meta.env.WAREHOUSE_URL ||
      import.meta.env.VITE_WAREHOUSE_URL ||
      import.meta.env.VUE_APP_WAREHOUSE_URL ||
      "";

    if (!baseUrl) return firstPicture;

    return `${baseUrl}/api/Item/image/${firstPicture}`;
  };

  const isEngineerItem = (item: Item): boolean => {
    const code = item.itemIndentifyId?.toUpperCase() || "";
    return Boolean(item.eng) || code.includes("-ENG-") || item.type === "ENG";
  };

  const isConsumerItem = (item: Item): boolean => {
    const code = item.itemIndentifyId?.toUpperCase() || "";
    return Boolean(item.com) || code.includes("-COM-") || item.type === "COM";
  };

  const getStockStatus = (
    item: Item,
  ):
    | "critical"
    | "low"
    | "warning"
    | "normal"
    | "out-of-stock"
    | "not-configured" => {
    const stockQty = Number(item.stockQty || 0);
    const saveQty = Number(item.saveQuantity || 0);

    if (stockQty === 0) return "out-of-stock";
    if (saveQty === 0) return "not-configured";
    if (stockQty >= saveQty) return "normal";

    const stockPercentage = (stockQty / saveQty) * 100;

    if (stockPercentage <= 25) return "critical";
    if (stockPercentage <= 50) return "low";

    return "warning";
  };

  const getItemsByArea = (area: AreaKey) => {
    return itemStore.items.filter((item) =>
      isAreaMatch(area, getItemArea(item)),
    );
  };

  const getOrdersByArea = (area: AreaKey) => {
    return orderStore.orders.filter((order) =>
      isAreaMatch(area, getOrderArea(order)),
    );
  };

  const getStockinsByArea = (area: AreaKey) => {
    return stockinStore.stockins.filter((stockin) =>
      isAreaMatch(area, getStockinArea(stockin)),
    );
  };

  const getLinesByArea = (area: AreaKey) => {
    return lineMachineStore.lines.filter((line: Line | null | undefined) =>
      isAreaMatch(area, getLineArea(line)),
    );
  };

  const getMachinesByArea = (area: AreaKey) => {
    return lineMachineStore.machines.filter((machine: Machine) =>
      isAreaMatch(area, getMachineArea(machine)),
    );
  };

  const getStockStatusCount = (items: Item[]): StockStatusCount => {
    const count: StockStatusCount = {
      normal: 0,
      warning: 0,
      low: 0,
      critical: 0,
      outOfStock: 0,
      notConfigured: 0,
      total: items.length,
    };

    for (const item of items) {
      const status = getStockStatus(item);

      if (status === "normal") count.normal += 1;
      if (status === "warning") count.warning += 1;
      if (status === "low") count.low += 1;
      if (status === "critical") count.critical += 1;
      if (status === "out-of-stock") count.outOfStock += 1;
      if (status === "not-configured") count.notConfigured += 1;
    }

    return count;
  };

  const buildAreaSummary = (area: AreaKey, month?: number, year?: number): AreaSummary => {
    const items = getItemsByArea(area);
    let orders = getOrdersByArea(area);
    let stockins = getStockinsByArea(area);
    const lines = getLinesByArea(area);
    const machines = getMachinesByArea(area);

    if (month !== undefined && year !== undefined) {
      orders = orders.filter((order) => {
        const orderDate = new Date(order.orderDate || (order as any).createdAt || new Date());
        return orderDate.getMonth() === month && orderDate.getFullYear() === year;
      });
      stockins = stockins.filter((stockin) => {
        const stockinDate = new Date(stockin.stockInDate || (stockin as any).createdAt || new Date());
        return stockinDate.getMonth() === month && stockinDate.getFullYear() === year;
      });
    }

    const totalStockQty = items.reduce(
      (sum, item) => sum + Number(item.stockQty || 0),
      0,
    );

    const totalStockValue = items.reduce((sum, item) => {
      return sum + Number(item.stockQty || 0) * getItemPrice(item);
    }, 0);

    const totalOrderQty = orders.reduce((sum, order) => {
      return (
        sum +
        (order.orderDetails || []).reduce((detailSum, detail) => {
          return detailSum + Number(detail.orderQty || 0);
        }, 0)
      );
    }, 0);

    const totalOrderValue = orders.reduce((sum, order) => {
      return (
        sum +
        (order.orderDetails || []).reduce((detailSum, detail) => {
          const price = detail.item?.price ? Number(detail.item.price) : 0;
          return detailSum + Number(detail.orderQty || 0) * price;
        }, 0)
      );
    }, 0);

    const orderedItemsSet = new Set<number>();
    orders.forEach(order => {
      (order.orderDetails || []).forEach(detail => {
        const itemId = detail.item?.id || detail.itemId;
        if (itemId) orderedItemsSet.add(itemId);
      });
    });
    const totalOrderItems = orderedItemsSet.size;

    let shortageItems = 0;
    let shortageQty = 0;
    let shortageValue = 0;

    items.forEach(item => {
      const stock = Number(item.stockQty || 0);
      const safe = Number(item.saveQuantity || 0);
      if (safe > 0 && stock < safe) {
        const missing = safe - stock;
        shortageItems += 1;
        shortageQty += missing;
        shortageValue += missing * getItemPrice(item);
      }
    });

    const totalStockinQty = stockins.reduce((sum, stockin) => {
      return (
        sum +
        (stockin.stockInDetails || []).reduce((detailSum, detail) => {
          return detailSum + Number(detail.quantity || 0);
        }, 0)
      );
    }, 0);

    const linesWithoutMachine = lines.filter((line) => {
      const machineCount =
        line.machines?.length ||
        lineMachineStore.machines.filter(
          (machine) => machine.lineId === line.id,
        ).length;

      return machineCount === 0;
    }).length;

    return {
      areaPart: area,
      totalItems: items.length,
      totalStockQty,
      totalStockValue,
      engineerItems: items.filter(isEngineerItem).length,
      consumerItems: items.filter(isConsumerItem).length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status === "Pending")
        .length,
      approvedOrders: orders.filter((order) => order.status === "Approved")
        .length,
      completedOrders: orders.filter((order) => order.status === "Completed")
        .length,
      rejectedOrders: orders.filter((order) => order.status === "Rejected")
        .length,
      totalOrderQty,
      totalStockins: stockins.length,
      totalStockinQty,
      totalLines: lines.length,
      totalMachines: machines.length,
      linesWithoutMachine,
      stockStatus: getStockStatusCount(items),
      totalOrderValue,
      totalOrderItems,
      shortageItems,
      shortageQty,
      shortageValue,
    };
  };

  // =========================
  // MAIN ANALYTICS
  // =========================

  const smdSummary = computed(() => buildAreaSummary("SMD"));
  const mainlineSummary = computed(() => buildAreaSummary("MAINLINE"));
  const allSummary = computed(() => buildAreaSummary("ALL"));

  const currentSummary = computed(() => {
    if (selectedArea.value === "SMD") return smdSummary.value;
    if (selectedArea.value === "MAINLINE") return mainlineSummary.value;
    return allSummary.value;
  });

  const areaSummaries = computed(() => ({
    SMD: smdSummary.value,
    MAINLINE: mainlineSummary.value,
  }));

  const dashboardStats = computed<DashboardStats>(() => ({
    totalPurchase: {
      value: currentSummary.value.totalStockValue,
    },
    totalOrders: {
      value: currentSummary.value.totalOrders,
    },
    totalStockins: {
      value: currentSummary.value.totalStockins,
    },
    totalStock: {
      value: currentSummary.value.totalItems,
    },
  }));

  const orderStatusSummary = computed<OrderStatusSummary>(() => ({
    pending: currentSummary.value.pendingOrders,
    approved: currentSummary.value.approvedOrders,
    completed: currentSummary.value.completedOrders,
    rejected: currentSummary.value.rejectedOrders,
    total: currentSummary.value.totalOrders,
  }));

  const lowStockCountByStatus = computed(() => ({
    normal: currentSummary.value.stockStatus.normal,
    critical: currentSummary.value.stockStatus.critical,
    low: currentSummary.value.stockStatus.low,
    warning: currentSummary.value.stockStatus.warning,
    outOfStock: currentSummary.value.stockStatus.outOfStock,
    notConfigured: currentSummary.value.stockStatus.notConfigured,
    total:
      currentSummary.value.stockStatus.critical +
      currentSummary.value.stockStatus.low +
      currentSummary.value.stockStatus.warning +
      currentSummary.value.stockStatus.outOfStock,
  }));

  const overviewStats = computed(() => ({
    totalItems: currentSummary.value.totalItems,
    totalStockins: currentSummary.value.totalStockins,
    totalOrders: currentSummary.value.totalOrders,
    totalLines: currentSummary.value.totalLines,
    totalMachines: currentSummary.value.totalMachines,
    lowStockCount: lowStockCountByStatus.value.total,
  }));

  // =========================
  // LISTS
  // =========================

  const buildLowStockList = (
    area: AreaKey,
    statuses: Array<ReturnType<typeof getStockStatus>>,
  ): LowStockItem[] => {
    return getItemsByArea(area)
      .filter((item) => statuses.includes(getStockStatus(item)))
      .map((item) => ({
        id: item.id || 0,
        name: getItemName(item),
        code: getItemCode(item),
        areaPart: getItemArea(item),
        stockQty: Number(item.stockQty || 0),
        safetyStock: Number(item.saveQuantity || 0),
        image: getItemImageUrl(item),
        status: getStockStatus(item) as LowStockItem["status"],
        unit: item.unit || "",
      }))
      .sort((a, b) => {
        const aRatio = a.safetyStock > 0 ? a.stockQty / a.safetyStock : 999;
        const bRatio = b.safetyStock > 0 ? b.stockQty / b.safetyStock : 999;
        return aRatio - bRatio;
      });
  };

  const criticalStockItems = computed<LowStockItem[]>(() =>
    buildLowStockList(selectedArea.value, ["critical"]),
  );

  const lowStockItemsByStatus = computed<LowStockItem[]>(() =>
    buildLowStockList(selectedArea.value, ["low"]),
  );

  const warningStockItems = computed<LowStockItem[]>(() =>
    buildLowStockList(selectedArea.value, ["warning"]),
  );

  const notConfiguredItems = computed<LowStockItem[]>(() =>
    buildLowStockList(selectedArea.value, ["not-configured"]),
  );

  const alertStockItems = computed<LowStockItem[]>(() =>
    buildLowStockList(selectedArea.value, [
      "out-of-stock",
      "critical",
      "low",
      "warning",
      "not-configured",
    ]),
  );

  const buildTopOrderedItems = (area: AreaKey, limit = 10): TopItem[] => {
    const orderItemMap = new Map<number, number>();

    getOrdersByArea(area)
      .filter((order) => order.status === "Completed")
      .forEach((order) => {
        (order.orderDetails || []).forEach((detail) => {
          const itemId = detail.item?.id || detail.itemId;
          if (!itemId) return;

          orderItemMap.set(
            itemId,
            (orderItemMap.get(itemId) || 0) + Number(detail.orderQty || 0),
          );
        });
      });

    const items = getItemsByArea(area)
      .map((item) => ({
        item,
        totalOrdered: orderItemMap.get(item.id || 0) || 0,
      }))
      .filter((entry) => entry.totalOrdered > 0)
      .sort((a, b) => b.totalOrdered - a.totalOrdered);

    const maxOrdered = items[0]?.totalOrdered || 1;

    return items.slice(0, limit).map(({ item, totalOrdered }) => ({
      id: item.id || 0,
      name: getItemName(item),
      code: getItemCode(item),
      areaPart: getItemArea(item),
      totalOrdered,
      percentage: Math.round((totalOrdered / maxOrdered) * 100),
      image: getItemImageUrl(item),
      stockQty: Number(item.stockQty || 0),
      safetyStock: Number(item.saveQuantity || 0),
      unit: item.unit || "",
    }));
  };

  const topOrderedItems = computed<TopItem[]>(() =>
    buildTopOrderedItems(selectedArea.value, 10),
  );

  const topOrderedItemsByArea = computed(() => ({
    SMD: buildTopOrderedItems("SMD", 8),
    MAINLINE: buildTopOrderedItems("MAINLINE", 8),
  }));

  const recentOrderStatus = computed<RecentOrderItem[]>(() => {
    return getOrdersByArea(selectedArea.value)
      .map((order) => ({
        id: order.id,
        orderNumber: `ORD-${String(order.id).padStart(5, "0")}`,
        orderDate: order.orderDate,
        status: order.status,
        areaPart: getOrderArea(order),
        totalItems: order.orderDetails?.length || 0,
        totalQty:
          order.orderDetails?.reduce(
            (sum, detail) => sum + Number(detail.orderQty || 0),
            0,
          ) || 0,
        workerName: order.nameWorker || order.account?.username || "-",
      }))
      .sort((a, b) => {
        return (
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      })
      .slice(0, 10);
  });

  const recentStockins = computed<RecentStockinItem[]>(() => {
    return getStockinsByArea(selectedArea.value)
      .map((stockin) => ({
        id: stockin.id,
        stockInDate: stockin.stockInDate,
        areaPart: getStockinArea(stockin),
        totalItems: stockin.stockInDetails?.length || 0,
        totalQty:
          stockin.stockInDetails?.reduce(
            (sum, detail) => sum + Number(detail.quantity || 0),
            0,
          ) || 0,
        creatorName: stockin.account?.username || "-",
      }))
      .sort((a, b) => {
        return (
          new Date(b.stockInDate).getTime() - new Date(a.stockInDate).getTime()
        );
      })
      .slice(0, 10);
  });

  // =========================
  // CHARTS
  // =========================

  const ordersByStatusChartData = computed<ChartData>(() => ({
    labels: ["Pending", "Approved", "Completed", "Rejected"],
    datasets: [
      {
        data: [
          orderStatusSummary.value.pending,
          orderStatusSummary.value.approved,
          orderStatusSummary.value.completed,
          orderStatusSummary.value.rejected,
        ],
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }));

  const stockValueChartData = computed<ChartData>(() => ({
    labels: ["Engineer", "Consumer"],
    datasets: [
      {
        data: [
          getItemsByArea(selectedArea.value)
            .filter(isEngineerItem)
            .reduce(
              (sum, item) =>
                sum + Number(item.stockQty || 0) * getItemPrice(item),
              0,
            ),
          getItemsByArea(selectedArea.value)
            .filter(isConsumerItem)
            .reduce(
              (sum, item) =>
                sum + Number(item.stockQty || 0) * getItemPrice(item),
              0,
            ),
        ],
        backgroundColor: ["#6366f1", "#ec4899"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }));

  const stockValueByAreaChartData = computed<ChartData>(() => ({
    labels: ["SMD", "MAINLINE"],
    datasets: [
      {
        label: "Giá trị tồn kho",
        data: [
          smdSummary.value.totalStockValue,
          mainlineSummary.value.totalStockValue,
        ],
        backgroundColor: ["#2563eb", "#16a34a"],
        borderWidth: 0,
      },
    ],
  }));

  const stockQtyByAreaChartData = computed<ChartData>(() => ({
    labels: ["SMD", "MAINLINE"],
    datasets: [
      {
        label: "Số lượng tồn",
        data: [
          smdSummary.value.totalStockQty,
          mainlineSummary.value.totalStockQty,
        ],
        backgroundColor: ["#60a5fa", "#4ade80"],
        borderWidth: 0,
      },
    ],
  }));

  const orderStatusByAreaChartData = computed<ChartData>(() => ({
    labels: ["Pending", "Approved", "Completed", "Rejected"],
    datasets: [
      {
        label: "SMD",
        data: [
          smdSummary.value.pendingOrders,
          smdSummary.value.approvedOrders,
          smdSummary.value.completedOrders,
          smdSummary.value.rejectedOrders,
        ],
        backgroundColor: ["#bfdbfe", "#93c5fd", "#60a5fa", "#2563eb"],
        borderWidth: 0,
      },
      {
        label: "MAINLINE",
        data: [
          mainlineSummary.value.pendingOrders,
          mainlineSummary.value.approvedOrders,
          mainlineSummary.value.completedOrders,
          mainlineSummary.value.rejectedOrders,
        ],
        backgroundColor: ["#bbf7d0", "#86efac", "#4ade80", "#16a34a"],
        borderWidth: 0,
      },
    ],
  }));

  const lineMachineByAreaChartData = computed<ChartData>(() => ({
    labels: ["SMD", "MAINLINE"],
    datasets: [
      {
        label: "Line",
        data: [smdSummary.value.totalLines, mainlineSummary.value.totalLines],
        backgroundColor: ["#93c5fd", "#86efac"],
        borderWidth: 0,
      },
      {
        label: "Machine",
        data: [
          smdSummary.value.totalMachines,
          mainlineSummary.value.totalMachines,
        ],
        backgroundColor: ["#2563eb", "#16a34a"],
        borderWidth: 0,
      },
    ],
  }));

  const monthlyMovementChartData = computed<ChartData>(() => {
    const monthMap = new Map<
      string,
      {
        orderedQty: number;
        stockinQty: number;
      }
    >();

    const ensureMonth = (date: string) => {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return null;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          orderedQty: 0,
          stockinQty: 0,
        });
      }

      return key;
    };

    getOrdersByArea(selectedArea.value).forEach((order) => {
      const key = ensureMonth(order.orderDate);
      if (!key) return;

      const current = monthMap.get(key)!;

      current.orderedQty +=
        order.orderDetails?.reduce(
          (sum, detail) => sum + Number(detail.orderQty || 0),
          0,
        ) || 0;
    });

    getStockinsByArea(selectedArea.value).forEach((stockin) => {
      const key = ensureMonth(stockin.stockInDate);
      if (!key) return;

      const current = monthMap.get(key)!;

      current.stockinQty +=
        stockin.stockInDetails?.reduce(
          (sum, detail) => sum + Number(detail.quantity || 0),
          0,
        ) || 0;
    });

    const labels = Array.from(monthMap.keys()).sort().slice(-12);

    return {
      labels,
      datasets: [
        {
          label: "SL nhập",
          data: labels.map((label) => monthMap.get(label)?.stockinQty || 0),
          borderColor: "#16a34a",
          backgroundColor: ["#16a34a"],
          borderWidth: 3,
          tension: 0.35,
          fill: false,
        },
        {
          label: "SL xuất/order",
          data: labels.map((label) => monthMap.get(label)?.orderedQty || 0),
          borderColor: "#f97316",
          backgroundColor: ["#f97316"],
          borderWidth: 3,
          tension: 0.35,
          fill: false,
        },
      ],
    };
  });

  // Biểu đồ đường: SL nhập kho & SL order theo từng ngày, hỗ trợ 7 ngày / 30 ngày / tất cả
  const getDailyMovementChartData = (range: "7d" | "30d" | "all") => {
    const toDateKey = (date: string) => {
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return null;
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const dayMap = new Map<string, { stockinQty: number; orderQty: number }>();

    const ensureDay = (key: string) => {
      if (!dayMap.has(key)) {
        dayMap.set(key, { stockinQty: 0, orderQty: 0 });
      }
      return dayMap.get(key)!;
    };

    getOrdersByArea(selectedArea.value).forEach((order) => {
      const key = toDateKey(order.orderDate);
      if (!key) return;

      const entry = ensureDay(key);
      entry.orderQty +=
        order.orderDetails?.reduce(
          (sum, detail) => sum + Number(detail.orderQty || 0),
          0,
        ) || 0;
    });

    getStockinsByArea(selectedArea.value).forEach((stockin) => {
      const key = toDateKey(stockin.stockInDate);
      if (!key) return;

      const entry = ensureDay(key);
      entry.stockinQty +=
        stockin.stockInDetails?.reduce(
          (sum, detail) => sum + Number(detail.quantity || 0),
          0,
        ) || 0;
    });

    let dateKeys: string[];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (range === "all") {
      const allKeys = Array.from(dayMap.keys()).sort();
      if (allKeys.length === 0) {
        dateKeys = [toDateKey(today.toISOString())!];
      } else {
        const start = new Date(allKeys[0]);
        dateKeys = [];
        const cursor = new Date(start);
        while (cursor <= today) {
          dateKeys.push(toDateKey(cursor.toISOString())!);
          cursor.setDate(cursor.getDate() + 1);
        }
      }
    } else {
      const days = range === "7d" ? 7 : 30;
      dateKeys = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dateKeys.push(toDateKey(d.toISOString())!);
      }
    }

    const labels = dateKeys.map((key) => {
      const [, m, d] = key.split("-");
      return `${d}/${m}`;
    });

    return {
      dates: dateKeys,
      chartData: {
        labels,
        datasets: [
          {
            label: "SL nhập",
            data: dateKeys.map((key) => dayMap.get(key)?.stockinQty || 0),
            borderColor: "#16a34a",
            backgroundColor: ["#16a34a"],
            borderWidth: 3,
            tension: 0.35,
            fill: false,
          },
          {
            label: "SL order",
            data: dateKeys.map((key) => dayMap.get(key)?.orderQty || 0),
            borderColor: "#f97316",
            backgroundColor: ["#f97316"],
            borderWidth: 3,
            tension: 0.35,
            fill: false,
          },
        ] as ChartData["datasets"],
      } as ChartData,
    };
  };

  // Lấy danh sách phiếu nhập / order theo 1 ngày cụ thể (key dạng YYYY-MM-DD)
  const getStockinsForDate = (area: AreaKey, dateKey: string) => {
    return getStockinsByArea(area).filter((stockin) => {
      const d = new Date(stockin.stockInDate);
      if (Number.isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === dateKey;
    });
  };

  const getOrdersForDate = (area: AreaKey, dateKey: string) => {
    return getOrdersByArea(area).filter((order) => {
      const d = new Date(order.orderDate);
      if (Number.isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === dateKey;
    });
  };

  // =========================
  // ACTIONS
  // =========================

  const setSelectedArea = (area: AreaKey) => {
    selectedArea.value = area;
  };

  const refreshDashboard = async () => {
    console.log("Dashboard refreshed");
  };

  return {
    // State
    selectedArea,
    setSelectedArea,

    // Helpers
    normalizeAreaPart,
    getItemArea,
    getItemName,
    getItemCode,
    getOrderArea,
    getStockinArea,
    getLineArea,
    getStockStatus,
    getItemsByArea,
    getOrdersByArea,
    getStockinsByArea,
    buildAreaSummary,
    getDailyMovementChartData,
    getStockinsForDate,
    getOrdersForDate,

    // Summary
    smdSummary,
    mainlineSummary,
    allSummary,
    currentSummary,
    areaSummaries,

    // Compatibility
    dashboardStats,
    orderStatusSummary,
    overviewStats,
    lowStockCountByStatus,

    // Lists
    topOrderedItems,
    topOrderedItemsByArea,
    criticalStockItems,
    lowStockItemsByStatus,
    warningStockItems,
    notConfiguredItems,
    alertStockItems,
    recentOrderStatus,
    recentStockins,

    // Charts
    ordersByStatusChartData,
    stockValueChartData,
    stockValueByAreaChartData,
    stockQtyByAreaChartData,
    orderStatusByAreaChartData,
    lineMachineByAreaChartData,
    monthlyMovementChartData,

    // Actions
    refreshDashboard,
  };
});
