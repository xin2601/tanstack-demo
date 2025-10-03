import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { formatErrorInfo, shouldIgnoreError, updateSessionStats } from '@/utils/monitoring'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorId: null,
        }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // 检查是否应该忽略此错误
        if (shouldIgnoreError(error)) {
            return
        }

        // 更新会话统计
        updateSessionStats('error')

        // 格式化错误信息
        const formattedError = formatErrorInfo(error, {
            componentStack: errorInfo.componentStack || undefined
        }, 'ErrorBoundary')

        // 发送到Sentry
        Sentry.withScope((scope) => {
            scope.setTag('errorBoundary', true)
            scope.setContext('errorInfo', {
                componentStack: errorInfo.componentStack,
                errorBoundary: 'ErrorBoundary',
            })
            scope.setLevel('error')
            Sentry.captureException(error)
        })

        // 调用自定义错误处理器
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // 在开发环境中打印错误
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error)
            console.error('Component stack:', errorInfo.componentStack)
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorId: null,
        })
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            // 如果提供了自定义fallback，使用它
            if (this.props.fallback) {
                return this.props.fallback
            }

            // 默认错误UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>出现了错误</AlertTitle>
                            <AlertDescription className="mt-2">
                                应用程序遇到了意外错误。我们已经记录了这个问题，正在努力修复。
                            </AlertDescription>
                        </Alert>

                        <div className="mt-4 space-y-2">
                            <Button onClick={this.handleRetry} className="w-full" variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                重试
                            </Button>
                            <Button onClick={this.handleReload} className="w-full">
                                重新加载页面
                            </Button>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-4 p-4 bg-gray-100 rounded-md">
                                <summary className="cursor-pointer font-medium">错误详情 (开发模式)</summary>
                                <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        {this.state.errorId && (
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                错误ID: {this.state.errorId}
                            </p>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// HOC版本的错误边界
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
    onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback} onError={onError}>
            <Component {...props} />
        </ErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
}

// Sentry的错误边界组件
export const SentryErrorBoundary = Sentry.withErrorBoundary(
    ({ children }: { children: ReactNode }) => <>{children}</>,
    {
        fallback: ({ error, resetError }) => (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>应用程序错误</AlertTitle>
                        <AlertDescription className="mt-2">
                            很抱歉，应用程序遇到了错误。请尝试刷新页面或联系支持团队。
                        </AlertDescription>
                    </Alert>

                    <div className="mt-4 space-y-2">
                        <Button onClick={resetError} className="w-full" variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            重试
                        </Button>
                        <Button onClick={() => window.location.reload()} className="w-full">
                            重新加载页面
                        </Button>
                    </div>

                    {import.meta.env.DEV && (
                        <details className="mt-4 p-4 bg-gray-100 rounded-md">
                            <summary className="cursor-pointer font-medium">错误详情 (开发模式)</summary>
                            <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                                {(error as Error)?.message}
                                {'\n\n'}
                                {(error as Error)?.stack}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        ),
        beforeCapture: (scope, error, errorInfo) => {
            scope.setTag('errorBoundary', 'sentry')
            scope.setContext('errorInfo', {
                componentStack: (errorInfo as any)?.componentStack,
                errorBoundary: 'sentry'
            })
        },
    }
)