/**
 * Zustand Store 主入口
 * 组合所有子 store 并提供统一的导出
 */

import * as React from 'react'
import { useUIStore } from './uiStore'
import { useAppStore } from './appStore'
import { useAuthStore } from './authStore'

// 导出所有 store
export { useUIStore, useAppStore, useAuthStore }

// 导出所有类型
export type * from './types'

// 导出选择器 hooks
export {
    useTheme,
    useSidebar,
    useModals,
    useNotifications,
    usePageLoading,
    useLocale,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
} from './uiStore'

export {
    useAppInitialization,
    useNetworkStatus,
    useFeatures,
    usePreferences,
    useAppCache,
    useAppVersion,
    isFeatureEnabled,
    getPreference,
    setPreference,
    useNetworkListener,
    useAppInitializer,
} from './appStore'

export {
    useAuthStatus,
    usePermissions,
    useLoginAttempts,
    useSession,
    checkPermission,
    checkMultiplePermissions,
    usePermissionCheck,
    useMultiplePermissionCheck,
    useSessionTimeoutListener,
    useAuthSync,
} from './authStore'

// 导出配置工具
export {
    createStoreWithMiddleware,
    handleStoreError,
    generateId,
    deepMerge,
    debounce,
    throttle,
    storage,
    sessionStorage,
} from './config'

// 组合 Store Hook
export const useStores = () => ({
    ui: useUIStore(),
    app: useAppStore(),
    auth: useAuthStore(),
})

// 重置所有 Store
export const resetAllStores = () => {
    useUIStore.getState().resetUI()
    useAppStore.getState().resetApp()
    useAuthStore.getState().resetAuth()
}

// Store 状态选择器
export const useStoreStates = () => ({
    ui: {
        loading: useUIStore((state) => state.loading),
        error: useUIStore((state) => state.error),
        theme: useUIStore((state) => state.theme),
        sidebarOpen: useUIStore((state) => state.sidebarOpen),
        notifications: useUIStore((state) => state.notifications),
    },
    app: {
        initialized: useAppStore((state) => state.initialized),
        loading: useAppStore((state) => state.loading),
        online: useAppStore((state) => state.online),
        features: useAppStore((state) => state.features),
    },
    auth: {
        isAuthenticated: useAuthStore((state) => state.isAuthenticated),
        loading: useAuthStore((state) => state.loading),
        permissions: useAuthStore((state) => state.permissions),
        loginAttempts: useAuthStore((state) => state.loginAttempts),
    },
})

// 全局错误处理
export const useGlobalError = () => {
    const uiError = useUIStore((state) => state.error)
    const appError = useAppStore((state) => state.error)
    const authError = useAuthStore((state) => state.error)

    const errors = [uiError, appError, authError].filter(Boolean)

    return {
        hasError: errors.length > 0,
        errors,
        clearErrors: () => {
            useUIStore.setState({ error: null })
            useAppStore.setState({ error: null })
            useAuthStore.setState({ error: null })
        },
    }
}

// 全局加载状态
export const useGlobalLoading = () => {
    const uiLoading = useUIStore((state) => state.loading)
    const appLoading = useAppStore((state) => state.loading)
    const authLoading = useAuthStore((state) => state.loading)
    const pageLoading = useUIStore((state) => state.pageLoading)

    return {
        isLoading: uiLoading || appLoading || authLoading || pageLoading,
        loadingStates: {
            ui: uiLoading,
            app: appLoading,
            auth: authLoading,
            page: pageLoading,
        },
    }
}

// Store 调试工具（仅开发环境）
export const useStoreDebug = () => {
    if (import.meta.env.DEV) {
        return {
            logStoreStates: () => {
                console.group('🏪 Store States')
                console.log('UI Store:', useUIStore.getState())
                console.log('App Store:', useAppStore.getState())
                console.log('Auth Store:', useAuthStore.getState())
                console.groupEnd()
            },
            resetStores: resetAllStores,
            getStoreStates: () => ({
                ui: useUIStore.getState(),
                app: useAppStore.getState(),
                auth: useAuthStore.getState(),
            }),
        }
    }

    return {
        logStoreStates: () => { },
        resetStores: () => { },
        getStoreStates: () => ({}),
    }
}

// Store 初始化 Hook
export const useStoreInitializer = () => {
  const appStore = useAppStore()
  const authStore = useAuthStore()
  
  React.useEffect(() => {
    if (!appStore.initialized) {
      appStore.initialize()
    }
  }, [appStore.initialized, appStore.initialize])
  
  return {
    initialized: appStore.initialized,
    syncAuthState: (authenticated: boolean, permissions?: string[]) => {
      authStore.setAuthenticated(authenticated)
      if (permissions) {
        authStore.setPermissions(permissions)
      }
    },
  }
}