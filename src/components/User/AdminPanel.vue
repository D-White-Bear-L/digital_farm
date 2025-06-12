<template>
  <div class="admin-panel">
    <el-tabs v-model="activeTab">
      <!-- 角色变更请求处理 -->
      <el-tab-pane label="角色变更请求" name="roleRequests">
        <el-table :data="pendingRequests" style="width: 100%">
          <el-table-column prop="user.username" label="申请人"></el-table-column>
          <el-table-column prop="requestedRole" label="申请角色">
            <template #default="scope">
              <el-tag :type="getRoleType(scope.row.requestedRole)">
                {{ getRoleName(scope.row.requestedRole) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="申请理由"></el-table-column>
          <el-table-column prop="createTime" label="申请时间"></el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="success" size="small" @click="handleApprove(scope.row)">批准</el-button>
              <el-button type="danger" size="small" @click="handleReject(scope.row)">拒绝</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 用户管理 -->
      <el-tab-pane label="用户管理" name="userManagement">
        <el-table :data="users" style="width: 100%">
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="realName" label="真实姓名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="role" label="角色">
            <template #default="scope">
              <el-tag :type="getRoleType(scope.row.role)">
                {{ getRoleName(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleResetPassword(scope.row)">重置密码</el-button>
              <el-button type="warning" size="small" @click="handleChangeRole(scope.row)">修改角色</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 处理角色变更请求对话框 -->
    <el-dialog
      v-model="roleRequestDialog.visible"
      :title="roleRequestDialog.isApprove ? '批准申请' : '拒绝申请'"
      width="500px"
    >
      <el-form :model="roleRequestDialog.form">
        <el-form-item label="处理意见" required>
          <el-input
            type="textarea"
            v-model="roleRequestDialog.form.adminComment"
            :rows="3"
            placeholder="请输入处理意见"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleRequestDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleRequest">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPasswordDialog.visible"
      title="重置密码"
      width="400px"
    >
      <el-form :model="resetPasswordDialog.form">
        <el-form-item label="新密码" required>
          <el-input
            v-model="resetPasswordDialog.form.newPassword"
            type="password"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input
            v-model="resetPasswordDialog.form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPasswordDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPassword">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      v-model="changeRoleDialog.visible"
      title="修改角色"
      width="400px"
    >
      <el-form :model="changeRoleDialog.form">
        <el-form-item label="新角色" required>
          <el-select v-model="changeRoleDialog.form.newRole">
            <el-option label="普通用户" value="USER"></el-option>
            <el-option label="管理员" value="MANAGER"></el-option>
            <el-option label="超级管理员" value="ADMIN"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changeRoleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitChangeRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { processRoleChangeRequest, getPendingRoleChangeRequests, resetUserPassword } from '@/api/UserRole'
import { getAllUsers } from '@/api/UserSetting'

const activeTab = ref('roleRequests')
const pendingRequests = ref([])
const users = ref([])

// 角色变更请求对话框
const roleRequestDialog = ref({
  visible: false,
  isApprove: true,
  currentRequest: null,
  form: {
    adminComment: ''
  }
})

// 重置密码对话框
const resetPasswordDialog = ref({
  visible: false,
  currentUser: null,
  form: {
    newPassword: '',
    confirmPassword: ''
  }
})

// 修改角色对话框
const changeRoleDialog = ref({
  visible: false,
  currentUser: null,
  form: {
    newRole: ''
  }
})

// 获取角色名称
const getRoleName = (role) => {
  const roleMap = {
    'USER': '普通用户',
    'MANAGER': '管理员',
    'ADMIN': '超级管理员'
  }
  return roleMap[role] || role
}

// 获取角色标签类型
const getRoleType = (role) => {
  const typeMap = {
    'USER': '',
    'MANAGER': 'success',
    'ADMIN': 'danger'
  }
  return typeMap[role] || ''
}

// 加载待处理的角色变更请求
const loadPendingRequests = async () => {
  try {
    const response = await getPendingRoleChangeRequests()
    pendingRequests.value = response.data
  } catch (error) {
    ElMessage.error('获取待处理请求失败')
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const response = await getAllUsers()
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

// 处理批准申请
const handleApprove = (request) => {
  roleRequestDialog.value.isApprove = true
  roleRequestDialog.value.currentRequest = request
  roleRequestDialog.value.form.adminComment = ''
  roleRequestDialog.value.visible = true
}

// 处理拒绝申请
const handleReject = (request) => {
  roleRequestDialog.value.isApprove = false
  roleRequestDialog.value.currentRequest = request
  roleRequestDialog.value.form.adminComment = ''
  roleRequestDialog.value.visible = true
}

// 提交角色变更请求处理
const submitRoleRequest = async () => {
  if (!roleRequestDialog.value.form.adminComment) {
    ElMessage.warning('请输入处理意见')
    return
  }

  try {
    await processRoleChangeRequest({
      requestId: roleRequestDialog.value.currentRequest.id,
      approved: roleRequestDialog.value.isApprove,
      adminComment: roleRequestDialog.value.form.adminComment,
      adminId: localStorage.getItem('userId')
    })
    ElMessage.success('处理成功')
    roleRequestDialog.value.visible = false
    loadPendingRequests()
    loadUsers()
  } catch (error) {
    ElMessage.error(error.message || '处理失败')
  }
}

// 处理重置密码
const handleResetPassword = (user) => {
  resetPasswordDialog.value.currentUser = user
  resetPasswordDialog.value.form.newPassword = ''
  resetPasswordDialog.value.form.confirmPassword = ''
  resetPasswordDialog.value.visible = true
}

// 提交重置密码
const submitResetPassword = async () => {
  if (!resetPasswordDialog.value.form.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }

  if (resetPasswordDialog.value.form.newPassword !== resetPasswordDialog.value.form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  try {
    await resetUserPassword({
      userId: resetPasswordDialog.value.currentUser.id,
      newPassword: resetPasswordDialog.value.form.newPassword,
      adminId: localStorage.getItem('userId')
    })
    ElMessage.success('密码重置成功')
    resetPasswordDialog.value.visible = false
  } catch (error) {
    ElMessage.error(error.message || '密码重置失败')
  }
}

// 处理修改角色
const handleChangeRole = (user) => {
  changeRoleDialog.value.currentUser = user
  changeRoleDialog.value.form.newRole = user.role
  changeRoleDialog.value.visible = true
}

// 提交修改角色
const submitChangeRole = async () => {
  try {
    await processRoleChangeRequest({
      userId: changeRoleDialog.value.currentUser.id,
      requestedRole: changeRoleDialog.value.form.newRole,
      approved: true,
      adminComment: '管理员直接修改',
      adminId: localStorage.getItem('userId')
    })
    ElMessage.success('角色修改成功')
    changeRoleDialog.value.visible = false
    loadUsers()
  } catch (error) {
    ElMessage.error(error.message || '角色修改失败')
  }
}

onMounted(() => {
  loadPendingRequests()
  loadUsers()
})
</script>

<style scoped>
.admin-panel {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 