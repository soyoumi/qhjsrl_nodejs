# 强缓戒色日历

## 功能介绍

### 核心功能

1. **日历视图**
   - 月视图：直观显示当月每一天的状态
   - 年视图：概览全年12个月的数据
   - 支持左右切换月份/年份

2. **状态标记**
   - 优秀（绿色）：完美坚持
   - 缓戒（灰色）：适度控制
   - 不良（红色）：需要改进
   - 点击日期可循环切换状态

3. **统计功能**
   - 月度统计：显示当月优秀/缓戒/不良天数及连续优秀天数
   - 年度统计：汇总全年数据

4. **数据管理**
   - 登录保护：需要输入登录码才能修改数据（默认：233888）
   - 数据导出：将所有记录导出为JSON文件
   - 数据导入：支持导入JSON数据，可选择合并或替换

### 技术特点

- **后端**：Node.js + Express
- **数据库**：SQLite3 (sqlite3)
- **前端**：原生 HTML/CSS/JavaScript
- **反向代理**：支持 Caddy 配置
- **进程管理**：支持 PM2 部署

---

# 部署说明

当前目录中的文件，是采用nodejs sqlite3存储数据方式，这是这个方案的版本。

如果你想使用单独html文件，也是可以的，在webhtml 目录中，这是html单文件版本，单html文件直接使用即可，存储是存到浏览器localStorage 中，是缓存，只要浏览器不清空缓存，数据就不会丢失，请注意导出json文件备份数据，避免数据丢失。

直接访问一个网址使用

https://chat.z.ai/space/r14na1kfebn1-art

这也是用的单html文件，缓存存储在浏览器localStorage中，不保证该网址一直有效，只要浏览器不清空缓存，数据就不会丢失，请注意导出json文件备份数据，避免数据丢失。

## 项目结构

```
qhjsrl_nodejs/
├── index.html      # 前端页面
├── server.js       # Express 服务器
├── db.js           # SQLite 数据库模块
├── package.json    # 项目依赖配置
├── Caddyfile       # Caddy 反向代理配置
└── 部署说明.md     # 本文件
```

## 环境要求

- Node.js 16+ 
- npm 或 yarn
- (可选) Caddy 2.x

## 本地开发部署

### 1. 安装依赖

```powershell
# 进入项目目录
cd d:\Desktop\qhjsrl_nodejs

# 安装依赖
npm install
```

### 2. 启动服务器

```powershell
npm start
```

服务器将在 `http://localhost:3006` 启动

### 3. 访问应用

打开浏览器访问：`http://localhost:3006`

## 使用 Caddy 反向代理部署

### 1. 安装 Caddy

下载并安装 Caddy：https://caddyserver.com/download

### 2. 配置 Caddyfile

项目已包含 `Caddyfile` 配置文件：

```caddy
qhjsrl.localhost {
    reverse_proxy localhost:3006
}
```

如需使用真实域名，修改 `Caddyfile`：

```caddy
your-domain.com {
    reverse_proxy localhost:3006
}
```

### 3. 启动 Caddy

```powershell
caddy run
```

### 4. 访问应用

- 本地测试：`http://qhjsrl.localhost`
- 生产环境：`https://your-domain.com` (Caddy 会自动申请 SSL 证书)

## 生产环境部署

### 使用 PM2 进程管理

```powershell
# 全局安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name qhjsrl

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs qhjsrl
```

### 数据备份

数据库文件为 `calendar.db`，定期备份该文件即可。

## 默认配置

- 端口：3006
- 登录码：233888
- 数据库文件：calendar.db (自动创建)

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/records | 获取所有记录 |
| POST | /api/records | 保存/删除单条记录 |
| GET | /api/auth | 检查登录状态 |
| POST | /api/auth/login | 登录 |
| POST | /api/auth/logout | 登出 |
| POST | /api/import | 导入数据 |

## 常见问题

### Q: 安装依赖时遇到 better-sqlite3 编译错误？

A: 本项目已改用 `sqlite3` 包，兼容性更好。如果仍有问题可尝试：

```bash
# 服务器上安装依赖
cd /var/www/qhjsrl
npm install

# 如果仍有问题，先清理缓存重试
rm -rf node_modules package-lock.json
npm install
```

### Q: Node.js 版本过新导致依赖不兼容？

A: 建议使用 Node.js LTS 版本（如 20.x 或 18.x）：

```bash
# 使用 nvm 安装 LTS 版本
nvm install --lts
nvm use --lts
```
