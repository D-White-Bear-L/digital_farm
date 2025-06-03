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
                            <el-button type="danger" size="small" plain @click="handleShowHistory(scope.row)">评估记录</el-button>
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
                        prop="notes" 
                        label="备注" 
                        min-width="200"
                    />
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
                    <el-button 
                        type="primary" 
                        @click="historyDialogVisible = false"
                        size="small"
                    >
                        关闭
                    </el-button>
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
import { ref, reactive, computed, watch } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageBar from '@/components/PageBar.vue'

export default {
    name: 'QualityEvaluation',
    components: {
        Search,
        Plus,
        PageBar
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
        const selectedQuality = ref('') // 添加缺失的质量等级筛选变量
        
        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalItems = computed(() => filteredData.value.length) // 修正：totalItems 应该基于整体过滤后的数据
        
        // 对话框相关 (新增评估)
        const dialogVisible = ref(false)
        const evaluationFormRef = ref(null)

        // 新增：查看详情对话框相关
        const detailDialogVisible = ref(false)
        const detailFormRef = ref(null)
        const detailForm = reactive({
            id: null,
            monitoringPoint: '',
            qualityLevel: ''
        })
        
        // 过滤后的数据 (表格使用)
        const filteredData = computed(() => { // 将 filteredEvaluations 重命名为 filteredData，避免重复声明
            let result = evaluations.value
            
            // 基地筛选
            if (selectedArea.value) {
                result = result.filter(item => item.monitoringPoint.includes(selectedArea.value))
            }
            
            // 监测点名称筛选
            if (searchText.value) {
                result = result.filter(item => item.monitoringPoint.includes(searchText.value))
            }
            
            // 耕地质量等级筛选
            if (selectedQuality.value) {
                result = result.filter(item => item.qualityLevel === selectedQuality.value)
            }
            
            return result
        })

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

        // 新增：查看详情表单的重置逻辑 (如果需要)
        const resetDetailForm = () => {
            if (detailFormRef.value) {
                detailFormRef.value.resetFields();
            }
            detailForm.id = null;
            detailForm.monitoringPoint = '';
            detailForm.qualityLevel = '';
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
        const filteredEvaluationsData = computed(() => { // 重命名此处的 filteredData
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
            return filteredEvaluationsData.value.length // 更新依赖
        })
        
        // 更新总条数
        watch(totalFilteredItems, (newValue) => {
            totalItems.value = newValue
        }, { immediate: true })
        
        // 分页后的数据
        const filteredEvaluations = computed(() => {
            const startIndex = (currentPage.value - 1) * pageSize.value
            const endIndex = startIndex + pageSize.value
            
            return filteredEvaluationsData.value.slice(startIndex, endIndex) // 更新依赖
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
            detailForm.id = row.id;
            detailForm.monitoringPoint = row.monitoringPoint;
            detailForm.qualityLevel = row.qualityLevel;
            detailDialogVisible.value = true;
        }

        // 提交详情评估
        const submitDetailEvaluation = () => {
            if (!detailForm.qualityLevel) {
                ElMessage.warning('请选择质量等级');
                return;
            }

            // 更新评估数据
            const index = evaluations.value.findIndex(item => item.id === detailForm.id);
            if (index !== -1) {
                evaluations.value[index].qualityLevel = detailForm.qualityLevel;
                ElMessage.success('评估更新成功');
                detailDialogVisible.value = false;
            }
        }
        
        // 历史评估记录相关
        const historyDialogVisible = ref(false)
        const historyRecords = ref([])
        const currentMonitoringPoint = ref('')

        // 显示历史评估记录
        const handleShowHistory = (row) => {
            currentMonitoringPoint.value = row.monitoringPoint
            // 这里应该调用API获取历史记录，暂时使用模拟数据
            historyRecords.value = [
                {
                    evaluationDate: '2023-01-15',
                    qualityLevel: '3',
                    evaluator: '张三',
                    notes: '土壤质量良好'
                },
                {
                    evaluationDate: '2022-12-10',
                    qualityLevel: '10',
                    evaluator: '李四',
                    notes: '需要适量施肥'
                },
                {
                    evaluationDate: '2022-11-05',
                    qualityLevel: '15',
                    evaluator: '王五',
                    notes: '土壤养分不足'
                }
            ]
            historyDialogVisible.value = true
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
            monitoringPoints, // 保留这个
            selectedArea,
            searchText,
            selectedQuality, // 确保导出
            currentPage,
            pageSize,
            totalItems,
            filteredEvaluations, // Table uses paginatedEvaluations
            // paginatedEvaluations, // 确保此项用于表格数据绑定 - 此处注释掉，因为filteredEvaluations已经承担了分页数据的角色
            dialogVisible,
            evaluationForm,
            evaluationFormRef,
            rules,
            handleAddEvaluation,
            submitEvaluation,
            handleViewDetail,
            // handlePagination,
            getQualityLevelType,
            // monitoringPoints, // 移除这个重复的导出
            // 新增导出
            detailDialogVisible,
            detailForm,
            detailFormRef,
            submitDetailEvaluation,
            resetDetailForm,
            historyDialogVisible,
            historyRecords,
            handleShowHistory
        }
    }
}
</script>

<style scoped>
/* .quality-evaluation {

} */

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