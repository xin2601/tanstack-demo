# Zustand 状态管理

本项目使用 Zustand 进行客户端状态管理，与 React Query 的服务端状态管理形成互补。

## 架构概览

```
src/stores/
├── types.ts           # 类型定义
├── config.ts          # 配置和工具函数
├── uiStore.ts         # UI 状态管理
├── appStore.ts        # 应用全局状态
├── authStore.ts       # 认证状态管理
├── index.ts           # 主入口文件
└── README.md          # 文档
```

## Store 分类

### 1. UI Store (`uiStore.ts`)
管理用户界面相关的状态：
- 主题设置 (light/dark/system)
- 侧边栏状态
- 模态框状态
- 通知系统
- 页面加载状态
- 移动端检测
- 语言设置

### 2. App Store (`appStore.ts`)
管理应用级别的状态：
- 应用初始化状态
- 网络连接状态
- 功能开关
- 用户偏好设置
- 缓存数据

### 3. Auth Store (`authStore.ts`)
管理客户端认证状态（补充 React Query 的服务端状态）：
- 本地认证状态
- 用户权限缓存
- 登录尝试次数
- 会话管理
- 记住登录状态

## 使用方法

### 基本用法

```tsx
import { useUIStore, useAppStore, useAuthStore } from '@/stores'

function MyComponent() {
  // 直接使用 store
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  
  // 或使用选择器 hooks
  const { theme: currentTheme, setTheme: changeTheme } = useTheme()
  
  return (
    <button onClick={() => changeTheme('dark')}>
      当前主题: {currentTheme}
    </button>
  )
}
```

### 通知系统

```tsx
import { showSuccess, showError, useNotifications } from '@/stores'

function NotificationExample() {
  const { notifications, clearNotifications } = useNotifications()
  
  const handleSuccess = () => {
    showSuccess('操作成功', '数据已保存')
  }
  
  const handleError = () => {
    showError('操作失败', '请稍后重试')
  }
  
  return (
    <div>
      <button onClick={handleSuccess}>显示成功通知</button>
      <button onClick={handleError}>显示错误通知</button>
      <button onClick={clearNotifications}>清除所有通知</button>
      <p>当前通知数量: {notifications.length}</p>
    </div>
  )
}
```

### 功能开关

```tsx
import { useFeatures, isFeatureEnabled } from '@/stores'

function FeatureExample() {
  const { features, toggleFeature } = useFeatures()
  
  // 在组件中检查功能
  if (!isFeatureEnabled('betaFeatures')) {
    return <div>此功能尚未开放</div>
  }
  
  return (
    <div>
      {Object.entries(features).map(([feature, enabled]) => (
        <label key={feature}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => toggleFeature(feature)}
          />
          {feature}
        </label>
      ))}
    </div>
  )
}
```

### 权限管理

```tsx
import { usePermissions, checkPermission } from '@/stores'

function PermissionExample() {
  const { permissions, hasPermission } = usePermissions()
  
  // 组件级权限检查
  if (!hasPermission('admin')) {
    return <div>权限不足</div>
  }
  
  // 或在函数中检查
  const handleAdminAction = () => {
    if (checkPermission('admin')) {
      // 执行管理员操作
    }
  }
  
  return (
    <div>
      <p>当前权限: {permissions.join(', ')}</p>
      <button onClick={handleAdminAction}>管理员操作</button>
    </div>
  )
}
```

### 用户偏好设置

```tsx
import { usePreferences, getPreference, setPreference } from '@/stores'

function PreferencesExample() {
  const { preferences, updatePreferences } = usePreferences()
  
  const handleUpdatePageSize = (size: number) => {
    updatePreferences({ tablePageSize: size })
    // 或使用工具函数
    setPreference('tablePageSize', size)
  }
  
  const currentPageSize = getPreference('tablePageSize', 10)
  
  return (
    <div>
      <p>当前页面大小: {currentPageSize}</p>
      <button onClick={() => handleUpdatePageSize(20)}>
        设置为 20
      </button>
    </div>
  )
}
```

## 高级用法

### 组合多个 Store

```tsx
import { useStores, useStoreStates } from '@/stores'

function CombinedExample() {
  // 获取所有 store 实例
  const { ui, app, auth } = useStores()
  
  // 或获取选择的状态
  const states = useStoreStates()
  
  return (
    <div>
      <p>主题: {states.ui.theme}</p>
      <p>在线状态: {states.app.online ? '在线' : '离线'}</p>
      <p>认证状态: {states.auth.isAuthenticated ? '已登录' : '未登录'}</p>
    </div>
  )
}
```

### 全局错误和加载状态

```tsx
import { useGlobalError, useGlobalLoading } from '@/stores'

function GlobalStateExample() {
  const { hasError, errors, clearErrors } = useGlobalError()
  const { isLoading, loadingStates } = useGlobalLoading()
  
  if (isLoading) {
    return <div>加载中...</div>
  }
  
  if (hasError) {
    return (
      <div>
        <p>发生错误:</p>
        <ul>
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
        <button onClick={clearErrors}>清除错误</button>
      </div>
    )
  }
  
  return <div>一切正常</div>
}
```

### Store 初始化

```tsx
import { useStoreInitializer } from '@/stores'

function AppInitializer() {
  const { initialized, syncAuthState } = useStoreInitializer()
  
  React.useEffect(() => {
    // 同步认证状态（例如从 React Query 获取用户信息后）
    syncAuthState(true, ['user', 'read'])
  }, [syncAuthState])
  
  if (!initialized) {
    return <div>初始化中...</div>
  }
  
  return <div>应用已就绪</div>
}
```

## 持久化

Store 会自动持久化部分状态到 localStorage：

- **UI Store**: 主题、侧边栏折叠状态、语言设置
- **App Store**: 功能开关、用户偏好、版本信息
- **Auth Store**: 认证状态、权限、记住登录状态

## 开发工具

在开发环境中，可以使用内置的调试工具：

```tsx
import { useStoreDebug } from '@/stores'

function DebugPanel() {
  const { logStoreStates, resetStores, getStoreStates } = useStoreDebug()
  
  return (
    <div>
      <button onClick={logStoreStates}>打印 Store 状态</button>
      <button onClick={resetStores}>重置所有 Store</button>
      <button onClick={() => console.log(getStoreStates())}>
        获取状态快照
      </button>
    </div>
  )
}
```

## 最佳实践

1. **状态分离**: 将客户端状态（UI、偏好）与服务端状态（API 数据）分离
2. **选择器优化**: 使用具体的选择器避免不必要的重渲染
3. **类型安全**: 充分利用 TypeScript 类型定义
4. **持久化策略**: 只持久化必要的状态，避免存储敏感信息
5. **错误处理**: 在 store 操作中添加适当的错误处理
6. **性能优化**: 使用 `subscribeWithSelector` 进行精确订阅

## 与 React Query 的配合

Zustand 主要管理客户端状态，React Query 管理服务端状态：

```tsx
// React Query 管理服务端数据
const { data: user } = useProfile()

// Zustand 管理客户端认证状态
const { isAuthenticated, setAuthenticated } = useAuthStatus()

// 同步状态
React.useEffect(() => {
  setAuthenticated(!!user)
}, [user, setAuthenticated])
```

这种架构确保了状态管理的清晰分离和高效协作。