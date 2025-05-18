<template>
    <div class="manual-container">
        <!-- 顶部操作栏 -->
        <div class="operation-bar">
            <el-select v-model="selectedArea" placeholder="基地" clearable>
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
                start-placeholder="采样开始日期"
                end-placeholder="采样结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="date-picker"
            />

            <el-button type="success" @click="handleAddReport">
                <el-icon><Plus /></el-icon>数据上报
            </el-button>
        </div>

        <!-- 土壤质量数据列表 -->
        <el-table :data="filteredReports" style="width: 100%" border stripe>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="monitoringPoint" label="监测点名称" width="120" />
            <el-table-column prop="soilSampleNo" label="土样编号" width="100" />
            <el-table-column prop="soilType" label="土样类型" width="100" />
            <el-table-column prop="sampleDepth" label="采样深度(cm)" width="120" align="center" />
            <el-table-column prop="sampleDate" label="采样时间" width="120" />
            <el-table-column prop="ph" label="pH" width="80" align="center" />
            <el-table-column prop="waterContent" label="水分(%ww/c)" width="120" align="center" />
            <el-table-column prop="conductivity" label="电导率(mS/c m)" width="120" align="center" />
            <el-table-column prop="organicMatter" label="有机质(g/kg)" width="120" align="center" />
            <el-table-column prop="availableP" label="有效磷(mg/kg)" width="120" align="center" />
            <el-table-column prop="availableK" label="速效钾(mg/kg)" width="120" align="center" />
            <el-table-column prop="availableN" label="有效氮(mg/kg)" width="120" align="center" />
            <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                    <el-button link type="success" @click="handleEdit(scope.row)">修改</el-button>
                    <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!-- 分页  -->
        <PageBar
            v-model:page="currentPage"
            v-model:limit="pageSize"
            :total="totalItems"
            @pagination="handlePagination" 
        />
        
        <!-- 数据上报/编辑对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogType === 'add' ? '土壤质量数据上报' : '编辑土壤质量数据'"
            width="800px"
        >
            <el-form :model="reportForm" label-width="120px" :rules="rules" ref="reportFormRef">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="监测点名称" prop="monitoringPoint">
                            <el-select v-model="reportForm.monitoringPoint" placeholder="请选择监测点">
                                <el-option v-for="point in monitoringPoints" :key="point.value" :label="point.label" :value="point.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="土样编号" prop="soilSampleNo">
                            <el-input v-model="reportForm.soilSampleNo" />
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="土样类型" prop="soilType">
                            <el-select v-model="reportForm.soilType" placeholder="请选择土样类型">
                                <el-option label="粘土" value="粘土" />
                                <el-option label="沙地" value="沙地" />
                                <el-option label="沙土" value="沙土" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="采样深度(cm)" prop="sampleDepth">
                            <el-input-number v-model="reportForm.sampleDepth" :min="0" :max="100" />
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="采样时间" prop="sampleDate">
                            <el-date-picker 
                                v-model="reportForm.sampleDate" 
                                type="date" 
                                placeholder="选择日期"
                                format="YYYY-MM-DD"
                                value-format="YYYY-MM-DD"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="pH值" prop="ph">
                            <el-input-number v-model="reportForm.ph" :min="0" :max="14" :precision="1" :step="0.1" />
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="水分(%ww/c)" prop="waterContent">
                            <el-input-number v-model="reportForm.waterContent" :min="0" :max="100" :precision="1" :step="0.1" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="电导率(mS/c m)" prop="conductivity">
                            <el-input-number v-model="reportForm.conductivity" :min="0" :precision="2" :step="0.1" />
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="有机质(g/kg)" prop="organicMatter">
                            <el-input-number v-model="reportForm.organicMatter" :min="0" :precision="1" :step="0.1" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="有效磷(mg/kg)" prop="availableP">
                            <el-input-number v-model="reportForm.availableP" :min="0" :precision="1" :step="0.1" />
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="速效钾(mg/kg)" prop="availableK">
                            <el-input-number v-model="reportForm.availableK" :min="0" :precision="1" :step="0.1" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="有效氮(mg/kg)" prop="availableN">
                            <el-input-number v-model="reportForm.availableN" :min="0" :precision="1" :step="0.1" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitReport">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox} from 'element-plus'
import PageBar from '@/components/PageBar.vue'

export default {
    name: 'ManualReport',
    components: {
        Search,
        Plus,
        PageBar
    },
    setup() {
        // 基地选项
        const areas = [
            { label: '地块一基地', value: '地块一基地' },
            { label: '莲花岛测点', value: '莲花岛测点' },
            { label: '北莲资测点', value: '北莲资测点' }
        ]
        
        // 监测点选项
        const monitoringPoints = [
            { label: '地块一基地', value: '地块一基地' },
            { label: '莲花岛测点1', value: '莲花岛测点1' },
            { label: '莲花岛测点2', value: '莲花岛测点2' },
            { label: '北莲资1号测点', value: '北莲资1号测点' }
        ]
        
        // 筛选条件
        const selectedArea = ref('')
        const searchText = ref('')
        const dateRange = ref([])
        
        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalItems = computed(() => filteredReports.value.length)
        
        // 分页处理函数
        const handlePagination = ({page, limit}) => {
            currentPage.value = page
            pageSize.value = limit
            console.log('currentPage:', currentPage.value, 'pageSize:', pageSize.value)
        }
        
        // 对话框相关
        const dialogVisible = ref(false)
        const dialogType = ref('add')
        const reportFormRef = ref(null)
        
        // 表单数据
        const reportForm = reactive({
            id: '',
            monitoringPoint: '',
            soilSampleNo: '',
            soilType: '',
            sampleDepth: 0,
            sampleDate: '',
            ph: 0,
            waterContent: 0,
            conductivity: 0,
            organicMatter: 0,
            availableP: 0,
            availableK: 0,
            availableN: 0
        })
        
        // 表单验证规则
        const rules = {
            monitoringPoint: [{ required: true, message: '请选择监测点', trigger: 'change' }],
            soilSampleNo: [{ required: true, message: '请输入土样编号', trigger: 'blur' }],
            soilType: [{ required: true, message: '请选择土样类型', trigger: 'change' }],
            sampleDate: [{ required: true, message: '请选择采样时间', trigger: 'change' }]
        }
        
        // 模拟数据
        const soilReports = ref([
            {
                id: 1,
                monitoringPoint: '地块一基地',
                soilSampleNo: 'T457',
                soilType: '粘土',
                sampleDepth: 3,
                sampleDate: '2025-03-18',
                ph: 7.2,
                waterContent: 56.8,
                conductivity: 56.8,
                organicMatter: 44.6,
                availableP: 0.65,
                availableK: 165.4,
                availableN: 659
            },
            {
                id: 2,
                monitoringPoint: '莲花岛测点1',
                soilSampleNo: 'V32',
                soilType: '沙地',
                sampleDepth: 30,
                sampleDate: '2024-10-28',
                ph: 3,
                waterContent: 3,
                conductivity: 3,
                organicMatter: 3,
                availableP: 3,
                availableK: 3,
                availableN: 3
            },
            {
                id: 3,
                monitoringPoint: '北莲资4号测点',
                soilSampleNo: '111',
                soilType: '111',
                sampleDepth: 111,
                sampleDate: '2024-10-25',
                ph: 1,
                waterContent: 1,
                conductivity: 1,
                organicMatter: 1,
                availableP: 1,
                availableK: 1,
                availableN: 1
            },
            {
                id: 4,
                monitoringPoint: '莲花岛测点2',
                soilSampleNo: 'V335',
                soilType: '沙地',
                sampleDepth: 30,
                sampleDate: '2024-09-14',
                ph: 4,
                waterContent: 4,
                conductivity: 4,
                organicMatter: 4,
                availableP: 4,
                availableK: 4,
                availableN: 4
            },
            {
                id: 5,
                monitoringPoint: '莲花岛测点1',
                soilSampleNo: 'v300',
                soilType: '沙地',
                sampleDepth: 30,
                sampleDate: '2024-08-10',
                ph: 2,
                waterContent: 2,
                conductivity: 2,
                organicMatter: 2,
                availableP: 2,
                availableK: 2,
                availableN: 2
            },
            {
                id: 6,
                monitoringPoint: '莲花岛测点1',
                soilSampleNo: 'v2003',
                soilType: '沙地',
                sampleDepth: 30,
                sampleDate: '2024-08-06',
                ph: 1,
                waterContent: 1,
                conductivity: 1,
                organicMatter: 1,
                availableP: 1,
                availableK: 1,
                availableN: 1
            },
            {
                id: 7,
                monitoringPoint: '北莲资1号测点',
                soilSampleNo: 'WY7306',
                soilType: '沙土',
                sampleDepth: 50,
                sampleDate: '2023-06-14',
                ph: 7.2,
                waterContent: 56.8,
                conductivity: 0.65,
                organicMatter: 44.6,
                availableP: 165.2,
                availableK: 165.4,
                availableN: 659.2
            },
            {
                id: 8,
                monitoringPoint: '北莲资1号测点',
                soilSampleNo: 'WY7305',
                soilType: '沙土',
                sampleDepth: 50,
                sampleDate: '2023-05-19',
                ph: 6.9,
                waterContent: 53.1,
                conductivity: 5.7,
                organicMatter: 55.3,
                availableP: 332.8,
                availableK: 155.9,
                availableN: 388.7
            },
            {
                id: 9,
                monitoringPoint: '北莲资1号测点',
                soilSampleNo: 'WY7304',
                soilType: '沙土',
                sampleDepth: 50,
                sampleDate: '2023-04-14',
                ph: 6.2,
                waterContent: 87.4,
                conductivity: 0.12,
                organicMatter: 44.6,
                availableP: 325.7,
                availableK: 89.4,
                availableN: 135.6
            },
            {
                id: 10,
                monitoringPoint: '北莲资1号测点',
                soilSampleNo: 'WY7303',
                soilType: '沙土',
                sampleDepth: 50,
                sampleDate: '2023-03-09',
                ph: 5.6,
                waterContent: 68.6,
                conductivity: 0.35,
                organicMatter: 35.9,
                availableP: 458.7,
                availableK: 221.4,
                availableN: 45
            }
        ])
        
        // 过滤后的数据
        const filteredReports = computed(() => {
            let result = soilReports.value
            
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
                const startDate = dateRange.value[0]
                const endDate = dateRange.value[1]
                result = result.filter(item => {
                    return item.sampleDate >= startDate && item.sampleDate <= endDate
                })
            }
            
            return result
        })

                // 处理编辑
                const handleEdit = (row) => {
            dialogType.value = 'edit'
            Object.keys(reportForm).forEach(key => {
                reportForm[key] = row[key]
            })
            dialogVisible.value = true
        }
        
        // 处理删除
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                `确认删除"${row.monitoringPoint}"的土壤质量数据吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                // 从数组中移除该数据
                const index = soilReports.value.findIndex(item => item.id === row.id)
                if (index !== -1) {
                    soilReports.value.splice(index, 1)
                    totalItems.value--
                }
                ElMessage.success('删除成功')
            }).catch(() => {})
        }
        // 处理添加报告
        const handleAddReport = () => {
            dialogType.value = 'add'
            Object.keys(reportForm).forEach(key => {
                if (key !== 'id') {
                    reportForm[key] = key === 'sampleDepth' ? 0 : ''
                }
            })
            dialogVisible.value = true
        }
        
        
        // 提交报告
        const submitReport = () => {
            reportFormRef.value.validate((valid) => {
                if (valid) {
                    if (dialogType.value === 'add') {
                        // 添加新报告
                        const newReport = { ...reportForm }
                        newReport.id = soilReports.value.length + 1
                        soilReports.value.unshift(newReport)
                        totalItems.value++
                        ElMessage.success('数据上报成功')
                    } else {
                        // 更新现有报告
                        const index = soilReports.value.findIndex(item => item.id === reportForm.id)
                        if (index !== -1) {
                            soilReports.value[index] = { ...reportForm }
                        }
                        ElMessage.success('数据更新成功')
                    }
                    dialogVisible.value = false
                } else {
                    return false
                }
            })
        }
        
        // 初始化
        onMounted(() => {
            // 可以在这里加载数据
        })
        
        return {
            // 数据
            areas,
            monitoringPoints,
            selectedArea,
            searchText,
            dateRange,
            soilReports,
            filteredReports,
            currentPage,
            pageSize,
            totalItems,
            dialogVisible,
            dialogType,
            reportForm,
            reportFormRef,
            rules,
            
            // 方法
            handlePagination,
            handleAddReport,
            handleEdit,
            handleDelete,
            submitReport
        }
    }
}
</script>

<style scoped>
.manual-container {
    padding: 20px;
}

.operation-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
}

.search-input {
    width: 200px;
}

.date-picker {
    width: 320px;
}

/* 移除原有的分页容器样式 */

:deep(.el-table .cell) {
    white-space: nowrap;
}

:deep(.el-table--border) {
    border-radius: 4px;
    overflow: hidden;
}

:deep(.el-input-number) {
    width: 100%;
}
</style>