// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
// 引入你刚写的Greeting组件（路径要和实际文件位置一致）
import Greeting from '../components/Greeting.vue';

// 定义路由规则
const routes = [
  {
    path: '/', // 根路径（访问localhost:5173直接跳转到问候语页面）
    name: 'Home',
    redirect: '/greeting' // 重定向到/greeting路径，方便测试
  },
  {
    path: '/greeting', // 访问路径：localhost:5173/greeting
    name: 'Greeting',
    component: Greeting // 关联Greeting组件
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 启用HTML5 History模式
  routes // 关联上面定义的路由规则
});

// 导出路由实例，供main.js使用
export default router;