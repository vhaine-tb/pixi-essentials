/*!
 * @pixi-essentials/cull - v1.0.1
 * Compiled Sun, 05 Jul 2020 15:17:15 UTC
 *
 * @pixi-essentials/cull is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pixi_js = require('pixi.js');

var tempRect = new pixi_js.Rectangle();
/**
 * Provides a simple, configurable mechanism for culling a subtree of your scene graph.
 *
 * If your scene graph is not static, culling needs to be done before rendering. You
 * can run it on the `prerender` event fired by the renderer.
 */
var Cull = /** @class */ (function () {
    /**
     * @param options
     * @param [options.recursive] - whether culling should be recursive
     * @param [options.toggle='renderable'] - which property of display-object was be set to indicate
     *      its culling state. It should be one of `renderable`, `visible`.
     */
    function Cull(options) {
        if (options === void 0) { options = {}; }
        this._recursive = typeof options.recursive === 'boolean' ? options.recursive : true;
        this._toggle = options.toggle || 'visible';
        this._targetList = new Set();
    }
    /**
     * Adds a display-object to the culling list
     *
     * @param target - the display-object to be culled
     * @return this
     */
    Cull.prototype.add = function (target) {
        this._targetList.add(target);
        return this;
    };
    /**
     * Adds all the display-objects to the culling list
     *
     * @param targets - the display-objects to be culled
     * @return this
     */
    Cull.prototype.addAll = function (targets) {
        for (var i = 0, j = targets.length; i < j; i++) {
            this._targetList.add(targets[i]);
        }
        return this;
    };
    /**
     * Removes the display-object from the culling list
     *
     * @param target - the display-object to be removed
     * @return this
     */
    Cull.prototype.remove = function (target) {
        this._targetList.delete(target);
        return this;
    };
    /**
     * Removes all the passed display-objects from the culling list
     *
     * @param targets - the display-objects to be removed
     * @return this
     */
    Cull.prototype.removeAll = function (targets) {
        for (var i = 0, j = targets.length; i < j; i++) {
            this._targetList.delete(targets[i]);
        }
        return this;
    };
    /**
     * Clears the culling list
     *
     * @return this
     */
    Cull.prototype.clear = function () {
        this._targetList.clear();
        return this;
    };
    /**
     * @param rect - the rectangle outside of which display-objects should be culled
     * @param skipUpdate - whether to skip transform update
     * @return this
     */
    Cull.prototype.cull = function (rect, skipUpdate) {
        var _this = this;
        if (skipUpdate === void 0) { skipUpdate = false; }
        this._targetList.forEach(function (target) {
            if (!skipUpdate) {
                // Update the transforms of display-objects in this target's subtree
                target.getBounds(false, tempRect);
            }
            if (_this._recursive) {
                _this.cullRecursive(rect, target);
            }
            else {
                // NOTE: If skip-update is false, then tempRect already contains the bounds of the target
                if (skipUpdate) {
                    target.getBounds(true, tempRect);
                }
                target[_this._toggle] = tempRect.right > rect.left
                    && tempRect.left < rect.right
                    && tempRect.bottom > rect.top
                    && tempRect.top < rect.bottom;
            }
        });
        return this;
    };
    /**
     * Sets all display-objects to the unculled state.
     *
     * @return this
     */
    Cull.prototype.uncull = function () {
        var _this = this;
        this._targetList.forEach(function (target) {
            if (_this._recursive) {
                _this.uncullRecursive(target);
            }
            else {
                target[_this._toggle] = false;
            }
        });
        return this;
    };
    Cull.prototype.cullRecursive = function (rect, displayObject) {
        // NOTE: getBounds can skipUpdate because updateTransform is invoked before culling.
        var bounds = displayObject.getBounds(true, tempRect);
        displayObject[this._toggle] = bounds.right > rect.left
            && bounds.left < rect.right
            && bounds.bottom > rect.top
            && bounds.top < rect.bottom;
        var fullyVisible = bounds.left >= rect.left
            && bounds.top >= rect.top
            && bounds.right <= rect.right
            && bounds.bottom >= rect.bottom;
        // Only cull children if this display-object is fully-visible. It is expected that the bounds
        // of children lie inside of its own. Hence, further culling is only required if the display-object
        // intersects with the boundaries of "rect".
        if (!fullyVisible
            && displayObject.children
            && displayObject.children.length) {
            var children = displayObject.children;
            for (var i = 0, j = children.length; i < j; i++) {
                this.cullRecursive(rect, children[i]);
            }
        }
    };
    Cull.prototype.uncullRecursive = function (displayObject) {
        displayObject[this._toggle] = true;
        if (displayObject.children && displayObject.children.length) {
            var children = displayObject.children;
            for (var i = 0, j = children.length; i < j; i++) {
                this.uncullRecursive(children[i]);
            }
        }
    };
    return Cull;
}());

exports.Cull = Cull;
//# sourceMappingURL=cull.js.map
