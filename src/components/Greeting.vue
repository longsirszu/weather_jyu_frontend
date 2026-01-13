<template>
  <!-- 页面显示区域 -->
  <div class="greeting-container">
    <h1>后端返回的问候语：</h1>
    <!-- 显示接口返回的内容，加载中显示提示 -->
    <p class="greeting-text">{{ greeting || "加载中..." }}</p>
    <!-- 错误提示 -->
    <p v-if="error" class="error-text">❌ {{ error }}</p>
  </div>
</template>

<script setup>
// Vue3组合式API，引入ref用于响应式数据
import { ref, onMounted } from 'vue';
// 引入axios用于发送HTTP请求
import axios from 'axios';

// 定义响应式数据：存储后端返回的问候语
const greeting = ref('');
// 定义响应式数据：存储请求错误信息
const error = ref('');

/**
 * 调用后端Greeting接口的方法
 */
const fetchGreeting = async () => {
  try {
    // 发送GET请求到后端接口
    const response = await axios.get('http://localhost:8080/api/greeting');
    // 将返回的字符串赋值给响应式变量
    greeting.value = response.data;
    // 清空错误信息
    error.value = '';
  } catch (err) {
    // 请求失败时记录错误信息
    error.value = '调用后端接口失败：' + (err.message || '未知错误');
    // 清空问候语
    greeting.value = '';
  }
};

// 组件挂载后立即调用接口（页面加载就请求数据）
onMounted(() => {
  fetchGreeting();
});
</script>

<style scoped>
/* 简单样式美化 */
.greeting-container {
  width: 80%;
  margin: 50px auto;
  text-align: center;
}

.greeting-text {
  font-size: 24px;
  color: #2c3e50;
  margin-top: 20px;
}

.error-text {
  color: #e74c3c;
  font-size: 18px;
  margin-top: 20px;
}
</style>