<template>
  <MainLayout>
    <div class="animate-fade-in">
      <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem;">Báo cáo</h2>
      
      <div class="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-chart-line" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo doanh thu</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Xem chi tiết doanh thu theo thời gian</p>
              <Button label="Xem báo cáo" outlined />
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-shopping-cart" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo đơn hàng</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Thống kê đơn hàng và trạng thái</p>
              <Button label="Xem báo cáo" outlined />
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <i class="pi pi-box" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Báo cáo tồn kho</h3>
              <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 1.5rem;">Theo dõi hàng tồn kho theo sản phẩm</p>
              <Button label="Xem báo cáo" outlined />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/components/MainLayout.vue'
</script>
