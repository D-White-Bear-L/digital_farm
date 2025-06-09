<template>
  <div id="app">
    <LayOut v-if="isLoggedIn" />
    <Login v-else @login-success="handleLoginSuccess" />
  </div>
</template>

<script>
import LayOut from './layout.vue'; 
import Login from './components/Login/Login.vue';

export default {
  name: 'App',
  components: {
    LayOut,
    Login
  },
  data() {
    return {
      isLoggedIn: false
    }
  },
  created() {
    // 在组件创建时检查用户是否已登录
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      // 从localStorage中获取token判断用户是否已登录
      const token = localStorage.getItem('token')
      this.isLoggedIn = !!token
    },
    handleLoginSuccess(userData) {
      // 登录成功后保存token并更新登录状态
      if (userData && userData.token) {
        localStorage.setItem('token', userData.token)
        // 可以保存其他用户信息
        if (userData.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(userData.userInfo))
        }
        this.isLoggedIn = true
      }
    },
    logout() {
      // 清除localStorage中的token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      this.isLoggedIn = false
    }
  }
}
</script>

<style>
/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  /* font-family: 'Microsoft YaHei', Arial, sans-serif; */
  overflow: hidden;
}
</style>
