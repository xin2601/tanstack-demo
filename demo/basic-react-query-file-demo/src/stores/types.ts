/**
 * Zustand Store 类型定义
 */

// 基础状态接口
export interface BaseState {
    loading: boolean
    error: string | null
}

// 用户界面状态
export interface UIState extends BaseState {
    // 主题设置
    theme: 'light' | 'dark' | 'system'

    // 侧边栏状态
    sidebarOpen: boolean
    sidebarCollapsed: boolean

    // 模态框状态
    modals: {
        [key: string]: boolean
    }

    // 通知状态
    notifications: Notification[]

    // 页面加载状态
    pageLoading: boolean

    // 移动端检测
    isMobile: boolean

    // 语言设置
    locale: 'zh-CN' | 'en-US'
}

// 通知类型
export interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
    timestamp: number
}

// 应用全局状态
export interface AppState extends BaseState {
    // 应用初始化状态
    initialized: boolean

    // 网络状态
    online: boolean

    // 应用版本信息
    version: string

    // 功能开关
    features: {
        [key: string]: boolean
    }

    // 用户偏好设置
    preferences: UserPreferences

    // 缓存数据
    cache: {
        [key: string]: any
    }
}

// 用户偏好设置
export interface UserPreferences {
    // 显示设置
    showWelcomeMessage: boolean
    autoSave: boolean

    // 表格设置
    tablePageSize: number
    tableColumns: {
        [tableName: string]: string[]
    }

    // 其他设置
    [key: string]: any
}

// 认证状态（补充 React Query 的服务端状态）
export interface AuthState extends BaseState {
    // 本地认证状态
    isAuthenticated: boolean

    // 用户权限缓存
    permissions: string[]

    // 登录状态
    loginAttempts: number
    lastLoginTime: number | null

    // 会话管理
    sessionTimeout: number | null

    // 记住登录状态
    rememberMe: boolean
}

// Store Actions 类型
export interface UIActions {
    // 主题操作
    setTheme: (theme: UIState['theme']) => void
    toggleTheme: () => void

    // 侧边栏操作
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void
    toggleSidebarCollapsed: () => void

    // 模态框操作
    openModal: (modalId: string) => void
    closeModal: (modalId: string) => void
    toggleModal: (modalId: string) => void
    closeAllModals: () => void

    // 通知操作
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
    removeNotification: (id: string) => void
    clearNotifications: () => void

    // 页面加载状态
    setPageLoading: (loading: boolean) => void

    // 移动端状态
    setIsMobile: (isMobile: boolean) => void

    // 语言设置
    setLocale: (locale: UIState['locale']) => void

    // 重置状态
    resetUI: () => void
}

export interface AppActions {
    // 初始化
    initialize: () => Promise<void>
    setInitialized: (initialized: boolean) => void

    // 网络状态
    setOnline: (online: boolean) => void

    // 功能开关
    setFeature: (feature: string, enabled: boolean) => void
    toggleFeature: (feature: string) => void

    // 用户偏好
    updatePreferences: (preferences: Partial<UserPreferences>) => void
    resetPreferences: () => void

    // 缓存操作
    setCache: (key: string, value: any) => void
    getCache: (key: string) => any
    clearCache: (key?: string) => void

    // 重置状态
    resetApp: () => void
}

export interface AuthActions {
    // 认证状态
    setAuthenticated: (authenticated: boolean) => void

    // 权限管理
    setPermissions: (permissions: string[]) => void
    hasPermission: (permission: string) => boolean

    // 登录尝试
    incrementLoginAttempts: () => void
    resetLoginAttempts: () => void
    setLastLoginTime: (time: number) => void

    // 会话管理
    setSessionTimeout: (timeout: number | null) => void

    // 记住登录
    setRememberMe: (remember: boolean) => void

    // 重置状态
    resetAuth: () => void
}

// 组合 Store 类型
export interface RootStore {
    ui: UIState & UIActions
    app: AppState & AppActions
    auth: AuthState & AuthActions
}

// Store 切片类型
export type UIStore = UIState & UIActions
export type AppStore = AppState & AppActions
export type AuthStore = AuthState & AuthActions