import { describe, it, expect, beforeEach, vi } from 'vitest'
import { monitoringConfig } from '@/config/monitoring'
import {
    generateId,
    getSessionId,
    shouldIgnoreError,
    formatErrorInfo,
    recordPerformanceMetric
} from '@/utils/monitoring'
import { WebVitalsCollector } from '@/services/webVitals'
import { GlobalErrorHandler } from '@/services/errorHandler'

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
})

// Mock fetch
global.fetch = vi.fn()

describe('监控配置', () => {
    it('应该有正确的默认配置', () => {
        expect(monitoringConfig.enableErrorTracking).toBe(true)
        expect(monitoringConfig.enablePerformanceTracking).toBe(true)
        expect(monitoringConfig.enableWebVitals).toBe(true)
        expect(monitoringConfig.environment).toBe('development')
    })
})

describe('监控工具函数', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应该生成唯一ID', () => {
        const id1 = generateId()
        const id2 = generateId()

        expect(id1).toBeTruthy()
        expect(id2).toBeTruthy()
        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^\d+-[a-z0-9]+$/)
    })

    it('应该获取或创建会话ID', () => {
        sessionStorageMock.getItem.mockReturnValue(null)

        const sessionId = getSessionId()

        expect(sessionId).toBeTruthy()
        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('monitoring_session_id', sessionId)
    })

    it('应该正确过滤错误', () => {
        const scriptError = new Error('Script error')
        const normalError = new Error('Normal error')

        expect(shouldIgnoreError(scriptError)).toBe(true)
        expect(shouldIgnoreError(normalError)).toBe(false)
    })

    it('应该格式化错误信息', () => {
        const error = new Error('Test error')
        const errorInfo = formatErrorInfo(error, { componentStack: 'test stack' }, 'TestBoundary')

        expect(errorInfo.message).toBe('Test error')
        expect(errorInfo.componentStack).toBe('test stack')
        expect(errorInfo.errorBoundary).toBe('TestBoundary')
        expect(errorInfo.timestamp).toBeTruthy()
        expect(errorInfo.sessionId).toBeTruthy()
    })
})

describe('Web Vitals收集器', () => {
    let collector: WebVitalsCollector

    beforeEach(() => {
        vi.clearAllMocks()
        collector = new WebVitalsCollector()
    })

    it('应该能够获取指标摘要', () => {
        const summary = collector.getMetricsSummary()
        expect(summary).toBeDefined()
        expect(typeof summary).toBe('object')
    })

    it('应该能够清除指标', () => {
        collector.clearMetrics()
        const metrics = collector.getMetrics()
        expect(metrics).toHaveLength(0)
    })

    it('应该正确评估性能等级', () => {
        expect(collector.getRating('LCP', 2000)).toBe('good')
        expect(collector.getRating('LCP', 3000)).toBe('needs-improvement')
        expect(collector.getRating('LCP', 5000)).toBe('poor')
    })
})

describe('全局错误处理器', () => {
    let errorHandler: GlobalErrorHandler

    beforeEach(() => {
        vi.clearAllMocks()
        errorHandler = new GlobalErrorHandler()
    })

    it('应该能够手动报告错误', () => {
        const error = new Error('Test error')
        const context = { type: 'test' }

        errorHandler.reportError(error, context)

        const errorQueue = errorHandler.getErrorQueue()
        expect(errorQueue).toHaveLength(1)
        expect(errorQueue[0].error.message).toBe('Test error')
        expect(errorQueue[0].context.type).toBe('manual_report')
    })

    it('应该能够获取错误统计', () => {
        const error = new Error('Test error')
        errorHandler.reportError(error, { type: 'test' })

        const stats = errorHandler.getErrorStats()
        expect(stats.total).toBe(1)
        expect(stats.byType['manual_report']).toBe(1)
    })

    it('应该能够清空错误队列', () => {
        const error = new Error('Test error')
        errorHandler.reportError(error)

        errorHandler.clearErrorQueue()
        const errorQueue = errorHandler.getErrorQueue()
        expect(errorQueue).toHaveLength(0)
    })
})

describe('性能监控', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('应该能够记录性能指标', () => {
        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response())
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

        recordPerformanceMetric('test_metric', 100)

        // 在开发环境中不会发送到API，但会打印日志
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })
})