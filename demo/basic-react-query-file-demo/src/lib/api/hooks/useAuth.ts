import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/lib/api/base'
import { endpoints, apiUtils } from '@/lib/api/base'
import type { ApiResponse } from '@/lib/http/types'

// 认证相关类型定义
export interface LoginCredentials {
    email: string
    password: string
    remember?: boolean
}

export interface RegisterData {
    name: string
    email: string
    password: string
    confirmPassword: string
}

export interface AuthUser {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'admin' | 'user'
    permissions: string[]
    createdAt: string
}

export interface LoginResponse {
    user: AuthUser
    token: string
    refreshToken: string
    expiresIn: number
}

export interface RefreshTokenResponse {
    token: string
    expiresIn: number
}

// React Query Keys
export const authKeys = {
    all: ['auth'] as const,
    profile: () => [...authKeys.all, 'profile'] as const,
}

/**
 * 获取当前用户信息
 */
export const useProfile = () => {
    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: async (): Promise<AuthUser> => {
            const response = await http.get<ApiResponse<AuthUser>>(endpoints.auth.profile)
            return apiUtils.handleResponse(response)
        },
        staleTime: 5 * 60 * 1000, // 5分钟
        gcTime: 10 * 60 * 1000, // 10分钟
        retry: (failureCount, error: any) => {
            // 如果是401错误，不重试
            if (error?.response?.status === 401) {
                return false
            }
            return failureCount < 3
        },
    })
}

/**
 * 登录
 */
export const useLogin = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
            const response = await http.post<ApiResponse<LoginResponse>>(
                endpoints.auth.login,
                credentials
            )
            return apiUtils.handleResponse(response)
        },
        onSuccess: (data) => {
            // 保存token到localStorage
            localStorage.setItem('authToken', data.token)
            localStorage.setItem('refreshToken', data.refreshToken)
            localStorage.setItem('userId', data.user.id)

            // 设置token过期时间
            const expiresAt = Date.now() + data.expiresIn * 1000
            localStorage.setItem('tokenExpiresAt', expiresAt.toString())

            // 更新用户信息缓存
            queryClient.setQueryData(authKeys.profile(), data.user)

            // 清除所有查询缓存，重新获取数据
            queryClient.clear()
        },
        onError: (error) => {
            console.error('登录失败:', error)
        },
    })
}

/**
 * 注册
 */
export const useRegister = () => {
    return useMutation({
        mutationFn: async (userData: RegisterData): Promise<LoginResponse> => {
            const response = await http.post<ApiResponse<LoginResponse>>(
                '/auth/register',
                userData
            )
            return apiUtils.handleResponse(response)
        },
        onSuccess: (data) => {
            // 注册成功后自动登录
            localStorage.setItem('authToken', data.token)
            localStorage.setItem('refreshToken', data.refreshToken)
            localStorage.setItem('userId', data.user.id)

            const expiresAt = Date.now() + data.expiresIn * 1000
            localStorage.setItem('tokenExpiresAt', expiresAt.toString())
        },
        onError: (error) => {
            console.error('注册失败:', error)
        },
    })
}

/**
 * 登出
 */
export const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (): Promise<void> => {
            try {
                await http.post(endpoints.auth.logout)
            } catch (error) {
                // 即使服务器登出失败，也要清除本地数据
                console.warn('服务器登出失败，但继续清除本地数据:', error)
            }
        },
        onSuccess: () => {
            // 清除本地存储
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userId')
            localStorage.removeItem('tokenExpiresAt')

            // 清除所有查询缓存
            queryClient.clear()

            // 重定向到登录页
            window.location.href = '/login'
        },
        onError: (error) => {
            console.error('登出失败:', error)

            // 即使失败也清除本地数据
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userId')
            localStorage.removeItem('tokenExpiresAt')

            queryClient.clear()
            window.location.href = '/login'
        },
    })
}

/**
 * 刷新token
 */
export const useRefreshToken = () => {
    return useMutation({
        mutationFn: async (): Promise<RefreshTokenResponse> => {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
                throw new Error('No refresh token available')
            }

            const response = await http.post<ApiResponse<RefreshTokenResponse>>(
                endpoints.auth.refresh,
                { refreshToken }
            )
            return apiUtils.handleResponse(response)
        },
        onSuccess: (data) => {
            // 更新token
            localStorage.setItem('authToken', data.token)

            const expiresAt = Date.now() + data.expiresIn * 1000
            localStorage.setItem('tokenExpiresAt', expiresAt.toString())
        },
        onError: (error) => {
            console.error('刷新token失败:', error)

            // 清除所有认证信息，重定向到登录页
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userId')
            localStorage.removeItem('tokenExpiresAt')

            window.location.href = '/login'
        },
    })
}

/**
 * 更新用户资料
 */
export const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: Partial<AuthUser>): Promise<AuthUser> => {
            const response = await http.put<ApiResponse<AuthUser>>(
                endpoints.auth.profile,
                data
            )
            return apiUtils.handleResponse(response)
        },
        onSuccess: (updatedUser) => {
            // 更新用户信息缓存
            queryClient.setQueryData(authKeys.profile(), updatedUser)
        },
        onError: (error) => {
            console.error('更新用户资料失败:', error)
        },
    })
}

/**
 * 修改密码
 */
export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (data: {
            currentPassword: string
            newPassword: string
            confirmPassword: string
        }): Promise<void> => {
            await http.post('/auth/change-password', data)
        },
        onError: (error) => {
            console.error('修改密码失败:', error)
        },
    })
}

/**
 * 检查认证状态
 */
export const useAuthStatus = () => {
    const token = localStorage.getItem('authToken')
    const expiresAt = localStorage.getItem('tokenExpiresAt')

    const isAuthenticated = !!(token && expiresAt && Date.now() < parseInt(expiresAt))

    return {
        isAuthenticated,
        token,
        isTokenExpired: !!(expiresAt && Date.now() >= parseInt(expiresAt)),
    }
}