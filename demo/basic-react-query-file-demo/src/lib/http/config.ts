// HTTP客户端配置
export const httpConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
}

// 环境特定配置
export const environmentConfigs = {
    development: {
        baseURL: 'http://localhost:3001/api',
        timeout: 10000,
        retries: 3,
    },
    production: {
        baseURL: 'https://api.yourapp.com',
        timeout: 5000,
        retries: 2,
    },
    staging: {
        baseURL: 'https://staging-api.yourapp.com',
        timeout: 8000,
        retries: 3,
    },
}

// 获取当前环境配置
export const getCurrentConfig = () => {
    const env = import.meta.env.MODE as keyof typeof environmentConfigs
    return {
        ...httpConfig,
        ...environmentConfigs[env] || environmentConfigs.development,
    }
}