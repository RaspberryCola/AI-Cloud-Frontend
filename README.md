# AI-Cloud LLM应用开发平台

## 项目简介
基于 React + TypeScript 实现的大语言模型(LLM) 应用开发平台，提供文件管理、知识库的创建与管理，以及Agent对话等功能。

## 主要功能

### ☁️ 在线云盘
- 文件上传/下载/删除/管理
- 多种文件格式支持
- 从云盘导入文件到知识库

### 📚 知识库管理
- 知识库的创建/更新/删除
- 文档批量导入和管理
- 支持多种文档格式

### 🔍 知识检索
- 基于向量的相似度检索
- 支持自定义检索参数(top-k)
- 实时召回测试
- 结果相关性展示
- 检索结果高亮显示

### 💬 Agent
- 支持自定义模型
- 支持知识库选择
- 支持MCP SSE
- 多轮对话
- 会话管理

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

## 部署方式

### 使用脚本部署（推荐）
项目提供了简便的部署脚本：

```bash
./deploy.sh
```

### Docker部署
项目支持Docker容器化部署，使用以下命令构建镜像：

```bash
docker build -t ai-cloud-frontend .
```

运行容器：

```bash
docker run -d -p 80:80 ai-cloud-frontend
```

## 贡献指南
欢迎提交Pull Request或Issue来帮助改进项目！

## 许可证
本项目遵循MIT许可证