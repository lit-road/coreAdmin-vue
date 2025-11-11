// -[x] 单例模式相关测试
import { describe, it, expect } from 'vitest'
import { createAxiosController, type RequestConfig } from '../AxiosController'

const baseConfig1: RequestConfig = {
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 1000,
}

const baseConfig2: RequestConfig = {
    baseURL: 'https://jsonplaceholder.typicode.cn',
    timeout: 2000,
}

describe('Axios Singleton Pattern', () => {
    it('should return the same instance for multiple calls', () => {
        const instance1 = createAxiosController(baseConfig1)
        const instance2 = createAxiosController(baseConfig2)
        expect(instance1).toBe(instance2)
    })
})
