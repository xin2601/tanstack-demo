// 监控相关类型定义
export interface ErrorInfo {
    message: string
    stack?: string
    componentStack?: string
    errorBoundary?: string
    timestamp: number
    url: string
    userAgent: string
    userId?: string
    sessionId: string
}

export interface PerformanceMetric {
    name: string
    value: number
    timestamp: number
    url: string
    sessionId: string
}

export interface WebVitalsMetric {
    name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
    value: number
    delta: number
    id: string
    timestamp: number
}

export interface MonitoringConfig {
    enableErrorTracking: boolean
    enablePerformanceTracking: boolean
    enableWebVitals: boolean
    sampleRate: number
    environment: 'development' | 'production' | 'staging'
    apiEndpoint?: string
    sentryDsn?: string
}

export interface UserSession {
    sessionId: string
    userId?: string
    startTime: number
    lastActivity: number
    pageViews: number
    errors: number
}

export interface NetworkError {
    url: string
    method: string
    status: number
    statusText: string
    timestamp: number
    duration: number
    sessionId: string
}

export interface CustomEvent {
    name: string
    properties: Record<string, any>
    timestamp: number
    sessionId: string
}