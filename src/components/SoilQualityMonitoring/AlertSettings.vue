<template>
    <div class="alert-settings-container">
        <div class="page-header">
            <h2>预警设置</h2>
            <p class="description">设置各项土壤指标的预警阈值，当监测数据超出设定范围时系统将发出预警</p>
        </div>
        
        <el-table :data="alertSettings" border stripe style="width: 100%">
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="name" label="名称" min-width="120" />
            <el-table-column prop="condition" label="适宜范围" width="180">
                <template #default="scope">
                    <el-select v-model="scope.row.condition" placeholder="选择条件">
                        <el-option label="大于" value="大于" />
                        <el-option label="小于" value="小于" />
                        <el-option label="等于" value="等于" />
                        <el-option label="分子之外" value="分子之外" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column prop="threshold" label="阈值" width="180">
                <template #default="scope">
                    <el-input-number 
                        v-model="scope.row.threshold" 
                        :min="0" 
                        :precision="scope.row.precision" 
                        :step="scope.row.step"
                        controls-position="right"
                        style="width: 100%"
                    />
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="saveSettings(scope.row)">保存</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default {
    name: 'AlertSettings',
    setup() {
        // 预警设置数据
        const alertSettings = ref([
            { id: 1, name: '有机质', condition: '分子之外', threshold: 100.42, precision: 2, step: 0.1 },
            { id: 2, name: '硼', condition: '大于', threshold: 52, precision: 0, step: 1 },
            { id: 3, name: '有效钾', condition: '大于', threshold: 100, precision: 0, step: 1 },
            { id: 4, name: '钙', condition: '大于', threshold: 100, precision: 0, step: 1 },
            { id: 5, name: '硫', condition: '等于', threshold: 100, precision: 0, step: 1 },
            { id: 6, name: 'ph', condition: '等于', threshold: 50, precision: 0, step: 1 },
            { id: 7, name: '铜', condition: '大于', threshold: 100, precision: 0, step: 1 },
            { id: 8, name: '锌', condition: '大于', threshold: 100, precision: 0, step: 1 },
            { id: 9, name: '硅', condition: '大于', threshold: 100, precision: 0, step: 1 },
            { id: 10, name: '氯', condition: '大于', threshold: 100, precision: 0, step: 1 },
            { id: 11, name: '锰', condition: '大于', threshold: 100, precision: 0, step: 1 }
        ])

        // 保存设置
        const saveSettings = (row) => {
            // 这里应该是调用API保存设置
            // 模拟API调用
            setTimeout(() => {
                ElMessage({
                    type: 'success',
                    message: `${row.name}预警设置保存成功`
                })
            }, 500)
        }

        return {
            alertSettings,
            saveSettings
        }
    }
}
</script>

<style scoped>
.alert-settings-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header {
    margin-bottom: 20px;
}

.page-header h2 {
    font-size: 20px;
    color: #303133;
    margin-bottom: 10px;
}

.description {
    font-size: 14px;
    color: #606266;
    margin-bottom: 20px;
}

:deep(.el-input-number .el-input__inner) {
    text-align: left;
}
</style>