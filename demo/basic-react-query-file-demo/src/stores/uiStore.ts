/**
 * UI 状态管理 Store
 * 管理用户界面相关的状态，如主题、侧边栏、模态框、通知等
 */

import { create } from 'zustand'
import { createStoreWithMiddleware, generateId, handleStoreError } from './config'
import type { UIStore, UIState, UIActions, Notification } from './types'

// 初始状态
const initialState: UIState = {
    loading: false,
    error: null,

    // 主题设置
    theme: 'system',

    // 侧边栏状态
    sidebarOpen: true,
    sidebarCollapsed: false,

    // 模态框状态
    modals: {},

    // 通知状态
    notifications: [],

    // 页面加载状态
    pageLoading: false,

    // 移动端检测
    isMobile: false,

    // 语言设置
    locale: 'zh-CN',
}

// 创建 UI Store
export const useUIStore = create<UIStore>()(
    createStoreWithMiddleware<UIStore>(
        (set, get) => ({
            ...initialState,

            // 主题操作
            setTheme: (theme) => {
                try {
                    set({ theme })

                    // 应用主题到 document
                    const root = document.documentElement
                    if (theme === 'dark') {
                        root.classList.add('dark')
                    } else if (theme === 'light') {
                        root.classList.remove('dark')
                    } else {
                        // system theme
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                        if (prefersDark) {
                            root.classList.add('dark')
                        } else {
                            root.classList.remove('dark')
                        }
                    }
                } catch (error) {
                    const errorMessage = handleStoreError(error, 'setTheme')
                    set({ error: errorMessage })
                }
            },

            toggleTheme: () => {
                const { theme } = get()
                const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
                get().setTheme(newTheme)
            },

            // 侧边栏操作
            setSidebarOpen: (open) => {
                set({ sidebarOpen: open })
            },

            toggleSidebar: () => {
                const { sidebarOpen } = get()
                set({ sidebarOpen: !sidebarOpen })
            },

            setSidebarCollapsed: (collapsed) => {
                set({ sidebarCollapsed: collapsed })
            },

            toggleSidebarCollapsed: () => {
                const { sidebarCollapsed } = get()
                set({ sidebarCollapsed: !sidebarCollapsed })
            },

            // 模态框操作
            openModal: (modalId) => {
                set((state) => ({
                    modals: { ...state.modals, [modalId]: true }
                }))
            },

            closeModal: (modalId) => {
                set((state) => ({
                    modals: { ...state.modals, [modalId]: false }
                }))
            },

            toggleModal: (modalId) => {
                const { modals } = get()
                const isOpen = modals[modalId] || false
                set((state) => ({
                    modals: { ...state.modals, [modalId]: !isOpen }
                }))
            },

            closeAllModals: () => {
                const { modals } = get()
                const closedModals = Object.keys(modals).reduce((acc, key) => {
                    acc[key] = false
                    return acc
                }, {} as Record<string, boolean>)
                set({ modals: closedModals })
            },

            // 通知操作
            addNotification: (notification) => {
                try {
                    const newNotification: Notification = {
                        ...notification,
                        id: generateId(),
                        timestamp: Date.now(),
                    }

                    set((state) => ({
                        notifications: [...state.notifications, newNotification]
                    }))

                    // 自动移除通知（如果设置了 duration）
                    if (notification.duration && notification.duration > 0) {
                        setTimeout(() => {
                            get().removeNotification(newNotification.id)
                        }, notification.duration)
                    }
                } catch (error) {
                    const errorMessage = handleStoreError(error, 'addNotification')
                    set({ error: errorMessage })
                }
            },

            removeNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter(n => n.id !== id)
                }))
            },

            clearNotifications: () => {
                set({ notifications: [] })
            },

            // 页面加载状态
            setPageLoading: (loading) => {
                set({ pageLoading: loading })
            },

            // 移动端状态
            setIsMobile: (isMobile) => {
                set({ isMobile })
            },

            // 语言设置
            setLocale: (locale) => {
                set({ locale })

                // 更新 HTML lang 属性
                document.documentElement.lang = locale === 'zh-CN' ? 'zh' : 'en'
                
                // 触发 i18n 语言变更（如果 i18n 已初始化）
                if (typeof window !== 'undefined' && window.i18n) {
                    window.i18n.changeLanguage(locale).catch(console.error)
                }
            },

            // 重置状态
            resetUI: () => {
                set(initialState)
            },
        }),
        {
            name: 'ui-store',
            persist: true,
            persistOptions: {
                // 只持久化部分状态
                partialize: (state) => ({
                    theme: state.theme,
                    sidebarCollapsed: state.sidebarCollapsed,
                    locale: state.locale,
                }),
            },
            devtools: true,
            subscribeWithSelector: true,
        }
    )
)

// 选择器 hooks
export const useTheme = () => useUIStore((state) => state.theme)
export const useSidebar = () => useUIStore((state) => ({
    open: state.sidebarOpen,
    collapsed: state.sidebarCollapsed,
    setOpen: state.setSidebarOpen,
    toggle: state.toggleSidebar,
    setCollapsed: state.setSidebarCollapsed,
    toggleCollapsed: state.toggleSidebarCollapsed,
}))

export const useModals = () => useUIStore((state) => ({
    modals: state.modals,
    openModal: state.openModal,
    closeModal: state.closeModal,
    toggleModal: state.toggleModal,
    closeAllModals: state.closeAllModals,
}))

export const useNotifications = () => useUIStore((state) => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
}))

export const usePageLoading = () => useUIStore((state) => ({
    loading: state.pageLoading,
    setLoading: state.setPageLoading,
}))

export const useLocale = () => useUIStore((state) => ({
    locale: state.locale,
    setLocale: state.setLocale,
}))

// 工具函数
export const showNotification = (
    type: Notification['type'],
    title: string,
    message?: string,
    duration: number = 5000
) => {
    useUIStore.getState().addNotification({
        type,
        title,
        message,
        duration,
    })
}

// 快捷通知函数
export const showSuccess = (title: string, message?: string) =>
    showNotification('success', title, message)

export const showError = (title: string, message?: string) =>
    showNotification('error', title, message, 8000)

export const showWarning = (title: string, message?: string) =>
    showNotification('warning', title, message)

export const showInfo = (title: string, message?: string) =>
    showNotification('info', title, message)