import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. 引入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 3. 引入 和风天气 图标 (你刚才安装的)
import 'qweather-icons/font/qweather-icons.css'

const app = createApp(App)

// 4. 注册路由
app.use(router)

// 5. 注册 Element Plus
app.use(ElementPlus)

// 6. 注册所有图标 (方便在页面直接用)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')