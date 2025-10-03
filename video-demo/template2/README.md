# TanStack Router + React Query 项目模板

这是一个基于 **TanStack Router** 和 **React Query** 的现代React应用项目模板。

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
│   └── index.tsx       # 首页
├── stores/             # 状态管理 (Zustand)
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── main.tsx            # 应用入口
└── styles.css          # 全局样式
```

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

## 🛠️ 技术栈

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

## 🔧 开发工具

项目集成了强大的开发工具：

- **TanStack Router Devtools** - 路由调试工具
- **React Query Devtools** - 数据状态调试工具
- **TypeScript** - 类型检查和智能提示

## 📖 相关文档

- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Shadcn/ui 文档](https://ui.shadcn.com)
- [Vite 文档](https://vitejs.dev)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目模板！

## 📄 许可证

MIT License

---

开始构建你的现代React应用程序吧！
