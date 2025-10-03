/**
 * 语言切换组件
 * 提供用户界面的语言切换功能
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages, Check } from 'lucide-react'
import { useLanguageSwitcher } from '@/i18n/hooks'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
    variant?: 'default' | 'ghost' | 'outline'
    size?: 'default' | 'sm' | 'lg'
    showText?: boolean
    className?: string
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    variant = 'ghost',
    size = 'default',
    showText = false,
    className,
}) => {
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguageSwitcher()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={cn('gap-2', className)}
                    aria-label="切换语言 / Switch Language"
                >
                    <Languages className="h-4 w-4" />
                    {showText && (
                        <span className="hidden sm:inline-block">
                            {currentLanguage.name}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
                {availableLanguages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <span>{language.name}</span>
                        {language.isActive && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/**
 * 简单的语言切换按钮（循环切换）
 */
export const SimpleLanguageSwitcher: React.FC<{
    className?: string
}> = ({ className }) => {
    const { currentLanguage, switchToNext } = useLanguageSwitcher()

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={switchToNext}
            className={cn('gap-2', className)}
            aria-label={`当前语言: ${currentLanguage.name} / Current Language: ${currentLanguage.name}`}
        >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-medium">
                {currentLanguage.code === 'zh-CN' ? '中' : 'EN'}
            </span>
        </Button>
    )
}

/**
 * 内联语言切换器（用于设置页面等）
 */
export const InlineLanguageSwitcher: React.FC<{
    className?: string
}> = ({ className }) => {
    const { currentLanguage, availableLanguages, changeLanguage } = useLanguageSwitcher()

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Languages className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1">
                {availableLanguages.map((language, index) => (
                    <React.Fragment key={language.code}>
                        <button
                            onClick={() => changeLanguage(language.code)}
                            className={cn(
                                'px-2 py-1 text-sm rounded transition-colors',
                                language.isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            {language.name}
                        </button>
                        {index < availableLanguages.length - 1 && (
                            <span className="text-muted-foreground">|</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default LanguageSwitcher