<template>
  <div class="devices-manage">
    <div class="devices-manage-header">
      <h3>设备管理</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    <button @click="showAddDialog = true">添加设备</button>
    <table>
      <thead>
        <tr>
          <th>名称</th>
          <th>类型</th>
          <th>状态</th>
          <th>X</th>
          <th>Y</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="device in devices" :key="device.id">
          <td>{{ device.name }}</td>
          <td>{{ getDeviceTypeName(device.type) }}</td>
          <td>{{ getStatusText(device.status) }}</td>
          <td>{{ device.x }}</td>
          <td>{{ device.y }}</td>
          <td>
            <button @click="editDevice(device)">编辑</button>
            <button @click="deleteDevice(device.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 添加/编辑设备对话框 -->
    <div v-if="showAddDialog || editingDevice" class="device-dialog">
      <h4>{{ editingDevice ? '编辑设备' : '添加设备' }}</h4>
      <form @submit.prevent="saveDevice">
        <label>
          名称:
          <input v-model="form.name" required />
        </label>
        <label>
          类型:
          <select v-model="form.type" required>
            <option value="sensor">传感器</option>
            <option value="irrigation">灌溉系统</option>
            <option value="camera">监控摄像头</option>
            <option value="weather">气象站</option>
            <option value="pump">水泵</option>
          </select>
        </label>
        <label>
          状态:
          <select v-model="form.status" required>
            <option value="normal">正常</option>
            <option value="warning">警告</option>
            <option value="error">异常</option>
          </select>
        </label>
        <label>
          X:
          <input type="number" v-model.number="form.x" min="0" max="100" required />
        </label>
        <label>
          Y:
          <input type="number" v-model.number="form.y" min="0" max="100" required />
        </label>
        <button type="submit">保存</button>
        <button type="button" @click="cancelEdit">取消</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DevicesManage',
  props: {
    devices: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showAddDialog: false,
      editingDevice: null,
      form: {
        id: null,
        name: '',
        type: 'sensor',
        status: 'normal',
        x: 50,
        y: 50
      }
    }
  },
  methods: {
    getDeviceTypeName(type) {
      const typeMap = {
        'sensor': '传感器',
        'irrigation': '灌溉系统',
        'camera': '监控摄像头',
        'weather': '气象站',
        'pump': '水泵'
      };
      return typeMap[type] || '未知设备';
    },
    getStatusText(status) {
      const statusMap = {
        'normal': '正常',
        'warning': '警告',
        'error': '异常'
      };
      return statusMap[status] || '未知状态';
    },
    editDevice(device) {
      this.editingDevice = device;
      this.form = { ...device };
      this.showAddDialog = false;
    },
    deleteDevice(id) {
      this.$emit('delete-device', id);
    },
    saveDevice() {
      if (this.editingDevice) {
        this.$emit('update-device', { ...this.form });
      } else {
        // 新增设备时生成唯一ID
        this.$emit('add-device', { ...this.form, id: Date.now() });
      }
      this.cancelEdit();
    },
    cancelEdit() {
      this.editingDevice = null;
      this.showAddDialog = false;
      this.form = {
        id: null,
        name: '',
        type: 'sensor',
        status: 'normal',
        x: 50,
        y: 50
      };
    }
  }
}
</script>

<style scoped>
.devices-manage {
  position: relative;
  min-width: 420px;
  max-width: 600px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 22px 20px 20px 20px;
  z-index: 1001;
  font-family: "Microsoft YaHei", Arial, sans-serif;
}

/* 新增头部样式 */
.devices-manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 26px;
  color: #00bcd4;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #ff4d4f;
}

.devices-manage h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 20px;
  color: #1890ff;
  font-weight: bold;
  letter-spacing: 1px;
}

.devices-manage button {
  background: #00eaff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}
.devices-manage button:hover {
  background: #1890ff;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
th, td {
  border: 1px solid #e6f7ff;
  padding: 8px 12px;
  text-align: center;
  color: #222;
  background: #fff;
  font-size: 15px;
}
thead th {
  background: #e6f7ff; /* 表头淡蓝色，提升对比度 */
  color: #222;
  font-weight: bold;
}
tbody tr:hover {
  background: #f0faff;
}

.device-dialog {
  background: #fff;
  border: 1.5px solid #00eaff;
  border-radius: 10px;
  padding: 18px;
  margin-top: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
}
.device-dialog label {
  display: block;
  margin-bottom: 10px;
  font-size: 15px;
}
.device-dialog input, .device-dialog select {
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 15px;
}
.device-dialog button {
  margin-right: 10px;
  margin-top: 10px;
}
</style>