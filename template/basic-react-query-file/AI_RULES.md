# AI 开发规则文档

## 📋 项目概述

本项目是一个展示 **TanStack Router** 和 **React Query** 结合使用的现代 React 应用示例。项目采用 TypeScript、Tailwind CSS、Shadcn/ui 等现代技术栈，展示了类型安全的路由管理、数据获取和状态管理的最佳实践。

## 🎯 核心技术栈

- **前端框架**: React 19.0.0
- **路由管理**: TanStack Router 1.132.27
- **数据获取**: TanStack React Query 5.66.0
- **类型系统**: TypeScript 5.7.2
- **样式框架**: Tailwind CSS 3.4.17
- **UI 组件**: Shadcn/ui (基于 Radix UI)
- **构建工具**: Vite 7.1.7
- **包管理**: 支持 npm/yarn/pnpm

## 🏗️ 项目架构规则

### 文件结构规范

```
src/
├── components/          # UI组件库 (仅限 Shadcn/ui 组件)
│   └── ui/             # 基础UI组件，不允许修改现有组件
├── hooks/              # 自定义React钩子
├── lib/                # 工具函数和配置
├── routes/             # 路由文件 (文件系统路由)
│   ├── __root.tsx      # 根路由布局
│   ├── *.tsx           # 页面路由组件
│   └── _pathlessLayout/ # 嵌套布局示例
├── *.tsx               # 数据获取和业务逻辑
├── main.tsx            # 应用入口点
└── styles.css          # 全局样式
```

### 命名约定

1. **文件命名**:
   - 路由文件: `kebab-case.tsx` (如 `posts.$postId.tsx`)
   - 组件文件: `PascalCase.tsx` 
   - 工具文件: `camelCase.ts`
   - 样式文件: `kebab-case.css`

2. **变量命名**:
   - 组件: `PascalCase`
   - 函数/变量: `camelCase`
   - 常量: `UPPER_SNAKE_CASE`
   - 类型/接口: `PascalCase`

## 🛠️ 开发规则

### 1. 路由开发规则

#### 文件系统路由
- 所有路由文件必须放在 `src/routes/` 目录下
- 使用 [`createFileRoute()`](src/routes/index.tsx:8) 创建路由
- 动态路由使用 `$` 前缀 (如 `$postId`)
- 布局路由使用 `_` 前缀 (如 `_pathlessLayout`)

#### 路由组件结构
```typescript
// 标准路由组件模板
export const Route = createFileRoute('/path')({
  // 数据预加载
  loader: ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData(queryOptions)
  },
  // 组件渲染
  component: ComponentName,
  // 错误处理
  errorComponent: ErrorComponent,
  // 加载状态
  pendingComponent: LoadingComponent,
})
```

#### 路由最佳实践
- 必须使用 TypeScript 进行类型安全
- 利用 `loader` 进行数据预加载
- 实现适当的错误边界和加载状态
- 使用 [`defaultPreload: 'intent'`](src/main.tsx:124) 进行智能预加载

### 2. 数据获取规则

#### React Query 配置
- 使用 [`queryOptions()`](src/postsQueryOptions.tsx:5) 定义查询配置
- 查询键必须使用数组格式: `['resource', ...params]`
- 在路由 loader 中使用 [`queryClient.ensureQueryData()`](src/routes/posts.$postId.tsx:8)

#### 数据获取模式
```typescript
// 查询选项定义
export const resourceQueryOptions = (id?: string) => queryOptions({
  queryKey: ['resource', id].filter(Boolean),
  queryFn: () => fetchResource(id),
  staleTime: 1000 * 60 * 5, // 5分钟
})

// 路由中使用
loader: ({ context: { queryClient }, params }) =>
  queryClient.ensureQueryData(resourceQueryOptions(params.id))
```

#### 数据获取最佳实践
- 所有 API 调用必须通过 React Query
- 使用适当的缓存策略 (`staleTime`, `cacheTime`)
- 实现错误处理和重试机制
- 利用 React Query Devtools 进行调试

### 3. 组件开发规则

#### UI 组件规范
- 优先使用 Shadcn/ui 组件库
- 不允许直接修改 `src/components/ui/` 下的组件
- 需要自定义时，在 `src/components/` 下创建新组件
- 使用 [`cn()`](src/lib/utils.ts:6) 工具函数合并 className

#### 组件结构模板
```typescript
import { cn } from '@/lib/utils'

interface ComponentProps {
  className?: string
  // 其他属性
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn('default-styles', className)} {...props}>
      {/* 组件内容 */}
    </div>
  )
}
```

#### 组件最佳实践
- 使用 TypeScript 接口定义 props
- 支持 `className` 属性用于样式扩展
- 使用 `forwardRef` 处理 ref 传递
- 实现适当的可访问性 (a11y) 属性

### 4. 样式开发规则

#### Tailwind CSS 规范
- 优先使用 Tailwind CSS 类名
- 使用 [`tailwind-merge`](package.json:62) 处理类名冲突
- 响应式设计使用 Tailwind 断点
- 自定义样式放在 [`src/styles.css`](src/styles.css:1)

#### 样式最佳实践
- 使用语义化的 CSS 变量
- 支持深色模式 (通过 `next-themes`)
- 保持样式的一致性和可维护性
- 避免内联样式，优先使用 Tailwind 类

### 5. TypeScript 规则

#### 类型安全要求
- 启用严格模式 (`"strict": true`)
- 所有函数必须有明确的返回类型
- 使用接口定义复杂对象类型
- 避免使用 `any` 类型

#### 类型定义规范
```typescript
// 接口定义
interface User {
  id: number
  name: string
  email: string
}

// 联合类型
type Status = 'loading' | 'success' | 'error'

// 泛型使用
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}
```

## 🔧 开发工具配置

### 必需的开发工具
- **TanStack Router Devtools**: 路由状态调试
- **React Query Devtools**: 数据状态调试  
- **TypeScript**: 类型检查和智能提示
- **Vite**: 快速开发和构建

### 推荐的 VSCode 扩展
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer

## 📦 依赖管理规则

### 包管理器
- 支持 npm、yarn、pnpm
- 优先使用 pnpm (性能更好)
- 锁定文件必须提交到版本控制

### 依赖添加规则
- 生产依赖: 运行时必需的包
- 开发依赖: 仅开发时使用的包
- 避免添加不必要的依赖
- 定期更新依赖版本

## 🚀 构建和部署

### 开发环境
```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口 3000)
pnpm dev

# 类型检查
tsc --noEmit
```

### 生产构建
```bash
# 构建项目
pnpm build

# 预览构建结果
pnpm serve
```

### 构建要求
- 必须通过 TypeScript 类型检查
- 构建产物必须经过优化
- 支持代码分割和懒加载
- 生成 source map 用于调试

## 🧪 测试规则

### 测试策略
- 组件测试: 使用 React Testing Library
- 路由测试: 测试路由导航和数据加载
- API 测试: 模拟 API 响应
- E2E 测试: 关键用户流程

### 测试最佳实践
- 测试用户行为而非实现细节
- 使用语义化的查询方法
- 模拟外部依赖
- 保持测试的独立性

## 🔒 代码质量规则

### 代码审查检查点
- [ ] TypeScript 类型安全
- [ ] 组件可复用性
- [ ] 性能优化 (懒加载、缓存)
- [ ] 可访问性 (a11y)
- [ ] 错误处理
- [ ] 代码注释和文档

### 性能优化
- 使用 React.memo 优化重渲染
- 实现路由级别的代码分割
- 优化图片和静态资源
- 使用 React Query 缓存策略

## 📚 学习资源

### 官方文档
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)

### 最佳实践参考
- React 官方文档和最佳实践
- TypeScript 深度指南
- Web 可访问性指南 (WCAG)
- 现代前端性能优化

## 🤝 贡献指南

### 提交规范
- 使用语义化提交信息
- 提交前运行类型检查和构建
- 确保代码符合项目规范
- 添加必要的测试用例

### Pull Request 流程
1. Fork 项目并创建功能分支
2. 实现功能并添加测试
3. 确保所有检查通过
4. 提交 PR 并描述变更内容
5. 等待代码审查和合并

---

**注意**: 本规则文档会随着项目发展持续更新，请定期查看最新版本。