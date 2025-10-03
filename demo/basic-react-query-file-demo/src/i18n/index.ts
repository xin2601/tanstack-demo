/**
 * i18n 国际化配置
 * 使用 react-i18next 实现多语言支持
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 导入语言资源
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

// 支持的语言列表
export const supportedLanguages = {
    'zh-CN': '简体中文',
    'en-US': 'English',
} as const

export type SupportedLanguage = keyof typeof supportedLanguages

// 默认语言
export const defaultLanguage: SupportedLanguage = 'zh-CN'

// 语言资源
const resources = {
    'zh-CN': {
        translation: zhCN,
    },
    'en-US': {
        translation: enUS,
    },
}

// 初始化 i18n
i18n
    .use(LanguageDetector) // 自动检测用户语言
    .use(initReactI18next) // 绑定 react-i18next
    .init({
        resources,
        fallbackLng: defaultLanguage,
        debug: import.meta.env.DEV,

        // 语言检测配置
        detection: {
            // 检测顺序：localStorage -> navigator -> htmlTag -> path -> subdomain
            order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            // 缓存用户语言选择
            caches: ['localStorage'],
            // localStorage 键名
            lookupLocalStorage: 'i18nextLng',
        },

        interpolation: {
            escapeValue: false, // React 已经处理了 XSS
        },

        // 命名空间配置
        defaultNS: 'translation',
        ns: ['translation'],

        // 键分隔符
        keySeparator: '.',
        nsSeparator: ':',

        // 返回对象而不是字符串（用于复杂的翻译结构）
        returnObjects: true,
    })

export default i18n