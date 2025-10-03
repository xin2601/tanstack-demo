import redaxios from 'redaxios'
import { setupInterceptors, setupRetryInterceptor } from './interceptors'
import { getCurrentConfig } from './config'

// 设置全局标志，告知监控系统使用Redaxios
window.__USE_REDAXIOS__ = true

// 创建Redaxios实例
const config = getCurrentConfig()
export const httpClient = redaxios.create(config)

// 设置拦截器
setupInterceptors(httpClient)
setupRetryInterceptor(httpClient, 3)

/**
 * HTTP客户端类
 * 提供更高级的API和功能
 */
export class HttpClient {
    private client = httpClient

    /**
     * GET请求
     */
    async get<T>(url: string, config?: any): Promise<T> {
        const response = await this.client.get<T>(url, config)
        return response.data
    }

    /**
     * POST请求
     */
    async post<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.post<T>(url, data, config)
        return response.data
    }

    /**
     * PUT请求
     */
    async put<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.put<T>(url, data, config)
        return response.data
    }

    /**
     * PATCH请求
     */
    async patch<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.patch<T>(url, data, config)
        return response.data
    }

    /**
     * DELETE请求
     */
    async delete<T>(url: string, config?: any): Promise<T> {
        const response = await this.client.delete<T>(url, config)
        return response.data
    }

    /**
     * 上传文件
     */
    async upload<T>(url: string, file: File, config?: any): Promise<T> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await this.client.post<T>(url, formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    }

    /**
     * 下载文件
     */
    async download(url: string, filename?: string, config?: any): Promise<void> {
        const response = await this.client.get(url, {
            ...config,
            responseType: 'blob',
        })

        // 创建下载链接
        const blob = new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
    }

    /**
     * 批量请求
     */
    async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
        return Promise.all(requests.map(request => request()))
    }

    /**
     * 取消请求
     */
    createCancelToken() {
        const controller = new AbortController()
        return {
            token: controller.signal,
            cancel: (reason?: string) => controller.abort(reason),
        }
    }

    /**
     * 获取原始客户端实例
     */
    getRawClient() {
        return this.client
    }
}

// 创建默认实例
export const http = new HttpClient()

// 默认导出
export default http