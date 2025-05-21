<template>
  <div class="devices-container">
    <!-- 顶部操作栏 -->
    <div class="operation-bar">
      <div class="left-filters">
        <el-select v-model="selectedBase" placeholder="基地" clearable class="base-select">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="base in baseOptions" :key="base.value" :label="base.label" :value="base.value" />
        </el-select>
        
        <el-select v-model="selectedType" placeholder="设备类型" clearable class="type-select">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="type in deviceTypes" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
        
        <el-input
          v-model="searchText"
          placeholder="设备名称"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-button type="primary" @click="handleAddDevice">
        <el-icon><Plus /></el-icon>新增设备
      </el-button>
    </div>
    
    <!-- 设备列表 -->
    <div class="table-container">
      <el-table :data="paginatedDevices" border stripe class="custom-table">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="设备名称" min-width="120" />
        <el-table-column prop="type" label="设备类型" width="120">
          <template #default="scope">
            <el-tag :type="getDeviceTypeTag(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="base" label="所属基地" width="120" />
        <el-table-column prop="location" label="安装位置" min-width="150" />
        <el-table-column prop="installDate" label="安装日期" width="120" />
        <el-table-column prop="status" label="设备状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastMaintenance" label="上次维护" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button link type="success" @click="handleMaintenance(scope.row)">维护</el-button>
              <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
    
    <!-- 新增/编辑设备对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增设备' : '编辑设备'"
      width="500px"
    >
      <el-form :model="deviceForm" label-width="100px" :rules="rules" ref="deviceFormRef">
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型">
            <el-option v-for="type in deviceTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属基地" prop="base">
          <el-select v-model="deviceForm.base" placeholder="请选择基地">
            <el-option v-for="base in baseOptions" :key="base.value" :label="base.label" :value="base.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="deviceForm.location" />
        </el-form-item>
        <el-form-item label="安装日期" prop="installDate">
          <el-date-picker 
            v-model="deviceForm.installDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="deviceForm.status" placeholder="请选择设备状态">
            <el-option label="正常" value="正常" />
            <el-option label="警告" value="警告" />
            <el-option label="异常" value="异常" />
            <el-option label="维护中" value="维护中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDevice">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 设备维护对话框 -->
    <el-dialog
      v-model="maintenanceDialogVisible"
      title="设备维护记录"
      width="600px"
    >
      <el-form :model="maintenanceForm" label-width="120px" :rules="maintenanceRules" ref="maintenanceFormRef">
        <el-form-item label="设备名称">
          <el-input v-model="maintenanceForm.deviceName" disabled />
        </el-form-item>
        <el-form-item label="维护日期" prop="maintenanceDate">
          <el-date-picker 
            v-model="maintenanceForm.maintenanceDate" 
            type="date" 
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="维护人员" prop="maintenanceStaff">
          <el-input v-model="maintenanceForm.maintenanceStaff" />
        </el-form-item>
        <el-form-item label="维护内容" prop="maintenanceContent">
          <el-input 
            v-model="maintenanceForm.maintenanceContent" 
            type="textarea" 
            :rows="4"
            placeholder="请输入维护内容"
          />
        </el-form-item>
        <el-form-item label="维护后状态" prop="statusAfter">
          <el-select v-model="maintenanceForm.statusAfter" placeholder="请选择维护后状态">
            <el-option label="正常" value="正常" />
            <el-option label="警告" value="警告" />
            <el-option label="异常" value="异常" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="maintenanceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMaintenance">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageBar from '@/components/PageBar.vue'

export default {
  name: 'DevicesList',
  components: {
    Search,
    Plus,
    PageBar
  },
  setup() {
    // 基地选项
    const baseOptions = [
      { label: '北莲基地', value: 'beilian' },
      { label: '莲花岛基地', value: 'lianhuadao' },
      { label: '马村基地', value: 'macun' }
    ]
    
    // 设备类型选项
    const deviceTypes = [
      { label: '土壤传感器', value: '土壤传感器' },
      { label: '灌溉系统', value: '灌溉系统' },
      { label: '监控摄像头', value: '监控摄像头' },
      { label: '气象站', value: '气象站' },
      { label: '水泵', value: '水泵' }
    ]
    
    // 筛选条件
    const selectedBase = ref('')
    const selectedType = ref('')
    const searchText = ref('')
    
    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // 对话框控制
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const maintenanceDialogVisible = ref(false)
    
    // 表单引用
    const deviceFormRef = ref(null)
    const maintenanceFormRef = ref(null)
    
    // 设备表单
    const deviceForm = reactive({
      id: '',
      name: '',
      type: '',
      base: '',
      location: '',
      installDate: '',
      status: '正常',
      lastMaintenance: ''
    })
    
    // 维护表单
    const maintenanceForm = reactive({
      deviceId: '',
      deviceName: '',
      maintenanceDate: '',
      maintenanceStaff: '',
      maintenanceContent: '',
      statusAfter: '正常'
    })
    
    // 表单验证规则
    const rules = {
      name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
      type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
      base: [{ required: true, message: '请选择所属基地', trigger: 'change' }],
      location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
      installDate: [{ required: true, message: '请选择安装日期', trigger: 'change' }],
      status: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
    }
    
    // 维护表单验证规则
    const maintenanceRules = {
      maintenanceDate: [{ required: true, message: '请选择维护日期', trigger: 'change' }],
      maintenanceStaff: [{ required: true, message: '请输入维护人员', trigger: 'blur' }],
      maintenanceContent: [{ required: true, message: '请输入维护内容', trigger: 'blur' }],
      statusAfter: [{ required: true, message: '请选择维护后状态', trigger: 'change' }]
    }
    
    // 模拟设备数据
    const devices = reactive([
      { id: 1, name: '土壤湿度传感器01', type: '土壤传感器', base: '北莲基地', location: '北莲基地A区', installDate: '2023-10-15', status: '正常', lastMaintenance: '2024-02-20' },
      { id: 2, name: '土壤温度传感器02', type: '土壤传感器', base: '北莲基地', location: '北莲基地B区', installDate: '2023-10-15', status: '正常', lastMaintenance: '2024-02-20' },
      { id: 3, name: '自动灌溉系统01', type: '灌溉系统', base: '莲花岛基地', location: '莲花岛基地C区', installDate: '2023-11-05', status: '警告', lastMaintenance: '2024-01-10' },
      { id: 4, name: '监控摄像头01', type: '监控摄像头', base: '莲花岛基地', location: '莲花岛基地入口', installDate: '2023-09-20', status: '正常', lastMaintenance: '2024-03-01' },
      { id: 5, name: '气象站01', type: '气象站', base: '马村基地', location: '马村基地中心', installDate: '2023-08-10', status: '异常', lastMaintenance: '2024-02-15' },
      { id: 6, name: '水泵01', type: '水泵', base: '马村基地', location: '马村基地灌溉区', installDate: '2023-12-01', status: '维护中', lastMaintenance: '2024-03-10' }
    ])
    
    // 根据筛选条件过滤的设备数据
    const filteredDevices = computed(() => {
      let result = devices
      
      // 根据基地筛选
      if (selectedBase.value) {
        result = result.filter(item => item.base.includes(selectedBase.value))
      }
      
      // 根据设备类型筛选
      if (selectedType.value) {
        result = result.filter(item => item.type === selectedType.value)
      }
      
      // 根据设备名称筛选
      if (searchText.value) {
        result = result.filter(item => item.name.includes(searchText.value))
      }
      
      return result
    })
    
    // 分页后的设备数据
    const paginatedDevices = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredDevices.value.slice(start, end)
    })
    
    // 总条目数
    const totalItems = computed(() => filteredDevices.value.length)
    
    // 获取设备类型标签样式
    const getDeviceTypeTag = (type) => {
      switch (type) {
        case '土壤传感器': return 'success'
        case '灌溉系统': return 'primary'
        case '监控摄像头': return 'info'
        case '气象站': return 'warning'
        case '水泵': return ''
        default: return ''
      }
    }
    
    // 获取状态标签样式
    const getStatusType = (status) => {
      switch (status) {
        case '正常': return 'success'
        case '警告': return 'warning'
        case '异常': return 'danger'
        case '维护中': return 'info'
        default: return ''
      }
    }
    
    // 处理分页
    const handlePagination = ({page, limit}) => {
      currentPage.value = page
      pageSize.value = limit
    }
    
    // 处理添加设备
    const handleAddDevice = () => {
      dialogType.value = 'add'
      resetDeviceForm()
      dialogVisible.value = true
    }
    
    // 处理编辑设备
    const handleEdit = (row) => {
      dialogType.value = 'edit'
      Object.keys(deviceForm).forEach(key => {
        deviceForm[key] = row[key]
      })
      dialogVisible.value = true
    }
    
    // 处理设备维护
    const handleMaintenance = (row) => {
      maintenanceForm.deviceId = row.id
      maintenanceForm.deviceName = row.name
      maintenanceForm.maintenanceDate = new Date().toISOString().split('T')[0]
      maintenanceForm.maintenanceStaff = ''
      maintenanceForm.maintenanceContent = ''
      maintenanceForm.statusAfter = '正常'
      maintenanceDialogVisible.value = true
    }
    
    // 处理删除设备
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除设备 "${row.name}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 模拟删除操作
        const index = devices.findIndex(item => item.id === row.id)
        if (index !== -1) {
          devices.splice(index, 1)
          ElMessage.success('设备删除成功')
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    // 重置设备表单
    const resetDeviceForm = () => {
      deviceForm.id = ''
      deviceForm.name = ''
      deviceForm.type = ''
      deviceForm.base = ''
      deviceForm.location = ''
      deviceForm.installDate = new Date().toISOString().split('T')[0]
      deviceForm.status = '正常'
      deviceForm.lastMaintenance = ''
    }
    
    // 提交设备表单
    const submitDevice = () => {
      deviceFormRef.value.validate((valid) => {
        if (valid) {
          if (dialogType.value === 'add') {
            // 模拟添加操作
            const newDevice = { ...deviceForm }
            newDevice.id = devices.length + 1
            devices.push(newDevice)
            ElMessage.success('设备添加成功')
          } else {
            // 模拟编辑操作
            const index = devices.findIndex(item => item.id === deviceForm.id)
            if (index !== -1) {
              devices[index] = { ...deviceForm }
              ElMessage.success('设备编辑成功')
            }
          }
          dialogVisible.value = false
        } else {
          return false
        }
      })
    }
    
    // 提交维护表单
    const submitMaintenance = () => {
      maintenanceFormRef.value.validate((valid) => {
        if (valid) {
          // 模拟维护记录提交
          const index = devices.findIndex(item => item.id === maintenanceForm.deviceId)
          if (index !== -1) {
            devices[index].lastMaintenance = maintenanceForm.maintenanceDate
            devices[index].status = maintenanceForm.statusAfter
            ElMessage.success('维护记录提交成功')
            maintenanceDialogVisible.value = false
          }
        } else {
          return false
        }
      })
    }
    
    return {
      baseOptions,
      deviceTypes,
      selectedBase,
      selectedType,
      searchText,
      currentPage,
      pageSize,
      dialogVisible,
      dialogType,
      maintenanceDialogVisible,
      deviceForm,
      maintenanceForm,
      deviceFormRef,
      maintenanceFormRef,
      rules,
      maintenanceRules,
      paginatedDevices,
      totalItems,
      getDeviceTypeTag,
      getStatusType,
      handlePagination,
      handleAddDevice,
      handleEdit,
      handleMaintenance,
      handleDelete,
      submitDevice,
      submitMaintenance
    }
  }
}
</script>

<style scoped>
.devices-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.left-filters {
  display: flex;
  gap: 15px;
}

.base-select, .type-select {
  width: 150px;
}

.search-input {
  width: 220px;
}

.table-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
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

:deep(.el-tag) {
  border-radius: 4px;
}
</style>