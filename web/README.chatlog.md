# Chatlog Web Frontend

基于 Next.js 的 Chatlog 前端界面，用于替代原有的简单 HTML 静态页面。

## 功能特性

- 🎨 现代化的 UI 界面（基于 shadcn/ui）
- 📱 响应式设计，支持移动端
- 🔍 四大功能模块：
  - 最近会话列表
  - 群聊列表（支持搜索）
  - 联系人列表（支持搜索）
  - 聊天记录查询（多条件筛选）
- ⚡ React Query 数据缓存
- 🌐 国际化支持（中文/英文）

## 开发

### 安装依赖

```bash
cd web
pnpm install
```

### 本地开发

```bash
pnpm dev
```

访问 http://localhost:3000/zh/chatlog 查看页面

**注意**: 本地开发时需要确保 Go 后端服务运行在 http://localhost:5030

### 构建生产版本

```bash
# 构建静态文件并复制到 Go 后端
pnpm build:chatlog
```

这个命令会：
1. 使用 `next.config.static.ts` 构建静态导出版本
2. 将构建产物从 `out/` 复制到 `../internal/chatlog/http/static/`
3. 创建 `index.htm` 作为默认首页

## 与 Go 后端集成

### 目录结构

```
chatlog/
├── web/                          # Next.js 前端
│   ├── src/
│   │   ├── app/[locale]/(marketing)/chatlog/  # Chatlog 页面
│   │   ├── components/chatlog/   # Chatlog 组件
│   │   └── libs/ChatlogAPI.ts    # API 客户端
│   ├── next.config.static.ts     # 静态导出配置
│   └── scripts/copy-to-go.js     # 复制脚本
└── internal/chatlog/http/
    ├── route.go                  # 路由配置（已更新）
    └── static/                   # 静态文件目录（自动生成）
```

### Go 后端路由配置

已更新 `internal/chatlog/http/route.go`：

- `/_next/*` - Next.js 静态资源
- `/zh/chatlog/` - 中文 Chatlog 页面
- `/en/chatlog/` - 英文 Chatlog 页面
- `/` - 重定向到 `/zh/chatlog/`
- `/api/v1/*` - API 端点（保持不变）

### 完整构建流程

1. 开发前端：
   ```bash
   cd web
   pnpm dev
   ```

2. 构建并集成到 Go：
   ```bash
   cd web
   pnpm build:chatlog
   ```

3. 构建 Go 后端：
   ```bash
   cd ..
   make build
   ```

4. 运行：
   ```bash
   ./bin/chatlog server
   ```

访问 http://localhost:5030 即可看到新的前端界面。

## API 客户端

`src/libs/ChatlogAPI.ts` 提供了完整的 API 封装：

```typescript
import { chatlogAPI } from '@/libs/ChatlogAPI';

// 查询聊天记录
const messages = await chatlogAPI.getChatlog({
  time: '2024-01-01~2024-01-31',
  talker: 'wxid_xxx',
  limit: 100,
});

// 查询联系人
const contacts = await chatlogAPI.getContacts({
  keyword: '张三',
});

// 查询群聊
const chatrooms = await chatlogAPI.getChatRooms();

// 查询会话
const sessions = await chatlogAPI.getSessions();
```

## 组件说明

### ChatlogDashboard
主容器组件，包含四个选项卡

### SessionList
显示最近会话列表

### ChatRoomList
显示群聊列表，支持关键词搜索

### ContactList
显示联系人列表，支持关键词搜索

### ChatlogViewer
聊天记录查看器，支持多条件查询：
- 时间范围
- 聊天对象
- 发送者
- 关键词
- 返回记录数

## 注意事项

1. **静态导出限制**：使用静态导出时，某些 Next.js 功能不可用（如 Server Actions、动态路由等）
2. **CORS**：本地开发时如果遇到 CORS 问题，需要在 Go 后端添加 CORS 中间件
3. **环境变量**：API 地址自动从 `window.location.origin` 获取，无需额外配置
4. **图片优化**：静态导出模式下图片优化被禁用（`unoptimized: true`）

## 未来改进

- [ ] 添加聊天记录实时更新
- [ ] 支持导出聊天记录（CSV/JSON）
- [ ] 添加多媒体消息预览
- [ ] 优化移动端体验
- [ ] 添加暗黑模式
