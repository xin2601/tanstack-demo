/**
 * 全局类型声明
 */

import type { i18n } from 'i18next'

declare global {
    interface Window {
        i18n?: i18n
    }
}

export { }