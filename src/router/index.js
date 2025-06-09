import { createRouter, createWebHistory } from 'vue-router'
// import Home from '../components/Home.vue'
// import DevicesList from '@/components/DevicesManage/DevicesList.vue'
import LayOut from '@/layout.vue'
import Login from '@/components/Login/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
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
        component: () => import('@/components/SoilQualityMonitoring/ManualReport.vue')
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

// 路由守卫：未登录跳转到登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router