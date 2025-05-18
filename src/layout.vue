<template>
    <div class="common-layout" :class="{ 'is-collapsed': isSidebarCollapsed }">
      <el-container>
        <el-aside :width="sidebarWidth">
          <SideBar @collapse-change="handleCollapseChange" />
        </el-aside>
        <el-container class="main-container">
          <el-header class="header" :style="{ height: headerHeight + 'px' }">
            <HeaderBar />
          </el-header>
          <el-main>
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </div>
</template>

<script>
import SideBar from '@/components/sidebar.vue'
import HeaderBar from '@/components/Header.vue'
import { ref, computed } from 'vue'

export default {
    name: 'CommonLayout',
    components: {
        SideBar,
        HeaderBar
    },
    setup() {
        const isSidebarCollapsed = ref(false)
        const headerHeight = ref(64) // 设置头部高度
        
        const sidebarWidth = computed(() => {
            return isSidebarCollapsed.value ? '64px' : '200px'
        })
        
        const handleCollapseChange = (collapsed) => {
            isSidebarCollapsed.value = collapsed
        }
        
        return {
            isSidebarCollapsed,
            sidebarWidth,
            headerHeight,
            handleCollapseChange
        }
    }
}
</script>

<style>
.common-layout {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.common-layout .el-aside {
    position: relative;
    z-index: 2;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.common-layout .main-container {
    flex: 1;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: calc(100% - 200px);
    margin-left: 0;
}

.common-layout.is-collapsed .main-container {
    width: calc(100% - v-bind(headerHeight + 16) + 'px');
}

.common-layout .el-header {
    height: v-bind(headerHeight + 'px');
    border-bottom: 1px solid #dcdfe6;
    box-sizing: border-box;
    background-color: #fff;
    position: relative;
    z-index: 1;
    padding: 0 20px;
    display: flex;
    align-items: center;
}

.common-layout .el-main {
    margin: 8px;
    background-color: #fff;
    position: relative;
    z-index: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow-y: auto;  /* 添加垂直滚动 */
    overflow-x: hidden; /* 隐藏水平滚动 */
    padding: 20px;
    height: calc(100vh - v-bind(headerHeight + 16) + 'px'); /* 设置固定高度，减去header高度和边距 */
}

/* .common-layout .is-sidebar-collapsed {
    margin-left: 64px;
} */
</style>