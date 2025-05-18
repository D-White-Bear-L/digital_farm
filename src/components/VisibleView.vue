<template>
  <div class="digital-farm-platform">
    <header class="platform-header">
      <div class="header-left">
        <span class="weather">晴平 小雨 27℃</span>
        <button class="btn-primary">数据共享</button>
      </div>
      <h1 class="platform-title">数字农场综合管理平台</h1>
      <div class="header-right">
        <button class="btn-primary">产业状态</button>
        <span class="time">{{ currentTime }}</span>
      </div>
    </header>

    <div class="platform-content">
      <!-- 左侧数据面板 -->
      <div class="left-panel">
        <data-panel 
          v-for="panel in leftPanels" 
          :key="panel.id" 
          :title="panel.title"
          :chart-type="panel.chartType"
        />
      </div>

      <!-- 中间地图区域 -->
      <div class="map-container">
        <!-- 修改为使用v-model绑定farmId -->
        <FarmMap :farmId="selectedFarmId" 
        @update:farmId="selectedFarmId = $event"/>
      </div>

      <!-- 右侧数据面板 -->
      <div class="right-panel">
        <data-panel
          v-for="panel in rightPanels"
          :key="panel.id"
          :title="panel.title"
          :chart-type="panel.chartType"
        />
      </div>
    </div>

    <!-- <footer class="platform-footer">
      <div class="footer-nav">
        <button class="nav-btn">卫星影像</button>
        <button class="nav-btn">地块管理</button>
        <button class="nav-btn">人员监测</button>
        <button class="nav-btn">植物区域</button>
      </div>
    </footer> -->
  </div>
</template>

<script>
import FarmMap from './FarmMap.vue'
import DataPanel from './DataPanel.vue'
import { farms } from '../data/farms.js'
// 从 DataPanel.vue 导入面板数据，不再使用 panels.js
import { leftPanels, rightPanels } from './DataPanel.vue'
import './VisibleView.css'

export default {
  name: 'HelloWorld',
  components: {
    FarmMap,
    DataPanel
  },
  data() {
    return {
      currentTime: '00:00:00',
      farms: farms,
      selectedFarmId: 1,
      leftPanels: leftPanels,
      rightPanels: rightPanels
    }
  },
  mounted() {
    this.startTimer()
  },
  methods: {
    startTimer() {
      // 立即更新一次时间
      this.updateTime();
      
      setInterval(() => {
        this.updateTime();
      }, 1000)
    },
    updateTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}:${seconds}`;
    }
  }
}
</script>

