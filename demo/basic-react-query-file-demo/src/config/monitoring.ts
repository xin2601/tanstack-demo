import type { MonitoringConfig } from '@/types/monitoring'

// 监控配置
export const monitoringConfig: MonitoringConfig = {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableWebVitals: true,
    sampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 生产环境采样率10%，开发环境100%
    environment: import.meta.env.PROD ? 'production' : 'development',
    apiEndpoint: import.meta.env.VITE_MONITORING_API_ENDPOINT,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
}

// Sentry配置
export const sentryConfig = {
    dsn: monitoringConfig.sentryDsn,
    environment: monitoringConfig.environment,
    sampleRate: monitoringConfig.sampleRate,
    tracesSampleRate: monitoringConfig.sampleRate,
    integrations: [
        // 将在监控服务中配置
    ],
    beforeSend(event: any) {
        // 在开发环境中打印错误信息
        if (monitoringConfig.environment === 'development') {
            console.error('Sentry Error:', event)
        }
        return event
    },
}

// Web Vitals配置
export const webVitalsConfig = {
    reportAllChanges: monitoringConfig.environment === 'development',
}

// 性能监控阈值
export const performanceThresholds = {
    // Core Web Vitals阈值
    LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
    FID: { good: 100, needsImprovement: 300 },   // First Input Delay
    CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
    TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte

    // 自定义性能阈值
    apiResponse: { good: 1000, needsImprovement: 3000 },
    pageLoad: { good: 3000, needsImprovement: 5000 },
    routeChange: { good: 500, needsImprovement: 1000 },
}

// 错误过滤规则
export const errorFilters = {
    // 忽略的错误消息模式
    ignoreMessages: [
        /Script error/,
        /Non-Error promise rejection captured/,
        /ResizeObserver loop limit exceeded/,
        /ChunkLoadError/,
    ],

    // 忽略的URL模式
    ignoreUrls: [
        /extensions\//,
        /^chrome:\/\//,
        /^moz-extension:\/\//,
    ],

    // 忽略的错误类型
    ignoreErrors: [
        'Network Error',
        'NetworkError',
        'AbortError',
    ],
}