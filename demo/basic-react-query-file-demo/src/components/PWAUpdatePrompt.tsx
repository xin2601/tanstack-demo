import React, { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

interface PWAUpdatePromptProps {
    onClose?: () => void
}

export function PWAUpdatePrompt({ onClose }: PWAUpdatePromptProps) {
    const [showPrompt, setShowPrompt] = useState(false)

    const {
      offlineReady: [offlineReady, setOfflineReady],
      needRefresh: [needRefresh, setNeedRefresh],
      updateServiceWorker,
    } = useRegisterSW({
      onRegistered(r: ServiceWorkerRegistration | undefined) {
        console.log('SW Registered: ', r)
      },
      onRegisterError(error: any) {
        console.log('SW registration error', error)
      },
    })

    useEffect(() => {
        if (offlineReady || needRefresh) {
            setShowPrompt(true)
        }
    }, [offlineReady, needRefresh])

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
        setShowPrompt(false)
        onClose?.()
    }

    const handleUpdate = () => {
        updateServiceWorker(true)
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {needRefresh ? (
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {needRefresh ? '新版本可用' : '应用已离线就绪'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {needRefresh
                            ? '点击重新加载以获取最新版本'
                            : '应用已缓存，可以离线使用'
                        }
                    </p>
                </div>

                <button
                    onClick={close}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {needRefresh && (
                <div className="mt-3 flex space-x-2">
                    <button
                        onClick={handleUpdate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                    >
                        重新加载
                    </button>
                    <button
                        onClick={close}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium py-2 px-3 rounded-md transition-colors"
                    >
                        稍后
                    </button>
                </div>
            )}
        </div>
    )
}