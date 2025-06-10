# Digital Farm

一个现代化的数字农场管理系统，帮助农民实现农业生产的数字化管理。

## 功能特性

- 🌱 作物生长监控
- 📊 数据可视化分析
- 🌤️ 天气信息集成
- 📱 移动端适配
- 🔐 用户认证与授权

## 技术栈

- Vue.js 3
- Vue Router
- Vuex/Pinia
- Element Plus
- Axios
- ECharts


## 项目结构

```
digital_farm/
├── public/          # 静态资源
├── src/             # 源代码
│   ├── assets/      # 资源文件
│   ├── components/  # 组件
│   ├── views/       # 页面
│   ├── router/      # 路由配置
│   ├── store/       # 状态管理
│   ├── utils/       # 工具函数
│   └── App.vue      # 根组件
├── .eslintrc.js    # ESLint 配置
└── package.json     # 项目依赖
```

## 开发指南

1. 克隆项目
```bash
git clone [项目地址]
cd digital_farm
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run serve
```

4. 访问 `http://localhost:8080`


5. 生产环境构建
```
npm run build
```
6. 代码检查与修复
```
npm run lint
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

[MIT License](LICENSE)
