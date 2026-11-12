# Zenavo 部署测试

一个零依赖的 Node.js 小应用：首页两个按钮，分别跳转到"关于"页和"运行状态"页。

## 项目结构

```
zenavo-demo/
├── server.js          # 服务器（监听 PORT 环境变量，默认 3000）
├── package.json       # 启动命令：npm start
├── Dockerfile         # 平台若用 Docker 构建会用到
├── public/
│   ├── index.html     # 首页（两个按钮）
│   ├── about.html     # 按钮 1 跳转页
│   ├── status.html    # 按钮 2 跳转页，读取 /health
│   └── style.css
└── .vscode/launch.json  # VS Code 里按 F5 启动
```

## 第一阶段：本地开发

需要 Node.js 18 或更高版本（终端运行 `node -v` 检查）。

```bash
npm start          # 或在 VS Code 里按 F5
```

打开 http://localhost:3000 ，点两个按钮确认跳转正常；访问 http://localhost:3000/health 应返回 JSON。

## 第二阶段：上传 GitHub

先在 GitHub 网站新建一个空仓库（不要勾选初始化 README），然后：

```bash
git init
git add .
git commit -m "初始版本"
git branch -M main
git remote add origin https://github.com/你的用户名/zenavo-demo.git
git push -u origin main
```

## 第三阶段：Zenavo 自动部署

在 Zenavo 里连接 GitHub 仓库后，按平台要求填写（以 Zenavo 实际界面为准）：

| 设置项 | 填写 |
|---|---|
| 构建方式 | Node.js，或选 Dockerfile |
| 安装/构建命令 | 不需要（零依赖），留空或填 `npm install` |
| 启动命令 | `npm start` |
| 端口 | 3000（或由平台通过 `PORT` 环境变量注入） |
| 健康检查路径 | `/health` |

## 第四阶段：上线并运维

- **HTTPS 网址**：部署成功后由平台分配，打开即可看到首页。
- **日志**：每个请求都会打印一行访问日志，在平台日志面板查看。
- **监控**：平台健康检查指向 `/health`；也可以直接打开"运行状态"页。
- **更新版本**：修改代码，把 `package.json` 里的 `version` 改成 1.0.1，然后
  `git commit -am "更新" && git push`，平台自动重新部署。打开状态页确认版本号已变化。
- **备份**：代码本身已在 GitHub 上；这个应用没有数据库，无需额外备份数据。
