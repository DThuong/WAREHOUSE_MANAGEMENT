<!-- <template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">${{ formatNumber(value) }}</div>
    <div class="stat-change" :class="change >= 0 ? 'positive' : 'negative'">
      <i :class="change >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
      <span>{{ Math.abs(change) }}% so với tháng trước</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: Number,
  change: Number
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}
</script> -->
