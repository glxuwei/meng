"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var rxjs_1 = require("rxjs");
var react_1 = require("react");
var shallowequal_1 = require("./utils/shallowequal");
var ImplStore = (function () {
    function ImplStore(initialState) {
        if (initialState === void 0) { initialState = {}; }
        var _this = this;
        this.state$ = new rxjs_1.ReplaySubject(1)
            .distinctUntilChanged(shallowequal_1.default)
            .scan(function (currentState, nextState) { return Object.assign(currentState, nextState); }, {});
        this.children = {};
        this.setState = function (nextState, callback) {
            _this.state$.next(nextState);
            if (callback)
                _this.state$.subscribe(callback).unsubscribe();
        };
        this.subscribe = function (success, error, complete) {
            return _this.state$.subscribe(success, error, complete);
        };
        this.state$.next(initialState);
    }
    return ImplStore;
}());
exports.ImplStore = ImplStore;
function createProxy(target) {
    return new Proxy(target, {
        get: function (target, name) {
            if (name in target)
                return target[name];
            else
                return target.children[name];
        }
    });
}
var rootStore = createProxy(new ImplStore());
var inject = function (source$, success) {
    return function (component) {
        component.resource.push({ source$: source$, success: success });
        return component;
    };
};
exports.inject = inject;
var lift = function (initialState) {
    if (initialState === void 0) { initialState = {}; }
    return function (component) {
        var displayName = component.displayName || component.name || Math.random().toString(32).substr(2);
        return _a = (function (_super) {
                __extends(LiftedComponent, _super);
                function LiftedComponent() {
                    var _this = _super.apply(this, arguments) || this;
                    _this._isMounted = false;
                    return _this;
                }
                LiftedComponent.prototype.componentWillUnmount = function () {
                    rootStore[displayName] = null;
                    this._isMounted = false;
                    this.haveOwnPropsChanged = false;
                    this.hasStoreStateChanged = false;
                    this.subscription.unsubscribe();
                    rootStore[displayName].subscription.unsubscribe();
                };
                LiftedComponent.prototype.componentWillReceiveProps = function (nextProps) {
                    rootStore[displayName].setState(nextProps);
                };
                LiftedComponent.prototype.componentWillMount = function () {
                    var _this = this;
                    var currentStore = new ImplStore(initialState);
                    component.prototype["setState"] = currentStore.setState.bind(currentStore);
                    rootStore.children[displayName] = currentStore;
                    this.main$ = currentStore.state$.combineLatest(rxjs_1.Observable.of(this.props), combineLatestSelector);
                    LiftedComponent.resource.forEach(function (source) { return _this.main$ = fork.call(_this, _this.main$, source); });
                    this.subscription = this.main$
                        .subscribe(currentStore.setState);
                    currentStore.subscription = currentStore.state$.subscribe(function (state) {
                        _this.hasStoreStateChanged = true;
                        _this.setState(state);
                    });
                };
                LiftedComponent.prototype.componentDidMount = function () {
                    this._isMounted = true;
                };
                LiftedComponent.prototype.shouldComponentUpdate = function () {
                    return this.hasStoreStateChanged;
                };
                LiftedComponent.prototype.render = function () {
                    this.hasStoreStateChanged = false;
                    var props = Object.assign({}, initialState, this.state);
                    return react_1.createElement(component, props);
                };
                return LiftedComponent;
            }(react_1.Component)),
            _a.displayName = "Meng(" + displayName + ")",
            _a.resource = [],
            _a;
        var _a;
    };
};
exports.lift = lift;
function fork(main$, _a) {
    var source$ = _a.source$, success = _a.success;
    if (source$ instanceof rxjs_1.Observable)
        return main$.combineLatest(source$.map(function (source) {
            return typeof success === "string" ? (_a = {}, _a[success] = source, _a) : success(source);
            var _a;
        }), combineLatestSelector);
    else if (source$ instanceof Promise)
        return main$.combineLatest(rxjs_1.Observable.fromPromise(source$).map(function (source) {
            return typeof success === "string" ? (_a = {}, _a[success] = source, _a) : success(source);
            var _a;
        }), combineLatestSelector);
    else if (source$ instanceof ImplStore)
        return main$.combineLatest(source$.state$.map(function (source) {
            return typeof success === "string" ? (_a = {}, _a[success] = source, _a) : success(source);
            var _a;
        }), combineLatestSelector);
    else if (source$ instanceof Function && source$.length > 0)
        return main$.concatMap(function (state) { return fork(main$, { source$: source$(state), success: success }).map(function (api) { return Object.assign(state, api); }); });
    else if (source$ instanceof Function && source$.length === 0)
        return fork(main$, { source$: source$(), success: success });
    else
        return main$.combineLatest(rxjs_1.Observable.of(typeof success === "string" ? (_b = {}, _b[success] = source$, _b) : success(source$)), combineLatestSelector);
    var _b;
}
var combineLatestSelector = function (acc, x) { return Object.assign(acc, x); };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rootStore;
