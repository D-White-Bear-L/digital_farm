<template>
    <div class="quality-evaluation">
        
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
            </div>
            
            <el-button type="success" @click="handleAddEvaluation">
                <el-icon><Plus /></el-icon>新增评估
            </el-button>
        </div>
        
        <!-- 土壤质量评估数据列表 -->
        <div class="table-container">
            <el-table :data="filteredEvaluations" style="width: 100%" border stripe class="custom-table">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="monitoringPoint" label="监测点名称" min-width="150" />
                <el-table-column prop="location" label="位置" min-width="150" />
                <el-table-column prop="qualityLevel" label="耕地质量等级" width="120" align="center">
                    <template #default="scope">
                        <el-tag :type="getQualityLevelType(scope.row.qualityLevel)">{{ scope.row.qualityLevel }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="evaluationDate" label="评定日期" min-width="180" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <div class="operation-buttons">
                            <el-button type="success" size="small" plain @click="handleViewDetail(scope.row)">查看详情</el-button>
                            <el-button type="danger" size="small" plain @click="handleDelete(scope.row)">评估记录</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container">
            <div class="pagination-info">
                <span class="total-info">共 {{ totalItems }} 条</span>
            </div>
            <div class="pagination-controls">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="sizes, prev, pager, next, jumper"
                    :total="totalItems"
                    background
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
                <div class="page-jump">
                    <span class="page-info">{{ pageSize }}条/页</span>
                    <el-input
                        v-model="jumpPage"
                        placeholder="跳至"
                        class="jump-input"
                        @keyup.enter="handleJumpPage"
                    />
                    <span>页</span>
                </div>
            </div>
        </div>
        
        <!-- 新增评估对话框 -->
        <el-dialog
            v-model="dialogVisible"
            title="新增土壤质量评估"
            width="600px"
        >
            <el-form :model="evaluationForm" label-width="120px" :rules="rules" ref="evaluationFormRef">
                <el-form-item label="监测点名称" prop="monitoringPoint">
                    <el-select v-model="evaluationForm.monitoringPoint" placeholder="请选择监测点">
                        <el-option v-for="point in monitoringPoints" :key="point.value" :label="point.label" :value="point.value" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="位置" prop="location">
                    <el-input v-model="evaluationForm.location" disabled />
                </el-form-item>
                
                <el-form-item label="耕地质量等级" prop="qualityLevel">
                    <el-select v-model="evaluationForm.qualityLevel" placeholder="请选择质量等级">
                        <el-option label="1" value="1" />
                        <el-option label="2" value="2" />
                        <el-option label="3" value="3" />
                        <el-option label="4" value="4" />
                        <el-option label="5" value="5" />
                        <el-option label="6" value="6" />
                        <el-option label="7" value="7" />
                        <el-option label="8" value="8" />
                        <el-option label="9" value="9" />
                        <el-option label="10" value="10" />
                        <el-option label="15" value="15" />
                    </el-select>
                </el-form-item>
                
                <el-form-item label="评定日期" prop="evaluationDate">
                    <el-date-picker 
                        v-model="evaluationForm.evaluationDate" 
                        type="date" 
                        placeholder="选择日期"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitEvaluation">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
    name: 'QualityEvaluation',
    components: {
        Search,
        Plus
    },
    setup() { // 在这里定义组件逻辑和数据
        // 基地选项
        const areas = [
            { label: '北莲', value: '北莲' },
            { label: '莲花岛', value: '莲花岛' },
            { label: '马村', value: '马村' }
        ]
        
        // 监测点选项
        const monitoringPoints = [
            { label: '北莲资4号监测点', value: '北莲资4号监测点', location: '北莲资4号监测点' },
            { label: '地块一基地', value: '地块一基地', location: '李四' },
            { label: '北莲资1号监测点', value: '北莲资1号监测点', location: '北莲资1号监测点' },
            { label: '莲花岛测点2', value: '莲花岛测点2', location: '莲花岛测点2' },
            { label: '莲花岛测点1', value: '莲花岛测点1', location: '莲花岛测点1' },
            { label: '北莲资2号监测点', value: '北莲资2号监测点', location: '北莲资2号监测点' },
            { label: '北莲资3号监测点', value: '北莲资3号监测点', location: '北莲资3号监测点' },
            { label: 'Test', value: 'Test', location: 'Test' },
            { label: '马村监测点2', value: '马村监测点2', location: '马村监测点2' },
            { label: '马村监测点1', value: '马村监测点1', location: '马村监测点1' }
        ]
        
        // 筛选条件
        const selectedArea = ref('')
        const searchText = ref('')
        
        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalItems = ref(11)
        const jumpPage = ref('')
        
        // 对话框相关
        const dialogVisible = ref(false)
        const evaluationFormRef = ref(null)
        
        // 表单数据
        const evaluationForm = reactive({
            id: '',
            monitoringPoint: '',
            location: '',
            qualityLevel: '',
            evaluationDate: new Date().toISOString().split('T')[0]
        })
        
        // 表单验证规则
        const rules = {
            monitoringPoint: [{ required: true, message: '请选择监测点', trigger: 'change' }],
            qualityLevel: [{ required: true, message: '请选择质量等级', trigger: 'change' }],
            evaluationDate: [{ required: true, message: '请选择评定日期', trigger: 'change' }]
        }
        
        // 模拟评估数据
        const evaluations = ref([
            {
                id: 1,
                monitoringPoint: '北莲资4号监测点',
                location: '北莲资4号监测点',
                qualityLevel: '3',
                evaluationDate: '2025-03-26 15:18:31'
            },
            {
                id: 2,
                monitoringPoint: '地块一基地',
                location: '李四',
                qualityLevel: '10',
                evaluationDate: '2025-03-20 14:26:01'
            },
            {
                id: 3,
                monitoringPoint: '北莲资1号监测点',
                location: '北莲资1号监测点',
                qualityLevel: '15',
                evaluationDate: '2024-11-17 16:13:19'
            },
            {
                id: 4,
                monitoringPoint: '莲花岛测点2',
                location: '莲花岛测点2',
                qualityLevel: '4',
                evaluationDate: '2024-11-17 16:13:12'
            },
            {
                id: 5,
                monitoringPoint: '莲花岛测点1',
                location: '莲花岛测点1',
                qualityLevel: '5',
                evaluationDate: '2024-11-17 16:12:46'
            },
            {
                id: 6,
                monitoringPoint: '北莲资2号监测点',
                location: '北莲资2号监测点',
                qualityLevel: '6',
                evaluationDate: '2024-10-15 10:25:30'
            },
            {
                id: 7,
                monitoringPoint: '北莲资3号监测点',
                location: '北莲资3号监测点',
                qualityLevel: '7',
                evaluationDate: '2024-10-10 09:15:20'
            },
            {
                id: 8,
                monitoringPoint: 'Test',
                location: 'Test',
                qualityLevel: '8',
                evaluationDate: '2024-09-25 14:30:45'
            },
            {
                id: 9,
                monitoringPoint: '马村监测点2',
                location: '马村监测点2',
                qualityLevel: '9',
                evaluationDate: '2024-09-20 11:20:15'
            },
            {
                id: 10,
                monitoringPoint: '马村监测点1',
                location: '马村监测点1',
                qualityLevel: '2',
                evaluationDate: '2024-09-15 16:45:30'
            },
            {
                id: 11,
                monitoringPoint: '测试点',
                location: '测试位置',
                qualityLevel: '1',
                evaluationDate: '2024-09-10 10:10:10'
            },
            {
                id: 12,
                monitoringPoint: '测试点2',
                location: '测试位置2',
                qualityLevel: '10',
                evaluationDate: '2024-08-25 15:30:00'
            },
            {
                id: 13,
                monitoringPoint: '测试点3',
                location: '测试位置3',
                qualityLevel: '5',
                evaluationDate: '2024-07-15 12:00:00'
            },
            {
                id: 14,
                monitoringPoint: '测试点4',
                location: '测试位置4',
                qualityLevel: '8',
                evaluationDate: '2024-06-05 09:00:00'

            }

        ])
        
        // 根据筛选条件过滤评估数据
        const filteredData = computed(() => {
            let result = evaluations.value
            
            // 按基地筛选
            if (selectedArea.value) {
                result = result.filter(item => item.monitoringPoint.includes(selectedArea.value))
            }
            
            // 按监测点名称搜索
            if (searchText.value) {
                result = result.filter(item => 
                    item.monitoringPoint.toLowerCase().includes(searchText.value.toLowerCase())
                )
            }
            
            return result
        })
        
        // 计算总条数
        const totalFilteredItems = computed(() => {
            return filteredData.value.length
        })
        
        // 更新总条数
        watch(totalFilteredItems, (newValue) => {
            totalItems.value = newValue
        }, { immediate: true })
        
        // 分页后的数据
        const filteredEvaluations = computed(() => {
            const startIndex = (currentPage.value - 1) * pageSize.value
            const endIndex = startIndex + pageSize.value
            
            return filteredData.value.slice(startIndex, endIndex)
        })
        
        // 监听监测点选择变化，自动填充位置
        watch(() => evaluationForm.monitoringPoint, (newVal) => {
            const selectedPoint = monitoringPoints.find(point => point.value === newVal)
            if (selectedPoint) {
                evaluationForm.location = selectedPoint.location
            }
        })
        
        // 根据质量等级返回对应的标签类型
        const getQualityLevelType = (level) => {
            const numLevel = parseInt(level)
            if (numLevel <= 3) return 'success'
            if (numLevel <= 6) return ''
            if (numLevel <= 9) return 'warning'
            return 'danger'
        }
        
        // 处理分页大小变化
        const handleSizeChange = (val) => {
            pageSize.value = val
            currentPage.value = 1
        }
        
        // 处理当前页变化
        const handleCurrentChange = (val) => {
            currentPage.value = val
        }
        
        // 处理页面跳转
        const handleJumpPage = () => {
            const page = parseInt(jumpPage.value)
            if (page && page > 0 && page <= Math.ceil(totalItems.value / pageSize.value)) {
                currentPage.value = page
            } else {
                ElMessage.warning('请输入有效的页码')
            }
            jumpPage.value = ''
        }
        
        // 处理新增评估
        const handleAddEvaluation = () => {
            // 重置表单
            Object.keys(evaluationForm).forEach(key => {
                if (key !== 'evaluationDate') {
                    evaluationForm[key] = ''
                } else {
                    evaluationForm[key] = new Date().toISOString().split('T')[0]
                }
            })
            
            dialogVisible.value = true
        }
        
        // 处理查看详情
        const handleViewDetail = (row) => {
            ElMessage.info(`查看 ${row.monitoringPoint} 的详细评估信息`)
            // 这里可以实现查看详情的逻辑
        }
        
        // 处理删除
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                `确定要删除 ${row.monitoringPoint} 的评估记录吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(() => {
                // 模拟删除操作
                const index = evaluations.value.findIndex(item => item.id === row.id)
                if (index !== -1) {
                    evaluations.value.splice(index, 1)
                    ElMessage.success('删除成功')
                }
            }).catch(() => {
                // 取消删除
            })
        }
        
        // 提交评估表单
        const submitEvaluation = () => {
            evaluationFormRef.value.validate((valid) => {
                if (valid) {
                    // 模拟添加新评估
                    const newEvaluation = {
                        id: evaluations.value.length + 1,
                        monitoringPoint: evaluationForm.monitoringPoint,
                        location: evaluationForm.location,
                        qualityLevel: evaluationForm.qualityLevel,
                        evaluationDate: evaluationForm.evaluationDate
                    }
                    
                    evaluations.value.unshift(newEvaluation)
                    dialogVisible.value = false
                    ElMessage.success('评估添加成功')
                } else {
                    return false
                }
            })
        }
        
        return {
            areas,
            monitoringPoints,
            selectedArea,
            searchText,
            currentPage,
            pageSize,
            totalItems,
            jumpPage,
            dialogVisible,
            evaluationForm,
            evaluationFormRef,
            rules,
            filteredEvaluations,
            getQualityLevelType,
            handleSizeChange,
            handleCurrentChange,
            handleJumpPage,
            handleAddEvaluation,
            handleViewDetail,
            handleDelete,
            submitEvaluation
        }
    }
}
</script>

<style scoped>
.quality-evaluation {

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

.add-btn {
    padding: 9px 20px;
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

.operation-buttons {
    display: flex;
    gap: 10px;
}

.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.page-jump {
    display: flex;
    align-items: center;
    margin-left: 15px;
}

.total-info {
    color: #606266;
}

.page-info {
    margin: 0 10px;
    color: #606266;
}

.jump-input {
    width: 50px;
    margin: 0 5px;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
    background-color: #67c23a;
}

:deep(.el-button--success--small) {
    --el-button-bg-color: #def3d6;
    --el-button-border-color: #67c23a;
    --el-button-hover-bg-color: #85ce61;
    --el-button-hover-border-color: #85ce61;
}
</style>