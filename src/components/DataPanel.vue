<template>
  <div class="data-panel" :data-chart-type="chartType">
    <h3 class="panel-title">{{ title }}</h3>
    <div class="panel-content">
      <div class="chart-container" ref="chartContainer"></div>
    </div>
  </div>
</template>

<script>
import './DataPanel.css'
// 定义左侧面板数据
export const leftPanels = [
{
    id: 1,
    title: '气象数据',
    chartType: 'weather'
  },
  {
    id: 1,
    title: '作物生长状态',
    chartType: 'growth'
  },
  {
    id: 3,
    title: '土壤监测数据',
    chartType: 'soil'
  },

]

// 定义右侧面板数据
export const rightPanels = [
  {
    id: 4,
    title: '设备运行状态',
    chartType: 'equipment'
  },
  {
    id: 5,
    title: '产量预测',
    chartType: 'yield'
  },
  {
    id: 6,
    title: '病虫害预警',
    chartType: 'pest'
  }
]

export default {
  name: 'DataPanel',
  props: {
    title: {
      type: String,
      required: true
    },
    chartType: {
      type: String,
      required: true
    }
  },
  mounted() {
    // 如果使用 ECharts，添加窗口大小变化监听
    window.addEventListener('resize', this.handleResize);
    // 初始化图表
    this.initChart();
  },
  methods: {
    initChart() {
      // 这里可以根据 chartType 初始化不同类型的图表
      // 示例代码，实际实现可能需要根据您的需求调整
      const chartContainer = this.$refs.chartContainer;
      if (chartContainer) {
        chartContainer.innerHTML = `<div class="placeholder-chart">${this.chartType} 图表区域</div>`;
      }
    },
    handleResize() {
      // 当窗口大小变化时重新初始化图表
      this.initChart();
    }
  },
  beforeUnmount() {
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

