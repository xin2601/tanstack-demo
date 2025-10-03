// HTTP相关类型定义
export interface ApiResponse<T> {
    data: T
    message?: string
    status: 'success' | 'error'
    code?: number
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    message?: string
    status: 'success' | 'error'
}

export interface ApiError {
    message: string
    code: string
    details?: any
    status?: number
}

export interface RequestConfig {
    skipErrorHandling?: boolean
    skipMonitoring?: boolean
    retries?: number
    timeout?: number
}

// 扩展Redaxios的AxiosRequestConfig类型
declare module 'redaxios' {
    interface AxiosRequestConfig {
        metadata?: {
            startTime: number
            requestId: string
        }
        skipErrorHandling?: boolean
        skipMonitoring?: boolean
        retries?: number
    }
}