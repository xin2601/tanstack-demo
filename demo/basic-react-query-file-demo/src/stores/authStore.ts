/**
 * 认证状态管理 Store
 * 管理客户端认证状态，补充 React Query 的服务端状态管理
 */

import * as React from 'react'
import { create } from 'zustand'
import { createStoreWithMiddleware, handleStoreError, storage } from './config'
import type { AuthStore, AuthState, AuthActions } from './types'

// 初始状态
const initialState: AuthState = {
    loading: false,
    error: null,

    // 本地认证状态
    isAuthenticated: false,

    // 用户权限缓存
    permissions: [],

    // 登录状态
    loginAttempts: 0,
    lastLoginTime: null,

    // 会话管理
    sessionTimeout: null,

    // 记住登录状态
    rememberMe: false,
}

// 创建 Auth Store
export const useAuthStore = create<AuthStore>()(
    createStoreWithMiddleware<AuthStore>(
        (set, get) => ({
            ...initialState,

            // 设置认证状态
            setAuthenticated: (authenticated) => {
                set({ isAuthenticated: authenticated })

                if (authenticated) {
                    // 认证成功时重置登录尝试次数
                    set({ loginAttempts: 0, lastLoginTime: Date.now() })
                } else {
                    // 认证失败时清除相关状态
                    set({
                        permissions: [],
                        sessionTimeout: null,
                        lastLoginTime: null,
                    })
                }
            },

            // 权限管理
            setPermissions: (permissions) => {
                set({ permissions })
            },

            hasPermission: (permission) => {
                const { permissions } = get()
                return permissions.includes(permission)
            },

            // 登录尝试管理
            incrementLoginAttempts: () => {
                set((state) => ({
                    loginAttempts: state.loginAttempts + 1
                }))
            },

            resetLoginAttempts: () => {
                set({ loginAttempts: 0 })
            },

            setLastLoginTime: (time) => {
                set({ lastLoginTime: time })
            },

            // 会话管理
            setSessionTimeout: (timeout) => {
                set({ sessionTimeout: timeout })

                if (timeout) {
                    // 设置会话超时定时器
                    setTimeout(() => {
                        const { isAuthenticated } = get()
                        if (isAuthenticated) {
                            console.log('会话已超时，自动登出')
                            get().setAuthenticated(false)

                            // 清除本地存储的认证信息
                            storage.remove('authToken')
                            storage.remove('refreshToken')
                            storage.remove('userId')
                            storage.remove('tokenExpiresAt')

                            // 可以触发重新登录提示
                            window.dispatchEvent(new CustomEvent('session-timeout'))
                        }
                    }, timeout)
                }
            },

            // 记住登录状态
            setRememberMe: (remember) => {
                set({ rememberMe: remember })
            },

            // 重置认证状态
            resetAuth: () => {
                set(initialState)

                // 清除本地存储
                storage.remove('authToken')
                storage.remove('refreshToken')
                storage.remove('userId')
                storage.remove('tokenExpiresAt')
            },
        }),
        {
            name: 'auth-store',
            persist: true,
            persistOptions: {
                // 只持久化部分状态
                partialize: (state) => ({
                    isAuthenticated: state.isAuthenticated,
                    permissions: state.permissions,
                    rememberMe: state.rememberMe,
                    lastLoginTime: state.lastLoginTime,
                }),
                // 自定义存储，根据 rememberMe 决定使用 localStorage 还是 sessionStorage
                storage: {
                    getItem: (name) => {
                        const rememberMe = storage.get('rememberMe', false)
                        const storageType = rememberMe ? localStorage : sessionStorage
                        const str = storageType.getItem(name)
                        return str ? JSON.parse(str) : null
                    },
                    setItem: (name, value) => {
                      const state = JSON.parse(value as unknown as string)
                      const rememberMe = state.rememberMe || false
                      const storageType = rememberMe ? localStorage : sessionStorage
                      storageType.setItem(name, value as unknown as string)
                      // 同时保存 rememberMe 状态到 localStorage
                      storage.set('rememberMe', rememberMe)
                    },
                    removeItem: (name) => {
                        localStorage.removeItem(name)
                        sessionStorage.removeItem(name)
                        storage.remove('rememberMe')
                    },
                },
            },
            devtools: true,
            subscribeWithSelector: true,
        }
    )
)

// 选择器 hooks
export const useAuthStatus = () => useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    setAuthenticated: state.setAuthenticated,
}))

export const usePermissions = () => useAuthStore((state) => ({
    permissions: state.permissions,
    setPermissions: state.setPermissions,
    hasPermission: state.hasPermission,
}))

export const useLoginAttempts = () => useAuthStore((state) => ({
    attempts: state.loginAttempts,
    increment: state.incrementLoginAttempts,
    reset: state.resetLoginAttempts,
    lastLoginTime: state.lastLoginTime,
    setLastLoginTime: state.setLastLoginTime,
}))

export const useSession = () => useAuthStore((state) => ({
    timeout: state.sessionTimeout,
    setTimeout: state.setSessionTimeout,
    rememberMe: state.rememberMe,
    setRememberMe: state.setRememberMe,
}))

// 工具函数
export const checkPermission = (permission: string): boolean => {
    return useAuthStore.getState().hasPermission(permission)
}

export const checkMultiplePermissions = (permissions: string[], requireAll = true): boolean => {
    const hasPermission = useAuthStore.getState().hasPermission

    if (requireAll) {
        return permissions.every(permission => hasPermission(permission))
    } else {
        return permissions.some(permission => hasPermission(permission))
    }
}

// 权限检查 hook
export const usePermissionCheck = (permission: string) => {
    return useAuthStore((state) => state.hasPermission(permission))
}

// 多权限检查 hook
export const useMultiplePermissionCheck = (permissions: string[], requireAll = true) => {
    return useAuthStore((state) => {
        if (requireAll) {
            return permissions.every(permission => state.hasPermission(permission))
        } else {
            return permissions.some(permission => state.hasPermission(permission))
        }
    })
}

// 会话超时监听 hook
export const useSessionTimeoutListener = (onTimeout?: () => void) => {
    React.useEffect(() => {
        const handleSessionTimeout = () => {
            console.log('检测到会话超时')
            onTimeout?.()
        }

        window.addEventListener('session-timeout', handleSessionTimeout)

        return () => {
            window.removeEventListener('session-timeout', handleSessionTimeout)
        }
    }, [onTimeout])
}

// 认证状态同步 hook（与 React Query 的认证状态同步）
export const useAuthSync = () => {
    const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
    const setPermissions = useAuthStore((state) => state.setPermissions)

    // 检查本地存储的认证状态
    React.useEffect(() => {
        const token = storage.get('authToken')
        const expiresAt = storage.get('tokenExpiresAt')

        if (token && expiresAt) {
            const isValid = Date.now() < parseInt(expiresAt as string)
            setAuthenticated(isValid)

            if (!isValid) {
                // Token 已过期，清除本地存储
                storage.remove('authToken')
                storage.remove('refreshToken')
                storage.remove('userId')
                storage.remove('tokenExpiresAt')
            }
        } else {
            setAuthenticated(false)
        }
    }, [setAuthenticated])

    return {
        syncAuthState: (authenticated: boolean, permissions?: string[]) => {
            setAuthenticated(authenticated)
            if (permissions) {
                setPermissions(permissions)
            }
        },
    }
}