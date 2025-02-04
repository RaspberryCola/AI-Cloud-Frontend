# Fish-Ant2 网盘系统

## 项目介绍
Fish-Ant2 是一个基于 React 和 TypeScript 开发的现代化网盘系统，提供文件存储、分享和管理功能。项目采用了最新的前端技术栈，具有美观的用户界面和流畅的用户体验。

## 技术栈
- React 18
- TypeScript
- Vite
- Ant Design 5.0
- Redux Toolkit
- React Router 6
- Tailwind CSS
- Axios

## 功能特性
- 用户认证（登录/注册）
- 文件上传和下载
- 文件管理（移动、重命名、删除等）
- 云端存储
- 知识库管理
- 响应式设计

## 开发环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

## 安装说明
1. 克隆项目
```bash
git clone [项目地址]
cd fish-ant2
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

## 构建部署
1. 构建生产版本
```bash
npm run build
# 或
yarn build
```

2. 预览构建结果
```bash
npm run preview
# 或
yarn preview
```

## Docker 部署
项目支持 Docker 部署，可以使用以下命令：

```bash
# 构建镜像
docker build -t fish-ant2 .

# 运行容器
docker run -p 80:80 fish-ant2
```

## 项目结构
```
fish-ant2/
├── src/                    # 源代码目录
│   ├── components/         # 组件
│   ├── pages/             # 页面
│   ├── layouts/           # 布局组件
│   ├── services/          # API 服务
│   ├── store/             # Redux store
│   ├── utils/             # 工具函数
│   └── types/             # TypeScript 类型定义
├── public/                # 静态资源
└── ...配置文件
```

## 开发规范
- 使用 ESLint 进行代码规范检查
- 使用 TypeScript 进行类型检查
- 遵循组件化开发原则
- 使用 Tailwind CSS 进行样式管理

## 贡献指南
欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证
[添加许可证信息] 