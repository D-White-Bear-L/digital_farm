<template>
    <div class="manual-container">
        <!-- 顶部操作栏 -->
        <div class="operation-bar">
            <el-select v-model="selectedArea" placeholder="基地" class="base-select" clearable>
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
            <el-select
                v-model="selectSource"
                placeholder="数据来源"
                clearable
                class="data-source-select"
            >
                <el-option label="全部" value=""></el-option>
                <el-option label="人工上报" value="manual"></el-option>
                <el-option label="机器测量" value="device"></el-option>
            </el-select>

            <el-button type="success" @click="handleFilter">
                <el-icon><Search /></el-icon>查询
            </el-button>
            
            <el-button type="success" @click="handleAddReport">
                <el-icon><Plus /></el-icon>数据上报
            </el-button>
        </div>

        <!-- 土壤质量数据列表 -->
        <el-table :data="tableData" style="width: 100%" border stripe v-loading="loading">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="pointName" label="监测点" width="120" />
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
            <el-table-column prop="reporter" label="采样人" width="120" align="center" />
            <el-table-column prop="phone" label="联系电话" width="120" align="center" />
            <el-table-column prop="dataSource" label="数据来源" width="120" align="center" />
            <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                    <el-button link type="success" @click="handleEdit(scope.row)">修改</el-button>
                    <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        
        <!-- 分页  -->
        <PageBar
            :page="currentPage"
            :limit="pageSize"
            :total="totalItems"
            @update:page="handlePageChange"
            @update:limit="handleLimitChange"
        />
        
        <!-- 数据上报/编辑对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogType === 'add' ? '土壤样品采集上报' : '编辑土壤样品信息'"
            width="900px"
        >
            <el-form :model="reportForm" label-width="120px" :rules="rules" ref="reportFormRef">
                <el-divider content-position="left">采样信息</el-divider>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="所属基地" prop="baseId">
                            <el-select v-model="reportForm.baseId" placeholder="请选择所属基地" style="width: 100%;">
                                <el-option v-for="area in areas" :key="area.value" :label="area.label" :value="area.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="监测点名称" prop="pointId">
                            <el-select v-model="reportForm.pointId" placeholder="请选择监测点名称" style="width: 100%;">
                                <el-option v-for="point in monitoringPoints" :key="point.value" :label="point.label" :value="point.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="土样编号" prop="soilSampleNo">
                            <el-input v-model="reportForm.soilSampleNo" placeholder="请输入土样编号" maxlength="20" show-word-limit />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="土样名称" prop="soilSampleName">
                            <el-input v-model="reportForm.soilSampleName" placeholder="请输入土样名称" maxlength="20" show-word-limit />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="采样经度" prop="longitude">
                            <el-input v-model="reportForm.longitude" placeholder="请输入采样经度" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="采样纬度" prop="latitude">
                            <el-input v-model="reportForm.latitude" placeholder="请输入采样纬度" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                     <el-col :span="12">
                        <el-form-item label="采样深度" prop="sampleDepth">
                            <el-input-number v-model="reportForm.sampleDepth" :min="0" :max="1000" placeholder="请输入采样深度" style="width: 100%;"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="采样时间" prop="sampleDate">
                            <el-date-picker 
                                v-model="reportForm.sampleDate" 
                                type="datetime" 
                                placeholder="选择日期时间"
                                format="YYYY-MM-DD HH:mm:ss"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                style="width: 100%;"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="采样人" prop="reporter">
                            <el-input v-model="reportForm.reporter" placeholder="请输入采样人" maxlength="20" show-word-limit />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="联系电话" prop="phone">
                            <el-input v-model="reportForm.phone" placeholder="请输入联系电话" maxlength="11" show-word-limit />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-divider content-position="left">鉴定结果</el-divider>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="PH" prop="ph">
                            <el-input-number v-model="reportForm.ph" :min="0" :max="14" :precision="1" :step="0.1" placeholder="请输入PH值" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="有机质g/kg" prop="organicMatter">
                            <el-input-number v-model="reportForm.organicMatter" :min="0" :precision="1" :step="0.1" placeholder="请输入有机质含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>
                
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="水分%VWC" prop="waterContent">
                            <el-input-number v-model="reportForm.waterContent" :min="0" :max="100" :precision="1" :step="0.1" placeholder="请输入水分含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="有效钾mg/kg" prop="availableK">
                            <el-input-number v-model="reportForm.availableK" :min="0" :precision="1" :step="0.1" placeholder="请输入有效钾含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="氨mg/kg" prop="availableN">
                            <el-input-number v-model="reportForm.availableN" :min="0" :precision="1" :step="0.1" placeholder="请输入氨含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="盐分ms/cr" prop="conductivity">
                            <el-input-number v-model="reportForm.conductivity" :min="0" :precision="2" :step="0.1" placeholder="请输入盐分" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="硅mg/kg" prop="siValue">
                            <el-input-number v-model="reportForm.siValue" :min="0" :precision="1" :step="0.1" placeholder="请输入硅含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="硫mg/kg" prop="sValue">
                            <el-input-number v-model="reportForm.sValue" :min="0" :precision="1" :step="0.1" placeholder="请输入硫含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="硼mg/kg" prop="bValue">
                            <el-input-number v-model="reportForm.bValue" :min="0" :precision="1" :step="0.1" placeholder="请输入硼含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="速效磷mg/kg" prop="availableP">
                            <el-input-number v-model="reportForm.availableP" :min="0" :precision="1" :step="0.1" placeholder="请输入速效磷含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="钙mg/kg" prop="calcium">
                            <el-input-number v-model="reportForm.calcium" :min="0" :precision="1" :step="0.1" placeholder="请输入钙含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="铜mg/kg" prop="copper">
                            <el-input-number v-model="reportForm.copper" :min="0" :precision="1" :step="0.1" placeholder="请输入铜含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="铵态氮g/kg" prop="ammoniumNitrogen">
                            <el-input-number v-model="reportForm.ammoniumNitrogen" :min="0" :precision="1" :step="0.1" placeholder="请输入铵态氮含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="锌mg/kg" prop="zinc">
                            <el-input-number v-model="reportForm.zinc" :min="0" :precision="1" :step="0.1" placeholder="请输入锌含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="锰mg/kg" prop="manganese">
                            <el-input-number v-model="reportForm.manganese" :min="0" :precision="1" :step="0.1" placeholder="请输入锰含量" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="镁mg/kg" prop="magnesium">
                            <el-input-number v-model="reportForm.magnesium" :min="0" :precision="1" :step="0.1" placeholder="请输入镁含量" style="width: 100%;" />
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
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBar from '@/components/PageBar.vue'
import {
  getManualReportList,
  addManualReport,
  updateManualReport,
  deleteManualReport,
  getBaseOptions
} from '@/api/ManualReport'
import { getMonitoring } from '@/api/Monitoring'; // 导入获取监测点列表的API

export default {
    name: 'ManualReport',
    components: {
        Search,
        Plus,
        PageBar
    },
    setup() {
        // 基地、监测点选项
        const areas = ref([])
        const monitoringPoints = ref([]) // 监测点选项

        // 查询条件
        const selectedArea = ref('')
        const searchText = ref('')
        const dateRange = ref([])
        const selectSource = ref('') // 声明 selectSource

        // 分页
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalItems = ref(0)
        const tableData = ref([])
        const loading = ref(false)

        // 查询数据
        const fetchData = async () => {
            loading.value = true
            try {
                const params = {
                    page: currentPage.value,
                    size: pageSize.value,
                    baseId: selectedArea.value ? Number(selectedArea.value) : null,
                    pointName: searchText.value,
                    startDate: dateRange.value[0] || '',
                    endDate: dateRange.value[1] || '',
                    dataSource: selectSource.value || ''
                }
                console.log('Sending params to backend:', params); 
                const res = await getManualReportList(params)
                if (res && res.data) {
                    tableData.value = Array.isArray(res.data.list) ? res.data.list : []
                    totalItems.value = res.data.total || 0
                }
            } catch (e) {
                ElMessage.error('数据加载失败')
            } finally {
                loading.value = false
            }
        }

        // 分页事件
        const handlePageChange = (page) => {
            currentPage.value = page
            fetchData()
        }
        const handleLimitChange = (limit) => {
            pageSize.value = limit
            currentPage.value = 1
            fetchData()
        }

        // 查询条件变动时刷新
        const handleFilter = () => {
            console.log('handleFilter triggered. selectedArea.value:', selectedArea.value);
            currentPage.value = 1;
            // 使用 nextTick 确保在 v-model 更新完成后再调用 fetchData
            nextTick(() => {
                fetchData();
            });
        }

        // 对话框相关
        const dialogVisible = ref(false)
        const dialogType = ref('add')
        const reportFormRef = ref(null)
        const reportForm = reactive({
            sampleId: '',
            baseId: '',
            pointId: '',
            soilSampleNo: '',
            soilSampleName: '',
            soilType: '',
            longitude: '',
            latitude: '',
            sampleDepth: '',
            sampleDate: '',
            reporter: '',
            phone: '',
            ph: '',
            organicMatter: '',
            waterContent: '',
            availableP: '',
            availableK: '',
            availableN: '',
            conductivity: '',
            siValue: '',
            sValue: '',
            bValue: '',
            caValue: '',
            cuValue: '',
            znValue: '',
            mnValue: '',
            mgValue: '',
            dataSource: 'manual'
        })

        // 表单校验
        const rules = {
            baseId: [{ required: true, message: '请选择所属基地', trigger: 'change' }],
            pointId: [{ required: true, message: '请选择监测点名称', trigger: 'change' }],
            soilSampleNo: [{ required: true, message: '请输入土样编号', trigger: 'blur' }],
            soilSampleName: [{ required: true, message: '请输入土样名称', trigger: 'blur' }],
            longitude: [
                { required: true, message: '请输入采样经度', trigger: 'blur' },
                {
                    validator: (rule, value, callback) => {
                        if (value === null || value === '') {
                            callback(new Error('请输入采样经度'));
                        } else if (isNaN(Number(value))) {
                            callback(new Error('经度必须是数字'));
                        } else {
                            const numValue = Number(value);
                            if (numValue < -180 || numValue > 180) {
                                callback(new Error('经度范围应在 -180 到 180 之间'));
                            } else {
                                callback();
                            }
                        }
                    },
                    trigger: 'blur'
                }
            ],
            latitude: [
                { required: true, message: '请输入采样纬度', trigger: 'blur' },
                {
                    validator: (rule, value, callback) => {
                        if (value === null || value === '') {
                            callback(new Error('请输入采样纬度'));
                        } else if (isNaN(Number(value))) {
                            callback(new Error('纬度必须是数字'));
                        } else {
                            const numValue = Number(value);
                            if (numValue < -90 || numValue > 90) {
                                callback(new Error('纬度范围应在 -90 到 90 之间'));
                            } else {
                                callback();
                            }
                        }
                    },
                    trigger: 'blur'
                }
            ],
            sampleDepth: [{ required: true, message: '请输入采样深度', trigger: 'blur' }],
            sampleDate: [{ required: true, message: '请选择采样时间', trigger: 'change' }]
        }

        // 新增/编辑
        const handleAddReport = () => {
            dialogType.value = 'add'
            Object.keys(reportForm).forEach(key => reportForm[key] = key === 'dataSource' ? 'manual' : '')
            dialogVisible.value = true
        }
        const handleEdit = (row) => {
            dialogType.value = 'edit'
            Object.keys(reportForm).forEach(key => reportForm[key] = row[key] ?? '')
            dialogVisible.value = true
        }
        // 删除
        const handleDelete = (row) => {
            ElMessageBox.confirm(`确认删除"${row.soilSampleName || row.soilSampleNo}"的数据吗？`, '警告', {
                confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
            }).then(async () => {
                const res = await deleteManualReport(row.sampleId)
                if (res.code === 200) {
                    ElMessage.success('删除成功')
                    fetchData()
                } else {
                    ElMessage.error(res.message || '删除失败')
                }
            }).catch(() => {})
        }
        // 提交
        const submitReport = () => {
            reportFormRef.value.validate(async (valid) => {
                if (!valid) return
                let res
                if (dialogType.value === 'add') {
                    res = await addManualReport({ ...reportForm })
                } else {
                    res = await updateManualReport({ ...reportForm })
                }
                if (res.code === 200) {
                    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
                    dialogVisible.value = false
                    fetchData()
                } else {
                    ElMessage.error(res.message || '操作失败')
                }
            })
        }

        // 获取基地选项
        const fetchBaseOptions = async () => {
            try {
                const res = await getBaseOptions()
                if (res && Array.isArray(res.data)) {
                    areas.value = res.data.map(item => ({ label: item.label, value: item.value }))
                }
            } catch (e) {
                ElMessage.error('获取基地选项失败')
            }
        }

        // 获取监测点选项
        const fetchMonitoringPoints = async (baseId = null) => {
            try {
                const params = {
                    page: 1, // 监测点列表通常不需要分页，获取全部即可
                    size: 9999, // 获取足够多的数据
                    baseId: baseId,
                    keyword: '' // 暂时不根据关键词筛选
                }
                const res = await getMonitoring(params)
                if (res && res.data && Array.isArray(res.data.list)) {
                    monitoringPoints.value = res.data.list.map(item => ({
                        label: item.pointName,
                        value: item.pointId
                    }))
                } else {
                    monitoringPoints.value = [];
                }
            } catch (e) {
                ElMessage.error('获取监测点选项失败')
            }
        }

        onMounted(() => {
            fetchBaseOptions()
            fetchData()
            fetchMonitoringPoints() // 初始加载所有监测点
        })

        // 监听基地变化，动态获取监测点
        watch(selectedArea, (val) => {
            console.log('selectedArea changed to:', val);
            reportForm.baseId = val
            // 清空监测点选项并重新加载
            reportForm.pointId = ''; // 清空已选的监测点
            monitoringPoints.value = []; // 清空当前监测点列表
            if (val) {
                fetchMonitoringPoints(Number(val)); // 如果选择了基地，则根据基地ID获取
            } else {
                fetchMonitoringPoints(); // 如果选择"全部"，则获取所有监测点
            }
        })

        return {
            areas,
            monitoringPoints,
            selectedArea,
            searchText,
            dateRange,
            currentPage,
            pageSize,
            totalItems,
            tableData,
            loading,
            dialogVisible,
            dialogType,
            reportForm,
            reportFormRef,
            rules,
            handlePageChange,
            handleLimitChange,
            handleFilter,
            handleAddReport,
            handleEdit,
            handleDelete,
            submitReport,
            selectSource // 导出 selectSource
        }
    }
}
</script>

<style scoped>
.manual-container {
    border-radius:12px ;
    padding: 20px;
    background-color: #f8fafc;

}

.operation-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    background-color: #ffffff;
    
}

.base-select {
    width: 20%;
}

.search-input {
    width: 200px;
}

.date-picker {
    width: 320px;
}

.data-source-select {
    width: 150px;
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
