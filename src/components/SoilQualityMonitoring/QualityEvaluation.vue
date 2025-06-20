<template>
    <div class="quality-evaluation">
        
        <!-- 顶部操作栏 -->
        <div class="operation-bar">
            <div class="left-filters">
                <el-select v-model="selectedBase" placeholder="基地" class="base-select">
                    <el-option label="全部" value=""></el-option>
                    <el-option v-for="base in bases" :key="base.value" :label="base.label" :value="base.value" />
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
            <el-table 
                v-loading="loading"
                :data="evaluations" 
                style="width: 100%" 
                border 
                stripe 
                class="custom-table"
                element-loading-text="数据加载中..."
                element-loading-background="rgba(255, 255, 255, 0.7)"
            >
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="pointName" label="监测点名称" min-width="150" />
                <el-table-column prop="baseName" label="基地" min-width="150" />
                <el-table-column prop="qualityLevel" label="耕地质量等级" width="120" align="center">
                    <template #default="scope">
                        <el-tag :type="getQualityLevelType(scope.row.qualityLevel)">{{ scope.row.qualityLevel }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="evaluator" label="评估人" min-width="150" />
                <el-table-column prop="evaluationDate" label="评定日期" min-width="180" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <div class="operation-buttons">
                            <el-button type="text"  plain @click="handleViewDetail(scope.row)">查看详情</el-button>
                            <!-- <el-button type="danger" size="small" plain @click="handleShowHistory(scope.row)">评估记录</el-button> -->
                             <el-button type="danger" size="small" plain @click="handleDelete(scope.row)">删除</el-button>
                        </div>
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
                
                <el-form-item label="评估人" prop="evaluator">
                    <el-input v-model="evaluationForm.evaluator"></el-input>
                </el-form-item>

                <el-form-item label="备注" prop="remarks">
                    <el-input v-model="evaluationForm.remarks" type="textbase" :rows="4" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitEvaluation">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 历史评估记录对话框 -->
        <el-dialog
            v-model="historyDialogVisible"
            :title="`${currentMonitoringPoint} 的历史评估记录`"
            width="750px"
            class="history-dialog"
        >
            <div class="history-dialog-content">
                <el-table 
                    :data="historyRecords" 
                    border 
                    style="width: 100%"
                    :header-cell-style="{background: '#f5f7fa', color: '#606266', fontWeight: 'bold'}"
                    :cell-style="{padding: '12px 0'}"
                >
                    <el-table-column 
                        prop="evaluationDate" 
                        label="评估日期" 
                        width="160" 
                        align="center"
                    />
                    <el-table-column 
                        prop="qualityLevel" 
                        label="质量等级" 
                        width="120" 
                        align="center"
                    >
                        <template #default="scope">
                            <el-tag 
                                :type="getQualityLevelType(scope.row.qualityLevel)"
                                size="small"
                            >
                                {{ scope.row.qualityLevel }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        prop="evaluator" 
                        label="评估人" 
                        width="120"
                        align="center"
                    />
                    <el-table-column 
                        prop="remarks" 
                        label="备注" 
                        min-width="200"
                    />
                    <el-table-column 
                        fixed="right" 
                        align="center"
                        label="操作" 
                        width="150"
                    >

                        <template #default="scope">
                            <el-button
                                type="text"
                                @click="handleDeleteHistoryRecord(scope.row.id)" 
                            >
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <template #footer>
                <div class="history-dialog-footer">
                    <div class="quality-level-description">
                        <p><el-tag type="success">1-4级</el-tag> 优等地</p>
                        <p><el-tag>5-8级</el-tag> 高等地</p>
                        <p><el-tag type="warning">9-12级</el-tag> 中等地</p>
                        <p><el-tag type="danger">13-15级</el-tag> 低等地</p>
                    </div>
                    <!-- <el-button 
                        type="primary" 
                        @click="historyDialogVisible = false"
                        size="small"
                    >
                        关闭
                    </el-button> -->
                </div>
            </template>
        </el-dialog>

        <!-- 查看详情对话框 -->
        <el-dialog
            v-model="detailDialogVisible"
            title="查看详情与评估"
            width="500px"
            @close="resetDetailForm"
            class="detail-dialog-custom"
        >
            <div class="detail-dialog-content">
                <div class="quality-description-section">
                    <h4>耕地质量说明</h4>
                    <p>1-4 等是优等地</p>
                    <p>5-8 等是高等地</p>
                    <p>9-12 等是中等地</p>
                    <p>13-15 等是低等地</p>
                </div>

                <el-divider />

                <div class="quality-assessment-section">
                    <h4>质量等级评定</h4>
                    <el-form :model="detailForm" label-width="0px" ref="detailFormRef">
                        <el-form-item prop="qualityLevel">
                            <el-radio-group v-model="detailForm.qualityLevel" class="quality-radio-group">
                                <el-radio v-for="level in 15" :key="level" :label="String(level)" border>{{ level }}级</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="detailDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitDetailEvaluation">确定</el-button>
                </span>
            </template>
        </el-dialog>

    </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBar from '@/components/PageBar.vue'
import { getSoilQualityEvaluationList, addSoilQualityEvaluation, updateSoilQualityEvaluation, deleteSoilQualityEvaluation, getBaseOptions, getMonitoringPointOptions } from '@/api/SoilQuality'
import { debounce } from 'lodash' // 添加 lodash 的 debounce 导入

export default {
    name: 'QualityEvaluation',
    components: {
        Search,
        Plus,
        PageBar
    },
    setup() { // 在这里定义组件逻辑和数据
        // 基地选项
        const bases = ref([]) // 基地选项
        
        // 监测点选项
        const monitoringPoints = ref([]) 
        
        // 筛选条件
        const selectedBase = ref('')
        const searchText = ref('')
        const selectedQuality = ref('') // 添加缺失的质量等级筛选变量
        
        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalItems = ref(0) // 总条数
        
        // 对话框相关 (新增评估)
        const dialogVisible = ref(false)
        const evaluationFormRef = ref(null)

        // 查看详情对话框相关
        const detailDialogVisible = ref(false)
        const detailFormRef = ref(null)
        const detailForm = reactive({ // 查看详情表单数据
            evaluationId: null,
            monitoringPoint: '',
            qualityLevel: ''
        })
        
        // 历史评估记录对话框相关
        const historyDialogVisible = ref(false)
        const currentMonitoringPoint = ref('')
        const historyRecords = ref([])
        
        // 评估数据 - 初始化为空数组
        const evaluations = ref([])
        
        
        // 表单数据
        const evaluationForm = reactive({
            pointId: null,
            location: '',
            qualityLevel: '',
            evaluator: '',
            evaluationDate: new Date().toISOString().split('T')[0]
        })
        
        // 表单验证规则
        const rules = {
            monitoringPoint: [{ required: true, message: '请选择监测点', trigger: 'change' }],
            qualityLevel: [{ required: true, message: '请选择质量等级', trigger: 'change' }],
            evaluationDate: [{ required: true, message: '请选择评定日期', trigger: 'change' }]
        }

        // 查看详情表单的重置逻辑
        const resetDetailForm = () => {
            if (detailFormRef.value) {
                detailFormRef.value.resetFields();
            }
            detailForm.evaluationId = null;
            detailForm.monitoringPoint = '';
            detailForm.qualityLevel = '';
        }
        
        // 监听监测点选择变化，自动填充位置和设置pointId
        watch(() => evaluationForm.monitoringPoint, (newVal) => {
            const selectedPoint = monitoringPoints.value.find(point => point.value === newVal)
            if (selectedPoint) {
                evaluationForm.location = selectedPoint.location || ''
                evaluationForm.pointId = newVal // 设置pointId为选中的监测点ID
            } else {
                evaluationForm.pointId = null // 如果没有选中监测点，将pointId设为null
                evaluationForm.location = ''
            }
        })
        
        // 根据质量等级返回对应的标签类型
        const getQualityLevelType = (level) => {
            const numLevel = parseInt(level)
            if (numLevel <= 4) return 'success'
            if (numLevel <= 8) return ''
            if (numLevel <= 12) return 'warning'
            return 'danger'
        }
        
        // 获取基地选项
        const fetchBaseOptions = async () => {
            try {
                const res = await getBaseOptions()
                if (res.code === 200) {
                    // 将获取的基地选项赋值给 bases
                    bases.value = res.data
                }else {
                    ElMessage.error(res.message || '获取基地选项失败')
                }
            } catch (error) {
                ElMessage.error('获取基地选项失败'),
                console.error('获取基地选项失败:', error)
            }
        }
        
        // 获取监测点选项
        const fetchMonitoringPoints = async () => {
            try {
                const res = await getMonitoringPointOptions()
                // console.log('监测点数据返回:', res.data) // 添加这行调试代码 test
                if (res.code === 200) {
                    monitoringPoints.value = res.data.list.map(item => ({ // 返回的是data.list
                        label: item.pointName,
                        value: item.pointId,
                        // location: item.location || '',
                    }))
                    // console.log('处理后的监测点数据:', monitoringPoints.value) // 添加这行调试代码
                } else {
                    ElMessage.error(res.message || '获取监测点选项失败')
                }
            } catch (error) {
                ElMessage.error('获取监测点选项失败')
                console.error('获取监测点选项失败:', error)
            }
        }
        
        // 加载状态
        const loading = ref(false)
        
        // 获取土壤质量评估列表
        // 获取土壤质量评估列表
        const fetchSoilQualityEvaluations = async () => {
            loading.value = true
            try {
                const params = {
                    baseId: selectedBase.value,
                    keyword: searchText.value,
                    pageNum: currentPage.value,
                    pageSize: pageSize.value
                }
                
                // console.log('发送分页请求参数:', params) // 添加调试日志 test
                
                const res = await getSoilQualityEvaluationList(params)
                if (res.code === 200) {
                    // 直接使用后端返回的数据
                    evaluations.value = (res.data.list || []).map(item => ({
                        ...item,
                        id: item.evaluationId, // 将 evaluationId 映射为 id
                        monitoringPoint: item.pointName || `监测点${item.pointId}` // 如果 pointName 为 null，则使用 pointId 代替

                    }))
                    totalItems.value = res.data.total || 0

                    // test
                    // console.log('获取到的评估数据:', evaluations.value)
                    // console.log('总条数:', totalItems.value)
                } else { 
                    ElMessage.error(res.message || '获取土壤质量评估列表失败')
                }
            } catch (error) {
                console.error('获取土壤质量评估列表失败:', error)
                ElMessage.error('获取评估数据失败')
            } finally {
                loading.value = false
            }
        }
        
        // 处理分页变化
        const handlePagination = debounce(({page, limit}) => { // 添加 debounce 防抖动
            currentPage.value = page
            pageSize.value = limit
            fetchSoilQualityEvaluations()
        }, 100)
        
        // 处理新增评估
        const handleAddEvaluation = () => {
            // 重置表单
            Object.keys(evaluationForm).forEach(key => {
                if (key !== 'evaluationDate') {
                    if(key === 'pointId') {
                        evaluationForm[key] = null
                    } else {
                        evaluationForm[key] = ''
                    }
                } else {
                    evaluationForm[key] = new Date().toISOString().split('T')[0]
                }
            })
            
            dialogVisible.value = true
        }
        
        // 处理查看详情
        const handleViewDetail = (row) => {
            detailForm.evaluationId = row.evaluationId || row.id;
            detailForm.monitoringPoint = row.pointName || row.monitoringPoint;
            detailForm.qualityLevel = row.qualityLevel;
            detailDialogVisible.value = true;
        }
        
        // 处理查看历史记录
        const handleShowHistory = (row) => {
            currentMonitoringPoint.value = row.pointName || row.monitoringPoint || `监测点${row.pointId}`
            // 这里可以添加获取历史记录的接口调用
            // 暂时使用模拟数据
            historyRecords.value = [
                {
                    evaluationDate: '2024-03-15',
                    qualityLevel: '3',
                    evaluator: '张三',
                    remarks: '土壤肥沃，适合种植'
                },
                {
                    evaluationDate: '2023-10-20',
                    qualityLevel: '5',
                    evaluator: '李四',
                    remarks: '土壤质量一般'
                }
            ]
            historyDialogVisible.value = true
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
            ).then(async () => {
                try {
                    const res = await deleteSoilQualityEvaluation(row.id)
                    if (res.code === 200) {
                        ElMessage.success('删除成功')
                        fetchSoilQualityEvaluations()
                    } else {
                        ElMessage.error(res.message || '删除失败')
                    }
                } catch (error) {
                    console.error('删除失败:', error)
                    ElMessage.error('删除失败')
                }
            }).catch(() => {
                // 取消删除
                ElMessage.info('已取消删除')
            })
        }
        
        // 提交新增评估
        const submitEvaluation = async () => {
            if (!evaluationFormRef.value) return
            
            await evaluationFormRef.value.validate(async (valid) => {
                if (valid) {
                    // 添加：检查 pointId 是否存在
                    if (!evaluationForm.pointId) {
                        ElMessage.error('监测点ID不能为空，请重新选择监测点')
                        return
                    }
                    
                    try {
                        // 转换为后端需要的格式
                        const submitData = {
                            pointId: evaluationForm.pointId,
                            qualityLevel: evaluationForm.qualityLevel,
                            evaluationDate: evaluationForm.evaluationDate,
                            evaluator: evaluationForm.evaluator || '系统用户',
                            remarks: evaluationForm.remarks || '无',
                        }
                        console.log('提交的数据:', submitData)
                        const res = await addSoilQualityEvaluation(submitData)
                        if (res.code === 200) {
                            ElMessage.success('添加成功')
                            dialogVisible.value = false
                            fetchSoilQualityEvaluations() // 刷新列表
                        } else {
                            ElMessage.error(res.message || '添加失败')
                        }
                    } catch (error) {
                        console.error('添加失败:', error)
                        ElMessage.error('添加失败')
                    }
                }
            })
        }
        
        // 提交详情评估
        const submitDetailEvaluation = async () => {
            try {
                const updateData = {
                    evaluationId: detailForm.evaluationId, // 使用 evaluationId 而不是 id
                    qualityLevel: detailForm.qualityLevel
                }
                
                const res = await updateSoilQualityEvaluation(updateData)
                if (res.code === 200) {
                    ElMessage.success('更新成功')
                    detailDialogVisible.value = false
                    fetchSoilQualityEvaluations() // 刷新列表
                } else {
                    ElMessage.error(res.message || '更新失败')
                }
            } catch (error) {
                console.error('更新失败:', error)
                ElMessage.error('更新失败')
            }
        }
        
        // 组件挂载时获取数据
        onMounted(() => {
            fetchBaseOptions()
            fetchMonitoringPoints()
            fetchSoilQualityEvaluations()
        })
        
        // 监听筛选条件变化，重新获取数据
        watch([selectedBase, searchText], () => {
            currentPage.value = 1 // 重置页码
            fetchSoilQualityEvaluations()
        })
        
        return {
            bases,
            monitoringPoints,
            selectedBase,
            searchText,
            selectedQuality,
            currentPage,
            pageSize,
            totalItems,
            evaluations,
            dialogVisible,
            evaluationForm,
            evaluationFormRef,
            rules,
            handleAddEvaluation,
            submitEvaluation,
            handleViewDetail,
            handleDelete,
            handlePagination,
            getQualityLevelType,
            // 详情对话框
            detailDialogVisible,
            detailForm,
            detailFormRef,
            submitDetailEvaluation,
            resetDetailForm,
            // 历史记录对话框
            historyDialogVisible,
            currentMonitoringPoint,
            historyRecords,
            handleShowHistory
        }
    }
}
</script>

<style scoped>
.quality-evaluation {
    border-radius:12px ;
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
    border-radius:12px ;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.left-filters {
    display: flex;
    gap: 15px;
}

.base-select {
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

.detail-dialog-custom .quality-description-section h4,
.detail-dialog-custom .quality-assessment-section h4 {
    margin-bottom: 10px;
    font-size: 16px;
    color: #303133;
}

.detail-dialog-custom .quality-description-section p {
    margin-bottom: 5px;
    font-size: 14px;
    color: #606266;
}

.detail-dialog-custom .quality-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px; /* 控制单选框之间的间距 */
}

.detail-dialog-custom .el-radio.is-bordered {
    margin-left: 0 !important; /* 覆盖 Element Plus 默认的 margin-left */
    margin-right: 0; /* 根据需要调整，如果gap已足够则不需要 */
    padding: 8px 15px; /* 调整内边距使按钮更紧凑 */
}

.detail-dialog-content {
    padding: 0 20px; /* 给对话框内容一些内边距 */
}

.el-divider {
    margin: 20px 0; /* 调整分割线上下的间距 */
}

/* 历史记录对话框样式 */
.history-dialog .el-dialog__header {
    border-bottom: 1px solid #ebeef5;
    padding: 15px 20px;
    margin: 0;
}

.history-dialog .el-dialog__body {
    padding: 20px;
}

.history-dialog-content {
    max-height: 60vh;
    overflow-y: auto;
}

.history-dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

.quality-level-description {
    display: flex;
    gap: 20px;
}

.quality-level-description p {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 14px;
    color: #606266;
}

.quality-level-description .el-tag {
    margin-right: 5px;
}

</style>