/**
 * Zustand Store 配置和工具函数
 */

import { StateCreator } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import type { PersistOptions } from 'zustand/middleware'

// 开发环境检测
const isDev = import.meta.env.DEV

// Store 配置选项
export interface StoreConfig {
  name: string
  persist?: boolean
  persistOptions?: Partial<PersistOptions<any>>
  devtools?: boolean
  subscribeWithSelector?: boolean
}

// 创建带中间件的 Store
export function createStoreWithMiddleware<T>(
  stateCreator: StateCreator<T, [], [], T>,
  config: StoreConfig
): StateCreator<T, [], [], T> {
  let store: any = stateCreator

  // 添加 subscribeWithSelector 中间件
  if (config.subscribeWithSelector) {
    store = subscribeWithSelector(store)
  }

  // 添加持久化中间件
  if (config.persist) {
    const persistOptions: PersistOptions<T> = {
      name: `${config.name}-storage`,
      // 默认使用 localStorage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      // 合并自定义选项
      ...config.persistOptions,
    }
    
    store = persist(store, persistOptions)
  }

  // 添加 devtools 中间件（仅在开发环境）
  if (config.devtools && isDev) {
    store = devtools(store, { name: config.name })
  }

  return store
}

// 通用的错误处理
export function handleStoreError(error: unknown, context: string): string {
    console.error(`[Store Error] ${context}:`, error)

    if (error instanceof Error) {
        return error.message
    }

    return typeof error === 'string' ? error : '未知错误'
}

// 生成唯一 ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 深度合并对象
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target }

    for (const key in source) {
        if (source[key] !== undefined) {
            if (
                typeof source[key] === 'object' &&
                source[key] !== null &&
                !Array.isArray(source[key]) &&
                typeof target[key] === 'object' &&
                target[key] !== null &&
                !Array.isArray(target[key])
            ) {
                result[key] = deepMerge(target[key], source[key] as any)
            } else {
                result[key] = source[key] as any
            }
        }
    }

    return result
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
            func(...args)
        }, wait)
    }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let lastTime = 0

    return (...args: Parameters<T>) => {
        const now = Date.now()

        if (now - lastTime >= wait) {
            lastTime = now
            func(...args)
        }
    }
}

// 本地存储工具
export const storage = {
    get: <T>(key: string, defaultValue?: T): T | null => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue ?? null
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error)
            return defaultValue ?? null
        }
    },

    set: (key: string, value: any): void => {
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error)
        }
    },

    remove: (key: string): void => {
        try {
            localStorage.removeItem(key)
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error)
        }
    },

    clear: (): void => {
        try {
            localStorage.clear()
        } catch (error) {
            console.error('Error clearing localStorage:', error)
        }
    },
}

// 会话存储工具
export const sessionStorage = {
    get: <T>(key: string, defaultValue?: T): T | null => {
        try {
            const item = window.sessionStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue ?? null
        } catch (error) {
            console.error(`Error reading from sessionStorage key "${key}":`, error)
            return defaultValue ?? null
        }
    },

    set: (key: string, value: any): void => {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error writing to sessionStorage key "${key}":`, error)
        }
    },

    remove: (key: string): void => {
        try {
            window.sessionStorage.removeItem(key)
        } catch (error) {
            console.error(`Error removing sessionStorage key "${key}":`, error)
        }
    },

    clear: (): void => {
        try {
            window.sessionStorage.clear()
        } catch (error) {
            console.error('Error clearing sessionStorage:', error)
        }
    },
}

// Store 重置工具
export function createResetters<T extends Record<string, any>>(
    initialState: T
): Record<keyof T, () => void> {
    const resetters = {} as Record<keyof T, () => void>

    for (const key in initialState) {
        resetters[key] = () => {
            // 这里需要在具体的 store 中实现重置逻辑
            console.log(`Reset ${String(key)} to initial state`)
        }
    }

    return resetters
}