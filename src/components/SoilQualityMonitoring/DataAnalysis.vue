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
      
      <!-- 添加日期范围选择器 -->
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="filter-item date-picker"
      />
      
      <el-button type="primary" @click="handleSearch" class="filter-item">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
      <el-button type="success" @click="exportData" class="filter-item">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
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
        <el-table-column prop="base" label="基地" width="120">
          <template #default="scope">
            {{ baseOptions.find(option => option.value === scope.row.base)?.label || scope.row.base }}
          </template>
        </el-table-column>
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
import { Search, ArrowUp, ArrowDown, More, Download } from '@element-plus/icons-vue'
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
    Download,
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
    const dateRange = ref([])
    
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
    
    // 扩展模拟数据，添加更多时间点的数据
    const generateTimeSeriesData = () => {
      const elements = ['铜', '锌', '铁', '锰', '硼', '钼', '氯', '硅']
      const bases = ['beilian', 'lianhuadao', 'macun']
      const monitoringPoints = {
        beilian: ['北莲监测点1', '北莲监测点2'],
        lianhuadao: ['莲花岛监测点1', '莲花岛监测点2'],
        macun: ['马村监测点1', '马村监测点2', '马村监测点3', '马村监测点4']
      }
      const statuses = ['正常', '偏高', '偏低']
      const trends = ['上升', '下降', '稳定']
      
      // 生成从2023-04到2025-03的月度数据
      const startDate = new Date('2023-04-01')
      const endDate = new Date('2025-03-31')
      const data = []
      let id = 1
      
      // 为每个基地、监测点、元素生成时间序列数据
      bases.forEach(base => {
        monitoringPoints[base].forEach(point => {
          elements.forEach(element => {
            // 为每个月生成数据
            const currentDate = new Date(startDate)
            while (currentDate <= endDate) {
              const month = currentDate.getMonth() + 1
              const year = currentDate.getFullYear()
              const dateStr = `${year}-${month.toString().padStart(2, '0')}-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`
              
              // 生成波动的值，使图表更有变化
              let value = 0
              if (element === '铜') value = Math.random() * 2 + 0.5 + Math.sin(month / 2) * 0.5
              else if (element === '锌') value = Math.random() * 1.5 + 0.7 + Math.cos(month / 3) * 0.8
              else if (element === '铁') value = Math.random() * 3 + 1 + Math.sin(month / 1.5) * 1
              else value = Math.random() * 2 + 0.8
              
              // 根据月份添加季节性变化
              if (month >= 6 && month <= 8) { // 夏季
                value *= 1.3
              } else if (month >= 12 || month <= 2) { // 冬季
                value *= 0.7
              }
              
              // 随机状态和趋势
              const status = statuses[Math.floor(Math.random() * statuses.length)]
              const trend = trends[Math.floor(Math.random() * trends.length)]
              
              data.push({
                id: id++,
                base,
                monitoringPoint: point,
                sampleDate: dateStr,
                element,
                value: parseFloat(value.toFixed(2)),
                status,
                trend
              })
              
              // 增加一个月
              currentDate.setMonth(currentDate.getMonth() + 1)
            }
          })
        })
      })
      
      return data
    }
    
    // 模拟数据
    const allData = reactive(generateTimeSeriesData())
    
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
      
      // 根据日期范围筛选
      if (dateRange.value && dateRange.value.length === 2) {
        const startDate = new Date(dateRange.value[0])
        const endDate = new Date(dateRange.value[1])
        result = result.filter(item => {
          const itemDate = new Date(item.sampleDate)
          return itemDate >= startDate && itemDate <= endDate
        })
      }
      
      // 根据当前选择的指标类型筛选
      if (activeTab.value === 'microElements') {
        result = result.filter(item => item.element === selectedElement.value)
      } else if (activeTab.value === 'ph') {
        // 这里可以添加其他指标的筛选逻辑
      }
      
      // 按基地和监测点名称排序
      result.sort((a, b) => {
        if (a.base !== b.base) {
          return a.base.localeCompare(b.base)
        }
        if (a.monitoringPoint !== b.monitoringPoint) {
          return a.monitoringPoint.localeCompare(b.monitoringPoint)
        }
        return new Date(a.sampleDate) - new Date(b.sampleDate)
      })
      
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
      
      // 按基地和日期分组数据
      const groupedByBase = {}
      const allDates = new Set()
      
      // 收集所有日期并按基地分组
      filteredData.value.forEach(item => {
        allDates.add(item.sampleDate)
        
        if (!groupedByBase[item.base]) {
          groupedByBase[item.base] = {}
        }
        
        // 按日期分组
        if (!groupedByBase[item.base][item.sampleDate]) {
          groupedByBase[item.base][item.sampleDate] = []
        }
        
        groupedByBase[item.base][item.sampleDate].push(item)
      })
      
      // 将日期转换为数组并排序
      const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))
      
      // 准备图表数据
      const series = []
      const baseNames = []
      
      // 为每个基地创建一个系列
      Object.keys(groupedByBase).forEach((base, index) => {
        const baseLabel = baseOptions.find(option => option.value === base)?.label || base
        baseNames.push(baseLabel)
        
        // 为每个监测点找到对应的平均值
        const seriesData = sortedDates.map(date => {
          const items = groupedByBase[base][date] || []
          if (items.length === 0) return null
          
          // 计算该日期下所有监测点的平均值
          const sum = items.reduce((acc, item) => acc + item.value, 0)
          return [date, parseFloat((sum / items.length).toFixed(2))]
        }).filter(item => item !== null)
        
        // 颜色配置
        const colors = [
          ['rgba(131, 191, 246, 0.8)', 'rgba(131, 191, 246, 0.1)'],
          ['rgba(250, 200, 88, 0.8)', 'rgba(250, 200, 88, 0.1)'],
          ['rgba(86, 168, 153, 0.8)', 'rgba(86, 168, 153, 0.1)'],
          ['rgba(255, 107, 107, 0.8)', 'rgba(255, 107, 107, 0.1)'],
          ['rgba(168, 119, 218, 0.8)', 'rgba(168, 119, 218, 0.1)'],
          ['rgba(95, 192, 95, 0.8)', 'rgba(95, 192, 95, 0.1)']
        ]
        
        series.push({
          name: baseLabel,
          type: 'line',
          stack: 'Total',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          sampling: 'average',
          itemStyle: {
            color: colors[index % colors.length][0]
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colors[index % colors.length][0]
              },
              {
                offset: 1,
                color: colors[index % colors.length][1]
              }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: seriesData
        })
      })
      
      // 设置图表选项
      const option = {
        color: ['#83bff6', '#fac858', '#56a899', '#ff6b6b', '#a877da', '#5fc05f'],
        title: {
          text: getChartTitle(),
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter: function(params) {
            let result = params[0].axisValue + '<br/>'
            params.forEach(param => {
              result += `<div style="display:flex;justify-content:space-between;align-items:center;margin:5px 0;">
                <span style="margin-right:15px;">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};margin-right:5px;"></span>
                  ${param.seriesName}:
                </span>
                <span style="font-weight:bold;">${param.value[1]} ${getValueUnit()}</span>
              </div>`
            })
            return result
          }
        },
        legend: {
          data: baseNames,
          bottom: 0,
          icon: 'circle',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '10%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            formatter: '{yyyy}-{MM}',
            color: '#666'
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: ['#eee'],
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: getValueLabel(),
          nameTextStyle: {
            color: '#666',
            padding: [0, 30, 0, 0]
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: ['#eee']
            }
          }
        },
        series: series,
        // 添加右侧数据标签
        visualMap: {
          show: true,
          type: 'piecewise',
          right: 10,
          top: 'center',
          orient: 'vertical',
          pieces: [
            { value: 2024, label: '2024-03', color: '#83bff6' },
            { value: 2023, label: '铜', color: '#fac858' },
            { value: 2022, label: '锌', color: '#56a899' },
            { value: 2021, label: '铁', color: '#ff6b6b' },
            { value: 2020, label: '锰', color: '#a877da' },
            { value: 2019, label: '硼', color: '#5fc05f' },
            { value: 2018, label: '钼', color: '#83bff6' },
            { value: 2017, label: '氯', color: '#fac858' },
            { value: 2016, label: '硅', color: '#56a899' }
          ],
          textStyle: {
            color: '#333'
          }
        }
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
    
    // 获取值的单位
    const getValueUnit = () => {
      if (activeTab.value === 'microElements') {
        return 'mg/kg'
      } else if (activeTab.value === 'ph') {
        return ''
      } else if (activeTab.value === 'moisture') {
        return '%'
      } else if (activeTab.value === 'organicMatter' || activeTab.value === 'salinity') {
        return 'g/kg'
      } else if (activeTab.value === 'sulfurNitrogen') {
        return 'mg/kg'
      }
      return ''
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
    watch([selectedBase, monitoringPointName, activeTab, selectedElement, dateRange], () => {
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
      dateRange,
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
  padding: 24px;
  background-color: #f8fafc;
  min-height: calc(100vh - 120px);
  color: #2c3e50;
}

.filter-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.filter-section:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.filter-item {
  margin-right: 16px;
  margin-bottom: 10px;
}

.search-input {
  width: 240px;
}

.date-picker {
  width: 320px;
}

.tabs-container {
  margin-bottom: 24px;
}

.chart-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 24px;
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.element-selection {
  width: 100%;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.chart-wrapper {
  width: 75%;
  height: 450px;
}

@media screen and (max-width: 1200px) {
  .chart-wrapper {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .statistics-info {
    width: 100%;
    padding-left: 0;
  }
}

.chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.statistics-info {
  width: 25%;
  padding-left: 24px;
}

.stat-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  padding: 16px 20px;
  background-color: #f8fafc;
  border-bottom: 1px solid #ebeef5;
}

.stat-content {
  padding: 20px;
}

.stat-item {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.stat-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  color: #409EFF;
  font-size: 18px;
}

.table-container {
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.table-container:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: bold;
  color: #2c3e50;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f8fafc;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 24px;
  height: 50px;
  line-height: 50px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: bold;
}

:deep(.el-tabs__item:hover) {
  color: #66b1ff;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #409EFF;
}

:deep(.el-button) {
  border-radius: 8px;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 0 10px;
  height: 28px;
  line-height: 28px;
}

:deep(.el-select) {
  width: 180px;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>