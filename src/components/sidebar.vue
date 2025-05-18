<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': isCollapse }">
    <div class="logo-container">
      <img src="../assets/logo.png" alt="系统logo" class="logo-img">
      <h2 class="logo-title" v-show="!isCollapse">土壤质量监测系统</h2>
    </div>
    
    <el-menu
      :default-active="activeIndex"
      class="sidebar-menu"
      background-color="transparent"
      text-color="#fff"
      active-text-color="#4fc3f7"
      router
      :collapse="isCollapse"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>
      
      <el-menu-item index="/monitoring">
        <el-icon><Monitor /></el-icon>
        <span>监测点管理</span>
      </el-menu-item>
      
      <el-menu-item index="/manual-report">
        <el-icon><Upload /></el-icon>
        <span>人工上报</span>
      </el-menu-item>
      
      <el-menu-item index="/quality-evaluation">
        <el-icon><StarFilled /></el-icon>
        <span>质量等级评估</span>
      </el-menu-item>
      
      <el-menu-item index="/data-analysis">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据分析</span>
      </el-menu-item>
      
      <el-sub-menu index="alert">
        <template #title>
          <el-icon><Bell /></el-icon>
          <span>监测预警</span>
        </template>
        <el-menu-item index="/alert-settings">预警设置</el-menu-item>
        <el-menu-item index="/alert-records">监测预警</el-menu-item>
      </el-sub-menu>
    </el-menu>
    
    <!-- 添加折叠按钮 -->
    <div class="collapse-btn" @click="toggleCollapse">
      <el-icon v-if="isCollapse"><Expand /></el-icon>
      <el-icon v-else><Fold /></el-icon>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  Monitor,
  Upload,
  StarFilled,
  DataAnalysis,
  Bell,
  Expand,
  Fold
} from '@element-plus/icons-vue'

export default {
  name: 'SideBar',
  components: {
    HomeFilled,
    Monitor,
    Upload,
    StarFilled,
    DataAnalysis,
    Bell,
    Expand,
    Fold
  },
  setup(props, { emit }) {
    const route = useRoute()
    const isCollapse = ref(false)
    
    const activeIndex = computed(() => {
      return route.path
    })
    
    // 修改折叠/展开方法，添加事件发射
    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value
      emit('collapse-change', isCollapse.value)
    }
    
    return {
      isCollapse,
      activeIndex,
      toggleCollapse
    }
  }
}
</script>

<style scoped>
.sidebar-container {
  height: 100vh;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  transition: width 0.3s;
  width: 200px; /* 展开时的宽度 */

  background-color: #0e2a1f; /* 作为顶部的纯色和图片未加载时的底色 */
  background-image:
    /* 顶层渐变：从纯色顶部到底部透明，以显示图片 */
    linear-gradient(
      to bottom,
      #0e2a1f 0%,       /* 顶部开始，纯色 */
      #0e2a1f 40%,      /* 纯色区域延伸到35%高度 */
      rgba(14, 42, 31, 0.8) 50%, /* 开始向半透明过渡 */
      rgba(14, 42, 31, 0) 70%, /* 在70%高度时完全透明 */
      rgba(14, 42, 31, 0) 100% /* 底部保持透明 */
    ),
    /* 底层图片 */
    url('../assets/sidebar.png');

  background-size:
    100% 100%, /* 渐变层覆盖整个容器 */
    cover;     /* 图片层覆盖整个容器 */

  background-position:
    0 0,             /* 渐变层从顶部开始 */
    center bottom;   /* 图片层底部对齐容器底部并居中 */

  background-repeat: no-repeat; /* 所有背景层都不重复 */
}

/* 折叠状态下的侧边栏 */
.sidebar-container.is-collapsed {
  width: 64px; /* 折叠时的宽度 */
  overflow: hidden;
}

.logo-container {
  padding: 20px 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: padding 0.3s;
}

/* 折叠状态下的logo容器 */
.is-collapsed .logo-container {
  padding: 20px 14px;
  justify-content: center;
}

.logo-img {
  width: 36px;
  height: 36px;
  margin-right: 10px;
  transition: margin 0.3s;
}

/* 折叠状态下的logo图片 */
.is-collapsed .logo-img {
  margin-right: 0;
}

.logo-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.sidebar-menu {
  border-right: none;
}

/* 自定义 Element Plus 菜单样式 */
:deep(.el-menu-item.is-active) {
  background-color: rgba(79, 195, 247, 0.2) !important;
  border-left: 3px solid #4fc3f7;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu-item .el-icon), :deep(.el-sub-menu__title .el-icon) {
  margin-right: 10px;
}

/* 添加折叠菜单弹出层的样式 - 使用更强的选择器 */
:global(.el-menu--popup) {
  background-color: #0e2a1f !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4) !important;
}

:global(.el-menu--popup .el-menu-item) {
  background-color: #0e2a1f !important;
  color: #fff !important;
}

:global(.el-menu--popup .el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:global(.el-menu--popup .el-menu-item.is-active) {
  background-color: rgba(79, 195, 247, 0.2) !important;
  color: #4fc3f7 !important;
}

/* 折叠按钮样式 */
.collapse-btn {
  position: fixed;
  bottom: 20px;
  left: 0;
  width: 24px;
  height: 24px;
  background-color: rgba(79, 195, 247, 0.2);
  color: #4fc3f7;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  z-index: 10;
  transition: left 0.3s;
  margin-left: 200px; /* 与侧边栏宽度相同 */
}

/* 折叠状态下的按钮位置 */
.is-collapsed .collapse-btn {
  margin-left: 64px; /* 与折叠后的侧边栏宽度相同 */
}

.collapse-btn:hover {
  background-color: rgba(79, 195, 247, 0.4);
}
</style>