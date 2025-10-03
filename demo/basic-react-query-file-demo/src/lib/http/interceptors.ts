import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'redaxios'
import { HttpMonitoringAdapter } from './monitoring'

/**
 * 设置Redaxios拦截器
 * 集成现有的监控和错误处理系统
 */
export function setupInterceptors(client: AxiosInstance) {
    // 请求拦截器
    client.interceptors.request.use(
        (config: AxiosRequestConfig) => {
            // 添加请求元数据
            const requestId = HttpMonitoringAdapter.generateRequestId()
            config.metadata = {
                startTime: Date.now(),
                requestId,
            }

            // 添加认证token
            const token = localStorage.getItem('authToken')
            if (token) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
                }
            }

            // 添加请求ID到headers
            config.headers = {
                ...config.headers,
                'X-Request-ID': requestId,
            }

            // 添加用户信息（如果有）
            const userId = localStorage.getItem('userId')
            if (userId) {
                config.headers = {
                    ...config.headers,
                    'X-User-ID': userId,
                }
            }

            // 添加会话ID
            const sessionId = sessionStorage.getItem('monitoring_session_id')
            if (sessionId) {
                config.headers = {
                    ...config.headers,
                    'X-Session-ID': sessionId,
                }
            }

            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    // 响应拦截器
    client.interceptors.response.use(
        (response: AxiosResponse) => {
            // 记录成功请求
            const { config } = response
            if (config.metadata?.startTime && !config.skipMonitoring) {
                HttpMonitoringAdapter.recordRequest(config, response, config.metadata.startTime)
            }

            return response
        },
        (error: AxiosError) => {
            // 记录错误请求
            const { config } = error
            if (config?.metadata?.startTime && !config.skipMonitoring) {
                HttpMonitoringAdapter.recordError(error, config, config.metadata.startTime)
            }

            // 如果配置了跳过错误处理，直接抛出错误
            if (config?.skipErrorHandling) {
                return Promise.reject(error)
            }

            // 处理特定的HTTP错误
            if (error.response) {
                const { status } = error.response

                // 401 未授权 - 清除token并重定向到登录页
                if (status === 401) {
                    localStorage.removeItem('authToken')
                    localStorage.removeItem('userId')

                    // 如果不是登录页面，重定向到登录页
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login'
                    }
                }

                // 403 禁止访问 - 显示权限不足提示
                if (status === 403) {
                    // 可以在这里触发全局提示组件
                    console.warn('Access forbidden: Insufficient permissions')
                }

                // 429 请求过多 - 显示限流提示
                if (status === 429) {
                    console.warn('Too many requests: Please try again later')
                }
            }

            return Promise.reject(error)
        }
    )
}

/**
 * 创建重试拦截器
 * 为特定的错误状态码提供自动重试功能
 */
export function setupRetryInterceptor(client: AxiosInstance, maxRetries: number = 3) {
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const config = error.config

            // 如果没有配置或已达到最大重试次数，直接抛出错误
            if (!config || !config.retries || config.retries <= 0) {
                return Promise.reject(error)
            }

            // 只对特定的错误状态码进行重试
            const retryableStatuses = [408, 429, 500, 502, 503, 504]
            const shouldRetry = error.response
                ? retryableStatuses.includes(error.response.status)
                : true // 网络错误也进行重试

            if (!shouldRetry) {
                return Promise.reject(error)
            }

            // 减少重试次数
            config.retries -= 1

            // 计算延迟时间（指数退避）
            const delay = Math.pow(2, maxRetries - config.retries) * 1000

            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, delay))

            return client(config)
        }
    )
}

/**
 * 创建缓存拦截器
 * 为GET请求提供简单的内存缓存
 */
export function setupCacheInterceptor(client: AxiosInstance, cacheDuration: number = 5 * 60 * 1000) {
    const cache = new Map<string, { data: any; timestamp: number }>()

    client.interceptors.request.use((config) => {
        // 只缓存GET请求
        if (config.method?.toLowerCase() !== 'get') {
            return config
        }

        const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`
        const cached = cache.get(cacheKey)

        if (cached && Date.now() - cached.timestamp < cacheDuration) {
            // 返回缓存的数据
            return Promise.reject({
                config,
                response: {
                    data: cached.data,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config,
                },
                isCache: true,
            })
        }

        return config
    })

    client.interceptors.response.use(
        (response) => {
            // 缓存GET请求的响应
            if (response.config.method?.toLowerCase() === 'get') {
                const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`
                cache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now(),
                })
            }

            return response
        },
        (error) => {
            // 如果是缓存命中，返回缓存的响应
            if (error.isCache) {
                return Promise.resolve(error.response)
            }

            return Promise.reject(error)
        }
    )

    // 定期清理过期缓存
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > cacheDuration) {
                cache.delete(key)
            }
        }
    }, cacheDuration)
}