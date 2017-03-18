"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var _1 = require("./");
var rxjs_1 = require("rxjs");
var fork_1 = require("./fork");
var shallowEqual_1 = require("./utils/shallowEqual");
exports.lift = function (initialState, initialName) {
    if (initialState === void 0) { initialState = {}; }
    return function (component) {
        var displayName = initialName || component.displayName || component.name || Math.random().toString(32).substr(2);
        return _a = (function (_super) {
                __extends(LiftedComponent, _super);
                function LiftedComponent(props) {
                    var _this = _super.call(this, props) || this;
                    var currentStore = new _1.ImplStore();
                    _this.state = Object.assign({ setState: currentStore.setState }, initialState, props);
                    _1.default.children[displayName] = currentStore;
                    var state$ = rxjs_1.Observable.of(_this.state);
                    var resource$ = rxjs_1.Observable.from(LiftedComponent.resource);
                    var parts = resource$.partition(function (resource) { return resource.source$ instanceof Function && resource.source$.length > 0; });
                    var asyncResource = parts[1].map(function (source) { return fork_1.fork(source); });
                    var asyncResource$ = rxjs_1.Observable.from(asyncResource).mergeAll();
                    var store$ = currentStore.state$
                        .merge(state$, asyncResource$)
                        .scan(function (currentStore, nextState) { return Object.assign({}, currentStore, nextState); })
                        .publishReplay(2)
                        .refCount()
                        .pairwise();
                    var listenResource = parts[0].map(function (source) { return fork_1.fork.call(_this, source, store$); });
                    var listenResource$ = rxjs_1.Observable.from(listenResource).mergeAll();
                    currentStore.store$ = store$.map(function (pairstore) { return pairstore[1]; }).merge(listenResource$).scan(function (nextStore, nextStoreOrState) { return Object.assign(nextStore, nextStoreOrState); });
                    return _this;
                }
                LiftedComponent.prototype.componentWillUnmount = function () {
                    _1.default.children[displayName] = null;
                    this.hasStoreStateChanged = false;
                    this.subscription.unsubscribe();
                };
                LiftedComponent.prototype.componentWillReceiveProps = function (nextProps) {
                    _1.default.children[displayName].setState(nextProps);
                };
                LiftedComponent.prototype.componentDidMount = function () {
                    var _this = this;
                    var currentStore = _1.default.children[displayName];
                    this.subscription =
                        currentStore.store$
                            .filter(function (store) { return !shallowEqual_1.default(_this.state, store); })
                            .subscribe(function (state) {
                            _this.hasStoreStateChanged = true;
                            var callback = state.callback || (function () { });
                            delete state.callback;
                            _this.setState(state, callback);
                        });
                };
                LiftedComponent.prototype.shouldComponentUpdate = function () {
                    return this.hasStoreStateChanged;
                };
                LiftedComponent.prototype.render = function () {
                    this.hasStoreStateChanged = false;
                    return react_1.createElement(component, this.state);
                };
                return LiftedComponent;
            }(react_1.Component)),
            _a.displayName = "Meng(" + displayName + ")",
            _a.resource = [],
            _a;
        var _a;
    };
};
//# sourceMappingURL=lift.js.map