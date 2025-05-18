<template>
    <div class="soil-monitoring-index-content">
        <h1>土壤质量监测系统</h1>
        <p>欢迎使用土壤质量监测系统。这是首页的主要内容区域。</p>
        
    </div>
</template>

<script>
export default {
    name: 'SoilQualityMonitoringPage', 
    // 不再需要导入和注册 SideBar 组件
    components: {
        // SideBar, // 移除
    },
}
</script>

<style>
.soil-monitoring-index-content {
    /* 可以为这个页面的特定内容添加样式 */
    /* 例如： */
    /* background-color: #fff; */
    /* padding: 15px; */
    /* border-radius: 4px; */
}

/* 移除了之前可能存在的 .soil-monitoring 整体padding，因为 main-content-section 已有padding */
</style>