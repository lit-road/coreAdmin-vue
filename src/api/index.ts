import { createAxiosController } from '@/utils/AxiosController'
import { router } from '@/router'
//interface
import type { RequestConfig, AxiosController } from '@/utils/AxiosController'

// const router = useRouter()
const path: string = `${window.location.protocol}//${import.meta.env.VITE_AXIOS_BASE_URL ?? window.location.hostname}${import.meta.env.VITE_AXIOS_BASE_PORT ?? ':' + window.location.port}`
const baseConfig: RequestConfig = {
    baseURL: path,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        withCredentials: 'false',
        //'think-lang': config.lang.defaultLang,
    },

    b_option: {
        onLogout: () => {
            // TODO: Implement logout logic
            router.push('/login')
        },
    },
}

/*
 * 创建实例
 */
const axiosController: AxiosController = createAxiosController(baseConfig)
const api = axiosController.axiosInstance
/*
 * 封装
 */

export { axiosController as apiController, api }
