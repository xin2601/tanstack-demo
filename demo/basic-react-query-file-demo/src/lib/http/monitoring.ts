import { recordNetworkError, recordCustomEvent } from '@/utils/monitoring'
import { globalErrorHandler } from '@/services/errorHandler'
import * as Sentry from '@sentry/react'
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'redaxios'

/**
 * HTTP监控适配器
 * 将Redaxios的请求/响应与现有监控系统集成
 */
export class HttpMonitoringAdapter {
    /**
     * 记录成功请求的性能指标
     */
    static recordRequest(config: AxiosRequestConfig, response: AxiosResponse, startTime: number) {
        const duration = Date.now() - startTime
        const { url, method = 'GET' } = config
        const fullUrl = this.getFullUrl(config)

        // 记录慢请求（超过5秒）
        if (duration > 5000) {
            recordCustomEvent('slow_request', {
                url: fullUrl,
                method: method.toUpperCase(),
                duration,
                status: response.status,
                requestId: config.metadata?.requestId,
            })

            // 发送慢请求警告到Sentry
            Sentry.captureMessage(`Slow HTTP request: ${method.toUpperCase()} ${fullUrl}`, {
                level: 'warning',
                tags: {
                    type: 'slow_request',
                    method: method.toUpperCase(),
                    status: response.status,
                },
                extra: {
                    url: fullUrl,
                    duration,
                    requestId: config.metadata?.requestId,
                },
            })
        }

        // 记录请求成功事件
        recordCustomEvent('http_request_success', {
            url: fullUrl,
            method: method.toUpperCase(),
            status: response.status,
            duration,
            requestId: config.metadata?.requestId,
        })
    }

    /**
     * 记录请求错误
     */
    static recordError(error: AxiosError, config: AxiosRequestConfig, startTime: number) {
        const duration = Date.now() - startTime
        const { method = 'GET' } = config
        const fullUrl = this.getFullUrl(config)

        if (error.response) {
            // HTTP错误响应（4xx, 5xx）
            const { status, statusText } = error.response

            recordNetworkError(
                fullUrl,
                method.toUpperCase(),
                status,
                statusText,
                duration
            )

            // 5xx错误发送到Sentry
            if (status >= 500) {
                Sentry.captureMessage(`HTTP Server Error: ${status} ${statusText}`, {
                    level: 'error',
                    tags: {
                        type: 'http_server_error',
                        method: method.toUpperCase(),
                        status,
                    },
                    extra: {
                        url: fullUrl,
                        duration,
                        statusText,
                        requestId: config.metadata?.requestId,
                        responseData: error.response.data,
                    },
                })
            } else if (status >= 400) {
                // 4xx错误记录为警告
                Sentry.captureMessage(`HTTP Client Error: ${status} ${statusText}`, {
                    level: 'warning',
                    tags: {
                        type: 'http_client_error',
                        method: method.toUpperCase(),
                        status,
                    },
                    extra: {
                        url: fullUrl,
                        duration,
                        statusText,
                        requestId: config.metadata?.requestId,
                        responseData: error.response.data,
                    },
                })
            }
        } else if (error.request) {
            // 网络错误（无响应）
            recordNetworkError(
                fullUrl,
                method.toUpperCase(),
                0,
                'Network Error',
                duration
            )

            // 发送网络错误到全局错误处理器
            globalErrorHandler.reportError(error, {
                type: 'http_network_error',
                url: fullUrl,
                method: method.toUpperCase(),
                duration,
                requestId: config.metadata?.requestId,
            })

            // 发送到Sentry
            Sentry.captureException(error, {
                tags: {
                    type: 'network_error',
                    method: method.toUpperCase(),
                },
                extra: {
                    url: fullUrl,
                    duration,
                    requestId: config.metadata?.requestId,
                },
            })
        } else {
            // 请求配置错误
            globalErrorHandler.reportError(error, {
                type: 'http_config_error',
                url: fullUrl,
                method: method.toUpperCase(),
                requestId: config.metadata?.requestId,
            })
        }

        // 记录错误事件
        recordCustomEvent('http_request_error', {
            url: fullUrl,
            method: method.toUpperCase(),
            status: error.response?.status || 0,
            duration,
            errorType: error.response ? 'response_error' : error.request ? 'network_error' : 'config_error',
            requestId: config.metadata?.requestId,
        })
    }

    /**
     * 获取完整的请求URL
     */
    private static getFullUrl(config: AxiosRequestConfig): string {
        if (config.url?.startsWith('http')) {
            return config.url
        }

        const baseURL = config.baseURL || ''
        const url = config.url || ''

        return `${baseURL}${url}`.replace(/\/+/g, '/').replace(/:\//g, '://')
    }

    /**
     * 生成请求ID
     */
    static generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
}