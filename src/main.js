// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 保留Pinia（之前配置的）
import router from './router'; // 引入刚写的路由配置
import App from './App.vue';

// 创建Vue实例并注册插件
const app = createApp(App);
app.use(createPinia()); // 启用Pinia
app.use(router); // 启用路由（新增这行！）
app.mount('#app'); // 挂载到index.html的#app节点