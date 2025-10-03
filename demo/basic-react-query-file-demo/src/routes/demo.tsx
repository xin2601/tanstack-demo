import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { useUsers, useCreateUser, useLogin, useProfile } from '@/lib/api/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users, UserPlus, LogIn, User, Settings, Bell, Palette } from 'lucide-react'
import {
  useTheme,
  useNotifications,
  useFeatures,
  useAuthStatus,
  useUIStore,
  showSuccess,
  showError,
  showWarning,
  showInfo
} from '@/stores'

export const Route = createFileRoute('/demo')({
    component: DemoPage,
})

function DemoPage() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Redaxios + React Query 集成演示</h1>
                <p className="text-muted-foreground">
                    展示Redaxios HTTP客户端与React Query的完美集成
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <UsersDemo />
                <AuthDemo />
                <HttpClientDemo />
                <MonitoringDemo />
                <ZustandUIDemo />
                <ZustandFeaturesDemo />
            </div>
        </div>
    )
}

function UsersDemo() {
    const { data: users, isLoading, error, refetch } = useUsers({
        page: 1,
        limit: 5
    })
    const createUser = useCreateUser()

    const handleCreateUser = async () => {
        try {
            await createUser.mutateAsync({
                name: `用户${Date.now()}`,
                email: `user${Date.now()}@example.com`,
                password: 'password123'
            })
        } catch (error) {
            console.error('创建用户失败:', error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    用户管理演示
                </CardTitle>
                <CardDescription>
                    使用React Query hooks进行用户数据管理
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        刷新用户列表
                    </Button>
                    <Button
                        onClick={handleCreateUser}
                        disabled={createUser.isPending}
                        size="sm"
                    >
                        {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <UserPlus className="mr-2 h-4 w-4" />
                        创建用户
                    </Button>
                </div>

                {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        错误: {error.message}
                    </div>
                )}

                {users && (
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                            共 {users.pagination?.total || users.data?.length || 0} 个用户
                        </div>
                        {users.data?.slice(0, 3).map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function AuthDemo() {
    const login = useLogin()
    const { data: profile, isLoading } = useProfile()

    const handleLogin = async () => {
        try {
            await login.mutateAsync({
                email: 'demo@example.com',
                password: 'password123'
            })
        } catch (error) {
            console.error('登录失败:', error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    认证演示
                </CardTitle>
                <CardDescription>
                    演示认证流程和用户状态管理
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {profile ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">已登录用户</span>
                        </div>
                        <div className="bg-green-50 p-3 rounded space-y-1">
                            <div className="font-medium">{profile.name}</div>
                            <div className="text-sm text-muted-foreground">{profile.email}</div>
                            <Badge variant="outline">{profile.role}</Badge>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                            {isLoading ? '检查登录状态...' : '未登录'}
                        </div>
                        <Button
                            onClick={handleLogin}
                            disabled={login.isPending}
                            className="w-full"
                        >
                            {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            演示登录
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function HttpClientDemo() {
    const [response, setResponse] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(false)

    const testHttpClient = async () => {
        setLoading(true)
        try {
            // 这里可以调用实际的API端点进行测试
            const mockResponse = {
                status: 'success',
                message: 'HTTP客户端工作正常',
                timestamp: new Date().toISOString(),
                client: 'Redaxios',
                features: [
                    '自动错误处理',
                    '请求/响应拦截',
                    '监控集成',
                    '类型安全'
                ]
            }

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 1000))
            setResponse(mockResponse)
        } catch (error) {
            setResponse({ error: error instanceof Error ? error.message : String(error) })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>HTTP客户端测试</CardTitle>
                <CardDescription>
                    测试Redaxios HTTP客户端功能
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    onClick={testHttpClient}
                    disabled={loading}
                    className="w-full"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    测试HTTP请求
                </Button>

                {response && (
                    <div className="bg-gray-50 p-3 rounded">
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function MonitoringDemo() {
    const [stats, setStats] = React.useState<any>(null)

    React.useEffect(() => {
        // 模拟监控统计数据
        const mockStats = {
            requests: {
                total: 156,
                success: 142,
                errors: 14,
                avgResponseTime: '245ms'
            },
            errors: {
                network: 3,
                server: 8,
                client: 3
            },
            performance: {
                slowRequests: 5,
                cacheHits: 89,
                retries: 12
            }
        }
        setStats(mockStats)
    }, [])

    return (
        <Card>
            <CardHeader>
                <CardTitle>监控统计</CardTitle>
                <CardDescription>
                    实时监控和错误追踪统计
                </CardDescription>
            </CardHeader>
            <CardContent>
                {stats && (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">请求统计</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>总请求: {stats.requests.total}</div>
                                <div>成功: {stats.requests.success}</div>
                                <div>错误: {stats.requests.errors}</div>
                                <div>平均响应: {stats.requests.avgResponseTime}</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">错误分布</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>网络错误</span>
                                    <Badge variant="destructive">{stats.errors.network}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>服务器错误</span>
                                    <Badge variant="destructive">{stats.errors.server}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>客户端错误</span>
                                    <Badge variant="secondary">{stats.errors.client}</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">性能指标</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>慢请求</span>
                                    <Badge variant="outline">{stats.performance.slowRequests}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>缓存命中</span>
                                    <Badge variant="outline">{stats.performance.cacheHits}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>重试次数</span>
                                    <Badge variant="outline">{stats.performance.retries}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ZustandUIDemo() {
    const theme = useTheme()
    const { notifications, clearNotifications } = useNotifications()
    const { setTheme } = useUIStore()

    const handleThemeChange = () => {
        const themes = ['light', 'dark', 'system'] as const
        const currentIndex = themes.indexOf(theme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        setTheme(nextTheme)
    }

    const handleShowNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
        const messages = {
            success: { title: '操作成功', message: '这是一个成功通知' },
            error: { title: '操作失败', message: '这是一个错误通知' },
            warning: { title: '警告', message: '这是一个警告通知' },
            info: { title: '信息', message: '这是一个信息通知' }
        }
        
        const { title, message } = messages[type]
        
        if (type === 'success') showSuccess(title, message)
        else if (type === 'error') showError(title, message)
        else if (type === 'warning') showWarning(title, message)
        else showInfo(title, message)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Zustand UI 状态演示
                </CardTitle>
                <CardDescription>
                    演示主题切换和通知系统
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-medium mb-2">主题控制</h4>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleThemeChange}
                            variant="outline"
                            size="sm"
                        >
                            <Palette className="mr-2 h-4 w-4" />
                            当前主题: {theme}
                        </Button>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-2">通知系统</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => handleShowNotification('success')}
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                        >
                            成功通知
                        </Button>
                        <Button
                            onClick={() => handleShowNotification('error')}
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                        >
                            错误通知
                        </Button>
                        <Button
                            onClick={() => handleShowNotification('warning')}
                            variant="outline"
                            size="sm"
                            className="text-yellow-600"
                        >
                            警告通知
                        </Button>
                        <Button
                            onClick={() => handleShowNotification('info')}
                            variant="outline"
                            size="sm"
                            className="text-blue-600"
                        >
                            信息通知
                        </Button>
                    </div>
                </div>

                {notifications.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">活跃通知 ({notifications.length})</h4>
                            <Button
                                onClick={clearNotifications}
                                variant="outline"
                                size="sm"
                            >
                                清除所有
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            查看右上角的通知显示
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ZustandFeaturesDemo() {
    const { features, toggleFeature } = useFeatures()
    const { isAuthenticated } = useAuthStatus()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    功能开关演示
                </CardTitle>
                <CardDescription>
                    演示应用功能开关和认证状态
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-medium mb-2">功能开关</h4>
                    <div className="space-y-2">
                        {Object.entries(features).map(([feature, enabled]) => (
                            <div key={feature} className="flex items-center justify-between">
                                <span className="text-sm">{feature}</span>
                                <Button
                                    onClick={() => toggleFeature(feature)}
                                    variant={enabled ? "default" : "outline"}
                                    size="sm"
                                >
                                    {enabled ? '已启用' : '已禁用'}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-2">认证状态</h4>
                    <div className="flex items-center gap-2">
                        <Badge variant={isAuthenticated ? "default" : "secondary"}>
                            {isAuthenticated ? '已认证' : '未认证'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            (由 Zustand 管理的客户端状态)
                        </span>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                    💡 这些状态由 Zustand 管理，与 React Query 的服务端状态互补
                </div>
            </CardContent>
        </Card>
    )
}