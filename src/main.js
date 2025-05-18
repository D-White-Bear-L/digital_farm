import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import router from './router/index.js'
import ElementPlus from 'element-plus'

// 高德地图配置
window._AMapSecurityConfig = {
  securityJsCode: '06b00cfdfbe78af912ac91012ac329ee', // 安全密钥
}
const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

