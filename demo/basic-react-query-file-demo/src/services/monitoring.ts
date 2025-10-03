import * as Sentry from '@sentry/react'
import { monitoringConfig, sentryConfig } from '@/config/monitoring'
import { initWebVitals } from './webVitals'
import { initErrorHandling } from './errorHandler'
import { cleanupExpiredSessions, monitorResourcePerformance } from '@/utils/monitoring'

// 监控服务类
export class MonitoringService {
    private isInitialized = false

    constructor() {
        this.init()
    }

    private init() {
        if (this.isInitialized) {
            return
        }

        this.isInitialized = true

        // 初始化Sentry
        this.initSentry()

        // 初始化Web Vitals监控
        this.initWebVitals()

        // 初始化错误处理
        this.initErrorHandling()

        // 初始化性能监控
        this.initPerformanceMonitoring()

        // 设置定期清理任务
        this.setupCleanupTasks()

        console.log('Monitoring service initialized')
    }

    private initSentry() {
        if (!sentryConfig.dsn) {
            console.warn('Sentry DSN not configured, skipping Sentry initialization')
            return
        }

        Sentry.init({
            ...sentryConfig,
            integrations: [
                // 基础集成，不使用高级功能避免导入错误
            ],
            // 性能监控
            tracesSampleRate: sentryConfig.tracesSampleRate,
        })

        // 设置用户上下文
        this.setupUserContext()
    }

    private setupUserContext() {
        // 从localStorage获取用户信息
        const userId = localStorage.getItem('userId')
        const userEmail = localStorage.getItem('userEmail')

        if (userId || userEmail) {
            Sentry.setUser({
                id: userId || undefined,
                email: userEmail || undefined,
            })
        }

        // 设置应用上下文
        Sentry.setContext('app', {
            name: 'TanStack React Query Demo',
            version: '1.0.0',
            environment: monitoringConfig.environment,
        })

        // 设置设备信息
        Sentry.setContext('device', {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
        })
    }

    private initWebVitals() {
        if (monitoringConfig.enableWebVitals) {
            initWebVitals()
        }
    }

    private initErrorHandling() {
        if (monitoringConfig.enableErrorTracking) {
            initErrorHandling()
        }
    }

    private initPerformanceMonitoring() {
        if (monitoringConfig.enablePerformanceTracking) {
            // 监控资源加载性能
            monitorResourcePerformance()

            // 监控页面可见性变化
            this.setupVisibilityMonitoring()

            // 监控内存使用情况
            this.setupMemoryMonitoring()
        }
    }

    private setupVisibilityMonitoring() {
        let visibilityStart = Date.now()

        document.addEventListener('visibilitychange', () => {
            const now = Date.now()

            if (document.visibilityState === 'visible') {
                visibilityStart = now

                // 记录页面变为可见
                Sentry.addBreadcrumb({
                    category: 'navigation',
                    message: 'Page became visible',
                    level: 'info',
                })
            } else {
                // 记录页面隐藏时长
                const hiddenDuration = now - visibilityStart

                Sentry.addBreadcrumb({
                    category: 'navigation',
                    message: 'Page became hidden',
                    level: 'info',
                    data: {
                        visibleDuration: hiddenDuration,
                    },
                })
            }
        })
    }

    private setupMemoryMonitoring() {
        // 检查是否支持内存API
        if ('memory' in performance) {
            const checkMemory = () => {
                const memory = (performance as any).memory

                // 如果内存使用超过阈值，发送警告
                const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit

                if (memoryUsage > 0.9) {
                    Sentry.captureMessage('High memory usage detected', {
                        level: 'warning',
                        extra: {
                            usedJSHeapSize: memory.usedJSHeapSize,
                            totalJSHeapSize: memory.totalJSHeapSize,
                            jsHeapSizeLimit: memory.jsHeapSizeLimit,
                            usagePercentage: memoryUsage * 100,
                        },
                    })
                }
            }

            // 每30秒检查一次内存使用情况
            setInterval(checkMemory, 30000)
        }
    }

    private setupCleanupTasks() {
        // 每小时清理一次过期的会话数据
        setInterval(() => {
            cleanupExpiredSessions()
        }, 60 * 60 * 1000)

        // 页面卸载时清理
        window.addEventListener('beforeunload', () => {
            cleanupExpiredSessions()
        })
    }

    // 手动设置用户信息
    public setUser(user: { id?: string; email?: string; username?: string }) {
        Sentry.setUser(user)

        // 保存到localStorage
        if (user.id) localStorage.setItem('userId', user.id)
        if (user.email) localStorage.setItem('userEmail', user.email)
    }

    // 添加自定义标签
    public setTag(key: string, value: string) {
        Sentry.setTag(key, value)
    }

    // 添加自定义上下文
    public setContext(key: string, context: any) {
        Sentry.setContext(key, context)
    }

    // 手动发送事件
    public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
        Sentry.captureMessage(message, { level })
    }

    // 手动发送异常
    public captureException(error: Error) {
        Sentry.captureException(error)
    }

    // 添加面包屑
    public addBreadcrumb(breadcrumb: {
        message: string
        category?: string
        level?: 'info' | 'warning' | 'error'
        data?: any
    }) {
        Sentry.addBreadcrumb(breadcrumb)
    }

    // 获取监控状态
    public getStatus() {
        return {
            initialized: this.isInitialized,
            config: {
                errorTracking: monitoringConfig.enableErrorTracking,
                performanceTracking: monitoringConfig.enablePerformanceTracking,
                webVitals: monitoringConfig.enableWebVitals,
                environment: monitoringConfig.environment,
                sampleRate: monitoringConfig.sampleRate,
            },
            sentry: {
                dsn: !!sentryConfig.dsn,
                environment: sentryConfig.environment,
            },
        }
    }
}

// 全局监控服务实例
export const monitoringService = new MonitoringService()

// 导出便捷函数
export const {
    setUser,
    setTag,
    setContext,
    captureMessage,
    captureException,
    addBreadcrumb,
    getStatus,
} = monitoringService

// 初始化监控服务
export const initMonitoring = () => {
    // 监控服务已经在构造函数中初始化
    return monitoringService
}

// React Router相关导入（需要在实际使用时导入）
// 这里先用any类型避免编译错误
const React = { useEffect: (...args: any[]) => { } }
const useLocation = () => ({})
const useNavigationType = () => 'POP'
const createRoutesFromChildren = (...args: any[]) => []
const matchRoutes = (...args: any[]) => []