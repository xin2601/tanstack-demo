import * as Sentry from '@sentry/react'
import { monitoringConfig, errorFilters } from '@/config/monitoring'
import {
    formatErrorInfo,
    shouldIgnoreError,
    updateSessionStats,
    recordNetworkError,
    recordCustomEvent
} from '@/utils/monitoring'

// 全局错误处理器类
export class GlobalErrorHandler {
    private isInitialized = false
    private errorQueue: Array<{ error: Error; context?: any }> = []
    private maxQueueSize = 100

    constructor() {
        this.init()
    }

    private init() {
        if (!monitoringConfig.enableErrorTracking || this.isInitialized) {
            return
        }

        this.isInitialized = true
        this.setupGlobalHandlers()
    }

    private setupGlobalHandlers() {
        // 捕获未处理的JavaScript错误
        window.addEventListener('error', this.handleGlobalError.bind(this))

        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))

        // 监听网络错误
        this.setupNetworkErrorMonitoring()

        // 监听资源加载错误
        this.setupResourceErrorMonitoring()

        // 定期清理错误队列
        setInterval(() => this.cleanupErrorQueue(), 60000) // 每分钟清理一次
    }

    private handleGlobalError(event: ErrorEvent) {
        const error = event.error || new Error(event.message)

        // 检查是否应该忽略此错误
        if (shouldIgnoreError(error, event.filename)) {
            return
        }

        // 格式化错误信息
        const errorInfo = formatErrorInfo(error, {
            componentStack: `at ${event.filename}:${event.lineno}:${event.colno}`
        }, 'GlobalErrorHandler')

        // 添加额外的上下文信息
        const context = {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: 'javascript_error',
        }

        this.processError(error, context, errorInfo)
    }

    private handleUnhandledRejection(event: PromiseRejectionEvent) {
        const error = event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason))

        // 检查是否应该忽略此错误
        if (shouldIgnoreError(error)) {
            return
        }

        // 格式化错误信息
        const errorInfo = formatErrorInfo(error, {}, 'GlobalErrorHandler')

        // 添加额外的上下文信息
        const context = {
            type: 'unhandled_promise_rejection',
            reason: event.reason,
        }

        this.processError(error, context, errorInfo)

        // 阻止默认的控制台错误输出
        if (monitoringConfig.environment === 'production') {
            event.preventDefault()
        }
    }

    private setupNetworkErrorMonitoring() {
        // 监听fetch请求
        const originalFetch = window.fetch
        window.fetch = async (...args) => {
            const startTime = Date.now()
            const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url
            const method = args[1]?.method || 'GET'

            try {
                const response = await originalFetch(...args)
                const duration = Date.now() - startTime

                // 记录慢请求
                if (duration > 5000) { // 超过5秒的请求
                    recordCustomEvent('slow_request', {
                        url,
                        method,
                        duration,
                        status: response.status,
                    })
                }

                // 记录HTTP错误
                if (!response.ok) {
                    recordNetworkError(
                        url,
                        method,
                        response.status,
                        response.statusText,
                        duration
                    )

                    // 如果是严重错误，发送到Sentry
                    if (response.status >= 500) {
                        Sentry.captureMessage(`Network Error: ${response.status} ${response.statusText}`, {
                            level: 'error',
                            tags: {
                                url,
                                method,
                                status: response.status,
                            },
                            extra: {
                                duration,
                                statusText: response.statusText,
                            },
                        })
                    }
                }

                return response
            } catch (error) {
                const duration = Date.now() - startTime

                recordNetworkError(
                    url,
                    method,
                    0,
                    'Network Error',
                    duration
                )

                // 发送网络错误到Sentry
                Sentry.captureException(error, {
                    tags: {
                        type: 'network_error',
                        url,
                        method,
                    },
                    extra: {
                        duration,
                    },
                })

                throw error
            }
        }

        // 监听XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open
        const originalXHRSend = XMLHttpRequest.prototype.send

        XMLHttpRequest.prototype.open = function (method: string, url: string, async?: boolean, user?: string | null, password?: string | null) {
            this._monitoringData = {
                method,
                url,
                startTime: 0,
            }
            return originalXHROpen.call(this, method, url, async ?? true, user, password)
        }

        XMLHttpRequest.prototype.send = function (...args: any[]) {
            if (this._monitoringData) {
                this._monitoringData.startTime = Date.now()

                this.addEventListener('loadend', () => {
                    if (this._monitoringData) {
                        const duration = Date.now() - this._monitoringData.startTime
                        const { method, url } = this._monitoringData

                        if (this.status >= 400) {
                            recordNetworkError(
                                url,
                                method,
                                this.status,
                                this.statusText,
                                duration
                            )
                        }
                    }
                })
            }

            return originalXHRSend.call(this, ...args)
        }
    }

    private setupResourceErrorMonitoring() {
        // 监听资源加载错误
        window.addEventListener('error', (event) => {
            const target = event.target as Element

            if (target && target !== (window as any)) {
                const resourceType = target.tagName?.toLowerCase()
                const resourceUrl = (target as any).src || (target as any).href

                if (resourceUrl) {
                    recordCustomEvent('resource_error', {
                        type: resourceType,
                        url: resourceUrl,
                        message: event.message || 'Resource failed to load',
                    })

                    // 发送资源错误到Sentry
                    Sentry.captureMessage(`Resource Error: ${resourceType} failed to load`, {
                        level: 'warning',
                        tags: {
                            type: 'resource_error',
                            resourceType,
                        },
                        extra: {
                            url: resourceUrl,
                        },
                    })
                }
            }
        }, true) // 使用捕获阶段
    }

    private processError(error: Error, context: any, errorInfo: any) {
        // 更新会话统计
        updateSessionStats('error')

        // 添加到错误队列
        this.addToErrorQueue(error, context)

        // 发送到Sentry
        Sentry.withScope((scope) => {
            scope.setTag('errorHandler', 'global')
            scope.setContext('errorContext', context)
            scope.setLevel('error')

            // 添加用户信息（如果有）
            const userId = localStorage.getItem('userId')
            if (userId) {
                scope.setUser({ id: userId })
            }

            Sentry.captureException(error)
        })

        // 记录自定义事件
        recordCustomEvent('error_occurred', {
            message: error.message,
            stack: error.stack,
            type: context.type,
            url: window.location.href,
        })

        // 在开发环境中打印错误
        if (monitoringConfig.environment === 'development') {
            console.error('Global Error Handler:', error)
            console.error('Context:', context)
        }
    }

    private addToErrorQueue(error: Error, context?: any) {
        // 防止队列过大
        if (this.errorQueue.length >= this.maxQueueSize) {
            this.errorQueue.shift() // 移除最旧的错误
        }

        this.errorQueue.push({
            error,
            context,
        })
    }

    private cleanupErrorQueue() {
        // 保留最近的50个错误
        if (this.errorQueue.length > 50) {
            this.errorQueue = this.errorQueue.slice(-50)
        }
    }

    // 手动报告错误
    public reportError(error: Error, context?: any) {
        if (!shouldIgnoreError(error)) {
            const errorInfo = formatErrorInfo(error, {}, 'ManualReport')
            this.processError(error, { ...context, type: 'manual_report' }, errorInfo)
        }
    }

    // 获取错误队列
    public getErrorQueue() {
        return [...this.errorQueue]
    }

    // 清空错误队列
    public clearErrorQueue() {
        this.errorQueue = []
    }

    // 获取错误统计
    public getErrorStats() {
        const stats = {
            total: this.errorQueue.length,
            byType: {} as Record<string, number>,
            recent: this.errorQueue.slice(-10),
        }

        this.errorQueue.forEach(({ context }) => {
            const type = context?.type || 'unknown'
            stats.byType[type] = (stats.byType[type] || 0) + 1
        })

        return stats
    }
}

// 全局错误处理器实例
export const globalErrorHandler = new GlobalErrorHandler()

// 初始化全局错误处理
export const initErrorHandling = () => {
    if (!monitoringConfig.enableErrorTracking) {
        return
    }

    // 错误处理器已经在构造函数中初始化
    console.log('Global error handling initialized')
}

// 手动报告错误的便捷函数
export const reportError = (error: Error, context?: any) => {
    globalErrorHandler.reportError(error, context)
}

// 扩展XMLHttpRequest类型
declare global {
    interface XMLHttpRequest {
        _monitoringData?: {
            method: string
            url: string
            startTime: number
        }
    }
}