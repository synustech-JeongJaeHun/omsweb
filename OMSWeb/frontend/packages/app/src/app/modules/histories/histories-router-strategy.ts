import {
	RouteReuseStrategy,
	ActivatedRouteSnapshot,
	DetachedRouteHandle,
} from '@angular/router'

const getPath = (p) => p.url.map((seg) => seg.path).join('/')

export class HistoriesRouterStrategy implements RouteReuseStrategy {
	private cache = new Map<string, DetachedRouteHandle>()
	private vailidateRoute(route: ActivatedRouteSnapshot) {
		//@ts-ignore
		const fullPath = route._routerState.url
		const mainPathArray = ['histories']
		const subPathArray = ['transfer', 'vehicles', 'alarms']
		if (
			mainPathArray.some((e) => fullPath.includes(e)) &&
			subPathArray.some((e) => getPath(route).startsWith(e))
		) {
			return true
		}
		return false
	}

	shouldDetach(route: ActivatedRouteSnapshot): boolean {
		return this.vailidateRoute(route)
	}

	store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle) {
		this.cache.set(getPath(route), detachedTree)
	}

	shouldAttach(route: ActivatedRouteSnapshot): boolean {
		const path = getPath(route)

		// 상위 라우터 이동시 캐시 초기화
		if (route.routeConfig.path === '') {
			this.cache = new Map<string, DetachedRouteHandle>()
		}

		if (this.cache.has(path)) {
			return true
		}
		return false
	}
	retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
		const cacheHit = this.cache.get(getPath(route))
		if (cacheHit) return cacheHit
		return null
	}
	shouldReuseRoute(
		future: ActivatedRouteSnapshot,
		curr: ActivatedRouteSnapshot,
	): boolean {
		return future.routeConfig === curr.routeConfig
	}
}
