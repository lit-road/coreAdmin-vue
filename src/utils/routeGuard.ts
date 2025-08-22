import { router } from '@/router'

export class RouteGuard {
    private static instance: RouteGuard

    public static getInstance(): RouteGuard {
        if (!RouteGuard.instance) {
            RouteGuard.instance = new RouteGuard()
        }
        return RouteGuard.instance
    }

    public setupGuards(): void {
        router.beforeEach((to, from, next) => {
            this.handleBeforeEach(to, from, next)
        })

        router.afterEach((to, from) => {
            this.handleAfterEach(to, from)
        })

        router.onError((error) => {
            this.handleError(error)
        })
    }

    private handleBeforeEach(to: any, from: any, next: any): void {
        const token = localStorage.getItem('token')

        if (to.meta.requiresAuth && !token) {
            next('/login')
        } else if (to.path === '/login' && token) {
            next('/')
        } else {
            next()
        }
    }

    private handleAfterEach(to: any, from: any): void {
        document.title = to.meta.title || 'Admin System'
    }

    private handleError(error: any): void {
        console.error('Router error:', error)
        router.push('/error')
    }
}

export const routeGuard = RouteGuard.getInstance()
