<template>
  <div class="farm-map-container" ref="mapContainerRef">
    <!-- 农场选择下拉列表 -->
    <div class="farm-selector">
      <select v-model="selectedFarmId" @change="changeFarm" class="farm-dropdown">
        <option v-for="farm in farms" :key="farm.id" :value="farm.id">
          {{ farm.name }}
        </option>
      </select>
    </div>
    
    <!-- 实时监控面板 -->
    <div class="monitoring-panel" :class="{ collapsed: isMonitoringCollapsed }">
      <div class="monitoring-header">
        <h3 class="monitoring-title">实时监控数据</h3>
        <button class="toggle-btn" @click="toggleMonitoring">
          {{ isMonitoringCollapsed ? '展开' : '收起' }}
        </button>
      </div>
      <div class="monitoring-content" v-if="!isMonitoringCollapsed">
        <div class="data-row">
          <span class="data-label">土壤湿度:</span>
          <span class="data-value" :class="{ warning: soilMoisture < 30, danger: soilMoisture < 20 }">
            {{ soilMoisture.toFixed(1) }}%
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">土壤温度:</span>
          <span class="data-value">{{ soilTemperature.toFixed(1) }}°C</span>
        </div>
        <div class="data-row">
          <span class="data-label">空气温度:</span>
          <span class="data-value">{{ airTemperature.toFixed(1) }}°C</span>
        </div>
        <div class="data-row">
          <span class="data-label">空气湿度:</span>
          <span class="data-value">{{ airHumidity.toFixed(1) }}%</span>
        </div>
        <div class="data-row">
          <span class="data-label">光照强度:</span>
          <span class="data-value">{{ lightIntensity.toFixed(0) }} lux</span>
        </div>
        <div class="data-row">
          <span class="data-label">设备状态:</span>
          <span class="data-value" :class="{ warning: deviceStatus === '警告', danger: deviceStatus === '异常' }">
            {{ deviceStatus }}
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">灌溉系统:</span>
          <span class="data-value">{{ irrigationStatus }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">最近更新:</span>
          <span class="data-value">{{ lastUpdate }}</span>
        </div>
      </div>
    </div>
    
    <!-- 天气效果层 -->
    <div class="weather-layer" :class="weatherEffect" v-if="showWeatherEffect"></div>
    
    <div id="map" ref="mapContainer"></div>
    
    <!-- 区域边界 -->
    <div class="area-boundary"></div>

    <!-- 只在未打开设备管理面板时显示“设备管理”按钮 -->
    <button
      v-if="!showDevicesManage"
      class="devices-manage-toggle"
      @click="showDevicesManage = true"
    >
      设备管理
    </button>

    <!-- 设备管理面板（可显示/隐藏）-->
    <DevicesManage
      v-show="showDevicesManage"
      :devices="devices"
      @add-device="addDevice"
      @update-device="updateDevice"
      @delete-device="deleteDevice"
      @close="showDevicesManage = false"
      class="devices-manage-panel"
    />
  </div>
</template>

<script>
// 引入高德地图
import AMapLoader from '@amap/amap-jsapi-loader';
import './FarmMap.css'; // 引入外部CSS文件
import { farms, getDefaultFarm } from '../data/farms.js'; // 引入农场数据
import DevicesManage from './DevicesManage.vue'; // 新增

export default {
  name: 'FarmMap',
  components: {DevicesManage},
  props: {
    farmId: {
      type: Number,
      default: 1 // 默认显示第一个农场
    },
  },
  data() {
    return {
      map: null,
      AMap: null, // 添加 AMap 对象存储
      currentFarm: null,
      markers: [],
      markerObjs: [],
      markerZoomThreshold: 16, // 标记的缩放阈值
      selectedFarmId: this.farmId, // 添加选中的农场ID
      farms: farms, // 将农场数据添加到组件中

      farmMarkerZoomThreshold: 12, // 农场标记的缩放阈值
      farmMarkerObj: null, // 农场标记的对象
      boundaryPolygon: null, // 区域边界的多边形对象
      
      // 数字孪生相关数据
      activeLayer: null,
      isMonitoringCollapsed: false,
      soilMoisture: 45,
      soilTemperature: 22,
      airTemperature: 25,
      airHumidity: 65,
      lightIntensity: 12000,
      deviceStatus: '正常',
      irrigationStatus: '关闭',
      lastUpdate: '刚刚',
      
      // 设备状态
      devices: [
        { id: 1, type: 'sensor', name: '土壤传感器1', status: 'normal', x: 30, y: 40 },
        { id: 2, type: 'irrigation', name: '灌溉系统1', status: 'normal', x: 45, y: 55 },
        { id: 3, type: 'camera', name: '监控摄像头1', status: 'warning', x: 60, y: 35 },
        { id: 4, type: 'weather', name: '气象站', status: 'normal', x: 25, y: 25 },
        { id: 5, type: 'pump', name: '水泵', status: 'error', x: 70, y: 60 }
      ]
    }
  },
  watch: {
    farmId: {
      handler(newVal) {
        this.selectedFarmId = newVal; // 同步外部传入的farmId
        this.loadFarmData(newVal);
        if (this.map) {
          // 清除现有标记和边界
          this.map.clearMap();
          // 重新添加农场数据
          this.addCustomMarkers();
          this.addBoundary();
          this.addHeatmap();
          this.updateHeatmapVisibility();
          // 移动到新农场中心
          this.map.setCenter(this.currentFarm.center);
        }
      },
      immediate: true
    }
  },

  
  mounted() {
    // 使用 setTimeout 确保 DOM 完全渲染
    setTimeout(() => {
      this.initMap();
    }, 500);
    
    // 模拟实时数据更新
    this.startDataSimulation();
  },
  beforeUnmount() {
    // 清理定时器
    if (this.dataSimulationInterval) {
      clearInterval(this.dataSimulationInterval);
    }
    if (this.timelineInterval) {
      clearInterval(this.timelineInterval);
    }
  },
  methods: {
  
  addFarmMarker() {
    if (!this.map || !this.AMap || !this.currentFarm) return;
    if (this.farmMarkerObj) {
      this.map.remove(this.farmMarkerObj);
      this.farmMarkerObj = null;
    }
    const markerContent = document.createElement('div');
    markerContent.className = 'farm-center-marker';
    markerContent.innerHTML = `<div class="farm-marker-icon">🏠</div>`;
    this.farmMarkerObj = new this.AMap.Marker({
      position: this.currentFarm.center,
      content: markerContent,
      anchor: 'center',
      zIndex: 200
    });
    this.farmMarkerObj.on('click', () => {
      this.map.setZoomAndCenter(15, this.currentFarm.center, true);
    });
    this.map.add(this.farmMarkerObj);
    this.updateFarmMarkerVisibility();
  },
  updateFarmMarkerVisibility() {
    if (!this.map || !this.farmMarkerObj) return;
    const zoom = this.map.getZoom();
    if (zoom < this.farmMarkerZoomThreshold) {
      this.farmMarkerObj.show();
      // 隐藏边界
      if (this.boundaryPolygon) this.boundaryPolygon.hide();
    } else {
      this.farmMarkerObj.hide();
      // 显示边界
      if (this.boundaryPolygon) this.boundaryPolygon.show();
    }
  },
    // 农场切换
    changeFarm() {
      // 触发事件通知父组件
      this.$emit('update:farmId', this.selectedFarmId);
      // 直接加载新农场数据
      this.loadFarmData(this.selectedFarmId);
      if (this.map) {
        // 清除现有标记和边界
        this.map.clearMap();
        // 重新添加农场数据
        this.addCustomMarkers();
        this.addBoundary();
        this.addHeatmap();
        this.updateHeatmapVisibility();
        // 移动到新农场中心并调整缩放级别
        this.map.setZoomAndCenter(14, this.currentFarm.center, true);
        this.addFarmMarker();
        this.updateFarmMarkerVisibility();
      }
    },
    
    loadFarmData(id) {
      // 根据ID加载农场数据
      this.currentFarm = farms.find(farm => farm.id === id) || getDefaultFarm();
      this.markers = (this.currentFarm && this.currentFarm.markers) ? this.currentFarm.markers : []; //  加载标记数据
      
      // 重置相关数据
      this.isMonitoringCollapsed = false;
      this.showTimeline = false;
      this.weatherEffect = '';
      this.showWeatherEffect = false;
      
      // 根据农场ID调整设备位置
      this.adjustDevicePositions(id);
      
      this.addHeatmap();
      this.updateHeatmapVisibility();
      this.addFarmMarker();
      this.addBoundary();
      this.updateFarmMarkerVisibility();
    },
    
    toggleMonitoring() {
      this.isMonitoringCollapsed = !this.isMonitoringCollapsed;
    },
    
    // 以下是地图相关方法
    initMap() {
      // 初始化高德地图
      AMapLoader.load({
        key: '4f5e2e1c9c8b3a7d6f0e2d1c4b7a9e8d',
        version: '2.0',
        plugins: [
          'AMap.ToolBar',// 工具栏
          'AMap.Scale',// 比例尺
          'AMap.HawkEye', // 实时定位
          'AMap.MapType', // 3D地图
          'AMap.Geolocation', // 地理位置
          'AMap.ControlBar',  // 3D控制插件
          'AMap.HeatMap',      // 添加热力图插件
        ],
        AMapUI: {
          version: '1.1',
          plugins: []
        },
        Loca: {
          version: '2.0.0'
        }
      }).then((AMap) => {
        this.AMap = AMap; // 保存 AMap 对象到组件实例
        
        // 确保容器存在
        if (!this.$refs.mapContainer) {
          console.error('地图容器不存在');
          return;
        }
        
        try {
          this.map = new this.AMap.Map(this.$refs.mapContainer, {
            pitch: 40, // 增加俯仰角度，使地图更有立体感
            viewMode: '3D', // 地图模式
            rotateEnable: true, // 是否开启地图旋转交互
            pitchEnable: true, // 是否开启地图倾斜交互
            zoom: 25, // 调整缩放级别
            rotation: -15, // 初始地图顺时针旋转的角度
            zooms: [2, 20], // 地图显示的缩放级别范围
            center: this.currentFarm.center, // 使用当前农场中心
            mapStyle: 'amap://styles/darkblue', // 使用深蓝色主题，更符合数字农场系统风格
            showBuildingBlock: true, // 显示3D建筑物
            showLabel: true, // 显示标签
            terrain: true, // 开启地形图功能
            features: ['bg', 'road', 'building', 'point'] // 确保显示所有地图要素
          });
          
          // 添加卫星图层
          const satelliteLayer = new this.AMap.TileLayer.Satellite();
          const roadNetLayer = new this.AMap.TileLayer.RoadNet();
          
          // 创建图层切换控件
          const layers = [
            new this.AMap.TileLayer(),
            satelliteLayer,
            roadNetLayer
          ];
          
          // 添加图层切换控件
          this.map.addControl(new this.AMap.MapType({
            defaultType: 1,
            showRoad: true,
            showTraffic: true,
            layers: layers
          }));
          
          // 添加控件
          this.map.addControl(new this.AMap.ToolBar({
            position: 'RB'  // 右下角
          }));
          this.map.addControl(new this.AMap.Scale({
            position: 'LB' // 左下角
          }));
          this.map.addControl(new this.AMap.ControlBar({
            position: {
              right: '10px',
              top: '180px' // 增加顶部距离，避免与其他控件重叠
            }
          }));
          
          // 添加自定义标记点
          this.addCustomMarkers();
          
          // 添加区域边界
          this.addBoundary();
          
          // 添加热力图效果
          this.addHeatmap();

          this.addFarmMarker();
          // 绑定地图缩放事件，动态切换农场中心点和边界显示
          this.map.on('zoomchange', () => {
            this.updateMarkerVisibility();
            this.updateFarmMarkerVisibility(); // 新增
          });
          
          // 添加地图点击事件，显示监控面板
          this.map.on('click', () => {
            this.isMonitoringCollapsed = false;
          });
          
          console.log('高德地图加载完成');
        } catch (error) {
          console.error('地图初始化失败:', error);
        }
      }).catch(e => {
        console.error('高德地图加载失败：', e);
      });
    },
    
    addBoundary() {
      if (!this.map || !this.AMap || !this.currentFarm) return;
      
      // 清除现有边界
      if (this.boundaryPolygon) {
        this.map.remove(this.boundaryPolygon);
        this.boundaryPolygon = null;
      }
      
      // 如果农场有边界数据，则添加边界
      if (this.currentFarm.boundary && this.currentFarm.boundary.length > 0) {
        // 创建多边形
        this.boundaryPolygon = new this.AMap.Polygon({
          path: this.currentFarm.boundary,
          strokeColor: '#00eaff',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#00eaff',
          fillOpacity: 0.1,
          zIndex: 50,
          bubble: true
        });
        
        // 将多边形添加到地图
        this.map.add(this.boundaryPolygon);
        
        // 缩放地图以适应边界
        this.map.setFitView([this.boundaryPolygon]);
      }
    },
    
    addCustomMarkers() {
      if (!this.map || !this.AMap || !this.markers || this.markers.length === 0) return;
      
      // 清除现有标记
      if (this.markerObjs && this.markerObjs.length > 0) {
        this.map.remove(this.markerObjs);
        this.markerObjs = [];
      }
      
      // 为每个标记点创建标记对象
      this.markers.forEach(marker => {
        // 创建自定义内容
        const markerContent = document.createElement('div');
        markerContent.className = 'custom-marker';
        markerContent.innerHTML = `
          <div class="marker-icon" style="background-color: ${marker.color || '#00eaff'}">
            <span>${marker.icon || '📍'}</span>
          </div>
          <div class="marker-label">${marker.label}</div>
        `;
        
        // 创建标记
        const markerObj = new this.AMap.Marker({
          position: marker.position || this.currentFarm.center,
          content: markerContent,
          anchor: 'bottom-center',
          offset: new this.AMap.Pixel(0, 0),
          zIndex: 100,
          extData: marker // 存储原始标记数据
        });
        
        // 添加点击事件
        markerObj.on('click', () => {
          this.showMarkerInfo(marker);
        });
        
        // 将标记添加到地图
        this.map.add(markerObj);
        this.markerObjs.push(markerObj);
      });
      
      // 绑定地图缩放事件，动态切换农场中心点和边界显示
      this.map.on('zoomchange', () => {
        this.updateMarkerVisibility();
        this.updateFarmMarkerVisibility(); // 新增
      });
      this.updateMarkerVisibility();
    },
    
    updateMarkerVisibility() {
      if (!this.map || !this.markerObjs || this.markerObjs.length === 0) return;
      
      const zoom = this.map.getZoom();
      const mapContainer = this.$refs.mapContainerRef;
      
      // 使用 ref 引用并检查是否存在
      if (mapContainer) {
        // 根据缩放级别添加类名
        if (zoom < 12) {
          mapContainer.classList.remove('zoom-level-medium', 'zoom-level-high');
          mapContainer.classList.add('zoom-level-low');
        } else if (zoom < 16) {
          mapContainer.classList.remove('zoom-level-low', 'zoom-level-high');
          mapContainer.classList.add('zoom-level-medium');
        } else {
          mapContainer.classList.remove('zoom-level-low', 'zoom-level-medium');
          mapContainer.classList.add('zoom-level-high');
        }
      }
      
      // 根据缩放级别调整标记大小和可见性
      this.markerObjs.forEach(markerObj => {
        if (zoom < 12) {
          // 缩放级别很小时，完全隐藏标记
          markerObj.hide();
        } else {
          markerObj.show();
          
          const markerContent = markerObj.getContent();
          
          if (zoom < this.markerZoomThreshold) {
            // 缩放级别小时，只显示图标，隐藏标签
            if (markerContent) {
              const labelEl = markerContent.querySelector('.marker-label');
              if (labelEl) labelEl.style.display = 'none';
              
              const iconEl = markerContent.querySelector('.marker-icon');
              if (iconEl) {
                iconEl.style.transform = 'scale(0.7)';
                iconEl.style.opacity = '0.7';
              }
            }
          } else {
            // 缩放级别大时，显示图标和标签
            if (markerContent) {
              const labelEl = markerContent.querySelector('.marker-label');
              if (labelEl) labelEl.style.display = 'block';
              
              const iconEl = markerContent.querySelector('.marker-icon');
              if (iconEl) {
                iconEl.style.transform = 'scale(1)';
                iconEl.style.opacity = '1';
              }
            }
          }
        }
      });
    },
    
    showMarkerInfo(marker) {
      if (!this.map || !this.AMap) return;
      
      // 使用参数
      console.log('显示标记信息:', marker.label);
      
      // 创建信息窗口内容
      const content = `
        <div class="info-window">
          <h3>${marker.label}</h3>
          <p>${marker.description || '暂无描述'}</p>
          ${marker.data ? `
            <div class="info-data">
              ${Object.entries(marker.data).map(([key, value]) => 
                `<div class="info-data-item">
                  <span class="info-data-label">${key}:</span>
                  <span class="info-data-value">${value}</span>
                </div>`
              ).join('')}
            </div>
          ` : ''}
          <div class="info-buttons">
            <button onclick="alert('查看详情功能尚未实现')">查看详情</button>
          </div>
        </div>
      `;
      
      // 创建信息窗口
      const infoWindow = new this.AMap.InfoWindow({
        content: content,
        offset: new this.AMap.Pixel(0, -30),
        closeWhenClickMap: true
      });
      
      // 打开信息窗口
      infoWindow.open(this.map, marker.position || this.currentFarm.center);
    },
    
    // 添加图层激活提示
    showLayerActivatedMessage(layer) {
      const layerNames = {
        'soil': '土壤监测',
        'water': '水质监测',
        'weather': '气象数据',
        'device': '设备状态',
        'crop': '作物生长'
      };
      
      if (this.map && this.AMap) {
        const message = `已激活${layerNames[layer] || ''}图层`;
        
        // 使用高德地图的信息提示窗口
        this.AMap.plugin('AMap.ToolBar', () => {
          this.map.plugin(new this.AMap.ToolBar());
        });
        
        // 显示提示信息
        this.map.plugin('AMap.ToolBar', () => {
          const toolBar = new this.AMap.ToolBar();
          this.map.addControl(toolBar);
          toolBar.showTip(message);
        });
      }
    },
    
    // 添加热力图方法
    addHeatmap(type = 'soil') {
      if (!this.map || !this.AMap || !this.currentFarm) return;
      
      // 切换农场前，彻底销毁旧热力图
      if (this.heatmap) {
        this.heatmap.setMap(null);
        this.heatmap = null;
      }
      
      // 如果没有热力图数据，则返回
      if (!this.currentFarm.heatmapData || this.currentFarm.heatmapData.length === 0) {
        console.warn('当前农场没有热力图数据');
        return;
      }
      
      // 根据类型设置热力图颜色
      let gradient;
      if (type === 'soil') {
        gradient = {
          0.4: 'rgb(0, 255, 255)',
          0.65: 'rgb(0, 110, 255)',
          0.85: 'rgb(100, 0, 255)',
          1.0: 'rgb(200, 0, 255)'
        };
      } else if (type === 'water') {
        gradient = {
          0.4: 'rgb(0, 255, 255)',
          0.6: 'rgb(0, 110, 255)',
          0.8: 'rgb(0, 0, 255)',
          1.0: 'rgb(0, 0, 255)'
        };
      } else {
        gradient = {
          0.4: 'rgb(0, 255, 0)',
          0.6: 'rgb(255, 255, 0)',
          0.8: 'rgb(255, 0, 0)',
          1.0: 'rgb(255, 0, 255)'
        };
      }
      
      // radius 建议用较小值，且随 zoom 变化
      const zoom = this.map.getZoom();
      let radius = 15;
      if (zoom <= 12) radius = 10;
      else if (zoom >= 17) radius = 25;
      else radius = 10 + (zoom - 12) * 3; // 12~17级线性变化
      
      // 创建热力图实例
      this.heatmap = new this.AMap.HeatMap(this.map, {
        radius: radius,
        opacity: [0, 0.8],
        gradient: gradient,
        zooms: [12, 20]
      });
      
      // 设置热力图数据
      this.heatmap.setDataSet({
        data: this.currentFarm.heatmapData,
        max: 100
      });
      
      // 解绑之前的 zoomchange 事件，避免重复绑定
      if (this._heatmapZoomHandler) {
        this.map.off('zoomchange', this._heatmapZoomHandler);
      }
      // 绑定 zoomchange 事件
      this._heatmapZoomHandler = () => {
        this.updateHeatmapVisibility();
        this.updateHeatmapRadius();
      };
      this.map.on('zoomchange', this._heatmapZoomHandler);
      
      // 初始化时根据当前缩放级别显示/隐藏热力图
      this.updateHeatmapVisibility();
      this.updateHeatmapRadius();
    },
    
    updateHeatmapVisibility() {
      if (!this.heatmap || !this.map) return;
      const zoom = this.map.getZoom();
      if (zoom < 12) {
        this.heatmap.hide();
      } else {
        this.heatmap.show();
      }
    },
    
    updateHeatmapRadius() {
      // 动态调整热力图radius，防止缩小时"山峰"变大
      if (!this.heatmap || !this.map) return;
      const zoom = this.map.getZoom();
      let radius = 15;
      if (zoom <= 12) radius = 10;
      else if (zoom >= 17) radius = 25;
      else radius = 10 + (zoom - 12) * 3;
      this.heatmap.setOptions({ radius });
    },
    
    showDeviceInfo(device) {
      // 创建信息窗口
      if (this.map && this.AMap) {
        // 计算设备在地图上的位置
        const bounds = this.map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        const lngSpan = ne.lng - sw.lng;
        const latSpan = ne.lat - sw.lat;
        
        const lng = sw.lng + lngSpan * (device.x / 100);
        const lat = ne.lat - latSpan * (device.y / 100);
        
        // 创建信息窗口内容
        const content = `
          <div class="info-window">
            <h3>${device.name}</h3>
            <p>类型: ${this.getDeviceTypeName(device.type)}</p>
            <p>状态: ${this.getStatusText(device.status)}</p>
            <p>位置: ${lng.toFixed(6)}, ${lat.toFixed(6)}</p>
            <div class="info-buttons">
              <button onclick="alert('设备控制功能尚未实现')">控制</button>
              <button onclick="alert('查看历史数据功能尚未实现')">历史数据</button>
            </div>
          </div>
        `;
        
        const infoWindow = new this.AMap.InfoWindow({
          content: content,
          offset: new this.AMap.Pixel(0, -10)
        });
        
        infoWindow.open(this.map, [lng, lat]);
      }
    },
    
    getDeviceTypeName(type) {
      const typeMap = {
        'sensor': '传感器',
        'irrigation': '灌溉系统',
        'camera': '监控摄像头',
        'weather': '气象站',
        'pump': '水泵'
      };
      return typeMap[type] || '未知设备';
    },
    
    getStatusText(status) {
      const statusMap = {
        'normal': '正常',
        'warning': '警告',
        'error': '异常'
      };
      return statusMap[status] || '未知状态';
    },
    
    adjustDevicePositions(farmId) {
      // 根据不同农场调整设备位置
      // 这里只是示例，实际应用中可能需要从后端获取每个农场的设备布局
      const basePositions = [
        { x: 30, y: 40 },
        { x: 45, y: 55 },
        { x: 60, y: 35 },
        { x: 25, y: 25 },
        { x: 70, y: 60 }
      ];
      
      // 为不同农场稍微调整位置
      this.devices.forEach((device, index) => {
        const basePos = basePositions[index];
        // 根据农场ID做一些偏移
        const offsetX = ((farmId * 7) % 20) - 10;
        const offsetY = ((farmId * 5) % 15) - 7;
        
        device.x = Math.max(5, Math.min(95, basePos.x + offsetX));
        device.y = Math.max(5, Math.min(95, basePos.y + offsetY));
      });
    },
    
    // 时间轴相关方法
    setTimelinePosition(event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = ((event.clientX - rect.left) / rect.width) * 100;
      this.timelinePosition = Math.max(0, Math.min(100, position));
      this.updateTimelineDate();
    },
    
    playTimeline() {
      this.isTimelinePlaying = true;
      this.timelineInterval = setInterval(() => {
        this.timelinePosition += 0.5;
        if (this.timelinePosition >= 100) {
          this.timelinePosition = 100;
          this.pauseTimeline();
        }
        this.updateTimelineDate();
      }, 200);
    },
    
    pauseTimeline() {
      this.isTimelinePlaying = false;
      if (this.timelineInterval) {
        clearInterval(this.timelineInterval);
      }
    },
    
    resetTimeline() {
      this.timelinePosition = 0;
      this.updateTimelineDate();
      this.pauseTimeline();
    },
    

    startDataSimulation() {
      // 模拟实时数据变化
      this.dataSimulationInterval = setInterval(() => {
        // 随机波动数据
        this.soilMoisture = Math.max(10, Math.min(90, this.soilMoisture + (Math.random() * 6 - 3)));
        this.soilTemperature = Math.max(15, Math.min(30, this.soilTemperature + (Math.random() * 2 - 1)));
        this.airTemperature = Math.max(15, Math.min(35, this.airTemperature + (Math.random() * 2 - 1)));
        this.airHumidity = Math.max(30, Math.min(90, this.airHumidity + (Math.random() * 6 - 3)));
        this.lightIntensity = Math.max(5000, Math.min(20000, this.lightIntensity + (Math.random() * 2000 - 1000)));
        
        // 随机更新设备状态
        if (Math.random() < 0.05) {
          const randomDevice = this.devices[Math.floor(Math.random() * this.devices.length)];
          const statuses = ['normal', 'warning', 'error'];
          randomDevice.status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // 更新总体设备状态
          if (this.devices.some(d => d.status === 'error')) {
            this.deviceStatus = '异常';
          } else if (this.devices.some(d => d.status === 'warning')) {
            this.deviceStatus = '警告';
          } else {
            this.deviceStatus = '正常';
          }
        }
        
        // 随机更新灌溉状态
        if (Math.random() < 0.1) {
          this.irrigationStatus = this.irrigationStatus === '开启' ? '关闭' : '开启';
        }
        
        // 更新时间
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        if (minutes === 0 && seconds < 10) {
          this.lastUpdate = '刚刚';
        } else if (minutes < 1) {
          this.lastUpdate = `${seconds}秒前`;
        } else if (minutes < 60) {
          this.lastUpdate = `${minutes}分钟前`;
        }
      }, 3000);
    }
  }
}
</script>
