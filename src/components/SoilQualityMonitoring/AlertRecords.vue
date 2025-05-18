<template>
    <div class="alert-records-container">
        <!-- 顶部操作栏 -->
        <div class="operation-bar">
            <div class="left-filters">
                <el-select v-model="selectedArea" placeholder="基地" clearable class="area-select">
                    <el-option label="全部" value=""></el-option>
                    <el-option v-for="area in areas" :key="area.value" :label="area.label" :value="area.value" />
                </el-select>
                
                <el-input
                    v-model="searchText"
                    placeholder="监测点名称"
                    clearable
                    class="search-input"
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
                
                <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="预警开始日期"
                    end-placeholder="预警结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    class="date-picker"
                />
            </div>
            
            <el-button type="primary" @click="refreshData">
                <el-icon><Refresh /></el-icon>刷新
            </el-button>
        </div>
        
        <!-- 预警记录表格 -->
        <div class="table-container">
            <el-table :data="paginatedAlerts" style="width: 100%" border stripe class="custom-table">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="monitoringPoint" label="监测点" min-width="120" />
                <el-table-column prop="alertContent" label="预警内容" min-width="300" show-overflow-tooltip />
                <el-table-column prop="alertTime" label="预警时间" min-width="180" />
                <el-table-column label="操作" width="100" align="center">
                    <template #default="scope">
                        <el-button 
                            link 
                            :type="scope.row.isRead ? 'info' : 'danger'" 
                            @click="handleView(scope.row)"
                        >
                            {{ scope.row.isRead ? '已知晓' : '未查看' }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        
        <!-- 分页 -->
        <PageBar
            v-model:page="currentPage"
            v-model:limit="pageSize"
            :total="totalItems"
            @pagination="handlePagination" 
        />
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageBar from '@/components/PageBar.vue'

export default {
    name: 'AlertRecords',
    components: {
        Search,
        Refresh,
        PageBar,
    },
    setup() {
        // 基地选项
        const areas = [
            { label: '地块一基地', value: '地块一基地' },
            { label: '莲花岛测点', value: '莲花岛测点' },
            { label: '北莲资测点', value: '北莲资测点' }
        ]
        
        // 筛选条件
        const selectedArea = ref('')
        const searchText = ref('')
        const dateRange = ref([])
        
        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        
        // 模拟预警数据
        const alertRecords = ref([
            { id: 1, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有机质含量44.6g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 2, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有机质含量44.6g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 3, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有机质含量0.65g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 4, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有机质含量44.6g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 5, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有效磷含量659mg/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 6, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有机质含量0.65g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 7, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有机质含量0.65g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 8, monitoringPoint: '地块一基地', alertContent: '本地地块的Test:有效磷含量234mg/kg/干设置阈值100.00mg/kg,有机质含量44.6g/kg/干设置阈值100.00mg/kg,有效钾含量100.00mg/kg/干设置阈值100.00mg/kg,全氮含量2.74mg/kg/干设置阈值100.00mg/kg,全磷含量0.65g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 9, monitoringPoint: '地块一基地', alertContent: '测试L2的地块一基地:有机质含量0.65g/kg/干设置阈值100.00mg/kg', alertTime: '2025-03-18 00:00:00', isRead: false },
            { id: 10, monitoringPoint: '安吉基地', alertContent: '安吉基地的Test:有效磷含量234mg/kg/干设置阈值100.00mg/kg', alertTime: '2024-11-14 19:26:48', isRead: false }
        ])
        
        // 加载状态
        const loading = ref(false)
        
        // 过滤后的数据
        const filteredAlerts = computed(() => {
            let result = alertRecords.value
            
            // 基地筛选
            if (selectedArea.value) {
                result = result.filter(item => item.monitoringPoint.includes(selectedArea.value))
            }
            
            // 监测点名称筛选
            if (searchText.value) {
                result = result.filter(item => item.monitoringPoint.includes(searchText.value))
            }
            
            // 日期范围筛选
            if (dateRange.value && dateRange.value.length === 2) {
                const startDate = new Date(dateRange.value[0])
                const endDate = new Date(dateRange.value[1])
                endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
                
                result = result.filter(item => {
                    const alertDate = new Date(item.alertTime)
                    return alertDate >= startDate && alertDate <= endDate
                })
            }
            
            return result
        })
        
        // 总条数
        const totalItems = computed(() => filteredAlerts.value.length)
        
        // 分页后的数据
        const paginatedAlerts = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value
            const end = start + pageSize.value
            return filteredAlerts.value.slice(start, end)
        })
        
        // 分页处理函数
        const handlePagination = ({page, limit}) => {
            currentPage.value = page
            pageSize.value = limit
            console.log('currentPage:', currentPage.value, 'pageSize:', pageSize.value)
        }
        
        // 查看详情
        const handleView = (row) => {
            // 更新状态为已读
            row.isRead = true;
            
            // 显示消息提示
            ElMessage.success(`已知晓预警: ${row.alertContent}`)
            
            // 在实际应用中，这里应该调用API更新预警状态
            // 例如：updateAlertStatus(row.id, true)
        }
        
        // 刷新数据
        const refreshData = () => {
            loading.value = true
            setTimeout(() => {
                loading.value = false
                ElMessage.success('数据已刷新')
            }, 1000)
        }
        
        // 初始化
        onMounted(() => {
            // 这里可以添加初始化逻辑，例如从API获取数据
        })
        
        return {
            // 数据
            areas,
            selectedArea,
            searchText,
            dateRange,
            alertRecords,
            loading,
            filteredAlerts,
            paginatedAlerts,
            totalItems,
            currentPage,
            pageSize,
            
            // 方法
            handlePagination,
            handleView,
            refreshData
        }
    }
}
</script>

<style scoped>
.alert-records-container {
    padding: 20px;
}

.operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    align-items: center;
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.left-filters {
    display: flex;
    gap: 15px;
}

.area-select {
    width: 150px;
}

.search-input {
    width: 220px;
}

.date-picker {
    width: 320px;
}

.table-container {
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.custom-table {
    --el-table-border-color: #ebeef5;
    --el-table-header-bg-color: #f5f7fa;
}

.custom-table :deep(th) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: bold;
}

:deep(.el-table .cell) {
    white-space: nowrap;
}

:deep(.el-table--border) {
    border-radius: 4px;
    overflow: hidden;
}
</style>
