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
            <el-table :data="alertRecords" style="width: 100%" border stripe class="custom-table">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="pointName" label="监测点" min-width="120" />
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
import { ref, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageBar from '@/components/PageBar.vue'
import { getAlertRecords, updateAlertStatus, getBaseOptions } from '@/api/AlertRecords'

export default {
    name: 'AlertRecords',
    components: {
        Search,
        Refresh,
        PageBar,
    },
    setup() {
        // 基地选项
        const areas = ref([])
        
        // 筛选条件
        const selectedArea = ref('')
        const searchText = ref('')
        const dateRange = ref([])
        
        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalItems = ref(0)
        
        // 预警记录数据
        const alertRecords = ref([])
        
        // 加载状态
        const loading = ref(false)
        
        // 加载基地选项
        const loadBaseOptions = async () => {
            try {
                const response = await getBaseOptions()
                if (response.code === 200) {
                    areas.value = response.data
                } else {
                    ElMessage.error(response.message || '获取基地列表失败')
                }
            } catch (error) {
                console.error('获取基地列表失败:', error)
                ElMessage.error('获取基地列表失败')
            }
        }
        
        // 加载预警记录
        const loadAlertRecords = async () => {
            loading.value = true
            try {
                const params = {
                    baseId: selectedArea.value || null,
                    pointName: searchText.value || null,
                    startDate: dateRange.value?.[0] || null,
                    endDate: dateRange.value?.[1] || null,
                    page: currentPage.value,
                    size: pageSize.value
                }
                
                const response = await getAlertRecords(params)
                if (response.code === 200) {
                    alertRecords.value = response.data.list || []
                    totalItems.value = response.data.total || 0
                } else {
                    ElMessage.error(response.message || '获取预警记录失败')
                }
            } catch (error) {
                console.error('获取预警记录失败:', error)
                ElMessage.error('获取预警记录失败')
            } finally {
                loading.value = false
            }
        }
        
        // 查看详情
        const handleView = async (row) => {
            try {
                const response = await updateAlertStatus(row.alertId)
                if (response.code === 200) {
                    row.isRead = true
                    ElMessage.success('已更新预警状态')
                } else {
                    ElMessage.error(response.message || '更新预警状态失败')
                }
            } catch (error) {
                console.error('更新预警状态失败:', error)
                ElMessage.error('更新预警状态失败')
            }
        }
        
        // 刷新数据
        const refreshData = () => {
            loadAlertRecords()
        }
        
        // 分页处理
        const handlePagination = ({page, limit}) => {
            currentPage.value = page
            pageSize.value = limit
            loadAlertRecords()
        }
        
        // 初始化
        onMounted(() => {
            loadBaseOptions()
            loadAlertRecords()
        })
        
        return {
            // 数据
            areas,
            selectedArea,
            searchText,
            dateRange,
            alertRecords,
            loading,
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
    background-color: #f8fafc;

}

.operation-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    align-items: center;
    background-color: #fff;
    padding: 15px;
    border-radius: 12px;
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
