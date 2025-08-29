/*
 * 需求列表
 *
 * ==基本需求==
 * - 单例axios 控制器
 * - 响应拦截
 * - 错误处理、重试
 * * 完整的ts 类型支持
 *
 * ==待验证需求==
 * 缓存处理
 * Loading 状态管理
 * 响应数据格式化
 * 重复请求识别和取消
 * 请求队列管理
 */

import axios, { AxiosError } from 'axios'
import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios'

// 业务响应结构
interface ResponseData<T> {
    code: number
    data: T
    message: string
    success: boolean
}

interface RequestConfig extends AxiosRequestConfig {
    baseURL: string
    headers?: AxiosRequestConfig['headers']
    timeout?: number
    withCredentials?: boolean

    // internal used
    retryCount?: number
    b_option?: AxiosCustomOptions
}

interface AxiosCustomOptions {
    onLogout?: () => void
}

interface TokenInfo {
    accessToken: string
    refreshToken: string
    expiresAt: number
}

class AxiosController {
    private static instance: AxiosController
    public axiosInstance: AxiosInstance
    private static reqConfig: RequestConfig

    //
    private onLogout?: () => void
    private maxRetryCount = 2

    private constructor(baseConfig: RequestConfig) {
        console.info('创建 AxiosController 实例')
        // 原生 axios 实例
        this.axiosInstance = axios.create(baseConfig)
        AxiosController.reqConfig = baseConfig
        this.onLogout = baseConfig.b_option?.onLogout
        this.setupInterceptors()
    }

    static getInstance(config: RequestConfig): AxiosController {
        if (!AxiosController.instance) {
            AxiosController.instance = new AxiosController(config)
        }

        return AxiosController.instance
    }

    private setupInterceptors() {
        this.axiosInstance.interceptors.request.use(
            // 中间件，对每个处理方法，注入了成功和失败回调方法
            (config) => this.handleRequest(config),
            (error) => this.handleRequestError(error),
        )

        this.axiosInstance.interceptors.response.use(
            (response) => this.handleResponse(response),
            (error) => this.handleResponseError(error),
        )
    }

    // 获取本地 token 信息
    private getTokenInfo(): TokenInfo | null {
        const tokenStr = localStorage.getItem('tokenInfo')
        if (!tokenStr) return null

        try {
            return JSON.parse(tokenStr) as TokenInfo
        } catch {
            return null
        }
    }

    // 存储Token
    private setTokenInfo(tokenInfo: TokenInfo) {
        localStorage.setItem('tokenInfo', JSON.stringify(tokenInfo))
    }

    private clearTokenInfo() {
        localStorage.removeItem('tokenInfo')
    }

    // 刷新 token
    private async refreshAccessToken(): Promise<string> {
        // TODO : 检索队列是重复

        const tokenInfo = this.getTokenInfo()
        if (!tokenInfo?.refreshToken) {
            throw new Error('No refresh token available')
        }

        // TODO: 放入队列汇总

        try {
            return await this.performTokenRefresh(tokenInfo.refreshToken)
        } catch (error) {
            throw error
        }
    }

    // 使用 refresh token 更新 access token
    private async performTokenRefresh(refreshToken: string): Promise<string> {
        // 调试：确认是否进入刷新分支
        console.log('REFRESH CALL', refreshToken)

        try {
            // 使用原生 axios 避免拦截器循环调用
            // TODO ： 配置API path
            const response = await axios.post(
                '/auth/refresh',
                {
                    refreshToken,
                },
                {
                    // static reqConfig
                    baseURL: AxiosController.reqConfig.baseURL,
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )

            const { data } = response.data as ResponseData<{
                accessToken: string
                refreshToken: string
                expiresIn: number
            }>

            if (!data?.accessToken) {
                throw new Error('Invalid refresh response')
            }

            // 更新token信息
            const newTokenInfo: TokenInfo = {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: Date.now() + data.expiresIn * 1000,
            }

            // 设置本地存储
            this.setTokenInfo(newTokenInfo)
            return data.accessToken
        } catch (error) {
            // 刷新失败，清除所有token信息并重定向到登录页
            this.clearTokenInfo()
            // TODO : 注入 刷新失败手柄函数
            // const handle = () => void 0
            this.handleTokenRefreshFailure()
            throw error
        }
    }

    private handleTokenRefreshFailure() {
        // TODO : i18n
        console.warn('Token refresh failed, redirecting to login')

        // TODO : 跳转逻辑，注入函数

        this.logout()
    }

    // 获取确定有效的 token
    private async ensureValidToken(): Promise<string | null> {
        // 获取 token
        const tokenInfo = this.getTokenInfo()
        if (!tokenInfo) return null

        // 判断是否过期
        if (this.isTokenExpired(tokenInfo)) {
            // 尝试刷新
            try {
                return await this.refreshAccessToken()
            } catch (error) {
                // return null
                throw error
            }
        }

        // 到达更新阀值
        if (this.shouldRefreshToken()) {
            // 更新 token
            // 不阻塞
            // 调用控制台日志
            this.refreshAccessToken().catch(console.error)
        }

        return tokenInfo.accessToken
    }

    // TODO : 判断是否需要刷新token
    private shouldRefreshToken(): boolean {
        const tokenInfo = this.getTokenInfo()
        if (!tokenInfo) return false

        const { expiresAt } = tokenInfo
        const now = Date.now()

        // 判断是否接近过期
        // TODO : 可配置
        return now > expiresAt - 5 * 60 * 1000 // 提前 5 分钟刷新
    }

    private isTokenExpired(tokenInfo: TokenInfo): boolean {
        return Date.now() >= tokenInfo.expiresAt
    }

    // 暂时定制
    // 双 token 设计
    private async handleRequest(
        config: InternalAxiosRequestConfig,
    ): Promise<InternalAxiosRequestConfig> {
        // 确认 token 有效
        // const accessToken = localStorage.getItem('accessToken')
        const accessToken = await this.ensureValidToken()

        // 携带token
        if (accessToken) {
            // RFC 6750：OAuth 2.0 Bearer Token
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }

        return config
    }

    private handleRequestError(error: AxiosError): AxiosError {
        return error
    }

    private handleResponse(response: AxiosResponse): AxiosResponse {
        return response
    }

    private async handleResponseError(error: AxiosError): Promise<AxiosError> {
        // token 问题
        // TODO ： 错误处理
        const config = error.config as RequestConfig
        const status = error.response?.status

        // token 无效
        if (status === 401 && config && !config.url?.includes('/auth/refresh')) {
            try {
                // 重新获取 token
                const newAccessToken = await this.refreshAccessToken()
                if (newAccessToken && config.headers) {
                    // 更新请求头
                    config.headers['Authorization'] = `Bearer ${newAccessToken}`
                    // 重新发送请求
                    return this.axiosInstance.request(config)
                }
            } catch (refreshError) {
                // TODO : 可配置 重定向
                console.warn('Token refresh failed during response handling', refreshError)
                return Promise.reject({
                    // TODO : 格式化输出
                })
            }
        }

        // 网络问题
        // TODO ： 重试机制
        if (config && this.shouldRetry(error) && (config.retryCount || 0) < this.maxRetryCount) {
            // TODO : 延时，每次翻倍
            config.retryCount = config.retryCount || 0
            const delay = Math.pow(2, config.retryCount!) * 1000
            await new Promise((resolve) => setTimeout(resolve, delay))

            config.retryCount++
            return this.axiosInstance.request(config)
        }

        let errorMessage = 'Request failed'

        if (error.response) {
            switch (status) {
                case 400:
                    errorMessage = 'Invalid request parameters'
                    break
                case 401:
                    errorMessage = 'Unauthorized, please login again'
                    break
                case 403:
                    errorMessage = 'Access denied'
                    break
                case 404:
                    errorMessage = 'Resource not found'
                    break
                case 500:
                    errorMessage = 'Internal server error'
                    break
                default:
                    errorMessage = `Request error ${status}`
            }
        } else if (error.request) {
            errorMessage = 'Network connection failed'
        } else {
            errorMessage = error.message || 'Request failed'
        }

        console.warn(error)
        return Promise.reject({
            // TODO : 定义结构体
            message: errorMessage,
            code: status,
            config,
        })
    }

    private shouldRetry(error: AxiosError): boolean {
        // TODO : 网络错误或超时 ** 暂定数据结构
        if (error.code === 'ECONNABORTED' || !error.response) {
            return true
        }

        const status = error.response?.status
        // 5xx 服务器错误
        if (status && status >= 500 && status < 600) {
            return true
        }

        return false
    }

    // 公共方法
    public login(tokenInfo: TokenInfo): void {
        this.setTokenInfo(tokenInfo)
    }

    public logout(): void {
        this.clearTokenInfo()
        // TODO ： 跳转到登录页
        if (this.onLogout) {
            this.onLogout()
        }
    }

    public isAuthenticated(): boolean {
        const tokenInfo = this.getTokenInfo()
        return tokenInfo !== null && !this.isTokenExpired(tokenInfo)
    }

    // 公共方法 -- get等
    public get<T>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
        console.log('进入 get', url, config, 'this.axiosInstance.get')

        return this.axiosInstance.get<T>(url, config)
    }

    public post<T>(
        url: string,
        data?: Record<string, unknown>,
        config?: RequestConfig,
    ): Promise<AxiosResponse<T>> {
        console.log('进入 post', url, 'this.axiosInstance.post')

        return this.axiosInstance.post<T>(url, data, config)
    }
}

/**
 * 获取全局唯一 AxiosController 实例
 * 用法：const api = createAxiosController(config)
 */
export function createAxiosController(baseConfig: RequestConfig): AxiosController {
    return AxiosController.getInstance(baseConfig)
}

export type { RequestConfig, AxiosController }
