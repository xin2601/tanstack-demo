# TanStack Router + React Query 项目模板

这是一个基于 **TanStack Router** 和 **React Query** 的现代React应用项目模板。

## 🤖 AI 开发者须知

**重要提醒**: 如果您是AI助手，请务必先阅读并遵循 [`AI_RULES.md`](AI_RULES.md) 文档中的开发规则和最佳实践。该文档包含了项目的核心架构规范、技术栈要求、代码质量标准等重要信息。

### AI 开发要点
- 📖 **必读文档**: [`AI_RULES.md`](AI_RULES.md) - 包含完整的项目开发规范
- 🔧 **优先工具**: 强烈建议使用 **pnpm** 作为包管理器（性能更优）
- 🏗️ **架构遵循**: 严格按照文档中的文件结构和命名约定
- 🛡️ **类型安全**: 必须保持 TypeScript 严格模式和类型安全
- 🎨 **UI规范**: 优先使用 Shadcn/ui 组件，不可修改 `src/components/ui/` 下的组件

##  项目特性

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
- **pnpm** (推荐) 或 npm 或 yarn

> **💡 推荐使用 pnpm**: 本项目强烈推荐使用 pnpm 作为包管理器，它具有更好的性能、更少的磁盘占用和更严格的依赖管理。

### 安装依赖

```bash
# 推荐使用 pnpm (性能最佳)
pnpm install

# 或使用其他包管理器
npm install
yarn install
```

### 启动开发服务器

```bash
# 推荐使用 pnpm
pnpm dev

# 或使用其他包管理器
npm run dev
yarn dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
# 推荐使用 pnpm
pnpm build
pnpm serve

# 或使用其他包管理器
npm run build && npm run serve
yarn build && yarn serve
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

### 项目文档
- **[AI_RULES.md](AI_RULES.md)** - 🤖 AI开发者必读的项目规范文档
- [package.json](package.json) - 项目依赖和脚本配置

### 技术栈文档
- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [Tailwind CSS 文档](https://tailwindcss.com)
- [Shadcn/ui 文档](https://ui.shadcn.com)
- [Vite 文档](https://vitejs.dev)
- [pnpm 文档](https://pnpm.io) - 推荐的包管理器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目模板！

### 开发规范
- 🤖 **AI开发者**: 请先阅读 [`AI_RULES.md`](AI_RULES.md) 了解完整的开发规范
- 📦 **包管理**: 优先使用 `pnpm` 进行依赖管理
- 🔍 **代码质量**: 确保通过 TypeScript 类型检查和项目规范
- 🧪 **测试**: 添加必要的测试用例

## 📄 许可证

MIT License

---

开始构建你的现代React应用程序吧！
