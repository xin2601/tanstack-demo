/**
 * 国际化相关的 React Hooks
 * 提供便捷的国际化功能和语言切换
 */

import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'
import { useUIStore } from '@/stores'
import type { SupportedLanguage } from './index'
import { supportedLanguages } from './index'

/**
 * 增强的翻译 Hook
 * 集成了 Zustand store 的语言状态管理
 */
export const useI18n = () => {
    const { t, i18n } = useTranslation()
    const locale = useUIStore((state) => state.locale)
    const setLocale = useUIStore((state) => state.setLocale)

    // 切换语言
    const changeLanguage = useCallback(
        async (language: SupportedLanguage) => {
            try {
                await i18n.changeLanguage(language)
                setLocale(language)

                // 更新 HTML lang 属性
                document.documentElement.lang = language === 'zh-CN' ? 'zh' : 'en'

                // 可以在这里添加其他语言切换后的逻辑
                console.log(`Language changed to: ${language}`)
            } catch (error) {
                console.error('Failed to change language:', error)
            }
        },
        [i18n, setLocale]
    )

    // 获取当前语言信息
    const currentLanguage = useMemo(() => {
        const lang = (locale || i18n.language) as SupportedLanguage
        return {
            code: lang,
            name: supportedLanguages[lang] || supportedLanguages['zh-CN'],
            isRTL: false, // 当前支持的语言都是 LTR
        }
    }, [locale, i18n.language])

    // 获取支持的语言列表
    const availableLanguages = useMemo(() => {
        return Object.entries(supportedLanguages).map(([code, name]) => ({
            code: code as SupportedLanguage,
            name,
            isActive: code === currentLanguage.code,
        }))
    }, [currentLanguage.code])

    // 检查是否为指定语言
    const isLanguage = useCallback(
        (language: SupportedLanguage) => {
            return currentLanguage.code === language
        },
        [currentLanguage.code]
    )

    // 格式化日期（根据当前语言）
    const formatDate = useCallback(
        (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
            const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
            const locale = currentLanguage.code === 'zh-CN' ? 'zh-CN' : 'en-US'

            return new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...options,
            }).format(dateObj)
        },
        [currentLanguage.code]
    )

    // 格式化数字（根据当前语言）
    const formatNumber = useCallback(
        (number: number, options?: Intl.NumberFormatOptions) => {
            const locale = currentLanguage.code === 'zh-CN' ? 'zh-CN' : 'en-US'
            return new Intl.NumberFormat(locale, options).format(number)
        },
        [currentLanguage.code]
    )

    // 格式化货币（根据当前语言）
    const formatCurrency = useCallback(
        (amount: number, currency: string = 'CNY') => {
            const locale = currentLanguage.code === 'zh-CN' ? 'zh-CN' : 'en-US'
            const currencyCode = currentLanguage.code === 'zh-CN' ? 'CNY' : currency

            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
            }).format(amount)
        },
        [currentLanguage.code]
    )

    return {
        // 基础翻译功能
        t,
        i18n,

        // 语言管理
        currentLanguage,
        availableLanguages,
        changeLanguage,
        isLanguage,

        // 格式化工具
        formatDate,
        formatNumber,
        formatCurrency,

        // 便捷方法
        isZhCN: currentLanguage.code === 'zh-CN',
        isEnUS: currentLanguage.code === 'en-US',
    }
}

/**
 * 翻译文本的 Hook（简化版）
 */
export const useTranslate = () => {
    const { t } = useTranslation()
    return t
}

/**
 * 语言切换器 Hook
 * 专门用于语言切换组件
 */
export const useLanguageSwitcher = () => {
    const { currentLanguage, availableLanguages, changeLanguage } = useI18n()

    const switchToNext = useCallback(() => {
        const currentIndex = availableLanguages.findIndex(lang => lang.isActive)
        const nextIndex = (currentIndex + 1) % availableLanguages.length
        const nextLanguage = availableLanguages[nextIndex]

        if (nextLanguage) {
            changeLanguage(nextLanguage.code)
        }
    }, [availableLanguages, changeLanguage])

    return {
        currentLanguage,
        availableLanguages,
        changeLanguage,
        switchToNext,
    }
}

/**
 * 本地化格式化 Hook
 * 提供各种本地化格式化功能
 */
export const useLocalization = () => {
    const { currentLanguage, formatDate, formatNumber, formatCurrency } = useI18n()

    // 相对时间格式化
    const formatRelativeTime = useCallback(
        (date: Date | string | number) => {
            const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
            const now = new Date()
            const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

            const locale = currentLanguage.code === 'zh-CN' ? 'zh-CN' : 'en-US'
            const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

            if (diffInSeconds < 60) {
                return rtf.format(-diffInSeconds, 'second')
            } else if (diffInSeconds < 3600) {
                return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
            } else if (diffInSeconds < 86400) {
                return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
            } else {
                return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
            }
        },
        [currentLanguage.code]
    )

    // 文件大小格式化
    const formatFileSize = useCallback(
        (bytes: number) => {
            const units = currentLanguage.code === 'zh-CN'
                ? ['字节', 'KB', 'MB', 'GB', 'TB']
                : ['Bytes', 'KB', 'MB', 'GB', 'TB']

            if (bytes === 0) return `0 ${units[0]}`

            const k = 1024
            const dm = 2
            const i = Math.floor(Math.log(bytes) / Math.log(k))

            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${units[i]}`
        },
        [currentLanguage.code]
    )

    return {
        formatDate,
        formatNumber,
        formatCurrency,
        formatRelativeTime,
        formatFileSize,
        currentLanguage,
    }
}

/**
 * 国际化错误处理 Hook
 */
export const useI18nError = () => {
    const { t } = useI18n()

    const getErrorMessage = useCallback(
        (error: Error | string | unknown) => {
            if (typeof error === 'string') {
                return t(`errors.${error}`, { defaultValue: error })
            }

            if (error instanceof Error) {
                return t(`errors.${error.message}`, { defaultValue: error.message })
            }

            return t('errors.generic')
        },
        [t]
    )

    return {
        getErrorMessage,
    }
}