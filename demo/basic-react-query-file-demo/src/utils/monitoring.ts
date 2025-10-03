import type {
    ErrorInfo,
    PerformanceMetric,
    UserSession,
    NetworkError,
    CustomEvent
} from '@/types/monitoring'
import { monitoringConfig, errorFilters } from '@/config/monitoring'

// 生成唯一ID
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 获取或创建会话ID
export const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('monitoring_session_id')
    if (!sessionId) {
        sessionId = generateId()
        sessionStorage.setItem('monitoring_session_id', sessionId)
    }
    return sessionId
}

// 获取用户会话信息
export const getUserSession = (): UserSession => {
    const sessionId = getSessionId()
    const stored = localStorage.getItem(`session_${sessionId}`)

    if (stored) {
        const session = JSON.parse(stored)
        session.lastActivity = Date.now()
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(session))
        return session
    }

    const newSession: UserSession = {
        sessionId,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: 1,
        errors: 0,
    }

    localStorage.setItem(`session_${sessionId}`, JSON.stringify(newSession))
    return newSession
}

// 更新会话统计
export const updateSessionStats = (type: 'pageView' | 'error'): void => {
    const session = getUserSession()

    if (type === 'pageView') {
        session.pageViews++
    } else if (type === 'error') {
        session.errors++
    }

    session.lastActivity = Date.now()
    localStorage.setItem(`session_${session.sessionId}`, JSON.stringify(session))
}

// 检查错误是否应该被忽略
export const shouldIgnoreError = (error: Error | string, url?: string): boolean => {
    const message = typeof error === 'string' ? error : error.message

    // 检查错误消息
    if (errorFilters.ignoreMessages.some(pattern => pattern.test(message))) {
        return true
    }

    // 检查错误类型
    if (errorFilters.ignoreErrors.includes(message)) {
        return true
    }

    // 检查URL
    if (url && errorFilters.ignoreUrls.some(pattern => pattern.test(url))) {
        return true
    }

    return false
}

// 格式化错误信息
export const formatErrorInfo = (
    error: Error,
    errorInfo?: { componentStack?: string },
    errorBoundary?: string
): ErrorInfo => {
    return {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        errorBoundary,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
    }
}

// 记录性能指标
export const recordPerformanceMetric = (name: string, value: number): void => {
    if (!monitoringConfig.enablePerformanceTracking) return

    const metric: PerformanceMetric = {
        name,
        value,
        timestamp: Date.now(),
        url: window.location.href,
        sessionId: getSessionId(),
    }

    // 发送到监控服务
    sendMetricToService(metric)

    // 在开发环境中打印
    if (monitoringConfig.environment === 'development') {
        console.log(`Performance Metric: ${name} = ${value}ms`)
    }
}

// 记录网络错误
export const recordNetworkError = (
    url: string,
    method: string,
    status: number,
    statusText: string,
    duration: number
): void => {
    const networkError: NetworkError = {
        url,
        method,
        status,
        statusText,
        timestamp: Date.now(),
        duration,
        sessionId: getSessionId(),
    }

    sendErrorToService(networkError)
}

// 记录自定义事件
export const recordCustomEvent = (name: string, properties: Record<string, any> = {}): void => {
    const event: CustomEvent = {
        name,
        properties,
        timestamp: Date.now(),
        sessionId: getSessionId(),
    }

    sendEventToService(event)
}

// 发送指标到监控服务
const sendMetricToService = async (metric: PerformanceMetric): Promise<void> => {
    if (!monitoringConfig.apiEndpoint) return

    try {
        await fetch(`${monitoringConfig.apiEndpoint}/metrics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metric),
        })
    } catch (error) {
        console.error('Failed to send metric:', error)
    }
}

// 发送错误到监控服务
const sendErrorToService = async (error: NetworkError | ErrorInfo): Promise<void> => {
    if (!monitoringConfig.apiEndpoint) return

    try {
        await fetch(`${monitoringConfig.apiEndpoint}/errors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(error),
        })
    } catch (err) {
        console.error('Failed to send error:', err)
    }
}

// 发送事件到监控服务
const sendEventToService = async (event: CustomEvent): Promise<void> => {
    if (!monitoringConfig.apiEndpoint) return

    try {
        await fetch(`${monitoringConfig.apiEndpoint}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        })
    } catch (error) {
        console.error('Failed to send event:', error)
    }
}

// 获取页面性能信息
export const getPagePerformance = (): Record<string, number> => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (!navigation) return {}

    return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
    }
}

// 监控资源加载性能
export const monitorResourcePerformance = (): void => {
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
                const resourceEntry = entry as PerformanceResourceTiming
                recordPerformanceMetric(`resource_${resourceEntry.name}`, resourceEntry.duration)
            }
        })
    })

    observer.observe({ entryTypes: ['resource'] })
}

// 清理过期的会话数据
export const cleanupExpiredSessions = (): void => {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('session_')) {
            try {
                const session = JSON.parse(localStorage.getItem(key) || '{}')
                if (now - session.lastActivity > maxAge) {
                    localStorage.removeItem(key)
                }
            } catch (error) {
                localStorage.removeItem(key)
            }
        }
    })
}