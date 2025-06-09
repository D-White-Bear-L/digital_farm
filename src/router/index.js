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
        component: () => import('@/components/User/User.vue')
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
  
  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录')
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router