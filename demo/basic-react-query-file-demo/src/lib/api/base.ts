import { http, httpClient } from '@/lib/http/client'
import type { ApiResponse, PaginatedResponse } from '@/lib/http/types'

// 导出HTTP客户端实例
export { http, httpClient }

// API基础配置
export const apiConfig = {
    // API版本
    version: 'v1',

    // 默认分页参数
    defaultPagination: {
        page: 1,
        limit: 20,
    },

    // 请求超时时间
    timeout: 10000,
}

// API响应处理工具
export const apiUtils = {
    /**
     * 处理API响应
     */
    handleResponse<T>(response: ApiResponse<T>): T {
        if (response.status === 'error') {
            throw new Error(response.message || 'API请求失败')
        }
        return response.data
    },

    /**
     * 处理分页响应
     */
    handlePaginatedResponse<T>(response: PaginatedResponse<T>): PaginatedResponse<T> {
        if (response.status === 'error') {
            throw new Error(response.message || 'API请求失败')
        }
        return response
    },

    /**
     * 构建查询参数
     */
    buildQueryParams(params: Record<string, any>): string {
        const searchParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(item => searchParams.append(key, String(item)))
                } else {
                    searchParams.append(key, String(value))
                }
            }
        })

        return searchParams.toString()
    },

    /**
     * 构建分页参数
     */
    buildPaginationParams(page: number = 1, limit: number = 20) {
        return {
            page,
            limit,
            offset: (page - 1) * limit,
        }
    },
}

// 常用的API端点
export const endpoints = {
    // 用户相关
    users: {
        list: '/users',
        detail: (id: string) => `/users/${id}`,
        create: '/users',
        update: (id: string) => `/users/${id}`,
        delete: (id: string) => `/users/${id}`,
    },

    // 认证相关
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
        profile: '/auth/profile',
    },

    // 文件上传
    upload: {
        single: '/upload/single',
        multiple: '/upload/multiple',
    },
}