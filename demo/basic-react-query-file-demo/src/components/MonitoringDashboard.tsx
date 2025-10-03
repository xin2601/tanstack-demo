import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    Eye,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react'
import { webVitalsCollector } from '@/services/webVitals'
import { globalErrorHandler } from '@/services/errorHandler'
import { monitoringService } from '@/services/monitoring'
import { getPagePerformance, getUserSession } from '@/utils/monitoring'
import type { WebVitalsMetric } from '@/types/monitoring'

interface DashboardProps {
    className?: string
}

export function MonitoringDashboard({ className }: DashboardProps) {
    const [webVitals, setWebVitals] = useState<Record<string, { value: number; rating: string }>>({})
    const [errorStats, setErrorStats] = useState<any>({})
    const [performanceData, setPerformanceData] = useState<Record<string, number>>({})
    const [sessionInfo, setSessionInfo] = useState<any>({})
    const [monitoringStatus, setMonitoringStatus] = useState<any>({})
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

    const refreshData = () => {
        // 获取Web Vitals数据
        const vitalsData = webVitalsCollector.getMetricsSummary()
        setWebVitals(vitalsData)

        // 获取错误统计
        const errors = globalErrorHandler.getErrorStats()
        setErrorStats(errors)

        // 获取性能数据
        const performance = getPagePerformance()
        setPerformanceData(performance)

        // 获取会话信息
        const session = getUserSession()
        setSessionInfo(session)

        // 获取监控状态
        const status = monitoringService.getStatus()
        setMonitoringStatus(status)

        setLastUpdate(new Date())
    }

    useEffect(() => {
        refreshData()

        // 每30秒自动刷新数据
        const interval = setInterval(refreshData, 30000)

        return () => clearInterval(interval)
    }, [])

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'good': return 'text-green-600'
            case 'needs-improvement': return 'text-yellow-600'
            case 'poor': return 'text-red-600'
            default: return 'text-gray-600'
        }
    }

    const getRatingIcon = (rating: string) => {
        switch (rating) {
            case 'good': return <TrendingUp className="h-4 w-4 text-green-600" />
            case 'needs-improvement': return <Minus className="h-4 w-4 text-yellow-600" />
            case 'poor': return <TrendingDown className="h-4 w-4 text-red-600" />
            default: return <Activity className="h-4 w-4 text-gray-600" />
        }
    }

    const formatValue = (name: string, value: number) => {
        if (name === 'CLS') {
            return value.toFixed(3)
        }
        return `${Math.round(value)}ms`
    }

    const getProgressValue = (name: string, value: number, rating: string) => {
        if (rating === 'good') return 100
        if (rating === 'needs-improvement') return 60
        if (rating === 'poor') return 30
        return 0
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* 头部信息 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">监控仪表板</h2>
                    <p className="text-muted-foreground">
                        最后更新: {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
                <Button onClick={refreshData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新数据
                </Button>
            </div>

            {/* 监控状态概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">错误追踪</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {monitoringStatus.config?.errorTracking ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">
                                {monitoringStatus.config?.errorTracking ? '已启用' : '已禁用'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">性能监控</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {monitoringStatus.config?.performanceTracking ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">
                                {monitoringStatus.config?.performanceTracking ? '已启用' : '已禁用'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Web Vitals</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {monitoringStatus.config?.webVitals ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">
                                {monitoringStatus.config?.webVitals ? '已启用' : '已禁用'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">会话时长</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sessionInfo.lastActivity && sessionInfo.startTime
                                ? Math.round((sessionInfo.lastActivity - sessionInfo.startTime) / 1000 / 60)
                                : 0}
                            <span className="text-sm font-normal text-muted-foreground ml-1">分钟</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 详细数据 */}
            <Tabs defaultValue="vitals" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
                    <TabsTrigger value="errors">错误统计</TabsTrigger>
                    <TabsTrigger value="performance">性能数据</TabsTrigger>
                    <TabsTrigger value="session">会话信息</TabsTrigger>
                </TabsList>

                <TabsContent value="vitals" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(webVitals).map(([name, data]) => (
                            <Card key={name}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{name}</CardTitle>
                                    {getRatingIcon(data.rating)}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatValue(name, data.value)}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <Badge
                                            variant={data.rating === 'good' ? 'default' : 'destructive'}
                                            className={getRatingColor(data.rating)}
                                        >
                                            {data.rating === 'good' ? '良好' :
                                                data.rating === 'needs-improvement' ? '需改进' : '较差'}
                                        </Badge>
                                        <Progress
                                            value={getProgressValue(name, data.value, data.rating)}
                                            className="w-16 h-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {Object.keys(webVitals).length === 0 && (
                        <Alert>
                            <Eye className="h-4 w-4" />
                            <AlertDescription>
                                暂无Web Vitals数据。请与页面交互以生成性能指标。
                            </AlertDescription>
                        </Alert>
                    )}
                </TabsContent>

                <TabsContent value="errors" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>错误总数</CardTitle>
                                <CardDescription>当前会话中的错误统计</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{errorStats.total || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>错误类型分布</CardTitle>
                                <CardDescription>按错误类型分类的统计</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(errorStats.byType || {}).map(([type, count]) => (
                                        <div key={type} className="flex justify-between items-center">
                                            <span className="text-sm">{type}</span>
                                            <Badge variant="outline">{count as number}</Badge>
                                        </div>
                                    ))}
                                    {Object.keys(errorStats.byType || {}).length === 0 && (
                                        <p className="text-sm text-muted-foreground">暂无错误记录</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {errorStats.recent && errorStats.recent.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>最近错误</CardTitle>
                                <CardDescription>最近发生的错误列表</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {errorStats.recent.map((error: any, index: number) => (
                                        <div key={index} className="p-2 border rounded text-sm">
                                            <div className="font-medium">{error.error?.message || '未知错误'}</div>
                                            <div className="text-muted-foreground">
                                                类型: {error.context?.type || '未知'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(performanceData).map(([name, value]) => (
                            <Card key={name}>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                        {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {Math.round(value)}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">ms</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {Object.keys(performanceData).length === 0 && (
                        <Alert>
                            <Activity className="h-4 w-4" />
                            <AlertDescription>
                                暂无性能数据。请刷新页面以获取性能指标。
                            </AlertDescription>
                        </Alert>
                    )}
                </TabsContent>

                <TabsContent value="session" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>会话ID</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <code className="text-sm bg-muted p-2 rounded block">
                                    {sessionInfo.sessionId || '未知'}
                                </code>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>页面浏览量</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{sessionInfo.pageViews || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>会话开始时间</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm">
                                    {sessionInfo.startTime
                                        ? new Date(sessionInfo.startTime).toLocaleString()
                                        : '未知'
                                    }
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>最后活动时间</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm">
                                    {sessionInfo.lastActivity
                                        ? new Date(sessionInfo.lastActivity).toLocaleString()
                                        : '未知'
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}