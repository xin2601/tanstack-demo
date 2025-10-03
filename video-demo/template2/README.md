# TanStack Router + React Query 示例项目

这是一个展示如何将 **TanStack Router** 和 **React Query** 结合使用的完整示例项目。项目演示了现代React应用中的路由管理、数据获取、状态管理和类型安全等最佳实践。

## 🚀 项目特性

- ⚡ **TanStack Router** - 类型安全的文件系统路由
- 🔄 **React Query** - 强大的数据获取和缓存
- 🎨 **Tailwind CSS** - 现代化的样式框架
- 🧩 **Shadcn/ui** - 高质量的UI组件库
- 📱 **响应式设计** - 适配各种设备
- 🛠️ **TypeScript** - 完整的类型安全
- 🔧 **Vite** - 快速的构建工具
- 🎯 **代码分割** - 自动路由级别的代码分割

## 📁 项目结构

```
src/
├── components/          # UI组件库 (Shadcn/ui)
│   └── ui/             # 基础UI组件
├── hooks/              # 自定义React钩子
├── lib/                # 工具函数
├── routes/             # 路由文件 (文件系统路由)
│   ├── __root.tsx      # 根路由布局
│   ├── index.tsx       # 首页
│   ├── posts.route.tsx # 文章路由布局
│   ├── posts.index.tsx # 文章列表页
│   ├── posts.$postId.tsx # 文章详情页
│   └── _pathlessLayout/ # 无路径嵌套布局示例
├── posts.tsx           # 文章数据获取逻辑
├── postsQueryOptions.tsx # React Query配置
├── main.tsx            # 应用入口
└── styles.css          # 全局样式
```

## 🎯 功能演示

### 1. 首页 (`/`)
- 简单的欢迎页面
- 展示基本的路由导航

### 2. 文章系统 (`/posts`)
- **文章列表** (`/posts`) - 展示从JSONPlaceholder API获取的文章列表
- **文章详情** (`/posts/$postId`) - 动态路由展示单篇文章详情
- **数据预加载** - 鼠标悬停时预加载数据
- **加载状态** - 优雅的加载和错误处理

### 3. 嵌套路由示例 (`/route-a`, `/route-b`)
- 展示无路径布局 (Pathless Layout) 的使用
- 嵌套路由的最佳实践

### 4. 404页面
- 自定义的404错误页面
- 友好的错误处理

## 🛠️ 技术栈详解

### TanStack Router 特性
- **类型安全路由** - 完整的TypeScript支持
- **文件系统路由** - 基于文件结构自动生成路由
- **数据预加载** - 智能的数据预加载策略
- **嵌套路由** - 支持复杂的路由嵌套
- **搜索参数** - 类型安全的URL搜索参数

### React Query 特性
- **智能缓存** - 自动缓存和同步数据
- **后台更新** - 数据在后台自动更新
- **加载状态** - 内置的加载和错误状态
- **开发者工具** - 强大的调试工具

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 使用 npm
npm run dev

# 使用 yarn  
yarn dev

# 使用 pnpm
pnpm dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run serve
```

## 📚 学习要点

### 1. 路由配置
```typescript
// src/main.tsx
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent', // 鼠标悬停时预加载
  defaultPreloadStaleTime: 0, // 确保数据新鲜度
})
```

### 2. 数据获取
```typescript
// src/postsQueryOptions.tsx
export const postsQueryOptions = queryOptions({
  queryKey: ['posts'],
  queryFn: () => fetchPosts(),
})
```

### 3. 路由组件
```typescript
// src/routes/posts.$postId.tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ context: { queryClient }, params: { postId } }) =>
    queryClient.ensureQueryData(postQueryOptions(postId)),
  component: PostComponent,
})
```

## 🔧 开发工具

项目集成了强大的开发工具：

- **TanStack Router Devtools** - 路由调试工具
- **React Query Devtools** - 数据状态调试工具
- **TypeScript** - 类型检查和智能提示
- **ESLint** - 代码质量检查

## 📖 相关文档

- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Shadcn/ui 文档](https://ui.shadcn.com)
- [Vite 文档](https://vitejs.dev)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个示例项目！

## 📄 许可证

MIT License

---

这个项目展示了如何构建现代、类型安全、高性能的React应用程序。通过学习这个示例，你将掌握TanStack生态系统的核心概念和最佳实践。
