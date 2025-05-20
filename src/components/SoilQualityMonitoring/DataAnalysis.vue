<template>
  <div class="data-analysis-container">
    <!-- 顶部筛选区域 -->
    <div class="filter-section">
      <el-select v-model="selectedBase" placeholder="选择基地" clearable class="filter-item">
        <el-option label="全部基地" value=""></el-option>
        <el-option v-for="base in baseOptions" :key="base.value" :label="base.label" :value="base.value"></el-option>
      </el-select>
      
      <el-input
        v-model="monitoringPointName"
        placeholder="监测点名称"
        clearable
        class="filter-item search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-button type="primary" @click="handleSearch" class="filter-item">查询</el-button>
      <el-button type="success" @click="exportData" class="filter-item">导出数据</el-button>
    </div>
    
    <!-- 指标切换标签页 -->
    <div class="tabs-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabChange" type="card">
        <el-tab-pane label="微量元素" name="microElements"></el-tab-pane>
        <el-tab-pane label="硫态氮" name="sulfurNitrogen"></el-tab-pane>
        <el-tab-pane label="有机质" name="organicMatter"></el-tab-pane>
        <el-tab-pane label="盐分" name="salinity"></el-tab-pane>
        <el-tab-pane label="水分" name="moisture"></el-tab-pane>
        <el-tab-pane label="PH" name="ph"></el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 图表展示区域 -->
    <div class="chart-container">
      <!-- 元素选择区域 -->
      <div class="element-selection" v-if="activeTab === 'microElements'">
        <el-radio-group v-model="selectedElement" @change="updateChart">
          <el-radio label="铜">铜</el-radio>
          <el-radio label="锌">锌</el-radio>
          <el-radio label="铁">铁</el-radio>
          <el-radio label="锰">锰</el-radio>
          <el-radio label="硼">硼</el-radio>
          <el-radio label="钼">钼</el-radio>
          <el-radio label="氯">氯</el-radio>
          <el-radio label="硅">硅</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 图表区域 -->
      <div class="chart-wrapper">
        <div id="mainChart" class="chart"></div>
      </div>
      
      <!-- 数据统计信息 -->
      <div class="statistics-info">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>数据统计</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-item">
              <span class="stat-label">最大值：</span>
              <span class="stat-value">{{ statistics.max }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">最小值：</span>
              <span class="stat-value">{{ statistics.min }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均值：</span>
              <span class="stat-value">{{ statistics.avg }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">标准差：</span>
              <span class="stat-value">{{ statistics.stdDev }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 数据表格区域 -->
    <div class="table-container">
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column prop="monitoringPoint" label="监测点" min-width="120"></el-table-column>
        <el-table-column prop="sampleDate" label="采样日期" width="120"></el-table-column>
        <el-table-column prop="value" :label="getValueLabel()" width="120"></el-table-column>
        <el-table-column prop="status" label="状态评价" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="trend" label="变化趋势" width="100">
          <template #default="scope">
            <el-tag :type="getTrendType(scope.row.trend)">
              {{ scope.row.trend }}
              <el-icon v-if="scope.row.trend === '上升'"><ArrowUp /></el-icon>
              <el-icon v-else-if="scope.row.trend === '下降'"><ArrowDown /></el-icon>
              <el-icon v-else><More /></el-icon>
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 - 使用PageBar组件替换原有分页 -->
      <PageBar
        v-model:page="currentPage"
        v-model:limit="pageSize"
        :total="total"
        @pagination="handlePagination" 
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { Search, ArrowUp, ArrowDown, More } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import PageBar from '@/components/PageBar.vue'

export default {
  name: 'DataAnalysis',
  components: {
    Search,
    ArrowUp,
    ArrowDown,
    More,
    PageBar
  },
  setup() {
    // 基地选项
    const baseOptions = [
      { label: '北莲基地', value: 'beilian' },
      { label: '莲花岛基地', value: 'lianhuadao' },
      { label: '马村基地', value: 'macun' }
    ]
    
    // 筛选条件
    const selectedBase = ref('')
    const monitoringPointName = ref('')
    const activeTab = ref('microElements')
    const selectedElement = ref('铜')
    
    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    
    // 图表实例
    let chartInstance = null
    
    // 统计数据
    const statistics = reactive({
      max: 0,
      min: 0,
      avg: 0,
      stdDev: 0
    })
    
    // 模拟数据
    const allData = reactive([
      { id: 1, base: 'beilian', monitoringPoint: '北莲监测点1', sampleDate: '2024-03-15', element: '铜', value: 1.2, status: '正常', trend: '稳定' },
      { id: 2, base: 'beilian', monitoringPoint: '北莲监测点2', sampleDate: '2024-03-15', element: '铜', value: 1.5, status: '正常', trend: '上升' },
      { id: 3, base: 'lianhuadao', monitoringPoint: '莲花岛监测点1', sampleDate: '2024-03-16', element: '铜', value: 0.8, status: '偏低', trend: '下降' },
      { id: 4, base: 'lianhuadao', monitoringPoint: '莲花岛监测点2', sampleDate: '2024-03-16', element: '铜', value: 1.3, status: '正常', trend: '稳定' },
      { id: 5, base: 'macun', monitoringPoint: '马村监测点1', sampleDate: '2024-03-17', element: '铜', value: 1.8, status: '偏高', trend: '上升' },
      { id: 6, base: 'beilian', monitoringPoint: '北莲监测点1', sampleDate: '2024-03-15', element: '锌', value: 0.9, status: '正常', trend: '稳定' },
      { id: 7, base: 'beilian', monitoringPoint: '北莲监测点2', sampleDate: '2024-03-15', element: '锌', value: 1.1, status: '正常', trend: '上升' },
      { id: 8, base: 'lianhuadao', monitoringPoint: '莲花岛监测点1', sampleDate: '2024-03-16', element: '锌', value: 0.7, status: '偏低', trend: '下降' },
      { id: 9, base: 'lianhuadao', monitoringPoint: '莲花岛监测点2', sampleDate: '2024-03-16', element: '锌', value: 1.0, status: '正常', trend: '稳定' },
      { id: 10, base: 'macun', monitoringPoint: '马村监测点1', sampleDate: '2024-03-17', element: '锌', value: 1.4, status: '正常', trend: '上升' },
      {  id: 11, base: 'macun', monitoringPoint: '马村监测点2', sampleDate: '2024-03-18', element: '锌', value: 1.6, status: '正常', trend: '下降' },
      {  id: 12, base: 'macun', monitoringPoint: '马村监测点3', sampleDate: '2024-03-19', element: '锌', value: 1.8, status: '正常', trend: '稳定' },
      {  id: 13, base: 'macun', monitoringPoint: '马村监测点4', sampleDate: '2024-03-20', element: '锌', value: 1.2, status: '正常', trend: '上升' }
    ])
    
    // 根据筛选条件过滤的数据
    const filteredData = computed(() => {
      let result = allData
      
      // 根据基地筛选
      if (selectedBase.value) {
        result = result.filter(item => item.base === selectedBase.value)
      }
      
      // 根据监测点名称筛选
      if (monitoringPointName.value) {
        result = result.filter(item => item.monitoringPoint.includes(monitoringPointName.value))
      }
      
      // 根据当前选择的指标类型筛选
      if (activeTab.value === 'microElements') {
        result = result.filter(item => item.element === selectedElement.value)
      } else if (activeTab.value === 'ph') {
        // 这里可以添加其他指标的筛选逻辑
      }
      
      return result
    })
    
    // 表格数据
    const tableData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredData.value.slice(start, end)
    })
    
    // 计算统计数据
    const calculateStatistics = () => {
      if (filteredData.value.length === 0) {
        statistics.max = 0
        statistics.min = 0
        statistics.avg = 0
        statistics.stdDev = 0
        return
      }
      
      const values = filteredData.value.map(item => item.value)
      statistics.max = Math.max(...values).toFixed(2)
      statistics.min = Math.min(...values).toFixed(2)
      
      // 计算平均值
      const sum = values.reduce((acc, val) => acc + val, 0)
      statistics.avg = (sum / values.length).toFixed(2)
      
      // 计算标准差
      const variance = values.reduce((acc, val) => acc + Math.pow(val - statistics.avg, 2), 0) / values.length
      statistics.stdDev = Math.sqrt(variance).toFixed(2)
    }
    
    // 初始化图表
    const initChart = () => {
      if (chartInstance) {
        chartInstance.dispose()
      }
      
      nextTick(() => {
        const chartDom = document.getElementById('mainChart')
        if (!chartDom) return
        
        chartInstance = echarts.init(chartDom)
        updateChart()
      })
    }
    
    // 更新图表数据
    const updateChart = () => {
      if (!chartInstance) return
      
      calculateStatistics()
      
      // 准备图表数据
      const xAxisData = filteredData.value.map(item => item.monitoringPoint)
      const seriesData = filteredData.value.map(item => item.value)
      
      // 设置图表选项
      const option = {
        title: {
          text: getChartTitle(),
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: getValueLabel()
        },
        series: [
          {
            name: getValueLabel(),
            type: 'bar',
            data: seriesData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' }
                ])
              }
            }
          },
          {
            name: '平均值',
            type: 'line',
            data: new Array(xAxisData.length).fill(statistics.avg),
            lineStyle: {
              type: 'dashed',
              color: '#FF9800'
            },
            symbol: 'none'
          }
        ]
      }
      
      chartInstance.setOption(option)
      total.value = filteredData.value.length
    }
    
    // 获取图表标题
    const getChartTitle = () => {
      if (activeTab.value === 'microElements') {
        return `土壤${selectedElement.value}含量分析`
      } else if (activeTab.value === 'ph') {
        return '土壤pH值分析'
      } else if (activeTab.value === 'moisture') {
        return '土壤水分含量分析'
      } else if (activeTab.value === 'organicMatter') {
        return '土壤有机质含量分析'
      } else if (activeTab.value === 'salinity') {
        return '土壤盐分含量分析'
      } else if (activeTab.value === 'sulfurNitrogen') {
        return '土壤硫态氮含量分析'
      }
      return '土壤质量数据分析'
    }
    
    // 获取值的标签
    const getValueLabel = () => {
      if (activeTab.value === 'microElements') {
        return `${selectedElement.value}含量(mg/kg)`
      } else if (activeTab.value === 'ph') {
        return 'pH值'
      } else if (activeTab.value === 'moisture') {
        return '水分(%)'
      } else if (activeTab.value === 'organicMatter') {
        return '有机质(g/kg)'
      } else if (activeTab.value === 'salinity') {
        return '盐分(g/kg)'
      } else if (activeTab.value === 'sulfurNitrogen') {
        return '硫态氮(mg/kg)'
      }
      return '值'
    }
    
    // 获取状态类型
    const getStatusType = (status) => {
      if (status === '正常') return 'success'
      if (status === '偏高') return 'warning'
      if (status === '偏低') return 'danger'
      return 'info'
    }
    
    // 获取趋势类型
    const getTrendType = (trend) => {
      if (trend === '上升') return 'danger'
      if (trend === '下降') return 'warning'
      return 'info'
    }
    
    // 处理查询
    const handleSearch = () => {
      currentPage.value = 1
      updateChart()
    }
    
    // 处理标签页切换
    const handleTabChange = () => {
      if (activeTab.value === 'microElements') {
        selectedElement.value = '铜'
      }
      updateChart()
    }
    
    // 处理分页 - 新增处理分页方法
    const handlePagination = ({page, limit}) => {
      currentPage.value = page
      pageSize.value = limit
      updateChart()
    }
    
    // 处理分页大小变化 - 保留原有方法以兼容
    const handleSizeChange = (size) => {
      pageSize.value = size
      updateChart()
    }
    
    // 处理当前页变化 - 保留原有方法以兼容
    const handleCurrentChange = (page) => {
      currentPage.value = page
      updateChart()
    }
    
    // 导出数据
    const exportData = () => {
      ElMessage.success('数据导出成功')
    }
    
    // 监听筛选条件变化
    watch([selectedBase, monitoringPointName, activeTab, selectedElement], () => {
      updateChart()
    })
    
    // 组件挂载后初始化图表
    onMounted(() => {
      initChart()
      
      // 监听窗口大小变化，调整图表大小
      window.addEventListener('resize', () => {
        if (chartInstance) {
          chartInstance.resize()
        }
      })
    })
    
    return {
      baseOptions,
      selectedBase,
      monitoringPointName,
      activeTab,
      selectedElement,
      currentPage,
      pageSize,
      total,
      tableData,
      statistics,
      handleSearch,
      handleTabChange,
      handleSizeChange,
      handleCurrentChange,
      handlePagination,
      exportData,
      updateChart,
      getValueLabel,
      getStatusType,
      getTrendType
    }
  }
}
</script>

<style scoped>
.data-analysis-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-item {
  margin-right: 15px;
}

.search-input {
  width: 220px;
}

.tabs-container {
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.element-selection {
  width: 100%;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.chart-wrapper {
  width: 75%;
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.statistics-info {
  width: 25%;
  padding-left: 20px;
}

.stat-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.stat-content {
  padding: 10px 0;
}

.stat-item {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: bold;
  color: #409EFF;
}

.table-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 移除原有的分页容器样式 */

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: bold;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #409EFF;
}
</style>