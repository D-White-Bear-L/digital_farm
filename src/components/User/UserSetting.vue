<template>
  <div class="user-profile-container">
    <el-card class="user-profile-card">
      <div class="profile-header">
        <h2>个人信息</h2>
        <el-button type="primary" size="small" @click="toggleEdit">
          {{ isEditing ? '保存' : '编辑' }}
        </el-button>
      </div>
      
      <div class="profile-content">
        <div class="avatar-section">
          <el-avatar :size="100" :src="userInfo.avatarUrl || defaultAvatar"></el-avatar>
          <div v-if="isEditing" class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              action="#"
              :http-request="uploadAvatar"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload">
              <el-button size="small" type="primary">更换头像</el-button>
            </el-upload>
          </div>
        </div>
        
        <div class="info-section">
          <el-form :model="userInfo" label-width="80px" :disabled="!isEditing">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" disabled></el-input>
            </el-form-item>
            
            <el-form-item label="真实姓名">
              <el-input v-model="userInfo.realName"></el-input>
            </el-form-item>
            
            <el-form-item label="性别">
              <el-select v-model="userInfo.gender" placeholder="请选择性别">
                <el-option label="男" value="male"></el-option>
                <el-option label="女" value="female"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="部门">
              <el-input v-model="userInfo.department"></el-input>
            </el-form-item>
            
            <el-form-item label="职位">
              <el-input v-model="userInfo.position"></el-input>
            </el-form-item>
            
            <el-form-item label="手机号码">
              <el-input v-model="userInfo.phone"></el-input>
            </el-form-item>
            
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email"></el-input>
            </el-form-item>
            
            <el-form-item label="地址">
              <el-input v-model="userInfo.address"></el-input>
            </el-form-item>
            
            <el-form-item label="个人简介">
              <el-input type="textarea" v-model="userInfo.bio" :rows="4"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <div class="profile-footer">
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.role === 'admin' ? '超级管理员' : userInfo.role === 'manager' ? '管理人员' : '用户' }}</div>
            <div class="stat-label">角色</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatDate(userInfo.lastLogin) }}</div>
            <div class="stat-label">最近登录</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ formatDate(userInfo.createTime) }}</div>
            <div class="stat-label">注册时间</div>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card class="security-card">
      <div class="security-header">
        <h3>安全设置</h3>
      </div>
      <div class="security-content">
        <div class="security-item" @click="showPasswordDialog = true">
          <div class="security-item-title">
            <i class="el-icon-lock"></i>
            <span>修改密码</span>
          </div>
          <div class="security-item-desc">
            <span>定期修改密码可以提高账号安全性</span>
            <el-tag size="small" type="info">上次修改: {{ formatDate(userInfo.passwordUpdatedAt || userInfo.createTime) }}</el-tag>
          </div>
          <i class="el-icon-arrow-right"></i>
        </div>
        
        <div class="security-item" @click="showBindPhoneDialog = true">
          <div class="security-item-title">
            <i class="el-icon-mobile-phone"></i>
            <span>手机绑定</span>
          </div>
          <div class="security-item-desc">
            <span>{{ userInfo.phone ? '已绑定手机: ' + maskPhone(userInfo.phone) : '未绑定手机' }}</span>
            <el-tag size="small" :type="userInfo.phone ? 'success' : 'danger'">{{ userInfo.phone ? '已绑定' : '未绑定' }}</el-tag>
          </div>
          <i class="el-icon-arrow-right"></i>
        </div>
        
        <!-- <div class="security-item" @click="showLoginHistoryDialog = true">
          <div class="security-item-title">
            <i class="el-icon-time"></i>
            <span>登录历史</span>
          </div>
          <div class="security-item-desc">
            <span>查看近期登录记录，发现异常及时处理</span>
          </div>
          <i class="el-icon-arrow-right"></i>
        </div> -->
      </div>
    </el-card>
    
    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" v-model="showPasswordDialog" width="400px" destroy-on-close>
      <el-form :model="passwordForm" label-width="100px" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="off"></el-input>
          <div class="password-strength">
            <div class="strength-label">密码强度:</div>
            <div class="strength-bar">
              <div class="strength-level" :class="passwordStrengthClass"></div>
            </div>
            <div class="strength-text">{{ passwordStrengthText }}</div>
          </div>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div class="password-tips">
        <p>密码安全提示:</p>
        <ul>
          <li>密码长度至少8位</li>
          <li>包含大小写字母、数字和特殊字符</li>
          <li>避免使用连续数字或字母</li>
          <li>避免使用个人信息作为密码</li>
        </ul>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="submitting">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 手机绑定对话框 -->
    <el-dialog title="手机绑定" v-model="showBindPhoneDialog" width="400px" destroy-on-close>
      <el-form :model="phoneForm" label-width="100px" :rules="phoneRules" ref="phoneFormRef">
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <div class="verification-code">
            <el-input v-model="phoneForm.code" placeholder="请输入验证码"></el-input>
            <el-button type="primary" :disabled="codeSending" @click="sendVerificationCode">
              {{ codeSending ? `${countdown}秒后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBindPhoneDialog = false">取消</el-button>
          <el-button type="primary" @click="bindPhone" :loading="submitting">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 登录历史对话框 -->
    <el-dialog title="登录历史" v-model="showLoginHistoryDialog" width="600px" @open="loadLoginHistory">
      <el-table v-if="loginHistoryLoaded" :data="loginHistory" style="width: 100%" max-height="400">
        <el-table-column prop="loginIp" label="登录IP" width="140"></el-table-column>
        <el-table-column prop="loginLocation" label="登录地点"></el-table-column>
        <el-table-column prop="loginDevice" label="登录设备"></el-table-column>
        <el-table-column prop="loginStatus" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.loginStatus === 'success' ? 'success' : 'danger'">
              {{ scope.row.loginStatus === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="loginTime" label="登录时间" width="180"></el-table-column>
      </el-table>
      <div v-else class="loading-placeholder">
        <el-skeleton :rows="4" animated />
      </div>
      <div class="login-history-footer">
        <p>如发现可疑登录记录，请立即修改密码并联系管理员</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getUserInfo as fetchUserInfo, 
  updateUserInfo, 
  changePassword as updatePassword, 
  sendVerificationCode as sendCode, 
  bindPhone as bindUserPhone, 
  uploadAvatar as uploadUserAvatar, 
  getLoginHistory 
} from '@/api/UserSetting'

export default {
  name: 'UserProfile',
  setup() {
    // 默认头像
    const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    
    // 用户信息
    const userInfo = reactive({
      userId: null,
      username: '',
      realName: '',
      role: '',
      avatarUrl: '',
      gender: '',
      birthday: null,
      department: '',
      position: '',
      phone: '',
      email: '',
      address: '',
      bio: '',
      lastLogin: '',
      loginIp: '',
      status: '',
      createTime: '',
      updateTime: '',
      passwordUpdatedAt: ''
    })
    
    // 编辑状态
    const isEditing = ref(false)
    
    // 提交状态
    const submitting = ref(false)
    
    // 对话框状态
    const showPasswordDialog = ref(false)
    const showBindPhoneDialog = ref(false)
    const showLoginHistoryDialog = ref(false)
    
    // 密码表单
    const passwordForm = reactive({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 手机表单
    const phoneForm = reactive({
      phone: '',
      code: ''
    })
    
    // 验证码发送状态
    const codeSending = ref(false)
    const countdown = ref(60)
    
    // 登录历史数据
    const loginHistory = ref([])
    const loginHistoryLoaded = ref(false)
    
    // 加载登录历史数据
    const loadLoginHistory = async () => {
      loginHistoryLoaded.value = false
      try {
        const response = await getLoginHistory(userInfo.userId)
        if (response.code === 200) {
          loginHistory.value = response.data
        } else {
          ElMessage.error(response.message || '获取登录历史失败')
        }
      } catch (error) {
        console.error('获取登录历史失败:', error)
        ElMessage.error('获取失败')
      } finally {
        loginHistoryLoaded.value = true
      }
    }
    
    // 密码表单验证规则
    const passwordRules = {
      oldPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 8, message: '密码长度不能小于8个字符', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            const hasLetter = /[a-zA-Z]/.test(value)
            const hasNumber = /\d/.test(value)
            const hasSpecialChar = /[!@#$%^&*()_+\-={};':"|,.<>/?]/.test(value)
            
            if (!(hasLetter && hasNumber && hasSpecialChar)) {
              callback(new Error('密码必须包含字母、数字和特殊字符'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { 
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          }, 
          trigger: 'blur' 
        }
      ]
    }
    
    // 手机表单验证规则
    const phoneRules = {
      phone: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
      ]
    }
    
    // 表单引用
    const passwordFormRef = ref(null)
    const phoneFormRef = ref(null)
    
    // 密码强度计算
    const passwordStrength = computed(() => {
      const password = passwordForm.newPassword
      if (!password) return 0
      
      let strength = 0
      // 长度检查
      if (password.length >= 8) strength += 1
      if (password.length >= 12) strength += 1
      
      // 复杂度检查
      if (/[a-z]/.test(password)) strength += 1
      if (/[A-Z]/.test(password)) strength += 1
      if (/\d/.test(password)) strength += 1
      if (/[!@#$%^&*()_+\-={};':"|,.<>/?]/.test(password)) strength += 1
      
      return Math.min(strength, 5)
    })
    
    const passwordStrengthClass = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 1) return 'very-weak'
      if (strength === 2) return 'weak'
      if (strength === 3) return 'medium'
      if (strength === 4) return 'strong'
      return 'very-strong'
    })
    
    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 1) return '非常弱'
      if (strength === 2) return '弱'
      if (strength === 3) return '中等'
      if (strength === 4) return '强'
      return '非常强'
    })
    
    // 切换编辑状态
    const toggleEdit = () => {
      if (isEditing.value) {
        // 保存用户信息
        saveUserInfo()
      }
      isEditing.value = !isEditing.value
    }
    
    // 获取用户信息
    const getUserInfo = async () => {
      try {
        const response = await fetchUserInfo()
        if (response.code === 200) {
          console.log('Fetched User Info:', response.data);
          console.log('Last Login Time:', response.data.lastLogin);
          Object.assign(userInfo, {
            userId: response.data.userId,
            username: response.data.username,
            realName: response.data.realName,
            role: response.data.role,
            avatarUrl: response.data.avatarUrl,
            gender: response.data.gender,
            birthday: response.data.birthday,
            department: response.data.department,
            position: response.data.position,
            phone: response.data.phone,
            email: response.data.email,
            address: response.data.address,
            bio: response.data.bio,
            lastLogin: response.data.lastLogin,
            loginIp: response.data.loginIp,
            status: response.data.status,
            createTime: response.data.createTime,
            updateTime: response.data.updateTime,
            passwordUpdatedAt: response.data.passwordUpdatedAt,
          });
        } else {
          console.error('Error fetching user info:', response.message);
          ElMessage.error(response.message || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      }
    }
    
    // 保存用户信息
    const saveUserInfo = async () => {
      submitting.value = true
      console.log('Sending userInfo to backend:', JSON.parse(JSON.stringify(userInfo)));
      try {
        const response = await updateUserInfo(userInfo)
        if (response.code === 200) {
          ElMessage.success('个人信息保存成功')
          isEditing.value = false
        } else {
          ElMessage.error(response.message || '保存失败')
        }
      } catch (error) {
        console.error('保存用户信息失败:', error)
        ElMessage.error('保存失败')
      } finally {
        submitting.value = false
      }
    }
    
    // 上传头像前的验证
    const beforeAvatarUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isJPG) {
        ElMessage.error('头像图片只能是JPG或PNG格式!')
      }
      if (!isLt2M) {
        ElMessage.error('头像图片大小不能超过2MB!')
      }
      return isJPG && isLt2M
    }
    
    // 上传头像
    const uploadAvatar = async (options) => {
      const file = options.file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userInfo.userId)
      
      // Add console.log to inspect formData before sending
      for (let pair of formData.entries()) {
          console.log(pair[0]+ ', ' + pair[1]); 
      }
      console.log('Sending avatar upload request with formData:', formData);

      try {
        const response = await uploadUserAvatar(formData)
        if (response.code === 200) {
          userInfo.avatarUrl = response.data
          ElMessage.success('头像上传成功')
        } else {
          ElMessage.error(response.message || '上传失败')
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        ElMessage.error('上传失败')
      }
    }
    
    // 修改密码
    const changePassword = () => {
      passwordFormRef.value.validate(async (valid) => {
        console.log('Password form validation result:', valid);
        if (valid) {
          submitting.value = true
          console.log('Submitting password change with form data:', JSON.parse(JSON.stringify(passwordForm)));
          try {
            const response = await updatePassword({
              userId: userInfo.userId,
              oldPassword: passwordForm.oldPassword,
              newPassword: passwordForm.newPassword
            })
            
            if (response.code === 200) {
              ElMessage.success('密码修改成功，请重新登录')
              showPasswordDialog.value = false
              userInfo.passwordUpdatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
              passwordForm.oldPassword = ''
              passwordForm.newPassword = ''
              passwordForm.confirmPassword = ''
            } else {
              ElMessage.error(response.message || '修改失败')
            }
          } catch (error) {
            console.error('修改密码失败:', error)
            ElMessage.error('修改失败')
          } finally {
            submitting.value = false
          }
        }
      })
    }
    
    // 发送验证码
    const sendVerificationCode = async () => {
      phoneFormRef.value.validateField('phone', async (valid) => {
        if (!valid) {
          codeSending.value = true
          try {
            const response = await sendCode(phoneForm.phone)
            if (response.code === 200) {
              ElMessage.success(`验证码已发送至 ${maskPhone(phoneForm.phone)}`)
              countdown.value = 60
              const timer = setInterval(() => {
                countdown.value--
                if (countdown.value <= 0) {
                  clearInterval(timer)
                  codeSending.value = false
                }
              }, 1000)
            } else {
              ElMessage.error(response.message || '发送失败')
              codeSending.value = false
            }
          } catch (error) {
            console.error('发送验证码失败:', error)
            ElMessage.error('发送失败')
            codeSending.value = false
          }
        }
      })
    }
    
    // 绑定手机
    const bindPhone = () => {
      phoneFormRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
            const response = await bindUserPhone({
              userId: userInfo.userId,
              phone: phoneForm.phone,
              code: phoneForm.code
            })
            
            if (response.code === 200) {
              userInfo.phone = phoneForm.phone
              ElMessage.success('手机绑定成功')
              showBindPhoneDialog.value = false
              phoneForm.phone = ''
              phoneForm.code = ''
            } else {
              ElMessage.error(response.message || '绑定失败')
            }
          } catch (error) {
            console.error('绑定手机失败:', error)
            ElMessage.error('绑定失败')
          } finally {
            submitting.value = false
          }
        }
      })
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '未知'
      try {
        if (typeof dateStr === 'string') {
          // 处理ISO格式的日期字符串
          if (dateStr.includes('T')) {
            return dateStr.replace('T', ' ').substring(0, 19)
          }
          // 处理其他格式的日期字符串
          return new Date(dateStr).toLocaleString('zh-CN', {
            year: 'numeric',//年：显示完整的年份，例如：2025
            month: '2-digit', //月：显示两位数的月份，例如：06
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit', // 不使用12h制
          })
        }
        if (dateStr instanceof Date) {
          return dateStr.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })
        }
        return '未知'
      } catch (error) {
        console.error('Date formatting error:', error)
        return '未知'
      }
    }
    
    // 手机号码脱敏
    const maskPhone = (phone) => {
      if (!phone) return ''
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
    
    onMounted(() => {
      getUserInfo()
    })
    
    return {
      userInfo,
      defaultAvatar,
      isEditing,
      submitting,
      toggleEdit,
      beforeAvatarUpload,
      uploadAvatar,
      showPasswordDialog,
      showBindPhoneDialog,
      showLoginHistoryDialog,
      passwordForm,
      phoneForm,
      passwordRules,
      phoneRules,
      passwordFormRef,
      phoneFormRef,
      changePassword,
      bindPhone,
      sendVerificationCode,
      codeSending,
      countdown,
      formatDate,
      maskPhone,
      loginHistory,
      passwordStrength,
      passwordStrengthClass,
      passwordStrengthText,
      loginHistoryLoaded,
      loadLoginHistory
    }
  }
}
</script>

<style scoped>
.user-profile-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.user-profile-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.profile-header h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.profile-content {
  display: flex;
  flex-wrap: wrap;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40px;
  margin-bottom: 20px;
}

.avatar-upload {
  margin-top: 15px;
}

.info-section {
  flex: 1;
  min-width: 300px;
}

.profile-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.user-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.security-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.security-header {
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.security-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.security-item:hover {
  background-color: #f5f7fa;
}

.security-item:last-child {
  border-bottom: none;
}

.security-item-title {
  display: flex;
  align-items: center;
  width: 120px;
}

.security-item-title i {
  margin-right: 10px;
  color: #409eff;
  font-size: 18px;
}

.security-item-desc {
  flex: 1;
  color: #606266;
  font-size: 14px;
  display: flex;
  flex-direction: column;
}

.security-item-desc .el-tag {
  margin-top: 5px;
  width: fit-content;
}

.verification-code {
  display: flex;
}

.verification-code .el-input {
  margin-right: 10px;
}

.verification-code .el-button {
  width: 120px;
}

.password-strength {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.strength-label {
  margin-right: 10px;
  font-size: 12px;
  color: #606266;
}

.strength-bar {
  width: 150px;
  height: 6px;
  background-color: #ebeef5;
  border-radius: 3px;
  overflow: hidden;
}

.strength-level {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-level.very-weak {
  width: 20%;
  background-color: #f56c6c;
}

.strength-level.weak {
  width: 40%;
  background-color: #e6a23c;
}

.strength-level.medium {
  width: 60%;
  background-color: #409eff;
}

.strength-level.strong {
  width: 80%;
  background-color: #67c23a;
}

.strength-level.very-strong {
  width: 100%;
  background-color: #67c23a;
}

.strength-text {
  margin-left: 10px;
  font-size: 12px;
}

.password-tips {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}

.password-tips p {
  margin: 0 0 5px 0;
  font-weight: bold;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
}

.login-history-footer {
  margin-top: 15px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
  }
  
  .avatar-section {
    margin-right: 0;
    margin-bottom: 30px;
  }
  
  .user-stats {
    flex-direction: column;
  }
  
  .stat-item {
    margin-bottom: 15px;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .security-item-title {
    margin-bottom: 10px;
  }
  
  .security-item-desc {
    margin-bottom: 10px;
  }
}
</style>