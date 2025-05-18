import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
// import index from '@/components/SoilQualityMonitoring/index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router