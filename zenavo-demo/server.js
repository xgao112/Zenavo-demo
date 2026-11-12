// 零依赖 Node.js 服务器：不需要 npm install，构建最简单
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000; // 部署平台一般通过 PORT 环境变量指定端口
const HOST = "0.0.0.0";                // 必须监听 0.0.0.0，否则容器外访问不到
const PUBLIC_DIR = path.join(__dirname, "public");
const VERSION = require("./package.json").version;
const startedAt = Date.now();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${new Date().toISOString()} ${req.method} ${url.pathname}`); // 访问日志

  // 健康检查接口：给部署平台做监控用
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": MIME[".json"] });
    return res.end(JSON.stringify({
      status: "ok",
      version: VERSION,
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      time: new Date().toISOString(),
    }));
  }

  // 静态文件
  let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
  filePath = path.normalize(path.join(PUBLIC_DIR, filePath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": MIME[".html"] });
      return res.end('<h1>404</h1><p>页面不存在。<a href="/">返回首页</a></p>');
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`服务已启动：http://localhost:${PORT}  (版本 ${VERSION})`);
});

// 平台重启/更新版本时优雅退出
process.on("SIGTERM", () => {
  console.log("收到 SIGTERM，正在关闭…");
  server.close(() => process.exit(0));
});
