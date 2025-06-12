import { createRouter, createWebHistory } from 'vue-router'
// import Home from '../components/Home.vue'
// import DevicesList from '@/components/DevicesManage/DevicesList.vue'
import LayOut from '@/layout.vue'
import Login from '@/components/Login/Login.vue'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: LayOut,
    children: [
      { path: '', name: 'Home', component: () => import('@/components/FarmMap.vue') },
      {
        path: '/monitoring',
        name: 'Monitoring',
        component: () => import('@/components/SoilQualityMonitoring/Monitoring.vue')
      },
      {
        path: '/manual-report',
        name: 'ManualReport',
        component: () => import('@/components/SoilQualityMonitoring/ManualReport.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/quality-evaluation',
        name: 'QualityEvaluation',
        component: () => import('@/components/SoilQualityMonitoring/QualityEvaluation.vue')
      },
      {
        path: '/data-analysis',
        name: 'DataAnalysis',
        component: () => import('@/components/SoilQualityMonitoring/DataAnalysis.vue')
      },
      {
        path: '/alert-settings',
        name: 'AlertSettings',
        component: () => import('@/components/SoilQualityMonitoring/AlertSettings.vue')
      },
      {
        path: '/alert-records',
        name: 'AlertRecords',
        component: () => import('@/components/SoilQualityMonitoring/AlertRecords.vue')
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/components/User/UserSetting.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 如果尝试访问 /login 并且已经登录，则重定向到首页
  if (to.path === '/login' && token) {
    next('/')
  }
  // 如果尝试访问非 /login 页面且未登录，则重定向到登录页
  else if (to.path !== '/login' && !token) {
    ElMessage.warning('请先登录')
    next('/login')
  }
  // 其他情况（已登录访问非 /login 页面，或未登录访问 /login 页面），允许导航
  else {
    next()
  }
})

export default router