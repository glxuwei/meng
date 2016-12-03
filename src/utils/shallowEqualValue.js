"use strict";
function shallowEqualValue(source, target) {
    var targetKeys = Object.keys(target);
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var i = 0; i < targetKeys.length; i++) {
        if (!hasOwn.call(source, targetKeys[i]) ||
            source[targetKeys[i]] !== target[targetKeys[i]]) {
            return false;
        }
    }
    return true;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shallowEqualValue;
