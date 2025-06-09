<template>
  <div class="login-container">
    <div class="login-header">
        <div class="logo">
            <img src="../../assets/logo.png" alt="logo" style="width: 72px;">
        </div>
        <h3 style="font-weight: 500;font-size: 24px;margin: 16px;color: #333">数字农场土壤质量监测系统</h3>
    </div>
    <div class="login-card">
      <!-- 左侧面板 - 背景图 -->
      <div class="login-bg">
        <img src="../../assets/login-bg.png" alt="背景图" style="width: 110%;">
      </div>

      <!-- 右侧面板 - 登录 -->
      <div class="login-panel" :class="{ 'active': activePanel === 'login' }">
        <h2>登录</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <input
              type="text"
              placeholder="用户名"
              v-model.trim="loginForm.username"
              required
            />
          </div>
          <div class="form-group">
            <input
              type="password"
              placeholder="密码"
              v-model.trim="loginForm.password"
              required
            />
          </div>
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="loginForm.remember">
            <label for="remember">记住我</label>
          </div>
          <button type="submit" class="btn-signin" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>
        <p class="switch-text">没有账号？<span @click="switchPanel('register')">注册</span></p>
      </div>

      <!-- 左侧面板 - 注册 -->
      <div class="register-panel" :class="{ 'active': activePanel === 'register' }">
        <h2>注册</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <input
              type="text"
              placeholder="用户名"
              v-model.trim="registerForm.username"
              required
              @blur="validateUsername"
            />
            <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
          </div>
          <div class="form-group">
            <input
              type="email"
              placeholder="邮箱"
              v-model.trim="registerForm.email"
              required
              @blur="validateEmail"
            />
            <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <input
              type="password"
              placeholder="密码"
              v-model.trim="registerForm.password"
              required
              @blur="validatePassword"
            />
            <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
          </div>
          <div class="form-group">
            <input
              type="password"
              placeholder="确认密码"
              v-model.trim="registerForm.confirmPassword"
              required
              @blur="validateConfirmPassword"
            />
            <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
          </div>
          <button type="submit" class="btn-signup" :disabled="isLoading || hasErrors">
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </form>
        <p class="switch-text">已有账号？<span @click="switchPanel('login')">登录</span></p>
      </div>
    </div>
  </div>
</template>

<script>
import { login, register } from '@/api/login'
import { ElMessage } from 'element-plus'

export default {
  name: 'LoginPage',
  data() {
    return {
      activePanel: 'login',
      isLoading: false,
      loginForm: {
        username: '',
        password: '',
        remember: false
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    hasErrors() {
      return Object.values(this.errors).some(error => error !== '')
    }
  },
  methods: {
    switchPanel(panel) {
      this.activePanel = panel
      this.clearForms()
    },
    
    clearForms() {
      this.loginForm = {
        username: '',
        password: '',
        remember: false
      }
      this.registerForm = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
      this.errors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    },

    validateUsername() {
      if (this.registerForm.username.length < 3) {
        this.errors.username = '用户名至少需要3个字符'
      } else {
        this.errors.username = ''
      }
    },

    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.registerForm.email)) {
        this.errors.email = '请输入有效的邮箱地址'
      } else {
        this.errors.email = ''
      }
    },

    validatePassword() {
      if (this.registerForm.password.length < 6) {
        this.errors.password = '密码至少需要6个字符'
      } else {
        this.errors.password = ''
      }
    },

    validateConfirmPassword() {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致'
      } else {
        this.errors.confirmPassword = ''
      }
    },
    
    async handleLogin() {
      if (this.hasErrors) return
      
      this.isLoading = true
      try {
        const res = await login(this.loginForm)
        if (res.code === 200) {
          // 存储token
          localStorage.setItem('token', res.data.token)
          // 存储用户信息
          localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
          
          ElMessage.success('登录成功')
          // 跳转到首页
          this.$router.push('/')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        this.isLoading = false
      }
    },

    async handleRegister() {
      if (this.hasErrors) return
      
      this.isLoading = true
      try {
        const res = await register(this.registerForm)
        if (res.code === 200) {
          ElMessage.success('注册成功，请登录')
          this.switchPanel('login')
        } else {
          ElMessage.error(res.message || '注册失败')
        }
      } catch (error) {
        console.error('注册错误:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('../../assets/login-bg.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 450px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
}


.login-panel, .register-panel {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  padding: 40px;
  box-sizing: border-box;
  transition: all 0.6s ease-in-out;
}

.login-panel {
  right: 0;
  opacity: 0;
  z-index: 1;
  transform: translateX(20%);
}

.register-panel {
  left: 0;
  opacity: 0;
  z-index: 1;
  transform: translateX(-20%);
}

.login-panel.active, .register-panel.active {
  opacity: 1;
  transform: translateX(0);
  z-index: 5;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  position: absolute;
  bottom: -18px;
  left: 0;
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #4a90e2;
  outline: none;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-signin, .btn-signup {
  background-color: #4a90e2;
  border-radius: 24px;
}

button:not(:disabled):hover {
  background-color: #3a7bc8;
}

.switch-text {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.switch-text span {
  color: #4a90e2;
  cursor: pointer;
  font-weight: 600;
}

.switch-text span:hover {
  text-decoration: underline;
}
/* 初始状态设置 */
.login-panel.active,.register-panel.active{
  background-color: white;
}


/* 响应式调整 */
@media (max-width: 768px) {
  .login-card {
    max-width: 400px;
    height: auto;
  }
  
  .login-bg {
    display: none;
  }
  
  .login-panel, .register-panel {
    position: relative;
    width: 100%;
    left: 0;
    right: 0;
    display: none;
  }
  
  .login-panel.active, .register-panel.active {
    display: block;
  }
}
</style>
