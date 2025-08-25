import { createAxios } from '@/utils/axios.ts'
//interface
import type { RequestConfig } from '@/utils/axios.ts'

const path: string = `${window.location.protocol}//${import.meta.env.VITE_AXIOS_BASE_URL ?? window.location.hostname}${import.meta.env.VITE_AXIOS_BASE_PORT ?? ':' + window.location.port}`
const baseConfig: RequestConfig = {
    baseURL: path,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        withCredentials: true,
        //'think-lang': config.lang.defaultLang,
    },
}

/*
 * 创建实例
 */
const instanceAxios: Axios = new createAxios(baseConfig)

/*
 * 封装
 */

class Axios {
    private static instance: AxiosInstance | null = null
    private static config: RequestConfig | null = null

    private constructor() {}

    static getInstance(config?: RequestConfig): AxiosInstance {
        if (!Axios.instance) {
            if (!config) {
                throw new Error('Config required for first initialization')
            }
            Axios.config = config
            Axios.instance = axios.create(config)
            console.info('创建 axios 实例')
        }
        return Axios.instance
    }
}

export function createAxiosInstance(config: RequestConfig): AxiosInstance {
    return Axios.getInstance(config)
}
