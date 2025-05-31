<template>
    <div class="monitoring-container">
        <!-- 顶部操作栏 -->
        <div class="operation-bar">
            <el-select v-model="selectedArea" placeholder="基地" clearable @change="handleFilter">
                <el-option label="全部" value=""></el-option>
                <el-option v-for="area in areas" :key="area.value" :label="area.label" :value="area.value" />
            </el-select>
            
            <el-input
                v-model="searchText"
                placeholder="监测点名称"
                clearable
                class="search-input"
                @clear="handleFilter"
                @keyup.enter="handleFilter"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>

            <el-button type="success" @click="handleFilter">
                <el-icon><Search /></el-icon>查询
            </el-button>

            <el-button type="success" @click="handleAddMonitoringPoint">
                <el-icon><Plus /></el-icon>新增监测点
            </el-button>
        </div>

        <!-- 监测点列表 -->
        <el-table :data="paginatedMonitoringPoints" style="width: 100%" v-loading="loading">
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="baseName" label="基地" />
            <el-table-column prop="pointName" label="监测点名称" />
            <el-table-column prop="location" label="位置" />
            <el-table-column label="监测点照片" width="120">
                <template #default="scope">
                    <el-image
                        v-if="scope.row.imageUrl"
                        :src="scope.row.imageUrl"
                        :preview-src-list="[scope.row.imageUrl]"
                        fit="cover"
                        class="monitoring-point-image"
                    >
                        <template #error>
                            <div class="image-placeholder">暂无照片</div>
                        </template>
                    </el-image>
                    <div v-else class="image-placeholder">暂无照片</div>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建日期" />
            <el-table-column label="操作" width="150">
                <template #default="scope">
                    <el-button link type="primary" @click="handleEdit(scope.row)">修改</el-button>
                    <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <PageBar
            v-model:page="currentPage"
            v-model:limit="pageSize"
            :total="totalItems"
            @pagination="handlePagination" 
        />

        <!-- 新增/编辑监测点对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogType === 'add' ? '新增监测点' : '编辑监测点'"
            width="500px"
        >
            <el-form :model="monitoringPointForm" label-width="100px">
                <el-form-item label="基地">
                    <el-select v-model="monitoringPointForm.baseName" placeholder="请选择基地">
                        <el-option v-for="area in areas" :key="area.value" :label="area.label" :value="area.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="监测点名称">
                    <el-input v-model="monitoringPointForm.pointName" />
                </el-form-item>
                <el-form-item label="位置">
                    <el-input v-model="monitoringPointForm.location" />
                </el-form-item>
                <el-form-item label="监测点照片">
                    <el-upload
                        class="monitoring-point-uploader"
                        action="/api/upload"
                        :show-file-list="false"
                        :on-success="handleUploadSuccess"
                    >
                        <img v-if="monitoringPointForm.imageUrl" :src="monitoringPointForm.imageUrl" class="uploaded-image">
                        <el-icon v-else class="upload-icon"><Plus /></el-icon>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSubmit">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ref, computed, onMounted,onUnmounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBar from '@/components/PageBar.vue'
import { getMonitoring, getBaseOptions, addMonitoringPoint, updateMonitoringPoint, deleteMonitoringPoint } from '@/api/soilQualityMonitoring'
// import { debounce } from 'lodash'

export default {
    name: 'MonitoringPage',
    components: {
        Search,
        Plus,
        PageBar
    },
   
    setup() {
        // 加载状态
        const loading = ref(false)

        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        const totalItems = ref(0)

        // 分页逻辑
        const handlePagination = (({page, limit}) => {
            currentPage.value = page
            pageSize.value = limit
            fetchMonitoringPoints()
        },100)

        // 基地选项
        const areas = ref([])

        // 状态数据
        const selectedArea = ref(null) // 当前选中的基地
        const searchText = ref('') // 搜索文本
        const dialogVisible = ref(false) // 对话框可见性
        const dialogType = ref('add') // 对话框类型
        // 状态数据
        const monitoringPointForm = ref({
            pointId: null,
            baseName: '',
            pointName: '',
            location: '',
            imageUrl: '' 
        })

        // 监测点数据
        const monitoringPoints = ref([])

        // 获取基地选项
        const fetchBaseOptions = () => {
            getBaseOptions().then(res => {
                if (res.code === 200) {
                    areas.value = res.data
                } else {
                    ElMessage.error(res.message || '获取基地选项失败')
                }
            }).catch(err => {
                console.error('获取基地选项出错:', err)
                ElMessage.error('获取基地选项出错')
            })
        }

        // 获取监测点数据
        const fetchMonitoringPoints = () => {
            loading.value = true // 显示加载状态
            const params = {
                pageNum: currentPage.value, // 当前页码
                pageSize: pageSize.value, // 每页数量
                baseId: selectedArea.value === "" ? null : selectedArea.value, // 基地ID，空字符串转为null
                keyword: searchText.value === "" ? null : searchText.value // 搜索关键字，空字符串转为null
            }

            getMonitoring(params).then(res => {
                if (res.code === 200) {
                    monitoringPoints.value = res.data.list || []
                    totalItems.value = res.data.total || 0
                } else {
                    ElMessage.error(res.message || '获取监测点数据失败')
                }
            }).catch(err => {
                console.error('获取监测点数据出错:', err)
                ElMessage.error('获取监测点数据出错')
            }).finally(() => {
                loading.value = false
            })
        }

        // 监听筛选条件变化
        const handleFilter = () => {
            currentPage.value = 1 // 重置到第一页

            fetchMonitoringPoints()
        }

        // 分页后的监测点列表
        const paginatedMonitoringPoints = computed(() => monitoringPoints.value)

        // 处理新增监测点
        const handleAddMonitoringPoint = () => {
            dialogType.value = 'add'
            monitoringPointForm.value = {
                pointId: null,
                baseName: '',
                pointName: '',
                location: '',
                imageUrl: ''
            }
            dialogVisible.value = true
        }

        // 处理编辑
        const handleEdit = (row) => {
            dialogType.value = 'edit'
            monitoringPointForm.value = { ...row }
            dialogVisible.value = true
        }

        // 处理删除
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                `确认删除监测点"${row.pointName}"吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                // 调用删除API
                deleteMonitoringPoint(row.pointId).then(res => {
                    if (res.code === 200) {
                        ElMessage.success(`删除监测点"${row.pointName}"成功`)
                        fetchMonitoringPoints()
                    } else {
                        ElMessage.error(res.message || '删除失败')
                    }
                }).catch(err => {
                    console.error('删除监测点出错:', err)
                    ElMessage.error('删除监测点出错')
                })
            }).catch(() => {})
        }

        // 处理表单提交 
        const handleSubmit = () => {
            if (!monitoringPointForm.value.baseName) {
                ElMessage.warning('请选择基地')
                return
            }
            if (!monitoringPointForm.value.pointName) {
                ElMessage.warning('请输入监测点名称')
                return
            }
            if (!monitoringPointForm.value.location) {
                ElMessage.warning('请输入监测点位置')
                return
            }

            if (dialogType.value === 'add') {
                // 添加监测点
                addMonitoringPoint(monitoringPointForm.value).then(res => {
                    if (res.code === 200) {
                        ElMessage.success('添加监测点成功')
                        dialogVisible.value = false
                        fetchMonitoringPoints()
                    } else {
                        ElMessage.error(res.message || '添加失败')
                    }
                }).catch(err => {
                    console.error('添加监测点出错:', err)
                    ElMessage.error('添加监测点出错')
                })
            } else {
                // 更新监测点
                updateMonitoringPoint(monitoringPointForm.value).then(res => {
                    if (res.code === 200) {
                        ElMessage.success('修改监测点成功')
                        dialogVisible.value = false
                        fetchMonitoringPoints()
                    } else {
                        ElMessage.error(res.message || '修改失败')
                    }
                }).catch(err => {
                    console.error('修改监测点出错:', err)
                    ElMessage.error('修改监测点出错')
                })
            }
        }

        // 处理图片上传成功
        const handleUploadSuccess = (response) => {
            monitoringPointForm.value.imageUrl = response.url 
        }

        // 初始化时获取数据
        onMounted(() => {
            fetchBaseOptions()
            fetchMonitoringPoints()
        })

        // 注销组件
        onUnmounted(() => {
            // 确保任何未完成的防抖函数被取消
            fetchMonitoringPoints.cancel()
            handlePagination.cancel()
        })

        return {
            loading,
            areas,
            selectedArea,
            searchText,
            dialogVisible,
            dialogType,
            monitoringPointForm,
            paginatedMonitoringPoints,
            handleAddMonitoringPoint,
            handleEdit,
            handleDelete,
            handleSubmit,
            handleUploadSuccess,
            totalItems,
            currentPage,
            pageSize,
            handlePagination,
            handleFilter
        }
    }
}
</script>

<style scoped>
.monitoring-container {
    padding: 20px;
}

.operation-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
}

.search-input {
    width: 200px;
}

.monitoring-point-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
}

.image-placeholder {
    width: 60px;
    height: 60px;
    background-color: #f5f7fa;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
    font-size: 12px;
}

.monitoring-point-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.monitoring-point-uploader:hover {
    border-color: #409eff;
}

.uploaded-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-icon {
    font-size: 28px;
    color: #8c939d;
}
</style>