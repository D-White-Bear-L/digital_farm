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
import * as echarts from 'echarts'
import { getSoilTrendAnalysis, getSoilMicroAnalysis, getSoilQualityAnalysis } from '@/api/DataAnalysis'

// 定义左侧面板数据
export const leftPanels = [
  {
    id: 1,
    title: '气象数据',
    chartType: 'weather'
  },
  {
    id: 2,
    title: '作物生长状态',
    chartType: 'growth'
  },
  {
    id: 3,
    title: '土壤监测数据',
    chartType: 'soil'
  }
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
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.dispose()
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    async initChart() {
      const chartContainer = this.$refs.chartContainer
      if (!chartContainer) return

      this.chart = echarts.init(chartContainer)

      switch (this.chartType) {
        case 'soil':
          await this.initSoilChart()
          break
        case 'weather':
          this.initWeatherChart()
          break
        case 'growth':
          this.initGrowthChart()
          break
        case 'equipment':
          this.initEquipmentChart()
          break
        case 'yield':
          this.initYieldChart()
          break
        case 'pest':
          this.initPestChart()
          break
      }
    },

    async initSoilChart() {
      try {
        // 获取土壤基础指标趋势数据
        const trendData = await getSoilTrendAnalysis()
        // 获取土壤微量元素数据
        const microData = await getSoilMicroAnalysis()
        // 获取土壤质量评估数据
        const qualityData = await getSoilQualityAnalysis()

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['pH值', '有机质', '水分含量', '有效磷', '速效钾', '有效氮', '电导率']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: trendData.dates
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'pH值',
              type: 'line',
              data: trendData.ph
            },
            {
              name: '有机质',
              type: 'line',
              data: trendData.organicMatter
            },
            {
              name: '水分含量',
              type: 'line',
              data: trendData.waterContent
            },
            {
              name: '有效磷',
              type: 'line',
              data: trendData.availableP
            },
            {
              name: '速效钾',
              type: 'line',
              data: trendData.availableK
            },
            {
              name: '有效氮',
              type: 'line',
              data: trendData.availableN
            },
            {
              name: '电导率',
              type: 'line',
              data: trendData.conductivity
            }
          ]
        }

        this.chart.setOption(option)
      } catch (error) {
        console.error('Failed to load soil data:', error)
      }
    },

    initWeatherChart() {
      // 实现气象数据图表
      const option = {
        // ... 气象数据图表配置
      }
      this.chart.setOption(option)
    },

    initGrowthChart() {
      // 实现作物生长状态图表
      const option = {
        // ... 作物生长状态图表配置
      }
      this.chart.setOption(option)
    },

    initEquipmentChart() {
      // 实现设备运行状态图表
      const option = {
        // ... 设备运行状态图表配置
      }
      this.chart.setOption(option)
    },

    initYieldChart() {
      // 实现产量预测图表
      const option = {
        // ... 产量预测图表配置
      }
      this.chart.setOption(option)
    },

    initPestChart() {
      // 实现病虫害预警图表
      const option = {
        // ... 病虫害预警图表配置
      }
      this.chart.setOption(option)
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style scoped>
.data-panel {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.panel-title {
  margin: 0 0 16px;
  font-size: 16px;
  color: #333;
}

.panel-content {
  height: 300px;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>

