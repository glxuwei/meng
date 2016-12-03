import { Observable, ReplaySubject } from 'rxjs'
import { Resource, Success } from './inject'
import { ImplStore } from './'

/**
 * 合并数据源，source$是函数则递归执行，并切换到新的执行分支，
 * 所有的异步操作都需要combineLatest
 */
export function fork<S>(state$: ReplaySubject<S>, {source$, success}: Resource): Observable<S> {

    // stream
    if (source$ instanceof Observable) {
        return source$.map(implSelector(success))
    }
    // Promise
    else if (source$ instanceof Promise) {
        return Observable.fromPromise(source$).map(implSelector(success))
    }
    // Store
    else if (source$ instanceof ImplStore)
        return source$.store$.map(implSelector(success))

    //function，需要状态的函数换分支
    else if (source$ instanceof Function && source$.length > 0)
        return state$.flatMap(state => fork(state$, { source$: source$(this.state, state), success }))

    //不需要状态的函数继续执行
    else if (source$ instanceof Function && source$.length === 0)
        return fork(state$, { source$: source$(this.state, this.state), success })

    else
        return Observable.of(source$).map(implSelector(success))
}

export const combineLatestSelector = (acc: Object, x: Object) => Object.assign(acc, x)

export const resetCallback = (state: Object) => Object.assign(state, { callback: () => { } })

export const implSelector = (success: Success) => (state: Object) => typeof success === "string" ? ({ [success]: state }) : success(state)
