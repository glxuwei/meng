import { ObservableInput } from "rxjs/Observable"
import { ComponentClass } from "react"

export type Inject = ObservableInput<Object> | (() => any) | any

export type Listen<S> = (currentStore: Partial<S>, nextStore: Partial<S>) => Inject

export type Success<S> = string | ((currentState: S, state: Partial<S>) => object)

export type AsyncResource<S> = { source$: Inject, success: Success<S> }

export type ListenResource<S> = { source$: Listen<S>, success: Success<S> }

export const inject = <S>(source$: Inject, success: Success<S>) =>
  <S>(component: ComponentClass<S>): any => {
    (component as any).asyncResource.push({ source$, success })
    return component
  }

export const listen = <S>(source$: Listen<S>, success: Success<S>) =>
  <S>(component: ComponentClass<S>): any => {
    (component as any).listenResource.push({ source$, success })
    return component
  }
