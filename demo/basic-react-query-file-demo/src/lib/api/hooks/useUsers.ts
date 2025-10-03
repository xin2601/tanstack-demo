import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { http } from '@/lib/api/base'
import { endpoints, apiUtils } from '@/lib/api/base'
import type { ApiResponse, PaginatedResponse } from '@/lib/http/types'

// 用户类型定义
export interface User {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'admin' | 'user'
    createdAt: string
    updatedAt: string
}

export interface CreateUserData {
    name: string
    email: string
    password: string
    role?: 'admin' | 'user'
}

export interface UpdateUserData {
    name?: string
    email?: string
    avatar?: string
    role?: 'admin' | 'user'
}

export interface UsersQueryParams {
    page?: number
    limit?: number
    search?: string
    role?: 'admin' | 'user'
    sortBy?: 'name' | 'email' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
}

// React Query Keys
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (params: UsersQueryParams) => [...userKeys.lists(), params] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
    infinite: (params: Omit<UsersQueryParams, 'page'>) => [...userKeys.all, 'infinite', params] as const,
}

/**
 * 获取用户列表
 */
export const useUsers = (params: UsersQueryParams = {}) => {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: async (): Promise<PaginatedResponse<User>> => {
            const queryString = apiUtils.buildQueryParams({
                ...apiUtils.buildPaginationParams(params.page, params.limit),
                search: params.search,
                role: params.role,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            })

            const url = `${endpoints.users.list}?${queryString}`
            return await http.get<PaginatedResponse<User>>(url)
        },
        staleTime: 5 * 60 * 1000, // 5分钟
        gcTime: 10 * 60 * 1000, // 10分钟
    })
}

/**
 * 获取单个用户详情
 */
export const useUser = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async (): Promise<User> => {
            const response = await http.get<ApiResponse<User>>(endpoints.users.detail(id))
            return apiUtils.handleResponse(response)
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/**
 * 无限滚动获取用户列表
 */
export const useInfiniteUsers = (params: Omit<UsersQueryParams, 'page'> = {}) => {
    return useInfiniteQuery({
        queryKey: userKeys.infinite(params),
        queryFn: async ({ pageParam = 1 }): Promise<PaginatedResponse<User>> => {
            const queryString = apiUtils.buildQueryParams({
                ...apiUtils.buildPaginationParams(pageParam, params.limit),
                search: params.search,
                role: params.role,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            })

            const url = `${endpoints.users.list}?${queryString}`
            return await http.get<PaginatedResponse<User>>(url)
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.pagination
            return page < totalPages ? page + 1 : undefined
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/**
 * 创建用户
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userData: CreateUserData): Promise<User> => {
            const response = await http.post<ApiResponse<User>>(endpoints.users.create, userData)
            return apiUtils.handleResponse(response)
        },
        onSuccess: (newUser) => {
            // 使所有用户列表查询失效
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })

            // 可选：直接更新缓存
            queryClient.setQueryData(userKeys.detail(newUser.id), newUser)
        },
        onError: (error) => {
            console.error('创建用户失败:', error)
        },
    })
}

/**
 * 更新用户
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }): Promise<User> => {
            const response = await http.put<ApiResponse<User>>(endpoints.users.update(id), data)
            return apiUtils.handleResponse(response)
        },
        onSuccess: (updatedUser) => {
            // 更新用户详情缓存
            queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser)

            // 使用户列表查询失效
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        },
        onError: (error) => {
            console.error('更新用户失败:', error)
        },
    })
}

/**
 * 删除用户
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            await http.delete(endpoints.users.delete(id))
        },
        onSuccess: (_, deletedId) => {
            // 从缓存中移除用户详情
            queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) })

            // 使用户列表查询失效
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        },
        onError: (error) => {
            console.error('删除用户失败:', error)
        },
    })
}

/**
 * 批量删除用户
 */
export const useBatchDeleteUsers = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: string[]): Promise<void> => {
            await Promise.all(ids.map(id => http.delete(endpoints.users.delete(id))))
        },
        onSuccess: (_, deletedIds) => {
            // 从缓存中移除所有被删除的用户详情
            deletedIds.forEach(id => {
                queryClient.removeQueries({ queryKey: userKeys.detail(id) })
            })

            // 使用户列表查询失效
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
        },
        onError: (error) => {
            console.error('批量删除用户失败:', error)
        },
    })
}