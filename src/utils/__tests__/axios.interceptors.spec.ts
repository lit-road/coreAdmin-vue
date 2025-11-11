// 响应拦截器相关测试
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAxiosController, type RequestConfig, type AxiosController } from '../AxiosController'

vi.mock('axios')
const mockAxios = vi.mocked(axios)

import axios, { type AxiosInstance, type AxiosResponse, type AxiosRequestConfig } from 'axios'

const baseConfig: RequestConfig = {
    baseURL: 'https://api.example.com',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
}

interface TokenInfo {
    accessToken?: string
    refreshToken: string
    expiresAt: number
}

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}

// 注入
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Axios Interceptors', () => {
    // 公共
    let requestInterceptor: <T>(config: T) => T
    let mockAxiosInstance: AxiosInstance
    let apiController: AxiosController

    beforeEach(() => {
        // 准备模拟环境
        // vi.resetAllMocks()
        // 借尸还魂

        mockAxiosInstance = {
            // get: vi.fn(),
            // post: vi.fn().mockImplementation((url: string) => {
            //     if (url === '/auth/refresh') {
            //         return Promise.resolve({
            //             data: {
            //                 code: 0,
            //                 data: {
            //                     accessToken: 'newAccessToken',
            //                     refreshToken: 'refreshToken',
            //                     expiresIn: 3600,
            //                 },
            //                 message: '',
            //                 success: true,
            //             },
            //         })
            //     }
            //     if (url === '/other/api') {
            //         return Promise.resolve({
            //             data: {
            //                 code: 1,
            //                 data: {},
            //                 message: 'other',
            //                 success: false,
            //             },
            //         })
            //     }
            //     // 默认返回
            //     return Promise.resolve({ data: {} })
            // }),
            post: vi.fn().mockImplementation((url: string) => {
                if (url === '/auth/refresh') {
                    return Promise.resolve({
                        data: {
                            code: 0,
                            data: {
                                accessToken: 'newAccessToken',
                                refreshToken: 'refreshToken',
                                expiresIn: 3600,
                            },
                            message: '',
                            success: true,
                        },
                    })
                }
                if (url === '/other/api') {
                    return Promise.resolve({
                        data: {
                            code: 1,
                            data: {},
                            message: 'other',
                            success: false,
                        },
                    })
                }
                // 默认返回
                return Promise.resolve({ data: {} })
            }),
            put: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
            request: vi.fn(),
            interceptors: {
                request: {
                    use: vi.fn((interceptor, errorInterceptor) => {
                        console.log(interceptor, 'request interceptor')
                        console.log(errorInterceptor, 'error interceptor')

                        requestInterceptor = interceptor
                        return 0
                    }),
                    eject: vi.fn(), // mock 方法，返回 void
                    clear: vi.fn(), // mock 方法，返回 void
                },
                response: {
                    use: vi.fn(),
                    eject: vi.fn(),
                    clear: vi.fn(),
                },
            },
            create: vi.fn(),
        } as unknown as AxiosInstance

        vi.spyOn(mockAxios, 'create').mockReturnValue(mockAxiosInstance)
        // vi.spyOn(axios, 'post').mockImplementation((url: string) => {
        //     if (url === '/auth/refresh') {
        //         return Promise.resolve({
        //             data: {
        //                 code: 0,
        //                 data: {
        //                     accessToken: 'newAccessToken',
        //                     refreshToken: 'refreshToken',
        //                     expiresIn: 3600,
        //                 },
        //                 message: '',
        //                 success: true,
        //             },
        //         })
        //     }
        //     if (url === '/other/api') {
        //         return Promise.resolve({
        //             data: {
        //                 code: 1,
        //                 data: {},
        //                 message: 'other',
        //                 success: false,
        //             },
        //         })
        //     }
        //     // 默认返回
        //     return Promise.resolve({ data: {} })
        // })

        apiController = createAxiosController(baseConfig)
        // vi.spyOn(apiController.instance, 'instance')
    })

    // afterEach(() => {
    //     vi.resetAllMocks()
    // })

    describe('Request Interceptor', () => {
        it('从本地获取token', async () => {
            // 步骤1：存储 tokenInfo 到本地 localStorage
            const tokenInfo: TokenInfo = {
                accessToken: 'mockAccessToken',
                refreshToken: 'mockRefreshToken',
                expiresAt: Date.now() + 1000, // 1秒后过期
            }

            localStorageMock.getItem.mockReturnValue(JSON.stringify(tokenInfo))

            // 步骤2：调用内部拦截器，它会用添加token
            await apiController.get('/test/api')
            // 判断内部是否调用 本地存储
            // expect(vi.spyOn(localStorageMock, 'getItem')).toHaveBeenCalled()

            // TODO：3、正确的返回正常的
            // 步骤3：
            const result: AxiosRequestConfig = await requestInterceptor({
                method: 'GET',
                url: '/test',
                headers: {},
            })

            const config = result.headers?.['Authorization']
            expect(config).toBe('Bearer mockAccessToken')
            // TODO：4、token临近失效阈值，会自动触发更新
        })

        it('当过期点在阈值内，更新 token', async () => {
            // 步骤1：存储 tokenInfo 到本地 localStorage
            // 固定时间
            const fixedTime = 1690000000000
            vi.useFakeTimers()
            vi.setSystemTime(fixedTime)

            const tokenInfo: TokenInfo = {
                accessToken: 'mockAccessToken',
                refreshToken: 'mockRefreshToken',
                expiresAt: fixedTime + 1000, // 1秒后过期
            }

            localStorageMock.getItem.mockReturnValue(JSON.stringify(tokenInfo))
            // TODO：5、token过期后会使用 refresh token 刷新 access token
            // // mock axios.post 刷新 token
            // 断言 localStorage.setItem 被调用，说明 token 已刷新
            const a = await apiController.get('/test/refresh/timeout')
            console.log(a, 'a', axios.get.mock.calls)

            // 对于private 函数进行路径判断
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'tokenInfo',
                expect.stringContaining('newAccessToken'),
            )

            // expect(localStorageMock.getItem).toHaveBeenCalled()
            vi.useRealTimers()
        })

        it('没有 accessToken 时应自动刷新并设置新 token', async () => {
            // localStorage 只存储 refreshToken，无 accessToken
            const tokenInfo: TokenInfo = {
                refreshToken: 'mockRefreshToken',
                expiresAt: Date.now() + 3600 * 1000,
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(tokenInfo))
            await apiController.get('/test/no-access-token')
            // 断言 setItem 被调用，说明 token 已刷新
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'tokenInfo',
                expect.stringContaining('newAccessToken'),
            )
        })

        it('token 过期后自动刷新', async () => {
            // token 已过期
            const tokenInfo: TokenInfo = {
                accessToken: 'expiredToken',
                refreshToken: 'mockRefreshToken',
                expiresAt: Date.now() - 1000,
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(tokenInfo))

            await apiController.get('/test/expired-token')
            // REFLOG: 如果没有这个。是监听不到axios 被触发的。
            await requestInterceptor({
                method: 'GET',
                url: '/test',
                headers: {},
            })
            // 断言 mockAxios.post 调用 '/auth/refresh'，参数只断言第一个即可
            // REFLOG: 必须用requestInterceptor
            expect(mockAxios.post).toHaveBeenCalledWith(
                '/auth/refresh',
                expect.anything(),
                expect.anything(),
            )
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'tokenInfo',
                expect.stringContaining('newAccessToken'),
            )
        })

        it('网络错误自动重试', async () => {
            let callCount = 0
            mockAxiosInstance.get.mockImplementation(() => {
                callCount++
                if (callCount === 1) throw { code: 'ECONNABORTED' }
                return Promise.resolve({ data: {}, status: 200 })
            })
            await apiController.get('/test/network-retry')
            console.log(callCount)

            expect(callCount).toBeGreaterThan(1)
        })
    })

    it('should handle 401 response and trigger token refresh', async () => {
        // const api = createAxiosController(baseConfig)
        // // mock refreshAccessToken
        // vi.spyOn(api, 'refreshAccessToken').mockResolvedValue('newToken')
        // // mock axiosInstance.request
        // vi.spyOn(api.axiosInstance, 'request').mockResolvedValue({ data: { code: 0 } })
        // // mock error
        // const error = {
        //     response: { status: 401 },
        //     config: { url: '/test', headers: {} },
        // }
        // const result = await (api as any).handleResponseError(error)
        // expect(api.refreshAccessToken).toHaveBeenCalled()
        // expect(result.data.code).toBe(0)
    })
})
