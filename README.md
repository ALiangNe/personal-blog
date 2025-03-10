# 个人博客 + AI 助手

基于本地 Deepseek 的个人博客系统，支持知识库管理和 AI 对话功能。

## 功能特点

- 🎨 现代化的个人博客界面
- 🤖 集成 Deepseek AI 对话功能
- 📚 支持知识库管理
- 📝 支持文件上传（TXT、PDF、DOCX）
- 💾 数据本地存储

## 部署说明

### 1. 环境要求

- 安装 [VS Code](https://code.visualstudio.com/)
- 安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 插件
- 安装 [Ollama](https://ollama.ai/)
- 下载 Deepseek 模型

### 2. 安装步骤

1. 克隆代码库：
   ```bash
   git clone https://github.com/ALiangNe/personal-blog.git
   cd personal-blog
   ```

2. 安装 Deepseek 模型：
   ```bash
   ollama pull deepseek-r1:8b
   ```

3. 启动 Ollama 服务：
   ```bash
   ollama serve
   ```

4. 使用 VS Code 打开项目文件夹，右键 `dao/index.html`，选择 "Open with Live Server"

### 3. 使用说明

- 访问 `http://localhost:5500/dao/` 即可使用完整功能
- AI 对话功能仅在本地环境可用
- 知识库数据保存在浏览器的 localStorage 中

### 4. 常见问题

1. AI 无法回答问题？
   - 确保 Ollama 服务正在运行
   - 确保已正确安装 Deepseek 模型
   - 检查浏览器控制台是否有错误信息

2. 页面无法访问？
   - 确保使用 Live Server 启动项目
   - 检查端口是否被占用

## 技术支持

如有问题，可以：
1. 在 GitHub 上提交 Issue
2. 询问班级同学
3. 查看 Ollama 和 Deepseek 官方文档
