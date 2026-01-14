<template>
  <div class="weather-app">
    <!-- 背景图层：更蓝、更透亮 -->
    <div class="background-layer"></div>

    <div class="content-container">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="location-info">
          <el-icon class="loc-icon"><LocationInformation /></el-icon>
          <span class="city-name">{{ currentCity }}</span>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入城市名"
            class="glass-input"
            @keyup.enter="onSearchInput"
            :disabled="isLoading"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </header>

      <!-- 主要内容区 -->
      <main class="main-content" v-loading="isLoading" element-loading-text="更新天气中..." element-loading-background="rgba(0, 0, 0, 0.1)">
        
        <!-- 左侧：天气主卡片 -->
        <div class="weather-card glass-card">
          <div v-if="weatherData.temp" class="card-content">
            
            <!-- 温度显示区域 + 3D贴纸 -->
            <div class="temp-section">
              <span class="temp-val">{{ weatherData.temp }}</span>
              <span class="temp-unit">°C</span>
              
              <!-- 🌟 核心修改：动态3D天气贴纸 -->
              <img :src="weatherSticker" class="weather-sticker" alt="sticker" />
            </div>

            <div class="weather-state">
              <span class="state-text">{{ weatherData.text }}</span>
              <!-- 和风天气图标字体 -->
              <i :class="`qi-${weatherData.icon}`" class="weather-icon-lg"></i>
            </div>
            <div class="meta-info">
              <p>体感温度 {{ weatherData.feelsLike }}°C</p>
              <p>{{ currentDate }}</p>
            </div>
          </div>
          <!-- 默认占位 -->
          <div v-else class="empty-state">
            数据加载中...
          </div>
        </div>

        <!-- 右侧：天气详情卡 -->
        <div class="detail-card glass-card">
          <div class="detail-title">天气详情</div>
          <div class="detail-grid">
            <div class="detail-item">
              <el-icon><Odometer /></el-icon>
              <span class="label">湿度</span>
              <span class="value">{{ weatherData.humidity || '--' }}%</span>
            </div>
            <div class="detail-item">
              <el-icon><Cloudy /></el-icon>
              <span class="label">云量</span>
              <span class="value">{{ weatherData.cloud || '--' }}%</span>
            </div>
            <div class="detail-item">
              <el-icon><Flag /></el-icon>
              <span class="label">风向</span>
              <span class="value">{{ weatherData.windDir || '--' }}</span>
            </div>
            <div class="detail-item">
              <el-icon><View /></el-icon>
              <span class="label">能见度</span>
              <span class="value">{{ weatherData.vis || '--' }}km</span>
            </div>
          </div>
        </div>

      </main>
      
      <!-- 底部：ECharts 折线图 -->
      <div class="chart-container glass-card" style="margin-top: 20px; padding: 20px; box-sizing: border-box;">
         <div style="color: #fff; font-size: 14px; margin-bottom: 5px; opacity: 0.9;">未来 8 小时温度趋势</div>
         <div id="tempChart" style="width: 100%; height: 160px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, LocationInformation, Odometer, Cloudy, Flag, View } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// === 状态定义 ===
const searchKeyword = ref('')
const currentCity = ref('北京') 
const isLoading = ref(false)

const weatherData = reactive({
  temp: '',
  text: '',
  feelsLike: '',
  icon: '',
  humidity: '',
  cloud: '',
  windDir: '',
  vis: ''
})

const currentDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

// === 🌟 计算贴纸图片逻辑 ===
const weatherSticker = computed(() => {
  // 根据天气代码返回不同的 3D 图片 URL
  // 图片来源：免费的图标库 CDN
  const code = parseInt(weatherData.icon)
  
  if (code >= 100 && code <= 149) {
    // 晴天：显示太阳
    return 'https://cdn-icons-png.flaticon.com/512/869/869869.png'
  } else if ((code >= 300 && code <= 399) || (code >= 400 && code <= 499)) {
    // 雨天：显示雨云
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png'
  } else {
    // 多云/阴天/晚上/其他：显示云朵太阳组合
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png'
  }
})

// === 生命周期 ===
onMounted(() => {
  fetchWeather('北京')
})

// === ECharts ===
const initChart = (hourlyData) => {
  const chartDom = document.getElementById('tempChart')
  if (!chartDom) return

  let myChart = echarts.getInstanceByDom(chartDom)
  if (myChart) myChart.dispose()
  
  myChart = echarts.init(chartDom)

  const list = hourlyData.slice(0, 8)
  const xData = list.map(item => item.fxTime.substring(11, 16))
  const yData = list.map(item => item.temp)

  const option = {
    grid: { top: 30, bottom: 0, left: 0, right: 0, containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#fff', fontSize: 12 }
    },
    yAxis: { type: 'value', show: false, scale: true },
    series: [
      {
        data: yData,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#fff' },
        lineStyle: { width: 3, color: '#fff' },
        label: {
          show: true, position: 'top', formatter: '{c}°', color: '#fff', fontSize: 14
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 255, 255, 0.8)' },
            { offset: 1, color: 'rgba(255, 255, 255, 0)' }
          ])
        }
      }
    ]
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

const onSearchInput = () => {
  const city = searchKeyword.value.trim()
  if (!city) {
    ElMessage.warning('请输入城市名')
    return
  }
  fetchWeather(city)
}

const fetchWeather = async (cityName) => {
  isLoading.value = true
  try {
    const cityRes = await axios.get(`http://localhost:8080/city/search`, {
      params: { q: cityName }, timeout: 3000
    })

    if (cityRes.data.code !== 200 || !cityRes.data.data || cityRes.data.data.length === 0) {
      ElMessage.error('定位失败，未找到该城市')
      return
    }

    const targetCity = cityRes.data.data[0]
    const locationId = targetCity.locationId
    const cityNameZh = targetCity.locationNameZh

    const [weatherRes, hourlyRes] = await Promise.all([
      axios.get(`http://localhost:8080/weather/now`, { params: { location: locationId }, timeout: 3000 }),
      axios.get(`http://localhost:8080/weather/24h`, { params: { location: locationId }, timeout: 3000 })
    ])

    const wData = weatherRes.data
    const hData = hourlyRes.data

    if (wData.code === 200 && wData.data.code === '200') {
      const now = wData.data.now
      weatherData.temp = now.temp
      weatherData.text = now.text
      weatherData.feelsLike = now.feelsLike
      weatherData.icon = now.icon
      weatherData.humidity = now.humidity
      weatherData.cloud = now.cloud
      weatherData.windDir = now.windDir
      weatherData.vis = now.vis

      currentCity.value = cityNameZh
      searchKeyword.value = ''

      if (hData.code === 200 && hData.data.hourly) {
        nextTick(() => {
          initChart(hData.data.hourly)
        })
      }
    } else {
      const errCode = wData.data ? wData.data.code : 'unknown'
      handleApiError(errCode)
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('响应超时')
    } else {
      ElMessage.error('网络连接异常')
    }
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleApiError = (code) => {
  if (['401', '402', '403', '429', '500'].includes(code)) {
    ElMessage.error('此天气服务暂停使用')
  } else if (code === '400' || code === '204') {
    ElMessage.error('定位失败')
  } else {
    ElMessage.error(`未知错误: ${code}`)
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

.weather-app {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 🌟 修改背景：更蓝、更透亮 */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 高清蓝天图 */
  background-image: url('https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=2574&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  z-index: -1;
  /* 增加亮度和饱和度，让画面更通透 */
  filter: brightness(0.8) saturate(1.2) contrast(1.05);
}

.content-container {
  width: 900px;
  max-width: 95%;
  height: 650px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;

  .location-info {
    display: flex;
    align-items: center;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    
    .loc-icon { font-size: 24px; margin-right: 8px; }
    .city-name { font-size: 28px; font-weight: 500; letter-spacing: 1px; }
  }

  .search-box {
    width: 300px;
    :deep(.el-input__wrapper) {
      background-color: rgba(255, 255, 255, 0.25);
      box-shadow: none;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      &.is-focus { background-color: rgba(255, 255, 255, 0.35); }
    }
    :deep(.el-input__inner) {
      color: #fff;
      &::placeholder { color: rgba(255, 255, 255, 0.8); }
    }
    :deep(.el-icon) { color: #fff; }
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
  flex: 1; 
}

/* 玻璃拟态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  color: #fff;
  padding: 30px;
}

.weather-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden; /* 防止贴纸溢出 */

  .temp-section {
    display: flex;
    align-items: flex-start;
    line-height: 1;
    margin-bottom: 10px;
    text-shadow: 0 4px 8px rgba(0,0,0,0.1);
    position: relative; /* 关键：相对定位 */
    
    .temp-val {
      font-size: 96px;
      font-weight: 300;
      z-index: 2;
    }
    .temp-unit {
      font-size: 32px;
      margin-top: 15px;
      margin-left: 5px;
      z-index: 2;
    }

    /* 🌟 贴纸样式 */
    .weather-sticker {
      position: absolute;
      right: 20px; /* 放在温度右侧 */
      top: -20px;
      width: 100px;
      height: 100px;
      opacity: 0.9;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
      animation: float 3s ease-in-out infinite; /* 浮动动画 */
    }
  }

  .weather-state {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    z-index: 2;
    
    .state-text {
      font-size: 32px;
      margin-right: 20px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .weather-icon-lg {
      font-size: 64px;
      color: #fff;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
  }

  .meta-info {
    font-size: 16px;
    opacity: 0.95;
    z-index: 2;
    p { margin: 5px 0; }
  }
}

/* 浮动动画 */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

.detail-card {
  display: flex;
  flex-direction: column;

  .detail-title {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 20px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 25px;
    flex: 1;
    align-content: center;
  }

  .detail-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    .el-icon { font-size: 20px; opacity: 0.9; }
    .label { flex: 1; margin-left: 10px; opacity: 0.9; }
    .value { font-weight: 500; font-size: 18px; }
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 20px;
  opacity: 0.8;
}
</style>