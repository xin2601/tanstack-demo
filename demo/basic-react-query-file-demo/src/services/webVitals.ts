import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'
import type { WebVitalsMetric } from '@/types/monitoring'
import { monitoringConfig, webVitalsConfig, performanceThresholds } from '@/config/monitoring'
import { getSessionId, recordCustomEvent } from '@/utils/monitoring'
import * as Sentry from '@sentry/react'

// Web Vitals指标收集器
export class WebVitalsCollector {
    private metrics: WebVitalsMetric[] = []
    private isInitialized = false

    constructor() {
        this.init()
    }

    private init() {
        if (!monitoringConfig.enableWebVitals || this.isInitialized) {
            return
        }

        this.isInitialized = true
        this.collectMetrics()
    }

    private collectMetrics() {
        // Cumulative Layout Shift (CLS)
        onCLS((metric: any) => {
            this.handleMetric({
                name: 'CLS',
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
            })
        }, webVitalsConfig)

        // Interaction to Next Paint (INP) - 替代FID
        onINP((metric: any) => {
            this.handleMetric({
                name: 'FID',
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
            })
        }, webVitalsConfig)

        // First Contentful Paint (FCP)
        onFCP((metric: any) => {
            this.handleMetric({
                name: 'FCP',
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
            })
        }, webVitalsConfig)

        // Largest Contentful Paint (LCP)
        onLCP((metric: any) => {
            this.handleMetric({
                name: 'LCP',
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
            })
        }, webVitalsConfig)

        // Time to First Byte (TTFB)
        onTTFB((metric: any) => {
            this.handleMetric({
                name: 'TTFB',
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
            })
        }, webVitalsConfig)
    }

    private handleMetric(metric: WebVitalsMetric) {
        // 存储指标
        this.metrics.push(metric)

        // 评估性能等级
        const rating = this.getRating(metric.name, metric.value)

        // 发送到监控服务
        this.sendMetric(metric, rating)

        // 记录自定义事件
        recordCustomEvent('web_vital', {
            name: metric.name,
            value: metric.value,
            rating,
            id: metric.id,
        })

        // 发送到Sentry
        Sentry.addBreadcrumb({
            category: 'web-vital',
            message: `${metric.name}: ${metric.value}`,
            level: rating === 'poor' ? 'warning' : 'info',
            data: {
                name: metric.name,
                value: metric.value,
                rating,
                id: metric.id,
            },
        })

        // 在开发环境中打印
        if (monitoringConfig.environment === 'development') {
            console.log(`Web Vital - ${metric.name}:`, {
                value: metric.value,
                rating,
                threshold: performanceThresholds[metric.name],
            })
        }

        // 如果性能很差，发送警告
        if (rating === 'poor') {
            this.handlePoorPerformance(metric, rating)
        }
    }

    public getRating(name: WebVitalsMetric['name'], value: number): 'good' | 'needs-improvement' | 'poor' {
        const threshold = performanceThresholds[name]
        if (!threshold) return 'good'

        if (value <= threshold.good) return 'good'
        if (value <= threshold.needsImprovement) return 'needs-improvement'
        return 'poor'
    }

    private async sendMetric(metric: WebVitalsMetric, rating: string) {
        if (!monitoringConfig.apiEndpoint) return

        try {
            await fetch(`${monitoringConfig.apiEndpoint}/web-vitals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...metric,
                    rating,
                    sessionId: getSessionId(),
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                }),
            })
        } catch (error) {
            console.error('Failed to send web vital metric:', error)
        }
    }

    private handlePoorPerformance(metric: WebVitalsMetric, rating: string) {
        // 发送性能警告到Sentry
        Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
            level: 'warning',
            tags: {
                webVital: metric.name,
                rating,
            },
            extra: {
                value: metric.value,
                threshold: performanceThresholds[metric.name],
                url: window.location.href,
            },
        })

        // 记录性能问题事件
        recordCustomEvent('performance_issue', {
            type: 'web_vital',
            metric: metric.name,
            value: metric.value,
            rating,
            threshold: performanceThresholds[metric.name],
        })
    }

    // 获取所有收集的指标
    public getMetrics(): WebVitalsMetric[] {
        return [...this.metrics]
    }

    // 获取指标摘要
    public getMetricsSummary() {
        const summary: Record<string, { value: number; rating: string }> = {}

        this.metrics.forEach((metric) => {
            if (!summary[metric.name] || metric.timestamp > summary[metric.name].value) {
                summary[metric.name] = {
                    value: metric.value,
                    rating: this.getRating(metric.name, metric.value),
                }
            }
        })

        return summary
    }

    // 清除指标
    public clearMetrics() {
        this.metrics = []
    }
}

// 全局Web Vitals收集器实例
export const webVitalsCollector = new WebVitalsCollector()

// 初始化Web Vitals监控
export const initWebVitals = () => {
    if (!monitoringConfig.enableWebVitals) {
        return
    }

    // 页面可见性变化时重新收集指标
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // 页面隐藏时发送最终指标
            webVitalsCollector.getMetrics().forEach((metric) => {
                recordCustomEvent('web_vital_final', {
                    name: metric.name,
                    value: metric.value,
                    rating: webVitalsCollector.getRating(metric.name, metric.value),
                })
            })
        }
    })

    // 页面卸载时发送指标
    window.addEventListener('beforeunload', () => {
        const summary = webVitalsCollector.getMetricsSummary()

        // 使用sendBeacon发送最终数据
        if (navigator.sendBeacon && monitoringConfig.apiEndpoint) {
            navigator.sendBeacon(
                `${monitoringConfig.apiEndpoint}/web-vitals-summary`,
                JSON.stringify({
                    summary,
                    sessionId: getSessionId(),
                    url: window.location.href,
                    timestamp: Date.now(),
                })
            )
        }
    })
}

// 手动触发Web Vitals收集
export const collectWebVitals = () => {
    return new Promise<WebVitalsMetric[]>((resolve) => {
        const metrics: WebVitalsMetric[] = []
        let collected = 0
        const total = 5 // CLS, FID, FCP, LCP, TTFB

        const handleMetric = (metric: any, name: WebVitalsMetric['name']) => {
            metrics.push({
                name,
                value: metric.value,
                delta: metric.delta,
                id: metric.id,
                timestamp: Date.now(),
            })

            collected++
            if (collected === total) {
                resolve(metrics)
            }
        }

        // 收集所有指标
        onCLS((metric: any) => handleMetric(metric, 'CLS'))
        onINP((metric: any) => handleMetric(metric, 'FID'))
        onFCP((metric: any) => handleMetric(metric, 'FCP'))
        onLCP((metric: any) => handleMetric(metric, 'LCP'))
        onTTFB((metric: any) => handleMetric(metric, 'TTFB'))

        // 超时处理
        setTimeout(() => {
            if (collected < total) {
                resolve(metrics)
            }
        }, 5000)
    })
}