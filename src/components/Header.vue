<template>
    <div class="header-container">
        <!-- 左侧区域 -->
        <div class="header-left">
            <div class="breadcrumb">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item v-if="currentRoute">{{ currentRouteName }}</el-breadcrumb-item>
                </el-breadcrumb>
            </div>
        </div>
    
        
        <!-- 右侧区域 -->
        <div class="header-right">
            <!-- 通知图标 -->
            <el-badge :value="notificationCount" class="notification-badge">
                <el-icon class="header-icon"><Bell /></el-icon>
            </el-badge>
            
            <!-- 全屏按钮 -->
            <el-tooltip content="全屏显示" placement="bottom">
                <el-icon class="header-icon" @click="toggleFullScreen">
                    <FullScreen />
                </el-icon>
            </el-tooltip>
            
            <!-- 用户信息 -->
            <el-dropdown trigger="click">
                <div class="user-info">
                    <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                    <span class="username">{{ name }}</span>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>个人信息</el-dropdown-item>
                        <el-dropdown-item>系统设置</el-dropdown-item>
                        <el-dropdown-item divided>退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, FullScreen } from '@element-plus/icons-vue'

export default {
    name: 'HeaderBar',
    components: {
        Bell,
        FullScreen
    },
    data(){

    },
    setup() {
        const searchText = ref('')
        const notificationCount = ref(5)
        const route = useRoute()
        
        const currentRouteName = computed(() => {
            return route.meta.title || route.name || ''
        })
        
        const currentRoute = computed(() => {
            return route.path !== '/'
        })
        
        // 全屏切换功能
        const toggleFullScreen = () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                }
            }
        }
        
        return {
            searchText,
            notificationCount,
            currentRouteName,
            currentRoute,
            toggleFullScreen
        }
    }
}
</script>

<style scoped>
.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    width: 100%;
}

.header-left, .header-center, .header-right {
    display: flex;
    align-items: center;
}

.header-left {
    flex: 1;
}

.header-center {
    flex: 2;
    justify-content: center;
}

.header-right {
    flex: 1;
    justify-content: flex-end;
    gap: 16px;
}

.search-input {
    max-width: 300px;
}

.header-icon {
    font-size: 20px;
    cursor: pointer;
    color: #606266;
}

.header-icon:hover {
    color: #409EFF;
}

.notification-badge {
    margin-right: 8px;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.username {
    margin-left: 8px;
    font-size: 14px;
    color: #606266;
}

.breadcrumb {
    font-size: 14px;
}
</style>