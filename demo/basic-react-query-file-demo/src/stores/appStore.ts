/**
 * 应用全局状态管理 Store
 * 管理应用级别的状态，如初始化、网络状态、功能开关、用户偏好等
 */

import * as React from 'react'
import { create } from 'zustand'
import { createStoreWithMiddleware, handleStoreError, deepMerge } from './config'
import type { AppStore, AppState, AppActions, UserPreferences } from './types'

// 默认用户偏好设置
const defaultPreferences: UserPreferences = {
    showWelcomeMessage: true,
    autoSave: true,
    tablePageSize: 10,
    tableColumns: {},
}

// 初始状态
const initialState: AppState = {
    loading: false,
    error: null,

    // 应用初始化状态
    initialized: false,

    // 网络状态
    online: navigator.onLine,

    // 应用版本信息
    version: '1.0.0',

    // 功能开关
    features: {
        darkMode: true,
        notifications: true,
        analytics: false,
        betaFeatures: false,
    },

    // 用户偏好设置
    preferences: defaultPreferences,

    // 缓存数据
    cache: {},
}

// 创建 App Store
export const useAppStore = create<AppStore>()(
    createStoreWithMiddleware<AppStore>(
        (set, get) => ({
            ...initialState,

            // 初始化应用
            initialize: async () => {
                try {
                    set({ loading: true, error: null })

                    // 模拟初始化过程
                    await new Promise(resolve => setTimeout(resolve, 1000))

                    // 检查网络状态
                    const online = navigator.onLine

                    // 从本地存储加载用户偏好
                    const savedPreferences = localStorage.getItem('user-preferences')
                    const preferences = savedPreferences
                        ? { ...defaultPreferences, ...JSON.parse(savedPreferences) }
                        : defaultPreferences

                    // 设置网络状态监听
                    const handleOnline = () => get().setOnline(true)
                    const handleOffline = () => get().setOnline(false)

                    window.addEventListener('online', handleOnline)
                    window.addEventListener('offline', handleOffline)

                    set({
                        initialized: true,
                        loading: false,
                        online,
                        preferences,
                    })

                    console.log('应用初始化完成')
                } catch (error) {
                    const errorMessage = handleStoreError(error, 'initialize')
                    set({
                        loading: false,
                        error: errorMessage,
                        initialized: false
                    })
                }
            },

            setInitialized: (initialized) => {
                set({ initialized })
            },

            // 网络状态管理
            setOnline: (online) => {
                set({ online })

                if (online) {
                    console.log('网络连接已恢复')
                    // 可以在这里触发数据同步等操作
                } else {
                    console.log('网络连接已断开')
                }
            },

            // 功能开关管理
            setFeature: (feature, enabled) => {
                set((state) => ({
                    features: { ...state.features, [feature]: enabled }
                }))
            },

            toggleFeature: (feature) => {
                const { features } = get()
                const currentValue = features[feature] || false
                get().setFeature(feature, !currentValue)
            },

            // 用户偏好管理
            updatePreferences: (newPreferences) => {
                try {
                    const { preferences } = get()
                    const updatedPreferences = deepMerge(preferences, newPreferences)

                    set({ preferences: updatedPreferences })

                    // 保存到本地存储
                    localStorage.setItem('user-preferences', JSON.stringify(updatedPreferences))
                } catch (error) {
                    const errorMessage = handleStoreError(error, 'updatePreferences')
                    set({ error: errorMessage })
                }
            },

            resetPreferences: () => {
                set({ preferences: defaultPreferences })
                localStorage.setItem('user-preferences', JSON.stringify(defaultPreferences))
            },

            // 缓存管理
            setCache: (key, value) => {
                set((state) => ({
                    cache: { ...state.cache, [key]: value }
                }))
            },

            getCache: (key) => {
                const { cache } = get()
                return cache[key]
            },

            clearCache: (key) => {
                if (key) {
                    set((state) => {
                        const newCache = { ...state.cache }
                        delete newCache[key]
                        return { cache: newCache }
                    })
                } else {
                    set({ cache: {} })
                }
            },

            // 重置应用状态
            resetApp: () => {
                set({
                    ...initialState,
                    // 保持网络状态
                    online: navigator.onLine,
                })

                // 清除本地存储
                localStorage.removeItem('user-preferences')
            },
        }),
        {
            name: 'app-store',
            persist: true,
            persistOptions: {
                // 持久化部分状态
                partialize: (state) => ({
                    features: state.features,
                    preferences: state.preferences,
                    version: state.version,
                }),
            },
            devtools: true,
            subscribeWithSelector: true,
        }
    )
)

// 选择器 hooks
export const useAppInitialization = () => useAppStore((state) => ({
    initialized: state.initialized,
    loading: state.loading,
    error: state.error,
    initialize: state.initialize,
}))

export const useNetworkStatus = () => useAppStore((state) => ({
    online: state.online,
    setOnline: state.setOnline,
}))

export const useFeatures = () => useAppStore((state) => ({
    features: state.features,
    setFeature: state.setFeature,
    toggleFeature: state.toggleFeature,
}))

export const usePreferences = () => useAppStore((state) => ({
    preferences: state.preferences,
    updatePreferences: state.updatePreferences,
    resetPreferences: state.resetPreferences,
}))

export const useAppCache = () => useAppStore((state) => ({
    cache: state.cache,
    setCache: state.setCache,
    getCache: state.getCache,
    clearCache: state.clearCache,
}))

export const useAppVersion = () => useAppStore((state) => state.version)

// 工具函数
export const isFeatureEnabled = (feature: string): boolean => {
    return useAppStore.getState().features[feature] || false
}

export const getPreference = <T>(key: string, defaultValue?: T): T => {
    const preferences = useAppStore.getState().preferences
    return (preferences as any)[key] ?? defaultValue
}

export const setPreference = (key: string, value: any): void => {
    useAppStore.getState().updatePreferences({ [key]: value })
}

// 网络状态监听 hook
export const useNetworkListener = () => {
    const setOnline = useAppStore((state) => state.setOnline)

    React.useEffect(() => {
        const handleOnline = () => setOnline(true)
        const handleOffline = () => setOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [setOnline])
}

// 应用初始化 hook
export const useAppInitializer = () => {
    const { initialized, initialize } = useAppInitialization()

    React.useEffect(() => {
        if (!initialized) {
            initialize()
        }
    }, [initialized, initialize])

    return { initialized }
}