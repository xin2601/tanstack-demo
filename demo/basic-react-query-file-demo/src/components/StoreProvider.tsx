/**
 * Store Provider 组件
 * 初始化和管理 Zustand stores
 */

import * as React from 'react'
import { useStoreInitializer, useNetworkListener, showNotification } from '@/stores'

interface StoreProviderProps {
    children: React.ReactNode
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
    const { initialized } = useStoreInitializer()

    // 网络状态监听
    useNetworkListener()

    // 会话超时监听
    React.useEffect(() => {
        const handleSessionTimeout = () => {
            showNotification('warning', '会话已超时', '请重新登录以继续使用', 10000)
        }

        window.addEventListener('session-timeout', handleSessionTimeout)

        return () => {
            window.removeEventListener('session-timeout', handleSessionTimeout)
        }
    }, [])

    // 主题初始化
    React.useEffect(() => {
        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleThemeChange = (e: MediaQueryListEvent) => {
            const root = document.documentElement
            const currentTheme = localStorage.getItem('ui-store')

            if (currentTheme) {
                try {
                    const parsed = JSON.parse(currentTheme)
                    if (parsed.state?.theme === 'system') {
                        if (e.matches) {
                            root.classList.add('dark')
                        } else {
                            root.classList.remove('dark')
                        }
                    }
                } catch (error) {
                    console.warn('Failed to parse theme from localStorage:', error)
                }
            }
        }

        mediaQuery.addEventListener('change', handleThemeChange)

        return () => {
            mediaQuery.removeEventListener('change', handleThemeChange)
        }
    }, [])

    // 移动端检测
    React.useEffect(() => {
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768
            // 这里可以更新 UI store 的 isMobile 状态
            // 但为了避免循环依赖，我们在这里直接检测
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => {
            window.removeEventListener('resize', checkMobile)
        }
    }, [])

    // 显示初始化加载状态
    if (!initialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在初始化应用...</p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

// Store 状态调试组件（仅开发环境）
export const StoreDebugger: React.FC = () => {
    if (import.meta.env.PROD) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <details className="bg-black/80 text-white p-2 rounded text-xs">
                <summary className="cursor-pointer">🏪 Store Debug</summary>
                <div className="mt-2 space-y-1">
                    <button
                        onClick={() => {
                            console.group('🏪 Store States')
                            console.log('Stores initialized')
                            console.groupEnd()
                        }}
                        className="block w-full text-left hover:bg-white/10 px-2 py-1 rounded"
                    >
                        Log States
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('确定要重置所有 Store 状态吗？')) {
                                // 这里可以调用 resetAllStores，但需要小心处理
                                console.log('Store reset requested')
                            }
                        }}
                        className="block w-full text-left hover:bg-white/10 px-2 py-1 rounded text-red-300"
                    >
                        Reset Stores
                    </button>
                </div>
            </details>
        </div>
    )
}