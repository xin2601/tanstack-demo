/**
 * 通知容器组件
 * 显示 Zustand 管理的全局通知
 */

import * as React from 'react'
import { useNotifications } from '@/stores'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotifications()

    if (notifications.length === 0) {
        return null
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-4 w-4" />
            case 'error':
                return <AlertCircle className="h-4 w-4" />
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />
            case 'info':
            default:
                return <Info className="h-4 w-4" />
        }
    }

    const getVariant = (type: string) => {
        switch (type) {
            case 'error':
                return 'destructive'
            default:
                return 'default'
        }
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {notifications.map((notification) => (
                <Alert
                    key={notification.id}
                    variant={getVariant(notification.type)}
                    className={`
            relative animate-in slide-in-from-right-full duration-300
            ${notification.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : ''}
            ${notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' : ''}
            ${notification.type === 'info' ? 'border-blue-200 bg-blue-50 text-blue-800' : ''}
          `}
                >
                    <div className="flex items-start gap-2">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                            <AlertTitle className="text-sm font-medium">
                                {notification.title}
                            </AlertTitle>
                            {notification.message && (
                                <AlertDescription className="text-sm mt-1">
                                    {notification.message}
                                </AlertDescription>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-black/10"
                            onClick={() => removeNotification(notification.id)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </Alert>
            ))}
        </div>
    )
}

// 通知 Hook，用于在组件中快速显示通知
export const useNotify = () => {
    const { addNotification } = useNotifications()

    return React.useCallback(
        (
            type: 'success' | 'error' | 'warning' | 'info',
            title: string,
            message?: string,
            duration?: number
        ) => {
            addNotification({
                type,
                title,
                message,
                duration: duration ?? (type === 'error' ? 8000 : 5000),
            })
        },
        [addNotification]
    )
}

// 快捷通知 Hooks
export const useNotifySuccess = () => {
    const notify = useNotify()
    return React.useCallback(
        (title: string, message?: string) => notify('success', title, message),
        [notify]
    )
}

export const useNotifyError = () => {
    const notify = useNotify()
    return React.useCallback(
        (title: string, message?: string) => notify('error', title, message),
        [notify]
    )
}

export const useNotifyWarning = () => {
    const notify = useNotify()
    return React.useCallback(
        (title: string, message?: string) => notify('warning', title, message),
        [notify]
    )
}

export const useNotifyInfo = () => {
    const notify = useNotify()
    return React.useCallback(
        (title: string, message?: string) => notify('info', title, message),
        [notify]
    )
}