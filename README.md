# AI-Cloud 云盘知识库系统

## 项目简介
基于 React + TypeScript 开发的云盘知识库管理系统，提供文件管理及知识库的创建、管理、检索和对话等功能。

## 技术栈
- 前端框架: React 18
- 开发语言: TypeScript 5
- UI组件库: Ant Design 5
- 样式方案: Tailwind CSS 3
- 构建工具: Vite 5
- 状态管理: Redux Toolkit 2
- 路由管理: React Router 6
- HTTP客户端: Axios
- Markdown渲染: React Markdown

## 主要功能
### ☁️ 在线云盘
- 文件上传/下载/删除/管理
- 从云盘导入文件到知识库

![云盘界面](https://smkl-pics.oss-cn-hangzhou.aliyuncs.com/AI-Cloud/CloudDrive.png)

### 📚 知识库管理
- 知识库的创建/更新/删除
- 文档批量导入和管理
- 支持多种文档格式

![知识库界面](https://smkl-pics.oss-cn-hangzhou.aliyuncs.com/AI-Cloud/KBList.png)
![知识库详情](https://smkl-pics.oss-cn-hangzhou.aliyuncs.com/AI-Cloud/LittlePrinceKB.png)

### 🔍 知识检索
- 基于向量的相似度检索
- 支持自定义检索参数(top-k)
- 实时召回测试
- 结果相关性展示

![知识检索](https://smkl-pics.oss-cn-hangzhou.aliyuncs.com/AI-Cloud/LittlePrinceRetrieve.png)

### 💬 智能对话
- 基于知识库的问答
- 流式响应输出
- Markdown格式渲染
- 上下文记忆功能

![知识库对话](https://smkl-pics.oss-cn-hangzhou.aliyuncs.com/AI-Cloud/LittlePrinceChat.png)

## 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### Docker部署
```bash
docker build -t ai-cloud .
docker run -d -p 8081:80 ai-cloud
```

## 项目结构
```
src/
├── assets/       # 静态资源
├── components/   # 公共组件
├── hooks/        # 自定义Hooks
├── layouts/      # 布局组件
├── pages/        # 页面组件
├── services/     # API服务
├── store/        # Redux状态管理
├── types/        # TypeScript类型定义
└── utils/        # 工具函数
```