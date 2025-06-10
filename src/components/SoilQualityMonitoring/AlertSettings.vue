<template>
    <div class="alert-settings-container">
        <div class="page-header">
            <h2>预警设置</h2>
            <p class="description">设置各项土壤指标的预警阈值，当监测数据超出设定范围时系统将发出预警</p>
        </div>
        
        <el-table :data="alertSettings" border stripe style="width: 100%">
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="indicatorName" label="名称" min-width="120" />
            <el-table-column prop="conditionType" label="适宜范围" width="180">
                <template #default="scope">
                    <el-select v-model="scope.row.conditionType" placeholder="选择条件">
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
                        :precision="scope.row.decimalPlaces" 
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAlertSettings, updateAlertSetting } from '@/api/AlertSettings'

export default {
    name: 'AlertSettings',
    setup() {
        const alertSettings = ref([])

        const fetchAlertSettings = async () => {
            try {
                const response = await getAlertSettings();
                alertSettings.value = response;
            } catch (error) {
                ElMessage.error('获取预警设置失败');
                console.error('Failed to fetch alert settings:', error);
            }
        };

        // 保存设置
        const saveSettings = async (row) => {
            try {
                await updateAlertSetting(row);
                ElMessage.success(`${row.indicatorName} 预警设置保存成功`);
            } catch (error) {
                ElMessage.error(`${row.indicatorName} 预警设置保存失败`);
                console.error('Failed to save alert settings:', error);
            }
        };

        onMounted(() => {
            fetchAlertSettings();
        });

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