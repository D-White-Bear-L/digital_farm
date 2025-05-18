<template>
    <div class="monitoring-container">
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

            <el-button type="primary" @click="handleAddMonitoringPoint">
                <el-icon><Plus /></el-icon>新增监测点
            </el-button>
        </div>

        <!-- 监测点列表 -->
        <el-table :data="paginatedMonitoringPoints" style="width: 100%">
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="area" label="基地" />
            <el-table-column prop="name" label="监测点名称" />
            <el-table-column prop="location" label="位置" />
            <el-table-column label="监测点照片" width="120">
                <template #default="scope">
                    <el-image
                        v-if="scope.row.image"
                        :src="scope.row.image"
                        :preview-src-list="[scope.row.image]"
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
                    <el-select v-model="monitoringPointForm.area" placeholder="请选择基地">
                        <el-option v-for="area in areas" :key="area.value" :label="area.label" :value="area.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="监测点名称">
                    <el-input v-model="monitoringPointForm.name" />
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
                        <img v-if="monitoringPointForm.image" :src="monitoringPointForm.image" class="uploaded-image">
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
import { ref, computed } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBar from '@/components/PageBar.vue'

export default {
    name: 'MonitoringPage',
    components: {
        Search,
        Plus,
        PageBar
    },
   
    setup() {

        // 分页相关
        const currentPage = ref(1)
        const pageSize = ref(10)
        // const totalItems = ref(0)

        // 分页逻辑
        const handlePagination = ({page, limit}) => {
            currentPage.value = page
            pageSize.value = limit
            console.log('currentPage:', currentPage.value, 'pageSize:', pageSize.value)
        }

        // 基地选项
        const areas = [
            { label: '测试基地1', value: 'test1' },
            { label: '测试基地2', value: 'test2' },
            { label: '测试基地3', value: 'test3' },
            { label: '测试基地4', value: 'test4' },
            { label: '测试基地5', value: 'test5' },
            { label: '测试基地6', value: 'test6' },
            { label: '测试基地7', value: 'test7' },
            { label: '测试基地8', value: 'test8' },
            { label: '测试基地9', value: 'test9' },
            { label: '测试基地10', value: 'test10' },
            { label: '测试基地11', value: 'test11' },
            { label: '测试基地12', value: 'test12' },
            { label: '测试基地13', value: 'test13' },
            { label: '测试基地14', value: 'test14' },
            // 更多基地选项...
        ]

        // 状态数据
        const selectedArea = ref('')
        const searchText = ref('')
        const dialogVisible = ref(false)
        const dialogType = ref('add')
        const monitoringPointForm = ref({
            area: '',
            name: '',
            location: '',
            image: ''
        })

        // 模拟数据
        const monitoringPoints = ref([
            {
                id: 1,
                area: '测试基地1',
                name: '监测点1',
                location: '东区',
                image: 'https://example.com/image1.jpg',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 2,
                area: '测试基地2',
                name: '监测点2',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 3,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 4,
                area: '测试基地4',
                name: '监测点4',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 5,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 6,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 7,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 8,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 9,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 10,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },
            {
                id: 11,
                area: '测试基地3',
                name: '监测点3',
                location: '南区',
                image: '',
                createTime: '2024-03-18 13:36:56'
            },

        ])

        // 过滤后的监测点列表
        const filteredMonitoringPoints = computed(() => {
            return monitoringPoints.value.filter(point => {
                const areaMatch = !selectedArea.value || point.area === selectedArea.value
                const nameMatch = !searchText.value || point.name.includes(searchText.value)
                return areaMatch && nameMatch
            })
        })
        
        // 计算总条目数
        const totalItems = computed(() => filteredMonitoringPoints.value.length)
        
        // 分页后的监测点列表
        const paginatedMonitoringPoints = computed(() => {
            const startIndex = (currentPage.value - 1) * pageSize.value
            const endIndex = startIndex + pageSize.value
            return filteredMonitoringPoints.value.slice(startIndex, endIndex)
        })

        // 处理新增监测点
        const handleAddMonitoringPoint = () => {
            dialogType.value = 'add'
            monitoringPointForm.value = {
                area: '',
                name: '',
                location: '',
                image: ''
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
                `确认删除监测点"${row.name}"吗？`,
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                // 这里添加删除逻辑
                // 从数组中移除该监测点
                const index = monitoringPoints.value.findIndex(item => item.id === row.id)
                if (index !== -1) {
                    monitoringPoints.value.splice(index, 1)
                }
                ElMessage.success(`删除监测点"${row.name}"成功`)
            }).catch(() => {})
        }

        // 处理表单提交
        const handleSubmit = () => {
            // 这里添加提交逻辑
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
            dialogVisible.value = false
        }

        // 处理图片上传成功
        const handleUploadSuccess = (response) => {
            monitoringPointForm.value.image = response.url
        }

        return {
            areas,
            selectedArea,
            searchText,
            dialogVisible,
            dialogType,
            monitoringPointForm,
            filteredMonitoringPoints,
            paginatedMonitoringPoints,
            handleAddMonitoringPoint,
            handleEdit,
            handleDelete,
            handleSubmit,
            handleUploadSuccess,
            totalItems,
            currentPage,
            pageSize,
            handlePagination
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