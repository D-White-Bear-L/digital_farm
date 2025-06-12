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
      <el-button type="success" @click="handleExportData" class="filter-item">
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
        <el-tab-pane label="有效磷" name="availableP"></el-tab-pane>
        <el-tab-pane label="速效钾" name="availableK"></el-tab-pane>
        <el-tab-pane label="电导率" name="conductivity"></el-tab-pane>
        <el-tab-pane label="土壤质量" name="soilQuality"></el-tab-pane>
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
          <el-radio label="硫">硫</el-radio>
          <el-radio label="镁">镁</el-radio>
          <el-radio label="钙">钙</el-radio>
        </el-radio-group>
      </div>
      
      <!-- 土壤质量评估展示 -->
      <div v-if="activeTab === 'soilQuality'" class="soil-quality-assessment">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="quality-score-card">
              <template #header>
                <div class="card-header">
                  <span>土壤质量评分</span>
                </div>
              </template>
              <div class="score-content">
                <div class="score-value">{{ soilQualityData.qualityScore?.toFixed(2) || 0 }}<span class="percentage-symbol">%</span></div>
                <div class="original-score-value">原始分: {{ soilQualityData.originalQualityScore?.toFixed(2) || 0 }}</div>
                <div class="score-level">
                  <el-tag :type="getQualityLevelType(soilQualityData.qualityLevel)">
                    {{ soilQualityData.qualityLevel || '未知' }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-card class="recommendations-card">
              <template #header>
                <div class="card-header">
                  <span>改善建议</span>
                </div>
              </template>
              <div class="recommendations-content">
                <el-timeline>
                  <el-timeline-item
                    v-for="(recommendation, index) in soilQualityData.recommendations"
                    :key="index"
                    :type="getRecommendationType(recommendation)"
                    :timestamp="'建议 ' + (index + 1)"
                  >
                    {{ recommendation }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 图表区域 -->
      <div class="chart-wrapper" v-if="activeTab !== 'soilQuality'">
        <div id="mainChart" class="chart"></div>
      </div>
      
      <!-- 数据统计信息 -->
      <div class="statistics-info" v-if="activeTab !== 'soilQuality'">
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
            <div class="stat-item">
              <span class="stat-label">数据点数：</span>
              <span class="stat-value">{{ statistics.count }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">变异系数：</span>
              <span class="stat-value">{{ statistics.cv }}</span>
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
        <el-table-column prop="monitoringPoint" label="监测点" min-width="120">
          <template #default="scope">
            {{ scope.row.monitoringPoint || currentDisplayPointName.value }}
          </template>
        </el-table-column>
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
        v-model="pagination"
        :total="total"
        @pagination="handlePagination" 
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { Search, ArrowUp, ArrowDown, More, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import PageBar from '@/components/PageBar.vue'
// eslint-disable-next-line no-unused-vars
import { getSoilTrendAnalysis, getSoilMicroAnalysis, getSoilQualityAnalysis, exportData, getBaseOptions } from '@/api/DataAnalysis'
import { getMonitoringPointOptions } from '@/api/SoilQuality'
// eslint-disable-next-line no-unused-vars
import { getMonitoringPointsByBaseId } from '@/api/Monitoring'

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
    const baseOptions = ref([])
    // 监测点列表，用于名称到ID的映射
    const allMonitoringPoints = ref([])
    const monitoringPointName = ref('')
    // 当前筛选并用于显示监测点的名称
    const currentDisplayPointName = ref('所有监测点')
    
    // 加载基地选项
    const loadBaseOptions = async () => {
      try {
        const response = await getBaseOptions()
        if (response.code === 200) {
          baseOptions.value = response.data
        } else {
          ElMessage.error(response.message || '获取基地列表失败')
        }
      } catch (error) {
        console.error('获取基地列表失败:', error)
        ElMessage.error('获取基地列表失败')
      }
    }
    
    // 根据基地ID加载监测点
    const updateMonitoringPoints = async () => {
      try {
        let response;
        if (selectedBase.value) {
          response = await getMonitoringPointsByBaseId(selectedBase.value);
        } else {
          response = await getMonitoringPointOptions();
        }
        
        if (response.code === 200 && Array.isArray(response.data.list)) {
          allMonitoringPoints.value = response.data.list;
        } else {
          console.error('获取监测点列表失败或数据格式不正确:', response);
          ElMessage.error('获取监测点列表失败');
        }
      } catch (error) {
        console.error('加载监测点列表失败:', error);
        ElMessage.error('加载监测点列表失败');
      }
    };
    
    // 筛选条件
    const selectedBase = ref('')
    const activeTab = ref('ph') // 默认显示 PH
    const selectedElement = ref('铜') // 微量元素默认选中铜
    const dateRange = ref([])
    
    // 分页相关
    const pagination = ref({ page: 1, limit: 10 })
    const total = ref(0)
    
    // 图表实例
    let chartInstance = null
    
    // 统计数据
    const statistics = reactive({
      max: 0,
      min: 0,
      avg: 0,
      stdDev: 0,
      count: 0,
      cv: 0
    })
    
    // 表格数据
    const tableData = ref([])
    
    // 后端趋势数据键名映射
    const trendKeyMap = {
      'ph': 'ph',
      'moisture': 'waterContent',
      'organicMatter': 'organicMatter',
      'salinity': 'conductivity',
      'sulfurNitrogen': 'availableN',
      'availableP': 'availableP',
      'availableK': 'availableK',
      'conductivity': 'conductivity'
    }

    // 微量元素中文名到后端键名映射
    const elementMap = {
      '铜': 'cu',
      '锌': 'zn',
      '铁': 'fe',
      '锰': 'mn',
      '硼': 'b',
      '钼': 'mo',
      '氯': 'cl',
      '硅': 'si',
      '硫': 's',
      '镁': 'mg',
      '钙': 'ca'
    }

    // 添加土壤质量数据
    const soilQualityData = ref({
      qualityScore: 0,
      originalQualityScore: 0,
      qualityLevel: '',
      recommendations: []
    })

    // 获取质量等级类型
    const getQualityLevelType = (level) => {
      switch (level) {
        case '优': return 'success'
        case '良': return 'success'
        case '中': return 'warning'
        case '及格': return 'warning'
        case '差': return 'danger'
        default: return 'info'
      }
    }

    // 获取建议类型
    const getRecommendationType = (recommendation) => {
      if (recommendation.includes('偏低')) return 'warning'
      if (recommendation.includes('偏高')) return 'danger'
      return 'info'
    }

    // 加载数据
    const loadData = async () => {
      console.time('loadData execution')
      try {
        let response = null;
        let data = null;
        
        // 根据 monitoringPointName 查找对应的 pointId
        let pointIdToSend = null;
        if (monitoringPointName.value) {
          const matchedPoint = allMonitoringPoints.value.find(point => 
            point.pointName === monitoringPointName.value
          );
          if (matchedPoint) {
            pointIdToSend = matchedPoint.pointId;
            currentDisplayPointName.value = matchedPoint.pointName; // 更新显示名称
          } else {
            console.warn(`未找到与 "${monitoringPointName.value}" 精确匹配的监测点ID，将发送 null。`);
            currentDisplayPointName.value = '所有监测点';
          }
        } else {
          currentDisplayPointName.value = '所有监测点';
        }

        const params = {
          baseId: selectedBase.value || null,
          pointId: pointIdToSend,
          startDate: dateRange.value?.[0] || null,
          endDate: dateRange.value?.[1] || null
        }

        console.log('请求参数:', params)

        if (activeTab.value === 'microElements') {
          // 微量元素现在也请求趋势数据
          const backendElementKey = elementMap[selectedElement.value];
          if (backendElementKey) {
            response = await getSoilTrendAnalysis({ ...params, paramName: backendElementKey });
            data = response; // Assuming trendAnalysis returns raw data
            console.log(`原始响应数据 (${selectedElement.value} 趋势):`, data);

            const values = data[backendElementKey] || [];
            tableData.value = (data.dates || []).map((date, index) => {
              const itemValue = values[index];
              return {
                base: selectedBase.value,
                monitoringPoint: currentDisplayPointName.value,
                sampleDate: date,
                value: itemValue,
                status: getStatusByValue(backendElementKey, itemValue),
                trend: getTrendByValue(itemValue, index > 0 ? values[index - 1] : null)
              };
            });
            updateStatistics();
            updateChart();
          } else {
            console.warn('未知的微量元素选择:', selectedElement.value);
            tableData.value = [];
            updateStatistics();
            updateChart();
          }
        } else if (activeTab.value in trendKeyMap) {
          response = await getSoilTrendAnalysis({ ...params, paramName: trendKeyMap[activeTab.value] }); // Pass paramName here
          data = response; // Assuming trendAnalysis returns raw data
          console.log('原始响应数据 (趋势分析):', data);

          // Process trend data for table and chart
          const trendData = data || {};
          const backendKey = trendKeyMap[activeTab.value];
          const values = trendData[backendKey] || [];
          tableData.value = (trendData.dates || []).map((date, index) => {
            const itemValue = values[index];
            return {
              base: selectedBase.value,
              monitoringPoint: currentDisplayPointName.value,
              sampleDate: date,
              value: itemValue,
              status: getStatusByValue(activeTab.value, itemValue),
              trend: getTrendByValue(itemValue, index > 0 ? values[index - 1] : null)
            };
          });
          updateStatistics();
          updateChart();
        } else if (activeTab.value === 'soilQuality') {
          console.log('请求土壤质量评估，参数:', params);
          response = await getSoilQualityAnalysis({ baseId: params.baseId });
          console.log('完整的API响应对象 (土壤质量评估):', response);

          // 直接检查 response 是否有数据，因为后端直接返回 Map
          if (response && response.qualityScore !== undefined) {
             console.log('土壤质量评估成功，数据:', response); // 直接打印 response
             soilQualityData.value = {
              qualityScore: response.qualityScore || 0,
              originalQualityScore: response.originalQualityScore || 0,
              qualityLevel: response.qualityLevel || '未知',
              recommendations: response.recommendations || []
            };
            ElMessage.success('获取土壤质量评估数据成功！');
          } else {
            console.error('获取土壤质量评估失败，响应:', response);
            ElMessage.error(response.message || '获取土壤质量评估数据失败');
          }
        } else { // 任何其他未知情况或错误处理
            ElMessage.error('获取数据失败: 未知标签或响应格式');
            console.error('API错误: 未知标签或响应格式', response);
            tableData.value = [];
            if (chartInstance) {
              chartInstance.clear();
              chartInstance.dispose();
              chartInstance = null;
              initChart();
            }
        }

      } catch (error) {
        console.error('加载数据失败 (捕获到异常):', error)
        ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
      } finally {
        console.timeEnd('loadData execution')
      }
    }

    // 根据值获取状态
    const getStatusByValue = (key, value) => {
      if (value === null || value === undefined) return '未知'
      
      // 阈值定义
      const thresholds = {
        // 基础理化指标阈值
        ph: { low: 6.0, high: 8.0 },
        waterContent: { low: 20, high: 40 }, // 与 moisture 对应
        organicMatter: { low: 20, high: 40 },
        conductivity: { low: 0.1, high: 0.3 }, // 与 salinity 对应
        availableN: { low: 100, high: 300 }, // 与 sulfurNitrogen 对应
        availableP: { low: 20, high: 60 },
        availableK: { low: 100, high: 300 },
        
        // 微量元素阈值 (后端键名)
        cu: { low: 0.2, high: 1.0 },
        zn: { low: 0.5, high: 2.0 },
        fe: { low: 1.0, high: 3.0 },
        mn: { low: 0.2, high: 0.8 },
        b: { low: 0.1, high: 0.5 },
        mo: { low: 0.05, high: 0.2 },
        cl: { low: 0.05, high: 0.2 },
        si: { low: 5.0, high: 15.0 },
        mg: { low: 1.0, high: 3.0 },
        ca: { low: 3.0, high: 8.0 },
        s: { low: 1.0, high: 3.0 }
      }
      
      const threshold = thresholds[key]
      if (!threshold) return '正常'
      
      if (value < threshold.low) return '偏低'
      if (value > threshold.high) return '偏高'
      return '正常'
    }

    // 根据值获取趋势
    const getTrendByValue = (current, previous) => {
      if (!previous) return '稳定'
      const diff = current - previous
      if (Math.abs(diff) < 0.1) return '稳定'
      return diff > 0 ? '上升' : '下降'
    }

    // 更新统计数据
    const updateStatistics = () => {
      if (tableData.value.length === 0) {
        statistics.max = 0
        statistics.min = 0
        statistics.avg = 0
        statistics.stdDev = 0
        statistics.count = 0
        statistics.cv = 0
        return
      }
      
      const values = tableData.value.map(item => item.value)
      statistics.max = Math.max(...values).toFixed(2)
      statistics.min = Math.min(...values).toFixed(2)
      
      const sum = values.reduce((acc, val) => acc + val, 0)
      statistics.avg = (sum / values.length).toFixed(2)
      
      const variance = values.reduce((acc, val) => acc + Math.pow(val - statistics.avg, 2), 0) / values.length
      statistics.stdDev = Math.sqrt(variance).toFixed(2)
      statistics.count = values.length
      statistics.cv = (statistics.stdDev / statistics.avg * 100).toFixed(2)
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
      })
    }
    
    // 更新图表数据
    const updateChart = () => {
      if (!chartInstance) {
        console.warn('ECharts 实例未初始化或已销毁');
        return;
      }
      
      updateStatistics();
      
      const series = [];
      const legendData = []; // 存储图例数据

      // 通用图表配置，后续会根据activeTab进行修改
      const option = {
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
          }
        },
        legend: {
          data: legendData,
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '10%',
          containLabel: true
        },
        series: series
      };

      // 统一处理趋势数据：显示当前指标的折线图 (包括微量元素趋势)
      const dates = tableData.value.map(item => item.sampleDate);
      const values = tableData.value.map(item => item.value);
      
      series.push({
        name: getValueLabel(),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: values,
        itemStyle: {
          color: '#83bff6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(131, 191, 246, 0.8)'
            },
            {
              offset: 1,
              color: 'rgba(131, 191, 246, 0.1)'
            }
          ])
        }
      });
      legendData.push(getValueLabel());

      option.xAxis = {
        type: 'category',
        data: dates,
        axisLabel: {
          formatter: (value) => value.split('-').slice(1).join('-')
        }
      };
      option.yAxis = {
        type: 'value',
        name: getValueUnit()
      };
      
      console.log('图表系列数据:', series);
      console.log('最终图表选项:', option); // 更改日志，更清晰

      chartInstance.setOption(option);
      total.value = tableData.value.length;
    }
    
    // 获取图表标题
    const getChartTitle = () => {
      const baseName = baseOptions.value.find(b => b.value === selectedBase.value)?.label || '所有基地'
      const displayPointName = currentDisplayPointName.value; // 直接使用统一的显示名称
      
      if (activeTab.value === 'microElements') {
        return `${baseName} - ${displayPointName} 微量元素含量分析` // 微量元素显示所有元素分析
      } else {
        return `${baseName} - ${displayPointName} ${getValueLabel()}趋势分析`
      }
    }
    
    // 获取值的标签
    const getValueLabel = () => {
      switch (activeTab.value) {
        case 'ph': return 'pH值'
        case 'moisture': return '水分含量'
        case 'organicMatter': return '有机质'
        case 'salinity': return '盐分'
        case 'sulfurNitrogen': return '硫态氮'
        case 'availableP': return '有效磷'
        case 'availableK': return '速效钾'
        case 'conductivity': return '电导率'
        case 'microElements': return selectedElement.value + '含量' // 微量元素显示选中元素的含量
        default: return '数值'
      }
    }
    
    // 获取值的单位
    const getValueUnit = () => {
      switch (activeTab.value) {
        case 'ph': return 'pH'
        case 'moisture': return '%'
        case 'organicMatter': return 'g/kg'
        case 'salinity': return 'dS/m'
        case 'sulfurNitrogen': return 'mg/kg'
        case 'conductivity': return 'dS/m'
        case 'availableP': return 'mg/kg'
        case 'availableK': return 'mg/kg'
        case 'availableN': return 'mg/kg'
        case 'microElements': return 'mg/kg' // 微量元素统一单位
        default: return ''
      }
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
      pagination.value.page = 1
      loadData()
    }
    
    // 处理标签页切换
    const handleTabChange = () => {
      if (activeTab.value === 'microElements') {
        selectedElement.value = '铜'
      }
      loadData()
    }
    
    // 处理分页 - 新增处理分页方法
    const handlePagination = ({page, limit}) => {
      pagination.value.page = page
      pagination.value.limit = limit
      loadData()
    }
    
    // 处理分页大小变化 - 保留原有方法以兼容
    const handleSizeChange = (size) => {
      pagination.value.limit = size
      loadData()
    }
    
    // 处理当前页变化 - 保留原有方法以兼容
    const handleCurrentChange = (page) => {
      pagination.value.page = page
      loadData()
    }
    
    // 导出数据
    const handleExportData = async () => {
      try {
        // 根据 monitoringPointName 查找对应的 pointId
        let pointIdToSend = null;
        if (monitoringPointName.value) {
          const matchedPoint = allMonitoringPoints.value.find(point => 
            point.pointName === monitoringPointName.value
          );
          if (matchedPoint) {
            pointIdToSend = matchedPoint.pointId;
          }
        }

        // 构建查询参数
        const params = {
          baseId: selectedBase.value || null,
          pointId: pointIdToSend || null,
          startDate: dateRange.value?.[0] || null,
          endDate: dateRange.value?.[1] || null,
          type: activeTab.value === 'microElements' ? 'micro' : activeTab.value
        };

        // 发起导出请求
        const response = await exportData(params); // 调用api中的exportData函数

        // 获取文件名
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'soil_analysis.csv';
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        // 下载文件
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        ElMessage.success('数据导出成功');
      } catch (error) {
        console.error('导出数据失败:', error);
        ElMessage.error('导出失败: ' + (error.message || '未知错误'));
      }
    }
    
    // 监听筛选条件变化
    watch([selectedBase, monitoringPointName, activeTab, selectedElement, dateRange], () => {
      // 移除条件判断，直接调用 loadData
      loadData();
    }, { deep: true, immediate: true }) // immediate: true 确保在组件挂载时也执行一次监听器
    
    // 组件挂载后加载数据
    onMounted(() => {
      initChart()
      loadBaseOptions() // 加载基地选项
      updateMonitoringPoints() // 使用新的函数加载监测点
      loadData()
      
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
      pagination,
      total,
      tableData,
      statistics,
      soilQualityData,
      handleSearch,
      handleTabChange,
      handleSizeChange,
      handleCurrentChange,
      handlePagination,
      handleExportData,
      updateChart,
      getValueLabel,
      getStatusType,
      getTrendType,
      getQualityLevelType,
      getRecommendationType,
      loadData,
      updateMonitoringPoints
    }
  }
}
</script>

<style scoped>
.data-analysis-container {
  border-radius:12px ;
  padding: 20px;
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

:deep(.el-select) {
  width: 180px;
}

:deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}

.soil-quality-assessment {
  width: 100%;
  margin-bottom: 24px;
}

.quality-score-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.quality-score-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.score-content {
  padding: 20px;
  text-align: center;
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 16px;
}

.percentage-symbol {
  font-size: 14px;
  font-weight: normal;
}

.original-score-value {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
}

.score-level {
  margin-top: 16px;
}

.recommendations-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.recommendations-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.recommendations-content {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.el-timeline-item__content) {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>