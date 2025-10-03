# AI 开发规则文档

## 📋 项目概述

本项目是一个展示 **TanStack Router** 和 **React Query** 结合使用的**企业级现代 React 应用**示例。项目采用 TypeScript、Tailwind CSS、Shadcn/ui、国际化、状态管理等现代技术栈，展示了类型安全的路由管理、数据获取、状态管理、多语言支持和用户体验优化的最佳实践。

## 🎯 核心技术栈

### 基础框架
- **前端框架**: React 19.0.0
- **路由管理**: TanStack Router 1.132.27
- **数据获取**: TanStack React Query 5.66.0
- **类型系统**: TypeScript 5.7.2
- **构建工具**: Vite 7.1.7

### UI 和样式
- **样式框架**: Tailwind CSS 3.4.17
- **UI 组件**: Shadcn/ui (基于 Radix UI)
- **主题系统**: next-themes 0.4.6 (深色/浅色/系统主题)

### 国际化和状态管理
- **国际化**: i18next 25.5.3 + react-i18next 16.0.0
- **语言检测**: i18next-browser-languagedetector 8.2.0
- **状态管理**: Zustand 5.0.8 (企业级三层架构)

### 监控和工具
- **错误监控**: Sentry 10.17.0
- **性能监控**: Web Vitals 5.1.0
- **HTTP客户端**: Redaxios 0.5.1
- **PWA支持**: Vite PWA Plugin 1.0.3
- **包管理**: 支持 npm/yarn/pnpm (推荐 pnpm)

## 🏗️ 项目架构规则

### 文件结构规范

```
src/
├── components/          # UI组件库
│   ├── ui/             # Shadcn/ui 基础组件 (不允许修改)
│   ├── LanguageSwitcher.tsx    # 语言切换组件
│   ├── NotificationContainer.tsx # 通知容器
│   ├── StoreProvider.tsx       # Store 提供者
│   └── *.tsx           # 自定义业务组件
├── hooks/              # 自定义React钩子
├── i18n/               # 国际化配置 ⭐ 新增
│   ├── index.ts        # i18n 配置和初始化
│   ├── hooks.ts        # 国际化相关 Hooks
│   └── locales/        # 语言资源文件
│       ├── zh-CN.json  # 中文语言包
│       └── en-US.json  # 英文语言包
├── lib/                # 工具函数和配置
│   ├── api/            # API 相关
│   ├── http/           # HTTP 客户端配置
│   └── utils.ts        # 工具函数
├── routes/             # 路由文件 (文件系统路由)
│   ├── __root.tsx      # 根路由布局
│   ├── index.tsx       # 首页
│   ├── demo.tsx        # 演示页面
│   └── monitoring.tsx  # 监控页面
├── services/           # API服务和数据获取逻辑
├── stores/             # 状态管理 ⭐ 新增
│   ├── types.ts        # Store 类型定义
│   ├── config.ts       # Store 配置和工具
│   ├── uiStore.ts      # UI 状态管理
│   ├── appStore.ts     # 应用状态管理
│   ├── authStore.ts    # 认证状态管理
│   ├── index.ts        # 统一导出
│   └── README.md       # Store 使用文档
├── types/              # TypeScript类型定义
│   ├── global.d.ts     # 全局类型声明
│   ├── monitoring.d.ts # 监控相关类型
│   └── pwa.d.ts        # PWA 相关类型
├── utils/              # 工具函数
├── mocks/              # 模拟数据
├── test/               # 测试配置和工具
├── main.tsx            # 应用入口点
└── styles.css          # 全局样式
```

### 命名约定

1. **文件命名**:
   - 路由文件: `kebab-case.tsx` (如 `posts.$postId.tsx`)
   - 组件文件: `PascalCase.tsx` 
   - Store 文件: `camelCase.ts` (如 `uiStore.ts`)
   - 工具文件: `camelCase.ts`
   - 样式文件: `kebab-case.css`
   - 国际化文件: `locale-code.json` (如 `zh-CN.json`)

2. **变量命名**:
   - 组件: `PascalCase`
   - 函数/变量: `camelCase`
   - 常量: `UPPER_SNAKE_CASE`
   - 类型/接口: `PascalCase`
   - Store 选择器: `use + 功能名` (如 `useTheme`)

## 🛠️ 开发规则

### 1. 路由开发规则

#### 文件系统路由
- 所有路由文件必须放在 `src/routes/` 目录下
- 使用 [`createFileRoute()`](src/routes/index.tsx:4) 创建路由
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
- 使用 [`defaultPreload: 'intent'`](src/main.tsx:22) 进行智能预加载

### 2. 数据获取规则

#### React Query 配置
- 使用 `queryOptions()` 定义查询配置
- 查询键必须使用数组格式: `['resource', ...params]`
- 在路由 loader 中使用 `queryClient.ensureQueryData()` 进行数据预加载

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
- 使用适当的缓存策略 (`staleTime`, `gcTime`)
- 实现错误处理和重试机制
- 利用 React Query Devtools 进行调试

### 3. 状态管理规则 ⭐ 新增

#### Zustand Store 架构
项目采用**三层 Store 架构**，职责分离：

```typescript
// UI Store - 用户界面状态
export const useUIStore = create<UIStore>()(
  createStoreWithMiddleware({
    // 主题管理
    theme: 'system',
    setTheme: (theme) => { /* 智能主题切换 */ },
    
    // 通知系统
    notifications: [],
    addNotification: (notification) => { /* 自动过期处理 */ },
    
    // 语言设置
    locale: 'zh-CN',
    setLocale: (locale) => { /* 同步 i18n */ },
  })
)

// App Store - 应用全局状态
export const useAppStore = create<AppStore>()(
  createStoreWithMiddleware({
    // 应用初始化
    initialize: async () => { /* 完整初始化流程 */ },
    
    // 功能开关
    features: { darkMode: true, notifications: true },
    toggleFeature: (feature) => { /* 动态功能控制 */ },
  })
)

// Auth Store - 认证状态
export const useAuthStore = create<AuthStore>()(
  createStoreWithMiddleware({
    // 认证状态
    isAuthenticated: false,
    setAuthenticated: (auth) => { /* 同步认证状态 */ },
    
    // 权限管理
    permissions: [],
    hasPermission: (perm) => { /* 权限检查 */ },
  })
)
```

#### Store 使用规范
- **UI Store**: 管理主题、侧边栏、模态框、通知、语言设置
- **App Store**: 管理应用初始化、网络状态、功能开关、用户偏好
- **Auth Store**: 管理认证状态、权限、会话、登录尝试

#### Store 最佳实践
- 使用选择器 hooks 避免不必要的重渲染
- 利用中间件进行持久化和调试
- 保持 Store 职责单一，避免跨 Store 依赖
- 使用 TypeScript 确保类型安全

### 4. 国际化开发规则 ⭐ 新增

#### i18n 配置
```typescript
// src/i18n/index.ts - 国际化配置
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    fallbackLng: 'zh-CN',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  })
```

#### 国际化使用规范
```typescript
// 在组件中使用翻译
import { useI18n } from '@/i18n/hooks'

function MyComponent() {
  const { t, currentLanguage, changeLanguage } = useI18n()
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('app.description')}</p>
    </div>
  )
}
```

#### 语言资源文件结构
```json
{
  "common": { "loading": "加载中...", "error": "错误" },
  "navigation": { "home": "首页", "settings": "设置" },
  "auth": { "login": "登录", "logout": "退出登录" },
  "ui": { "theme": { "light": "浅色主题", "dark": "深色主题" } },
  "app": { "title": "应用标题", "description": "应用描述" }
}
```

#### 国际化最佳实践
- 所有用户可见文本必须使用 `t()` 函数
- 语言键使用点分隔的层级结构
- 支持参数插值和复数形式
- 使用 `useI18n` Hook 获取完整的国际化功能

### 5. 组件开发规则

#### UI 组件规范
- 优先使用 Shadcn/ui 组件库
- 不允许直接修改 `src/components/ui/` 下的组件
- 需要自定义时，在 `src/components/` 下创建新组件
- 使用 [`cn()`](src/lib/utils.ts:6) 工具函数合并 className

#### 组件结构模板
```typescript
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/hooks'

interface ComponentProps {
  className?: string
  // 其他属性
}

export function Component({ className, ...props }: ComponentProps) {
  const { t } = useI18n()
  
  return (
    <div className={cn('default-styles', className)} {...props}>
      <h1>{t('component.title')}</h1>
      {/* 组件内容 */}
    </div>
  )
}
```

#### 特殊组件规范

##### 语言切换组件
```typescript
// 使用预定义的语言切换组件
import { LanguageSwitcher, SimpleLanguageSwitcher } from '@/components/LanguageSwitcher'

// 下拉菜单式
<LanguageSwitcher variant="outline" showText={true} />

// 简单切换按钮
<SimpleLanguageSwitcher />
```

##### 通知系统
```typescript
// 使用全局通知函数
import { showSuccess, showError, useNotifications } from '@/stores'

// 显示通知
showSuccess('操作成功', '数据已保存')
showError('操作失败', '请稍后重试')

// 在组件中管理通知
const { notifications, removeNotification } = useNotifications()
```

#### 组件最佳实践
- 使用 TypeScript 接口定义 props
- 支持 `className` 属性用于样式扩展
- 使用 `forwardRef` 处理 ref 传递
- 实现适当的可访问性 (a11y) 属性
- 所有文本内容必须支持国际化

### 6. 样式开发规则

#### Tailwind CSS 规范
- 优先使用 Tailwind CSS 类名
- 使用 [`tailwind-merge`](package.json:76) 处理类名冲突
- 响应式设计使用 Tailwind 断点
- 自定义样式放在 [`src/styles.css`](src/styles.css:1)

#### 主题系统
```typescript
// 主题切换
import { useTheme } from '@/stores'

const { theme, setTheme, toggleTheme } = useTheme()

// 支持的主题
setTheme('light')   // 浅色主题
setTheme('dark')    // 深色主题
setTheme('system')  // 跟随系统
```

#### 样式最佳实践
- 使用语义化的 CSS 变量
- 支持深色模式 (通过 [`next-themes`](package.json:65))
- 保持样式的一致性和可维护性
- 避免内联样式，优先使用 Tailwind 类
- 响应式设计优先考虑移动端

### 7. TypeScript 规则

#### 类型安全要求
- 启用严格模式 (`"strict": true`)
- 所有函数必须有明确的返回类型
- 使用接口定义复杂对象类型
- 避免使用 `any` 类型

#### Store 类型定义
```typescript
// Store 状态接口
export interface UIState extends BaseState {
  theme: 'light' | 'dark' | 'system'
  locale: 'zh-CN' | 'en-US'
  notifications: Notification[]
}

// Store 操作接口
export interface UIActions {
  setTheme: (theme: UIState['theme']) => void
  setLocale: (locale: UIState['locale']) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
}

// 组合 Store 类型
export type UIStore = UIState & UIActions
```

#### 国际化类型定义
```typescript
// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'en-US'

// 语言信息接口
export interface LanguageInfo {
  code: SupportedLanguage
  name: string
  isActive: boolean
}
```

## 🔧 开发工具配置

### 必需的开发工具
- **TanStack Router Devtools**: 路由状态调试
- **React Query Devtools**: 数据状态调试  
- **Zustand Devtools**: 状态管理调试 ⭐ 新增
- **TypeScript**: 类型检查和智能提示
- **Vite**: 快速开发和构建

### 推荐的 VSCode 扩展
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- i18n Ally (国际化支持) ⭐ 新增
- Auto Rename Tag
- Bracket Pair Colorizer

## 📦 依赖管理规则

### 包管理器
- 支持 npm、yarn、pnpm
- **强烈推荐使用 pnpm** (性能更好，依赖管理更严格)
- 锁定文件必须提交到版本控制

### 新增依赖类别
- **国际化依赖**: i18next、react-i18next、语言检测器
- **状态管理依赖**: zustand、中间件
- **监控依赖**: sentry、web-vitals
- **PWA依赖**: vite-plugin-pwa、workbox

### 依赖添加规则
- 生产依赖: 运行时必需的包
- 开发依赖: 仅开发时使用的包
- 避免添加不必要的依赖
- 定期更新依赖版本
- 新增依赖前检查是否与现有技术栈兼容

## 🚀 构建和部署

### 开发环境
```bash
# 安装依赖 (推荐使用 pnpm)
pnpm install

# 启动开发服务器 (端口 3000)
pnpm dev

# 类型检查
pnpm build  # 包含 tsc --noEmit

# 测试
pnpm test
pnpm test:coverage
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
- 必须通过 ESLint 代码检查
- 构建产物必须经过优化
- 支持代码分割和懒加载
- 生成 source map 用于调试
- PWA 功能正常工作

## 🧪 测试规则

### 测试策略
- **组件测试**: 使用 React Testing Library
- **路由测试**: 测试路由导航和数据加载
- **Store 测试**: 测试状态管理逻辑 ⭐ 新增
- **国际化测试**: 测试多语言切换 ⭐ 新增
- **API 测试**: 模拟 API 响应
- **E2E 测试**: 关键用户流程

### 测试最佳实践
- 测试用户行为而非实现细节
- 使用语义化的查询方法
- 模拟外部依赖
- 保持测试的独立性
- 测试国际化文本的正确显示
- 测试主题切换功能

## 🔒 代码质量规则

### 代码审查检查点
- [ ] TypeScript 类型安全
- [ ] 组件可复用性
- [ ] 性能优化 (懒加载、缓存)
- [ ] 可访问性 (a11y)
- [ ] 错误处理
- [ ] 国际化支持 ⭐ 新增
- [ ] 状态管理规范 ⭐ 新增
- [ ] 通知反馈完整性 ⭐ 新增
- [ ] 代码注释和文档

### 性能优化
- 使用 React.memo 优化重渲染
- 实现路由级别的代码分割
- 优化图片和静态资源
- 使用 React Query 缓存策略
- 使用 Zustand 选择器避免不必要的重渲染 ⭐ 新增
- 国际化资源懒加载 ⭐ 新增

### 用户体验优化 ⭐ 新增
- 实现加载状态和错误边界
- 提供直观的操作反馈 (通知系统)
- 支持多语言和主题切换
- 响应式设计适配各种设备
- PWA 功能提供原生应用体验

## 📚 学习资源

### 官方文档
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [i18next](https://www.i18next.com) ⭐ 新增
- [Zustand](https://zustand-demo.pmnd.rs) ⭐ 新增

### 最佳实践参考
- React 官方文档和最佳实践
- TypeScript 深度指南
- Web 可访问性指南 (WCAG)
- 现代前端性能优化
- 国际化最佳实践 ⭐ 新增
- 状态管理模式和实践 ⭐ 新增

## 🤝 贡献指南

### 提交规范
- 使用语义化提交信息
- 提交前运行类型检查和构建
- 确保代码符合项目规范
- 添加必要的测试用例
- 更新相关文档和国际化文本 ⭐ 新增

### Pull Request 流程
1. Fork 项目并创建功能分支
2. 实现功能并添加测试
3. 确保所有检查通过 (类型检查、测试、构建)
4. 更新国际化文本 (如涉及用户界面) ⭐ 新增
5. 提交 PR 并描述变更内容
6. 等待代码审查和合并

### 新功能开发检查清单 ⭐ 新增
- [ ] 功能实现完整
- [ ] TypeScript 类型定义
- [ ] 国际化文本支持
- [ ] 响应式设计适配
- [ ] 错误处理和边界情况
- [ ] 单元测试覆盖
- [ ] 文档更新
- [ ] 可访问性检查

---

## 🔄 更新日志

### v2.0.0 (2025-10-03) - 企业级功能升级
- ✨ 新增国际化系统 (i18next + react-i18next)
- 🏪 新增状态管理系统 (Zustand 三层架构)
- 🔔 新增通知系统和用户反馈
- 🌐 新增语言切换功能
- 📱 增强响应式设计和主题系统
- 📊 完善监控和性能追踪
- 📝 更新开发规则和最佳实践

### v1.0.0 (2025-10-03) - 基础版本
- 🎯 TanStack Router + React Query 基础架构
- 🎨 Shadcn/ui + Tailwind CSS 设计系统
- 🔧 TypeScript + Vite 开发环境

---

**注意**: 本规则文档会随着项目发展持续更新，请定期查看最新版本。当前版本已升级为**企业级应用开发规范**，包含完整的国际化、状态管理、用户体验优化等功能。