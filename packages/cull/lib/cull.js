/*!
 * @pixi-essentials/cull - v1.0.0
 * Compiled Tue, 30 Jun 2020 16:20:53 UTC
 *
 * @pixi-essentials/cull is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');

var tempRect = new pixi_js.Rectangle();
/**
 * WIP: Better culling than pixi-cull
 */
var Cull = /** @class */ (function () {
    function Cull(options) {
        if (options === void 0) { options = {}; }
        this._toggle = options.toggle || 'visible';
        this._targetList = new Set();
    }
    Cull.prototype.add = function (target) {
        this._targetList.add(target);
    };
    Cull.prototype.addAll = function (targets) {
        for (var i = 0, j = targets.length; i < j; i++) {
            this._targetList.add(targets[i]);
        }
    };
    Cull.prototype.remove = function (target) {
        this._targetList.delete(target);
    };
    Cull.prototype.removeAll = function (targets) {
        for (var i = 0, j = targets.length; i < j; i++) {
            this._targetList.delete(targets[i]);
        }
    };
    Cull.prototype.clear = function () {
        this._targetList.clear();
    };
    /**
     * @param rect - the rectangle outside of which display-objects should be culled
     * @param skipUpdate - whether to skip transform update
     */
    Cull.prototype.cull = function (rect, skipUpdate) {
        var _this = this;
        if (skipUpdate === void 0) { skipUpdate = false; }
        this._targetList.forEach(function (target) {
            if (!skipUpdate) {
                var parent = target.parent;
                // TODO: pixi.js 5.3.0 use enableTempParent()
                if (!target.parent) {
                    target.parent = target._tempDisplayObjectParent;
                }
                target.updateTransform();
                target.parent = parent;
            }
            _this.cullRecursive(rect, target);
        });
    };
    Cull.prototype.cullRecursive = function (rect, displayObject) {
        // NOTE: getBounds can skipUpdate because updateTransform is invoked before culling.
        var bounds = displayObject.getBounds(true, tempRect);
        displayObject[this._toggle] = bounds.right > rect.left
            && bounds.left < rect.right
            && bounds.bottom > rect.top
            && bounds.top < rect.bottom;
        // Only cull children if this display-object is visible. It is expected that the bounds
        // of children lie inside of its own.
        if (displayObject[this._toggle]) {
            this.cullRecursive(rect, displayObject);
        }
    };
    return Cull;
}());

exports.Cull = Cull;
//# sourceMappingURL=cull.js.map
