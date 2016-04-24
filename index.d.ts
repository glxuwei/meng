import { ComponentClass, StatelessComponent } from 'react';
declare const Store: {
    state: {};
    setState: (state: Object, callback?: () => void) => void;
};
export interface component<P, S> extends ComponentClass<P> {
    displayName?: string;
    name?: string;
    resource?: Object;
}
export interface Stateless<P> extends StatelessComponent<P> {
    name?: string;
}
export declare const lift: (initialState?: Object) => <P, S>(component: component<P, S> | Stateless<P>) => any;
export declare const resource: (source: any, name: string) => <T>(Component: any) => any;
export declare const getStore: () => {
    state: {};
    setState: (state: Object, callback?: () => void) => void;
};
export default Store;
