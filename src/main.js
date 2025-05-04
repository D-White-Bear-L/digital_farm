import { createApp } from 'vue'
import App from './App.vue'

// 高德地图配置
window._AMapSecurityConfig = {
  securityJsCode: '06b00cfdfbe78af912ac91012ac329ee', // 安全密钥
}

createApp(App).mount('#app')
