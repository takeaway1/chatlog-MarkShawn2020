# Chatlog 前端开发指南

## 同时运行后端和前端开发环境

### 方式一：使用 API 代理（推荐）

这种方式使用 Next.js 的 rewrites 功能将 API 请求代理到 Go 后端。

#### 步骤：

1. **启动 Go 后端**（终端 1）：
   ```bash
   # 在项目根目录
   ./bin/chatlog server
   # 或者使用 chatlog 命令行工具
   chatlog server
   ```

   后端将运行在 `http://localhost:5030`

2. **启动 Next.js 前端**（终端 2）：
   ```bash
   cd web
   pnpm dev:chatlog
   ```

   前端将运行在 `http://localhost:3000`

3. **访问**：
   ```
   http://localhost:3000/zh/chatlog
   ```

**优点**：
- ✅ 无需 CORS 配置
- ✅ API 请求自动代理到后端
- ✅ 支持热重载
- ✅ 完整的开发工具支持

### 方式二：直接访问后端 API

如果你想让前端直接访问后端 API（而不通过代理）：

1. **创建 `.env.local`**：
   ```bash
   cd web
   cp .env.local.example .env.local
   ```

2. **编辑 `.env.local`**：
   ```bash
   NEXT_PUBLIC_CHATLOG_API_URL=http://localhost:5030
   ```

3. **在 Go 后端添加 CORS 支持**：

   编辑 `internal/chatlog/http/service.go`，添加 CORS 中间件：

   ```go
   import "github.com/gin-contrib/cors"

   func (s *Service) initRouter() {
       router := s.GetRouter()

       // 开发环境允许 CORS
       router.Use(cors.New(cors.Config{
           AllowOrigins:     []string{"http://localhost:3000"},
           AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
           AllowHeaders:     []string{"Origin", "Content-Type"},
           AllowCredentials: true,
       }))

       // ... 其余路由配置
   }
   ```

4. **启动服务**：
   ```bash
   # 终端 1: Go 后端
   ./bin/chatlog server

   # 终端 2: Next.js 前端
   cd web
   pnpm dev:chatlog
   ```

## 开发工作流

### 典型的开发流程

1. **初始设置**：
   ```bash
   # 构建 Go 后端
   make build

   # 安装前端依赖
   cd web
   pnpm install
   ```

2. **日常开发**：
   ```bash
   # 终端 1: 启动后端（只需要运行一次，除非修改了 Go 代码）
   ./bin/chatlog server

   # 终端 2: 启动前端（支持热重载）
   cd web
   pnpm dev:chatlog
   ```

3. **修改代码**：
   - **前端代码**（`web/src/**`）：自动热重载，保存即生效
   - **Go 后端代码**：需要重新编译 `make build` 并重启服务

### 调试技巧

#### 查看 API 请求

在浏览器开发者工具（F12）中：
- **Network** 选项卡：查看所有 API 请求和响应
- **Console** 选项卡：查看错误日志

#### 常见问题

1. **API 请求失败（404）**：
   - 检查 Go 后端是否在运行：`curl http://localhost:5030/api/v1/session`
   - 检查前端代理配置是否正确

2. **CORS 错误**：
   - 使用方式一（API 代理）可以避免 CORS 问题
   - 或者在 Go 后端添加 CORS 中间件

3. **前端无法启动**：
   - 确保安装了依赖：`pnpm install`
   - 检查 Node.js 版本：`node -v`（需要 >= 20）

## 开发配置文件

### Next.js 配置文件说明

- **`next.config.ts`**：默认配置（用于生产构建）
- **`next.config.dev.ts`**：开发配置（包含 API 代理）
- **`next.config.static.ts`**：静态导出配置（用于 Go 集成）

### 环境变量

- **`.env`**：基础配置（已提交到 Git）
- **`.env.local`**：本地开发配置（不提交到 Git）
- **`.env.production`**：生产环境配置

## 快速命令参考

```bash
# 开发模式（带 API 代理）
pnpm dev:chatlog

# 标准开发模式（包含 Spotlight）
pnpm dev

# 构建静态文件并复制到 Go 后端
pnpm build:chatlog

# 类型检查
pnpm check:types

# 代码检查
pnpm lint

# 修复代码风格
pnpm lint:fix

# 运行测试
pnpm test

# 清理构建产物
pnpm clean
```

## 目录结构

```
web/
├── src/
│   ├── app/[locale]/(marketing)/chatlog/  # Chatlog 页面
│   ├── components/chatlog/                 # Chatlog 组件
│   │   ├── ChatlogDashboard.tsx           # 主面板
│   │   ├── SessionList.tsx                # 会话列表
│   │   ├── ChatRoomList.tsx               # 群聊列表
│   │   ├── ContactList.tsx                # 联系人列表
│   │   └── ChatlogViewer.tsx              # 聊天记录查看器
│   ├── libs/ChatlogAPI.ts                 # API 客户端
│   └── providers/ReactQueryProvider.tsx   # React Query 配置
├── next.config.dev.ts                      # 开发配置
├── next.config.static.ts                   # 静态导出配置
└── scripts/copy-to-go.js                   # 构建脚本
```

## 生产部署

当你完成开发并准备部署时：

```bash
# 1. 构建静态前端并复制到 Go 后端
cd web
pnpm build:chatlog

# 2. 构建 Go 后端（会包含静态文件）
cd ..
make build

# 3. 运行
./bin/chatlog server
```

访问 `http://localhost:5030` 即可看到完整的应用。
