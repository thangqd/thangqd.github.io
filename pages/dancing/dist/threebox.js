(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.Threebox = require('./src/Threebox.js'),
window.THREE = require('./src/three.js')

},{"./src/Threebox.js":4,"./src/three.js":25}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":2,"timers":3}],4:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
 */

const THREE = require("./three.js");
const CameraSync = require("./camera/CameraSync.js");
const utils = require("./utils/utils.js");
const SunCalc = require("./utils/suncalc.js");
const ThreeboxConstants = require("./utils/constants.js");
const Objects = require("./objects/objects.js");
const material = require("./utils/material.js");
const sphere = require("./objects/sphere.js");
const extrusion = require("./objects/extrusion.js");
const label = require("./objects/label.js");
const tooltip = require("./objects/tooltip.js");
const loader = require("./objects/loadObj.js");
const Object3D = require("./objects/Object3D.js");
const line = require("./objects/line.js");
const tube = require("./objects/tube.js");
const LabelRenderer = require("./objects/LabelRenderer.js");
const BuildingShadows = require("./objects/effects/BuildingShadows.js");

function Threebox(map, glContext, options){

    this.init(map, glContext, options);

};

Threebox.prototype = {

	repaint: function () {
		this.map.repaint = true;
	},

	/**
	 * Threebox constructor init method
	 * @param {mapboxgl.map} map
	 * @param {WebGLRenderingContext} glContext
	 * @param {defaultOptions} options
	 */
	init: function (map, glContext, options) {

		// apply starter options
		this.options = utils._validate(options || {}, defaultOptions);

		this.map = map;
		this.map.tb = this; //[jscastro] needed if we want to queryRenderedFeatures from map.onload

		this.objects = new Objects();

		this.mapboxVersion = parseFloat(this.map.version); 

		// Set up a THREE.js scene
		this.renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			preserveDrawingBuffer: options.preserveDrawingBuffer,
			canvas: map.getCanvas(),
			context: glContext
		});

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.map.getCanvas().clientWidth, this.map.getCanvas().clientHeight);
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.autoClear = false;

		// [jscastro] set labelRendered
		this.labelRenderer = new LabelRenderer(this.map);

		this.scene = new THREE.Scene();
		this.world = new THREE.Group();
		this.world.name = "world";
		this.scene.add(this.world);

		this.objectsCache = new Map();
		this.zoomLayers = [];

		this.fov = this.options.fov;
		this.orthographic = this.options.orthographic || false;

		//raycaster for mouse events
		this.raycaster = new THREE.Raycaster();
		this.raycaster.layers.set(0);
		//this.raycaster.params.Points.threshold = 100;

		this.mapCenter = this.map.getCenter();
		this.mapCenterUnits = utils.projectToWorld([this.mapCenter.lng, this.mapCenter.lat]);
		this.lightDateTime = new Date();
		this.lightLng = this.mapCenter.lng;
		this.lightLat = this.mapCenter.lat;
		this.sunPosition;
		this.rotationStep = 5;// degrees step size for rotation
		this.gridStep = 6;// decimals to adjust the lnglat grid step, 6 = 11.1cm
		this.altitudeStep = 0.1; // 1px = 0.1m = 10cm
		this.defaultCursor = 'default';

		this.lights = this.initLights;
		if (this.options.defaultLights) this.defaultLights();
		if (this.options.realSunlight) this.realSunlight(this.options.realSunlightHelper);
		this.skyLayerName = 'sky-layer';
		this.terrainSourceName = 'mapbox-dem';
		this.terrainExaggeration = 1.0;
		this.terrainLayerName = '';
		this.enableSelectingFeatures = this.options.enableSelectingFeatures || false;
		this.enableSelectingObjects = this.options.enableSelectingObjects || false;
		this.enableDraggingObjects = this.options.enableDraggingObjects || false;
		this.enableRotatingObjects = this.options.enableRotatingObjects || false;
		this.enableTooltips = this.options.enableTooltips || false;
		this.multiLayer = this.options.multiLayer || false;

		this.map.on('style.load', function () {
			this.tb.zoomLayers = [];
			//[jscastro] if multiLayer, create a by default layer in the map, so tb.update won't be needed in client side to avoid duplicating calls to render
			if (this.tb.options.multiLayer) this.addLayer({ id: "threebox_layer", type: 'custom', renderingMode: '3d', map: this, onAdd: function (map, gl) { }, render: function (gl, matrix) { this.map.tb.update(); } })

			this.once('idle', () => {
				this.tb.setObjectsScale();
			});

			if (this.tb.options.sky) {
				this.tb.sky = true;
			}
			if (this.tb.options.terrain) {
				this.tb.terrain = true;
			}
			let rasterLayers = ['satellite', 'mapbox-mapbox-satellite', 'satelliteLayer'];
			rasterLayers.forEach((l) => {
				if (this.getLayer(l)) this.tb.terrainLayerName = l;
			})
		});

		//[jscastro] new event map on load
		this.map.on('load', function () {
			this.getCanvasContainer().style.cursor = this.tb.defaultCursor;

			//[jscastro] new fields to manage events on map
			this.selectedObject; //selected object through click
			this.selectedFeature;//selected state id for extrusion layer features
			this.draggedObject; //dragged object through mousedown + mousemove
			let draggedAction; //dragged action to notify frontend
			this.overedObject; //overed object through mouseover
			this.overedFeature; //overed state for extrusion layer features

			let canvas = this.getCanvasContainer();
			this.getCanvasContainer().style.cursor = this.tb.defaultCursor;
			// Variable to hold the starting xy coordinates
			// when 'mousedown' occured.
			let start;

			//when object selected
			let startCoords = [];

			let lngDiff; // difference between cursor and model left corner
			let latDiff; // difference between cursor and model bottom corner
			let altDiff; // difference between cursor and model height
			let rotationDiff; 

			// Return the xy coordinates of the mouse position
			function mousePos(e) {
				var rect = canvas.getBoundingClientRect();
				return {
					x: e.originalEvent.clientX - rect.left - canvas.clientLeft,
					y: e.originalEvent.clientY - rect.top - canvas.clientTop
				};
			}
			
			this.unselectObject = function () {
				//deselect, reset and return
				this.selectedObject.selected = false;
				this.selectedObject = null;
			}

			this.outObject = function () {
				this.overedObject.over = false;
				this.overedObject = null;
			}

			this.unselectFeature = function (f) {
				if (typeof f.id == 'undefined') return;
				this.setFeatureState(
					{ source: f.source, sourceLayer: f.sourceLayer, id: f.id },
					{ select: false }
				);

				this.removeTooltip(f);
				f = this.queryRenderedFeatures({ layers: [f.layer.id], filter: ["==", ['id'], f.id] })[0];
				// Dispatch new event f for unselected
				if (f) this.fire('SelectedFeatureChange', { detail: f });
				this.selectedFeature = null;

			}

			this.selectFeature = function(f) {
				this.selectedFeature = f;
				this.setFeatureState(
					{ source: this.selectedFeature.source, sourceLayer: this.selectedFeature.sourceLayer, id: this.selectedFeature.id },
					{ select: true }
				);
				this.selectedFeature = this.queryRenderedFeatures({ layers: [this.selectedFeature.layer.id], filter: ["==", ['id'], this.selectedFeature.id] })[0];
				this.addTooltip(this.selectedFeature);
				// Dispatch new event SelectedFeature for selected
				this.fire('SelectedFeatureChange', { detail: this.selectedFeature });

			}

			this.outFeature = function(f) {
				if (this.overedFeature && typeof this.overedFeature != 'undefined' && this.overedFeature.id != f) {
					map.setFeatureState(
						{ source: this.overedFeature.source, sourceLayer: this.overedFeature.sourceLayer, id: this.overedFeature.id },
						{ hover: false }
					);
					this.removeTooltip(this.overedFeature);
					this.overedFeature = null;
				}
			}

			this.addTooltip = function(f) {
				if (!this.tb.enableTooltips) return;
				let coordinates = this.tb.getFeatureCenter(f);
				let t = this.tb.tooltip({
					text: f.properties.name || f.id || f.type,
					mapboxStyle: true,
					feature: f
				});
				t.setCoords(coordinates);
				this.tb.add(t, f.layer.id);
				f.tooltip = t;
				f.tooltip.tooltip.visible = true;
			}

			this.removeTooltip = function(f) {
				if (f.tooltip) {
					f.tooltip.visibility = false;
					this.tb.remove(f.tooltip);
					f.tooltip = null;
				}
			}

			map.onContextMenu = function (e) {
				alert('contextMenu'); //TODO: implement a callback
			}

			// onclick function
			this.onClick = function (e) {
				let intersectionExists
				let intersects = [];
				if (map.tb.enableSelectingObjects) {
					//raycast only if we are in a custom layer, for other layers go to the else, this avoids duplicated calls to raycaster
					intersects = this.tb.queryRenderedFeatures(e.point);
				}
				intersectionExists = typeof intersects[0] == 'object';
				// if intersect exists, highlight it
				if (intersectionExists) {

					let nearestObject = Threebox.prototype.findParent3DObject(intersects[0]);

					if (nearestObject) {
						//if extrusion object selected, unselect
						if (this.selectedFeature) {
							this.unselectFeature(this.selectedFeature);
						}
						//if not selected yet, select it
						if (!this.selectedObject) {
							this.selectedObject = nearestObject;
							this.selectedObject.selected = true;
						}
						else if (this.selectedObject.uuid != nearestObject.uuid) {
							//it's a different object, restore the previous and select the new one
							this.selectedObject.selected = false;
							nearestObject.selected = true;
							this.selectedObject = nearestObject;

						} else if (this.selectedObject.uuid == nearestObject.uuid) {
							//deselect, reset and return
							this.unselectObject();
							return;
						}

						// fire the Wireframed event to notify UI status change
						this.selectedObject.dispatchEvent({ type: 'Wireframed', detail: this.selectedObject });
						this.selectedObject.dispatchEvent({ type: 'IsPlayingChanged', detail: this.selectedObject });

						this.repaint = true;
						e.preventDefault();
					}
				}
				else {
					let features = [];
					if (map.tb.enableSelectingFeatures) {
						features = this.queryRenderedFeatures(e.point);
					}
					//now let's check the extrusion layer objects
					if (features.length > 0) {

						if (features[0].layer.type == 'fill-extrusion' && typeof features[0].id != 'undefined') {

							//if 3D object selected, unselect
							if (this.selectedObject) {
								this.unselectObject();
							}

							//if not selected yet, select it
							if (!this.selectedFeature) {
								this.selectFeature(features[0])
							}
							else if (this.selectedFeature.id != features[0].id) {
								//it's a different feature, restore the previous and select the new one
								this.unselectFeature(this.selectedFeature);
								this.selectFeature(features[0])

							} else if (this.selectedFeature.id == features[0].id) {
								//deselect, reset and return
								this.unselectFeature(this.selectedFeature);
								return;
							}

						}
					}
				}
			}

			this.onMouseMove = function (e) {

				// Capture the ongoing xy coordinates
				let current = mousePos(e);

				this.getCanvasContainer().style.cursor = this.tb.defaultCursor;
				//check if being rotated
				if (e.originalEvent.altKey && this.draggedObject) {

					if (!map.tb.enableRotatingObjects) return;
					draggedAction = 'rotate';
					// Set a UI indicator for dragging.
					this.getCanvasContainer().style.cursor = 'move';
					var minX = Math.min(start.x, current.x),
						maxX = Math.max(start.x, current.x),
						minY = Math.min(start.y, current.y),
						maxY = Math.max(start.y, current.y);
					//set the movement fluid we rotate only every 10px moved, in steps of 10 degrees up to 360
					let rotation = { x: 0, y: 0, z: (Math.round(rotationDiff[2] + (~~((current.x - start.x) / this.tb.rotationStep) % 360 * this.tb.rotationStep) % 360)) };
					//now rotate the model depending the axis
					this.draggedObject.setRotation(rotation);
					this.draggedObject.addHelp("rot: " + rotation.z + "&#176;");
					//this.draggedObject.setRotationAxis(rotation);
					return;
				}

				//check if being moved
				if (e.originalEvent.shiftKey && this.draggedObject) {
					if (!map.tb.enableDraggingObjects) return;

					draggedAction = 'translate';
					// Set a UI indicator for dragging.
					this.getCanvasContainer().style.cursor = 'move';
					// Capture the first xy coordinates, height must be the same to move on the same plane
					let coords = e.lngLat;
					let options = [Number((coords.lng + lngDiff).toFixed(this.tb.gridStep)), Number((coords.lat + latDiff).toFixed(this.tb.gridStep)), this.draggedObject.modelHeight];
					this.draggedObject.setCoords(options);
					this.draggedObject.addHelp("lng: " + options[0] + "&#176;, lat: " + options[1] + "&#176;");
					return;
				}

				//check if being moved on altitude
				if (e.originalEvent.ctrlKey && this.draggedObject) {
					if (!map.tb.enableDraggingObjects) return;
					draggedAction = 'altitude';
					// Set a UI indicator for dragging.
					this.getCanvasContainer().style.cursor = 'move';
					// Capture the first xy coordinates, height must be the same to move on the same plane
					let now = (e.point.y * this.tb.altitudeStep);
					let options = [this.draggedObject.coordinates[0], this.draggedObject.coordinates[1], Number((- now - altDiff).toFixed(this.tb.gridStep))];
					this.draggedObject.setCoords(options);
					this.draggedObject.addHelp("alt: " + options[2] + "m");
					return;
				}

				let intersectionExists
				let intersects = [];

				if (map.tb.enableSelectingObjects) {
					// calculate objects intersecting the picking ray
					intersects = this.tb.queryRenderedFeatures(e.point);
				}
				intersectionExists = typeof intersects[0] == 'object';

				// if intersect exists, highlight it, if not check the extrusion layer
				if (intersectionExists) {
					let nearestObject = Threebox.prototype.findParent3DObject(intersects[0]);
					if (nearestObject) {
						this.outFeature(this.overedFeature);
						this.getCanvasContainer().style.cursor = 'pointer';
						if (!this.selectedObject || nearestObject.uuid != this.selectedObject.uuid) {
							if (this.overedObject && this.overedObject.uuid != nearestObject.uuid) {
								this.outObject();
							}
							nearestObject.over = true;
							this.overedObject = nearestObject;
						} else if (this.selectedObject && nearestObject.uuid == this.selectedObject.uuid) {
							nearestObject.over = true;
							this.overedObject = nearestObject;
						}
						this.repaint = true;
						e.preventDefault();
					}
				}
				else {
					//clean the object overed
					if (this.overedObject) { this.outObject(); }
					//now let's check the extrusion layer objects
					let features = [];
					if (map.tb.enableSelectingFeatures) {
						features = this.queryRenderedFeatures(e.point);
					}
					if (features.length > 0) {
						this.outFeature(features[0]);

						if (features[0].layer.type == 'fill-extrusion' && typeof features[0].id != 'undefined') {
							if ((!this.selectedFeature || this.selectedFeature.id != features[0].id)) {
								this.getCanvasContainer().style.cursor = 'pointer';
								this.overedFeature = features[0];
								this.setFeatureState(
									{ source: this.overedFeature.source, sourceLayer: this.overedFeature.sourceLayer, id: this.overedFeature.id },
									{ hover: true }
								);
								this.overedFeature = map.queryRenderedFeatures({ layers: [this.overedFeature.layer.id], filter: ["==", ['id'], this.overedFeature.id] })[0];
								this.addTooltip(this.overedFeature);

							}
						}
					}
				}

			}

			this.onMouseDown = function (e) {

				// Continue the rest of the function shiftkey or altkey are pressed, and if object is selected
				if (!((e.originalEvent.shiftKey || e.originalEvent.altKey || e.originalEvent.ctrlKey) && e.originalEvent.button === 0 && this.selectedObject)) return;
				if (!map.tb.enableDraggingObjects && !map.tb.enableRotatingObjects) return;

				e.preventDefault();

				map.getCanvasContainer().style.cursor = 'move';

				// Disable default drag zooming when the shift key is held down.
				//map.dragPan.disable();

				// Call functions for the following events
				map.once('mouseup', this.onMouseUp);
				//map.once('mouseout', this.onMouseUp);

				// move the selected object
				this.draggedObject = this.selectedObject;

				// Capture the first xy coordinates
				start = mousePos(e);
				startCoords = this.draggedObject.coordinates;

				rotationDiff = utils.degreeify(this.draggedObject.rotation);
				lngDiff = startCoords[0] - e.lngLat.lng;
				latDiff = startCoords[1] - e.lngLat.lat;
				altDiff = -this.draggedObject.modelHeight - (e.point.y * this.tb.altitudeStep);
			}

			this.onMouseUp = function (e) {

				// Set a UI indicator for dragging.
				this.getCanvasContainer().style.cursor = this.tb.defaultCursor;

				// Remove these events now that finish has been called.
				//map.off('mousemove', onMouseMove);
				this.off('mouseup', this.onMouseUp);
				this.off('mouseout', this.onMouseUp);
				this.dragPan.enable();

				if (this.draggedObject) {
					this.draggedObject.dispatchEvent({ type: 'ObjectDragged', detail: { draggedObject: this.draggedObject, draggedAction: draggedAction } });
					this.draggedObject.removeHelp();
					this.draggedObject = null;
					draggedAction = null;
				};
			}

			this.onMouseOut = function (e) {
				if (this.overedFeature) {
					let features = this.queryRenderedFeatures(e.point);
					if (features.length > 0 && this.overedFeature.id != features[0].id) {
						this.getCanvasContainer().style.cursor = this.tb.defaultCursor;
						//only unover when new feature is another
						this.outFeature(features[0]);
					}
				}
			}

			this.onZoom = function (e) {
				this.tb.zoomLayers.forEach((l) => { this.tb.toggleLayer(l); });
				this.tb.setObjectsScale();
			}

			let ctrlDown = false;
			let shiftDown = false;
			let ctrlKey = 17, cmdKey = 91, shiftKey = 16, sK = 83, dK = 68;

			function onKeyDown(e) {

				if (e.which === ctrlKey || e.which === cmdKey) ctrlDown = true;
				if (e.which === shiftKey) shiftDown = true;
				let obj = this.selectedObject;
				if (shiftDown && e.which === sK && obj) {
					//shift + sS
					let dc = utils.toDecimal;
					if (!obj.help) {
						let s = obj.modelSize;
						let sf = 1;
						if (obj.userData.units !== 'meters') {
							//if not meters, calculate scale to the current lat
							sf = utils.projectedUnitsPerMeter(obj.coordinates[1]);
							if (!sf) { sf = 1; };
							sf = dc(sf, 7);
						}

						obj.addHelp("size(m): " + dc((s.x / sf), 3) + " W, " + dc((s.y / sf), 3) + " L, " + dc((s.z / sf), 3) + " H");
						this.repaint = true;
					}
					else {
						obj.removeHelp();
					}
					return false;
				}

			};

			function onKeyUp (e) {
				if (e.which == ctrlKey || e.which == cmdKey) ctrlDown = false;
				if (e.which === shiftKey) shiftDown = false;
			}

			//listener to the events
			//this.on('contextmenu', map.onContextMenu);
			this.on('click', this.onClick);
			this.on('mousemove', this.onMouseMove);
			this.on('mouseout', this.onMouseOut)
			this.on('mousedown', this.onMouseDown);
			this.on('zoom', this.onZoom);
			this.on('zoomend', this.onZoom);

			document.addEventListener('keydown', onKeyDown.bind(this), true);
			document.addEventListener('keyup', onKeyUp.bind(this));

		});

	},

	//[jscastro] added property to manage an athmospheric sky layer
	get sky() { return this.options.sky; },
	set sky(value) {
		if (value) {
			this.createSkyLayer();
		}
		else {
			this.removeLayer(this.skyLayerName);
		}
		this.options.sky = value;
	},

	//[jscastro] added property to manage an athmospheric sky layer
	get terrain() { return this.options.terrain; },
	set terrain(value) {
		this.terrainLayerName = '';
		if (value) {
			this.createTerrainLayer();
		}
		else {
			if (this.mapboxVersion < 2.0) { console.warn("Terrain layer are only supported by Mapbox-gl-js > v2.0"); return };

			if (this.map.getTerrain()) {
				this.map.setTerrain(null); //
				this.map.removeSource(this.terrainSourceName);
			}
		}
		this.options.terrain = value;
	},

	//[jscastro] added property to manage FOV for perspective camera
	get fov() { return this.options.fov;},
	set fov(value) {
		if (this.camera instanceof THREE.PerspectiveCamera && this.options.fov !== value) {
			this.map.transform.fov = value;
			this.camera.fov = this.map.transform.fov;
			this.cameraSync.setupCamera();
			this.map.repaint = true;
			this.options.fov = value;
		}

	},

	//[jscastro] added property to manage camera type
	get orthographic() { return this.options.orthographic; },
	set orthographic(value) {
		const h = this.map.getCanvas().clientHeight;
		const w = this.map.getCanvas().clientWidth;
		if (value) {
			this.map.transform.fov = 0;
			this.camera = new THREE.OrthographicCamera(w / - 2, w / 2, h / 2, h / - 2, 0.1, 1e21);
		} else {
			this.map.transform.fov = this.fov;
			this.camera = new THREE.PerspectiveCamera(this.map.transform.fov, w / h, 0.1, 1e21);
		}
		this.camera.layers.enable(0);
		this.camera.layers.enable(1);
		// The CameraSync object will keep the Mapbox and THREE.js camera movements in sync.
		// It requires a world group to scale as we zoom in. Rotation is handled in the camera's
		// projection matrix itself (as is field of view and near/far clipping)
		// It automatically registers to listen for move events on the map so we don't need to do that here
		this.cameraSync = new CameraSync(this.map, this.camera, this.world);
		this.map.repaint = true; // repaint the map
		this.options.orthographic = value;

	},

	//[jscastro] method to create an athmospheric sky layer
	createSkyLayer: function () {
		if (this.mapboxVersion < 2.0) { console.warn("Sky layer are only supported by Mapbox-gl-js > v2.0"); this.options.sky = false; return };

		let layer = this.map.getLayer(this.skyLayerName);
		if (!layer) {
			this.map.addLayer({
				'id': this.skyLayerName,
				'type': 'sky',
				'paint': {
					'sky-opacity': [
						'interpolate',
						['linear'],
						['zoom'],
						0,
						0,
						5,
						0.3,
						8,
						1
					],
					// set up the sky layer for atmospheric scattering
					'sky-type': 'atmosphere',
					// explicitly set the position of the sun rather than allowing the sun to be attached to the main light source
					'sky-atmosphere-sun': this.getSunSky(this.lightDateTime),
					// set the intensity of the sun as a light source (0-100 with higher values corresponding to brighter skies)
					'sky-atmosphere-sun-intensity': 10
				}
			});

			this.map.once('idle', () => {
				this.setSunlight();
				this.repaint();
			});
		}
	},

	//[jscastro] method to create a terrain layer
	createTerrainLayer: function () {
		if (this.mapboxVersion < 2.0) { console.warn("Terrain layer are only supported by Mapbox-gl-js > v2.0"); this.options.terrain = false; return };
		let layer = this.map.getTerrain();
		if (!layer) {
			// add the DEM source as a terrain layer with exaggerated height
			this.map.addSource(this.terrainSourceName, {
				'type': 'raster-dem',
				'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
				'tileSize': 512,
				'maxzoom': 14
			});
			this.map.setTerrain({ 'source': this.terrainSourceName, 'exaggeration': this.terrainExaggeration });
			this.map.once('idle', () => {
				//alert("idle");
				this.cameraSync.updateCamera();
				this.repaint();
			});

		}
	},

	// Objects
	sphere: function (options) {
		this.setDefaultView(options, this.options);
		return sphere(options, this.world)
	},

	line: line,

	label: label,

	tooltip: tooltip,

	tube: function (options) {
		this.setDefaultView(options, this.options);
		return tube(options, this.world)
	},

	extrusion: function (options) {
		this.setDefaultView(options, this.options);
		return extrusion(options);
	},

	Object3D: function (options) {
		this.setDefaultView(options, this.options);
		return Object3D(options)
	},

	loadObj: async function loadObj(options, cb) {
		this.setDefaultView(options, this.options);
		if (options.clone === false) {
			return new Promise(
				async (resolve) => {
					loader(options, cb, async (obj) => {
						resolve(obj);
					});
				});
		}
		else {
			//[jscastro] new added cache for 3D Objects
			let cache = this.objectsCache.get(options.obj);
			if (cache) {
				cache.promise
					.then(obj => {
						cb(obj.duplicate(options));
					})
					.catch(err => {
						this.objectsCache.delete(options.obj);
						console.error("Could not load model file: " + options.obj);
					});
			} else {
				this.objectsCache.set(options.obj, {
					promise: new Promise(
						async (resolve, reject) => {
							loader(options, cb, async (obj) => {
								if (obj.duplicate) {
									resolve(obj.duplicate());
								} else {
									reject(obj);
								}
							});
						})
				});

			}
		}
	},

	// Material

	material: function (o) {
		return material(o)
	},

	initLights : {
		ambientLight: null,
		dirLight: null,
		dirLightBack: null,
		dirLightHelper: null,
		hemiLight: null,
		pointLight: null
	},

	utils: utils,

	SunCalc: SunCalc,

	Constants: ThreeboxConstants,

	projectToWorld: function (coords) {
		return this.utils.projectToWorld(coords)
	},

	unprojectFromWorld: function (v3) {
		return this.utils.unprojectFromWorld(v3)
	},

	projectedUnitsPerMeter: function (lat) {
		return this.utils.projectedUnitsPerMeter(lat)
	},

	//get the center point of a feature
	getFeatureCenter: function getFeatureCenter(feature, obj, level) {
		return utils.getFeatureCenter(feature, obj, level);
	},

	getObjectHeightOnFloor: function (feature, obj, level) {
		return utils.getObjectHeightOnFloor(feature, obj, level);
	},

	queryRenderedFeatures: function (point) {

		let mouse = new THREE.Vector2();

		// // scale mouse pixel position to a percentage of the screen's width and height
		mouse.x = (point.x / this.map.transform.width) * 2 - 1;
		mouse.y = 1 - (point.y / this.map.transform.height) * 2;

		this.raycaster.setFromCamera(mouse, this.camera);

		// calculate objects intersecting the picking ray
		let intersects = this.raycaster.intersectObjects(this.world.children, true);

		return intersects
	},

	//[jscastro] find 3D object of a mesh. this method is needed to know the object of a raycasted mesh
	findParent3DObject: function (mesh) {
		//find the Parent Object3D of the mesh captured by Raytracer
		var result;
		mesh.object.traverseAncestors(function (m) {
			if (m.parent)
				if (m.parent.type == "Group" && m.userData.obj) {
					result = m;
				}
		});
		return result;
	},

	//[jscastro] method to replicate behaviour of map.setLayoutProperty when Threebox are affected
	setLayoutProperty: function (layerId, name, value) {
		//first set layout property at the map
		this.map.setLayoutProperty(layerId, name, value);
		if (value !== null && value !== undefined) {
			if (name === 'visibility') {
				this.world.children.filter(o => (o.layer === layerId)).forEach((o) => { o.visibility = value });
			}
		}
	},

	//[jscastro] Custom Layers doesn't work on minzoom and maxzoom attributes, and if the layer is including labels they don't hide either on minzoom
	setLayerZoomRange: function (layerId, minZoomLayer, maxZoomLayer) {
		if (this.map.getLayer(layerId)) {
			this.map.setLayerZoomRange(layerId, minZoomLayer, maxZoomLayer);
			if (!this.zoomLayers.includes(layerId)) this.zoomLayers.push(layerId);
			this.toggleLayer(layerId);
		}
	},

	//[jscastro] method to set the height of all the objects in a level. this only works if the objects have a geojson feature
	setLayerHeigthProperty: function (layerId, level) {
		let layer = this.map.getLayer(layerId);
		if (!layer) return;
		if (layer.type == "fill-extrusion") {
			let data = this.map.getStyle().sources[layer.source].data;
			let features = data.features;
			features.forEach(function (f) {
				f.properties.level = level;
			});
			//we change the level on the source
			this.map.getSource(layer.source).setData(data);
		} else if (layer.type == "custom") {
			this.world.children.forEach(function (obj) {
				let feature = obj.userData.feature;
				if (feature && feature.layer === layerId) {
					//TODO: this could be a multidimensional array
					let location = this.tb.getFeatureCenter(feature, obj, level);
					obj.setCoords(location);
				}
			});
		}
	},

	//[jscastro] method to set globally all the objects that are fixedScale
	setObjectsScale: function () {
		this.world.children.filter(o => (o.fixedZoom != null)).forEach((o) => { o.setObjectScale(this.map.transform.scale); });
	},

	//[jscastro] mapbox setStyle removes all the layers, including custom layers, so tb.world must be cleaned up too
	setStyle: function (styleId, options) {
		this.clear().then(() => {
			this.map.setStyle(styleId, options);
		});
	},

	//[jscastro] method to toggle Layer visibility checking zoom range
	toggleLayer: function (layerId, visible = true) {
		let l = this.map.getLayer(layerId);
		if (l) {
			if (!visible) {
				this.toggle(l.id, false);
				return;
			}
			let z = this.map.getZoom();
			if (l.minzoom && z < l.minzoom) { this.toggle(l.id, false); return; };
			if (l.maxzoom && z >= l.maxzoom) { this.toggle(l.id, false); return; };
			this.toggle(l.id, true);
		};
	},

	//[jscastro] method to toggle Layer visibility
	toggle: function (layerId, visible) {
		//call
		this.setLayoutProperty(layerId, 'visibility', (visible ? 'visible' : 'none'))
		this.labelRenderer.toggleLabels(layerId, visible);
	},

	update: function () {

		if (this.map.repaint) this.map.repaint = false

		var timestamp = Date.now();

		// Update any animations
		this.objects.animationManager.update(timestamp);

		this.updateLightHelper();

		// Render the scene and repaint the map
		this.renderer.resetState(); //update threejs r126
		this.renderer.render(this.scene, this.camera);

		// [jscastro] Render any label
		this.labelRenderer.render(this.scene, this.camera);
		if (this.options.passiveRendering === false) this.map.triggerRepaint();
	},

	add: function (obj, layerId, sourceId) {
		//[jscastro] remove the tooltip if not enabled
		if (!this.enableTooltips && obj.tooltip) { obj.tooltip.visibility = false };
		this.world.add(obj);
		if (layerId) {
			obj.layer = layerId;
			obj.source = sourceId;
			let l = this.map.getLayer(layerId);
			if (l) {
				let v = l.visibility;
				let u = typeof v === 'undefined';
				obj.visibility = (u || v === 'visible' ? true : false);
			}
		}
	},

	removeByName: function (name) {
		let obj = this.world.getObjectByName(name);
		if (obj) this.remove(obj);
	},

	remove: function (obj) {
		if (this.map.selectedObject && obj.uuid == this.map.selectedObject.uuid) this.map.unselectObject();
		if (this.map.draggedObject && obj.uuid == this.map.draggedObject.uuid) this.map.draggedObject = null;
		if (obj.dispose) obj.dispose();
		this.world.remove(obj);
		obj = null;
	},

	//[jscastro] this clears tb.world in order to dispose properly the resources
	clear: async function (layerId = null, dispose = false) {
		return new Promise((resolve, reject) => {
			let objects = [];
			this.world.children.forEach(function (object) {
				objects.push(object);
			});
			for (let i = 0; i < objects.length; i++) {
				let obj = objects[i];
				//if layerId, check the layer to remove, otherwise always remove
				if (obj.layer === layerId || !layerId) {
					this.remove(obj);
				}
			}
			if (dispose) {
				this.objectsCache.forEach((value) => {
					value.promise.then(obj => {
						obj.dispose();
						obj = null;
					})
				})
			}

			resolve("clear");
		});
	},

	//[jscastro] remove a layer clearing first the 3D objects from this layer in tb.world
	removeLayer: function (layerId) {
		this.clear(layerId, true).then( () => {
			this.map.removeLayer(layerId);
		});
	},

	//[jscastro] get the sun position (azimuth, altitude) from a given datetime, lng, lat
	getSunPosition: function (date, coords) {
		return SunCalc.getPosition(date || Date.now(), coords[1], coords[0]);  
	},

	//[jscastro] get the sun times for sunrise, sunset, etc.. from a given datetime, lng, lat and alt
	getSunTimes: function (date, coords) {
		return SunCalc.getTimes(date, coords[1], coords[0], (coords[2] ? coords[2] : 0));
	},

	//[jscastro] set shadows for fill-extrusion layers
	setBuildingShadows: function (options) {
		if (this.map.getLayer(options.buildingsLayerId)) {
			let layer = new BuildingShadows(options, this);
			this.map.addLayer(layer, options.buildingsLayerId);
		}
		else {
			console.warn("The layer '" + options.buildingsLayerId + "' does not exist in the map.");
		}
	},

	//[jscastro] This method set the sun light for a given datetime and lnglat
	setSunlight: function (newDate = new Date(), coords) {
		if (!this.lights.dirLight || !this.options.realSunlight) {
			console.warn("To use setSunlight it's required to set realSunlight : true in Threebox initial options.");
			return;
		}

		var date = new Date(newDate.getTime());

		if (coords) {
			if (coords.lng && coords.lat) this.mapCenter = coords
			else this.mapCenter = { lng: coords[0], lat: coords[1] };
		}
		else {
			this.mapCenter = this.map.getCenter();
		}

		if (this.lightDateTime && this.lightDateTime.getTime() === date.getTime() && this.lightLng === this.mapCenter.lng && this.lightLat === this.mapCenter.lat) {
			return; //setSunLight could be called on render, so due to performance, avoid duplicated calls
		}

		this.lightDateTime = date;
		this.lightLng = this.mapCenter.lng; 
		this.lightLat = this.mapCenter.lat
		this.sunPosition = this.getSunPosition(date, [this.mapCenter.lng, this.mapCenter.lat]);  
		let altitude = this.sunPosition.altitude;
		let azimuth = Math.PI + this.sunPosition.azimuth;
		//console.log("Altitude: " + utils.degreeify(altitude) + ", Azimuth: " + (utils.degreeify(azimuth)));

		let radius = ThreeboxConstants.WORLD_SIZE / 2;
		let alt = Math.sin(altitude);
		let altRadius = Math.cos(altitude);
		let azCos = Math.cos(azimuth) * altRadius;
		let azSin = Math.sin(azimuth) * altRadius;

		this.lights.dirLight.position.set(azSin, azCos, alt);
		this.lights.dirLight.position.multiplyScalar(radius);
		this.lights.dirLight.intensity = Math.max(alt, 0);
		this.lights.hemiLight.intensity = Math.max(alt * 1, 0.1);
		//console.log("Intensity:" + this.lights.dirLight.intensity);
		this.lights.dirLight.updateMatrixWorld();
		this.updateLightHelper();
		if (this.map.loaded()) {
			this.updateSunGround(this.sunPosition);
			this.map.setLight({
				anchor: 'map',
				position: [3, 180 + this.sunPosition.azimuth * 180 / Math.PI, 90 - this.sunPosition.altitude * 180 / Math.PI],
				intensity: Math.cos(this.sunPosition.altitude), //0.4,
				color: `hsl(40, ${50 * Math.cos(this.sunPosition.altitude)}%, ${Math.max(20, 20 + (96 * Math.sin(this.sunPosition.altitude)))}%)`

			}, { duration: 0 });
			if (this.sky) { this.updateSunSky(this.getSunSky(date, this.sunPosition));}
		}
	},

	getSunSky: function (date, sunPos) {
		if (!sunPos) {
			var center = this.map.getCenter();
			sunPos = this.getSunPosition(
				date || Date.now(), [center.lng, center.lat]
			);
		}
		var sunAzimuth = 180 + (sunPos.azimuth * 180) / Math.PI;
		var sunAltitude = 90 - (sunPos.altitude * 180) / Math.PI;
		return [sunAzimuth, sunAltitude];
	},

	updateSunSky: function (sunPos) {
		if (this.sky) {
			// update the `sky-atmosphere-sun` paint property with the position of the sun based on the selected time
			this.map.setPaintProperty(this.skyLayerName, 'sky-atmosphere-sun', sunPos);
		}
	},

	updateSunGround: function (sunPos) {
		if (this.terrainLayerName != '') {
			// update the raster layer paint property with the position of the sun based on the selected time
			this.map.setPaintProperty(this.terrainLayerName, 'raster-opacity', Math.max(sunPos.altitude, 0.25));
		}
	},

	//[jscastro] this updates the directional light helper
	updateLightHelper: function () {
		if (this.lights.dirLightHelper) {
			this.lights.dirLightHelper.position.setFromMatrixPosition(this.lights.dirLight.matrixWorld);
			this.lights.dirLightHelper.updateMatrix();
			this.lights.dirLightHelper.update();
		}
	},

	//[jscastro] method to fully dispose the resources, watch out is you call this without navigating to other page
	dispose: async function () {

		console.log(this.memory());
		//console.log(window.performance.memory);

		return new Promise((resolve) => {
			resolve(
				this.clear(null, true).then((resolve) => {
					this.map.remove();
					this.map = {};
					this.scene.remove(this.world);
					this.world.children = [];
					this.world = null;
					this.objectsCache.clear();
					this.labelRenderer.dispose();
					console.log(this.memory());
					this.renderer.dispose();
					return resolve;
				})
			);
			//console.log(window.performance.memory);
		});

	},

	defaultLights: function () {

		this.lights.ambientLight = new THREE.AmbientLight(new THREE.Color('hsl(0, 0%, 100%)'), 0.75);
		this.scene.add(this.lights.ambientLight);

		this.lights.dirLightBack = new THREE.DirectionalLight(new THREE.Color('hsl(0, 0%, 100%)'), 0.25);
		this.lights.dirLightBack.position.set(30, 100, 100);
		this.scene.add(this.lights.dirLightBack);

		this.lights.dirLight  = new THREE.DirectionalLight(new THREE.Color('hsl(0, 0%, 100%)'), 0.25);
		this.lights.dirLight.position.set(-30, 100, -100);
		this.scene.add(this.lights.dirLight);

	},

	realSunlight: function (helper = false) {

		this.renderer.shadowMap.enabled = true;
		//this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.lights.dirLight = new THREE.DirectionalLight(0xffffff, 1);
		this.scene.add(this.lights.dirLight);
		if (helper) {
			this.lights.dirLightHelper = new THREE.DirectionalLightHelper(this.lights.dirLight, 5);
			this.scene.add(this.lights.dirLightHelper);
		}
		let d2 = 1000; let r2 = 2; let mapSize2 = 8192;
		this.lights.dirLight.castShadow = true;
		this.lights.dirLight.shadow.radius = r2;
		this.lights.dirLight.shadow.mapSize.width = mapSize2;
		this.lights.dirLight.shadow.mapSize.height = mapSize2;
		this.lights.dirLight.shadow.camera.top = this.lights.dirLight.shadow.camera.right = d2;
		this.lights.dirLight.shadow.camera.bottom = this.lights.dirLight.shadow.camera.left = -d2;
		this.lights.dirLight.shadow.camera.near = 1;
		this.lights.dirLight.shadow.camera.visible = true;
		this.lights.dirLight.shadow.camera.far = 400000000; 

		this.lights.hemiLight = new THREE.HemisphereLight(new THREE.Color(0xffffff), new THREE.Color(0xffffff), 0.6);
		this.lights.hemiLight.color.setHSL(0.661, 0.96, 0.12);
		this.lights.hemiLight.groundColor.setHSL(0.11, 0.96, 0.14);
		this.lights.hemiLight.position.set(0, 0, 50);
		this.scene.add(this.lights.hemiLight);
		this.setSunlight();

		this.map.once('idle', () => {
			this.setSunlight();
			this.repaint();
		});

	},

	setDefaultView: function (options, defOptions) {
		options.bbox = (options.bbox || options.bbox == null) && defOptions.enableSelectingObjects;
		options.tooltip = (options.tooltip || options.tooltip == null) && defOptions.enableTooltips;
		options.mapScale = this.map.transform.scale;
	},

	memory: function () { return this.renderer.info.memory },

	programs: function () { return this.renderer.info.programs.length },

	version: '2.2.4',

}

var defaultOptions = {
	defaultLights: false,
	realSunlight: false,
	realSunlightHelper: false,
	passiveRendering: true,
	preserveDrawingBuffer: false,
	enableSelectingFeatures: false,
	enableSelectingObjects: false,
	enableDraggingObjects: false,
	enableRotatingObjects: false,
	enableTooltips: false,
	multiLayer: false,
	orthographic: false,
	fov: ThreeboxConstants.FOV_DEGREES,
	sky: false,
	terrain: false
}
module.exports = exports = Threebox;


},{"./camera/CameraSync.js":6,"./objects/LabelRenderer.js":8,"./objects/Object3D.js":9,"./objects/effects/BuildingShadows.js":10,"./objects/extrusion.js":11,"./objects/label.js":13,"./objects/line.js":14,"./objects/loadObj.js":15,"./objects/objects.js":21,"./objects/sphere.js":22,"./objects/tooltip.js":23,"./objects/tube.js":24,"./three.js":25,"./utils/constants.js":26,"./utils/material.js":27,"./utils/suncalc.js":28,"./utils/utils.js":29}],5:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
*/
const THREE = require('../three.js');
const utils = require("../utils/utils.js");

function AnimationManager(map) {

    this.map = map
    this.enrolledObjects = [];    
    this.previousFrameTime;

};

AnimationManager.prototype = {

	unenroll: function (obj) {
		this.enrolledObjects.splice(this.enrolledObjects.indexOf(obj), 1);
	},

	enroll: function (obj) {

		//[jscastro] add the object default animations
		obj.clock = new THREE.Clock();
		obj.hasDefaultAnimation = false;
		obj.defaultAction;
		obj.actions = [];
		obj.mixer;

		//[jscastro] if the object includes animations
		if (obj.animations && obj.animations.length > 0) {

			obj.hasDefaultAnimation = true;

			//check first if a defaultAnimation is defined by options
			let daIndex = (obj.userData.defaultAnimation ? obj.userData.defaultAnimation : 0);
			obj.mixer = new THREE.AnimationMixer(obj);

			setAction(daIndex);
		}

		//[jscastro] set the action to play
		function setAction(animationIndex) {
			for (let i = 0; i < obj.animations.length; i++) {

				if (animationIndex > obj.animations.length)
					console.log("The animation index " + animationIndex + " doesn't exist for this object");
				let animation = obj.animations[i];
				let action = obj.mixer.clipAction(animation);
				obj.actions.push(action);

				//select the default animation and set the weight to 1
				if (animationIndex === i) {
					obj.defaultAction = action;
					action.setEffectiveWeight(1);
				}
				else {
					action.setEffectiveWeight(0);
				}
				action.play();

			}
		}

		let _isPlaying = false;
		//[jscastro] added property for isPlaying state
		Object.defineProperty(obj, 'isPlaying', {
			get() { return _isPlaying; },
			set(value) {
				if (_isPlaying != value) {
					_isPlaying = value;
					// Dispatch new event IsPlayingChanged
					obj.dispatchEvent({ type: 'IsPlayingChanged', detail: obj});
				}
			}
		})

		/* Extend the provided object with animation-specific properties and track in the animation manager */
		this.enrolledObjects.push(obj);

		// Give this object its own internal animation queue
		obj.animationQueue = [];

		obj.set = function (options) {

			//if duration is set, animate to the new state
			if (options.duration > 0) {

				let newParams = {
					start: Date.now(),
					expiration: Date.now() + options.duration,
					endState: {}
				}

				utils.extend(options, newParams);

				let translating = options.coords;
				let rotating = options.rotation;
				let scaling = options.scale || options.scaleX || options.scaleY || options.scaleZ;

				if (rotating) {

					let r = obj.rotation;
					options.startRotation = [r.x, r.y, r.z];


					options.endState.rotation = utils.types.rotation(options.rotation, options.startRotation);
					options.rotationPerMs = options.endState.rotation
						.map(function (angle, index) {
							return (angle - options.startRotation[index]) / options.duration;
						})
				}

				if (scaling) {
					let s = obj.scale;
					options.startScale = [s.x, s.y, s.z];
					options.endState.scale = utils.types.scale(options.scale, options.startScale);

					options.scalePerMs = options.endState.scale
						.map(function (scale, index) {
							return (scale - options.startScale[index]) / options.duration;
						})
				}

				if (translating) options.pathCurve = new THREE.CatmullRomCurve3(utils.lnglatsToWorld([obj.coordinates, options.coords]));

				let entry = {
					type: 'set',
					parameters: options
				}

				this.animationQueue
					.push(entry);

				tb.map.repaint = true;
			}

			//if no duration set, stop object's existing animations and go to that state immediately
			else {
				this.stop();
				options.rotation = utils.radify(options.rotation);
				this._setObject(options);
			}

			return this

		};

		//[jscastro] animation method, is set by update method
		obj.animationMethod = null;

		//[jscastro] stop animation and the queue
		obj.stop = function (index) {
			if (obj.mixer) {
				obj.isPlaying = false;
				cancelAnimationFrame(obj.animationMethod);
			}
			//TODO: if this is removed, it produces an error in 
			this.animationQueue = [];
			return this;
		}

		obj.followPath = function (options, cb) {

			let entry = {
				type: 'followPath',
				parameters: utils._validate(options, defaults.followPath)
			};

			utils.extend(
				entry.parameters,
				{
					pathCurve: new THREE.CatmullRomCurve3(
						utils.lnglatsToWorld(options.path)
					),
					start: Date.now(),
					expiration: Date.now() + entry.parameters.duration,
					cb: cb
				}
			);

			this.animationQueue
				.push(entry);

			tb.map.repaint = true;

			return this;
		};

		obj._setObject = function (options) {

			//default scale always
			obj.setScale();

			let p = options.position; // lnglat
			let r = options.rotation; // radians
			let s = options.scale; // custom scale
			let w = options.worldCoordinates; //Vector3
			let q = options.quaternion; // [axis, angle in rads]
			let t = options.translate; // [jscastro] lnglat + height for 3D objects
			let wt = options.worldTranslate; // [jscastro] Vector3 translation

			if (p) {
				this.coordinates = p;
				let c = utils.projectToWorld(p);
				this.position.copy(c)
			}

			if (t) {
				this.coordinates = [this.coordinates[0] + t[0], this.coordinates[1] + t[1], this.coordinates[2] + t[2]];
				let c = utils.projectToWorld(t);
				this.position.copy(c)
				//this.translateX(c.x);
				//this.translateY(c.y);
				//this.translateZ(c.z);
				options.position = this.coordinates;
			}

			if (wt) {
				this.translateX(wt.x);
				this.translateY(wt.y);
				this.translateZ(wt.z);
				let p = utils.unprojectFromWorld(this.position);
				this.coordinates = options.position = p;
			}

			if (r) {
				this.rotation.set(r[0], r[1], r[2]);
				options.rotation = new THREE.Vector3(r[0], r[1], r[2]);
			}

			if (s) {
				this.scale.set(s[0], s[1], s[2]);
				options.scale = this.scale;
			}

			if (q) {
				this.quaternion.setFromAxisAngle(q[0], q[1]);
				options.rotation = q[0].multiplyScalar(q[1]);
			}

			if (w) {
				this.position.copy(w);
				let p = utils.unprojectFromWorld(w);
				this.coordinates = options.position = p;
			} 

			//Each time the object is positioned, project the floor and correct shadow plane
			this.setBoundingBoxShadowFloor();
			this.setReceiveShadowFloor();

			this.updateMatrixWorld();
			tb.map.repaint = true;

			//const threeTarget = new THREE.EventDispatcher();
			//threeTarget.dispatchEvent({ type: 'event', detail: { object: this, action: { position: options.position, rotation: options.rotation, scale: options.scale } } });
			// fire the ObjectChanged event to notify UI object change
			let e = { type: 'ObjectChanged', detail: { object: this, action: { position: options.position, rotation: options.rotation, scale: options.scale } } };
			this.dispatchEvent(e);

		};

		//[jscastro] play default animation
		obj.playDefault = function (options) {
			if (obj.mixer && obj.hasDefaultAnimation) {

				let newParams = {
					start: Date.now(),
					expiration: Date.now() + options.duration,
					endState: {}
				}

				utils.extend(options, newParams);

				obj.mixer.timeScale = options.speed || 1;

				let entry = {
					type: 'playDefault',
					parameters: options
				};

				this.animationQueue
					.push(entry);

				tb.map.repaint = true
				return this;
			}
		}

		//[jscastro] play an animation, requires options.animation as an index, if not it will play the default one
		obj.playAnimation = function (options) {
			if (obj.mixer) {

				if (options.animation) {
					setAction(options.animation)
				}
				obj.playDefault(options);

			}
		}

		//[jscastro] pause all actions animation
		obj.pauseAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.paused = true;
				});
			}
		}

		//[jscastro] unpause all actions
		obj.unPauseAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.paused = false;
				});
			}

		}

		//[jscastro] stop all actions
		obj.deactivateAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.stop();
				});
			}
		}

		//[jscastro] play all actions
		obj.activateAllActions = function () {
			if (obj.mixer) {
				obj.actions.forEach(function (action) {
					action.play();
				});
			}
		}

		//[jscastro] move the model action one tick just to avoid issues with initial position
		obj.idle = function () {
			if (obj.mixer) {
				// Update the animation mixer and render this frame
				obj.mixer.update(0.01);
			}
			tb.map.repaint = true;
			return this;
		}

	},

	update: function (now) {

		if (this.previousFrameTime === undefined) this.previousFrameTime = now;

		let dimensions = ['X', 'Y', 'Z'];

		//[jscastro] when function expires this produces an error
		if (!this.enrolledObjects) return false;

		//iterate through objects in queue. count in reverse so we can cull objects without frame shifting
		for (let a = this.enrolledObjects.length - 1; a >= 0; a--) {

			let object = this.enrolledObjects[a];

			if (!object.animationQueue || object.animationQueue.length === 0) continue;

			//[jscastro] now multiple animations on a single object is possible
			for (let i = object.animationQueue.length - 1; i >= 0; i--) {

				//focus on first item in queue
				let item = object.animationQueue[i];
				if (!item) continue;
				let options = item.parameters;

				// if an animation is past its expiration date, cull it
				if (!options.expiration) {
					// console.log('culled')

					object.animationQueue.splice(i, 1);

					// set the start time of the next animation
					if (object.animationQueue[i]) object.animationQueue[i].parameters.start = now;

					return
				}

				//if finished, jump to end state and flag animation entry for removal next time around. Execute callback if there is one
				let expiring = now >= options.expiration;

				if (expiring) {
					options.expiration = false;
					if (item.type === 'playDefault') {
						object.stop();
					} else {
						if (options.endState) object._setObject(options.endState);
						if (typeof (options.cb) != 'undefined') options.cb();
					}
				}

				else {

					let timeProgress = (now - options.start) / options.duration;

					if (item.type === 'set') {

						let objectState = {};

						if (options.pathCurve) objectState.worldCoordinates = options.pathCurve.getPoint(timeProgress);

						if (options.rotationPerMs) {
							objectState.rotation = options.startRotation.map(function (rad, index) {
								return rad + options.rotationPerMs[index] * timeProgress * options.duration
							})
						}

						if (options.scalePerMs) {
							objectState.scale = options.startScale.map(function (scale, index) {
								return scale + options.scalePerMs[index] * timeProgress * options.duration
							})
						}

						object._setObject(objectState);
					}

					if (item.type === 'followPath') {

						let position = options.pathCurve.getPointAt(timeProgress);
						let objectState = { worldCoordinates: position };

						// if we need to track heading
						if (options.trackHeading) {

							let tangent = options.pathCurve
								.getTangentAt(timeProgress)
								.normalize();

							let axis = new THREE.Vector3(0, 0, 0);
							let up = new THREE.Vector3(0, 1, 0);

							axis
								.crossVectors(up, tangent)
								.normalize();

							let radians = Math.acos(up.dot(tangent));

							objectState.quaternion = [axis, radians];

						}

						object._setObject(objectState);

					}

					//[jscastro] play default animation
					if (item.type === 'playDefault') {
						object.activateAllActions();
						object.isPlaying = true;
						object.animationMethod = requestAnimationFrame(this.update);
						object.mixer.update(object.clock.getDelta());
						tb.map.repaint = true;
					}

				}
			}

		}

		this.previousFrameTime = now;
	}

}

const defaults = {
    followPath: {
        path: null,
        duration: 1000,
        trackHeading: true
    }
}
module.exports = exports = AnimationManager;
},{"../three.js":25,"../utils/utils.js":29}],6:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
 */
const THREE = require("../three.js");
const utils = require("../utils/utils.js");
const ThreeboxConstants = require("../utils/constants.js");

function CameraSync(map, camera, world) {
    //    console.log("CameraSync constructor");
    this.map = map;
    this.camera = camera;
    this.active = true;

    this.camera.matrixAutoUpdate = false; // We're in charge of the camera now!

    // Postion and configure the world group so we can scale it appropriately when the camera zooms
    this.world = world || new THREE.Group();
    this.world.position.x = this.world.position.y = ThreeboxConstants.WORLD_SIZE / 2
    this.world.matrixAutoUpdate = false;

    // set up basic camera state
    this.state = {
        translateCenter: new THREE.Matrix4().makeTranslation(ThreeboxConstants.WORLD_SIZE / 2, -ThreeboxConstants.WORLD_SIZE / 2, 0),
        worldSizeRatio: ThreeboxConstants.TILE_SIZE / ThreeboxConstants.WORLD_SIZE,
        worldSize: ThreeboxConstants.TILE_SIZE * this.map.transform.scale
    };

    // Listen for move events from the map and update the Three.js camera
    let _this = this; // keep the function on _this
    this.map
        .on('move', function () {
            _this.updateCamera();
        })
        .on('resize', function () {
            _this.setupCamera();
        })

    this.setupCamera();
}

CameraSync.prototype = {
    setupCamera: function () {
        const t = this.map.transform;
        this.camera.aspect = t.width / t.height; //bug fixed, if aspect is not reset raycast will fail on map resize
        this.halfFov = t._fov / 2;
        this.cameraToCenterDistance = 0.5 / Math.tan(this.halfFov) * t.height;
        const maxPitch = t._maxPitch * Math.PI / 180;
        this.acuteAngle = Math.PI / 2 - maxPitch;
        this.updateCamera();
    },

    updateCamera: function (ev) {
        if (!this.camera) {
            console.log('nocamera')
            return;
        }

        const t = this.map.transform;
        this.camera.aspect = t.width / t.height; //bug fixed, if aspect is not reset raycast will fail on map resize
        const offset = t.centerOffset || new THREE.Vector3(); //{ x: t.width / 2, y: t.height / 2 };
        let farZ = 0;
        let furthestDistance = 0;
        this.halfFov = t._fov / 2;
        const groundAngle = Math.PI / 2 + t._pitch;
        const pitchAngle = Math.cos((Math.PI / 2) - t._pitch); //pitch seems to influence heavily the depth calculation and cannot be more than 60 = PI/3 < v1 and 85 > v2
        this.cameraToCenterDistance = 0.5 / Math.tan(this.halfFov) * t.height;
        let pixelsPerMeter = 1;
        const worldSize = this.worldSize();

        if (this.map.tb.mapboxVersion >= 2.0) {
            // mapbox version >= 2.0
            pixelsPerMeter = this.mercatorZfromAltitude(1, t.center.lat) * worldSize;
            const fovAboveCenter = t._fov * (0.5 + t.centerOffset.y / t.height);

            // Adjust distance to MSL by the minimum possible elevation visible on screen,
            // this way the far plane is pushed further in the case of negative elevation.
            const minElevationInPixels = t.elevation ? t.elevation.getMinElevationBelowMSL() * pixelsPerMeter : 0;
            const cameraToSeaLevelDistance = ((t._camera.position[2] * worldSize) - minElevationInPixels) / Math.cos(t._pitch);
            const topHalfSurfaceDistance = Math.sin(fovAboveCenter) * cameraToSeaLevelDistance / Math.sin(utils.clamp(Math.PI - groundAngle - fovAboveCenter, 0.01, Math.PI - 0.01));

            // Calculate z distance of the farthest fragment that should be rendered.
            furthestDistance = pitchAngle * topHalfSurfaceDistance + cameraToSeaLevelDistance;

            // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
            const horizonDistance = cameraToSeaLevelDistance * (1 / t._horizonShift);
            farZ = Math.min(furthestDistance * 1.01, horizonDistance);
        } else {
            // mapbox version < 2.0 or azure maps
            // Furthest distance optimized by @jscastro76
            const topHalfSurfaceDistance = Math.sin(this.halfFov) * this.cameraToCenterDistance / Math.sin(Math.PI - groundAngle - this.halfFov);

            // Calculate z distance of the farthest fragment that should be rendered. 
            furthestDistance = pitchAngle * topHalfSurfaceDistance + this.cameraToCenterDistance;

            // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
            farZ = furthestDistance * 1.01;
        }
        this.cameraTranslateZ = new THREE.Matrix4().makeTranslation(0, 0, this.cameraToCenterDistance);

        // someday @ansis set further near plane to fix precision for deckgl,so we should fix it to use mapbox-gl v1.3+ correctly
        // https://github.com/mapbox/mapbox-gl-js/commit/5cf6e5f523611bea61dae155db19a7cb19eb825c#diff-5dddfe9d7b5b4413ee54284bc1f7966d
        const nz = (t.height / 50); //min near z as coded by @ansis
        const nearZ = Math.max(nz * pitchAngle, nz); //on changes in the pitch nz could be too low

        const h = t.height;
        const w = t.width;
        if (this.camera instanceof THREE.OrthographicCamera) {
            this.camera.projectionMatrix = utils.makeOrthographicMatrix(w / - 2, w / 2, h / 2, h / - 2, nearZ, farZ);
        } else {
            this.camera.projectionMatrix = utils.makePerspectiveMatrix(t._fov, w / h, nearZ, farZ);
        }
        this.camera.projectionMatrix.elements[8] = -offset.x * 2 / t.width;
        this.camera.projectionMatrix.elements[9] = offset.y * 2 / t.height;

        // Unlike the Mapbox GL JS camera, separate camera translation and rotation out into its world matrix
        // If this is applied directly to the projection matrix, it will work OK but break raycasting
        let cameraWorldMatrix = this.calcCameraMatrix(t._pitch, t.angle);
        // When terrain layers are included, height of 3D layers must be modified from t_camera.z * worldSize
        if (t.elevation) cameraWorldMatrix.elements[14] = t._camera.position[2] * worldSize;
        //this.camera.matrixWorld.elements is equivalent to t._camera._transform
        this.camera.matrixWorld.copy(cameraWorldMatrix);
        
        let zoomPow = t.scale * this.state.worldSizeRatio;
        // Handle scaling and translation of objects in the map in the world's matrix transform, not the camera
        let scale = new THREE.Matrix4;
        let translateMap = new THREE.Matrix4;
        let rotateMap = new THREE.Matrix4;

        scale.makeScale(zoomPow, zoomPow, zoomPow);

        let x = t.x || t.point.x;
        let y = t.y || t.point.y;
        translateMap.makeTranslation(-x, y, 0);
        rotateMap.makeRotationZ(Math.PI);

        this.world.matrix = new THREE.Matrix4()
            .premultiply(rotateMap)
            .premultiply(this.state.translateCenter)
            .premultiply(scale)
            .premultiply(translateMap)

        // utils.prettyPrintMatrix(this.camera.projectionMatrix.elements);
        this.map.fire('CameraSynced', { detail: { nearZ: nearZ, farZ: farZ, pitch: t._pitch, angle: t.angle, furthestDistance: furthestDistance, cameraToCenterDistance: this.cameraToCenterDistance, t: this.map.transform, tbProjMatrix: this.camera.projectionMatrix.elements, tbWorldMatrix: this.world.matrix.elements, cameraSyn: CameraSync } });

    },

    worldSize() {
        let t = this.map.transform;
        return t.tileSize * t.scale;
    },

    worldSizeFromZoom() {
        let t = this.map.transform;
        return Math.pow(2.0, t.zoom) * t.tileSize;
    },

    mercatorZfromAltitude(altitude, lat) {
        return altitude / this.circumferenceAtLatitude(lat);
    },

    mercatorZfromZoom() {
        return this.cameraToCenterDistance / this.worldSizeFromZoom();
    },

    circumferenceAtLatitude(latitude) {
        return ThreeboxConstants.EARTH_CIRCUMFERENCE * Math.cos(latitude * Math.PI / 180);
    },

    calcCameraMatrix(pitch, angle, trz) {
        const t = this.map.transform;
        const _pitch = (pitch === undefined) ? t._pitch : pitch;
        const _angle = (angle === undefined) ? t.angle : angle;
        const _trz = (trz === undefined) ? this.cameraTranslateZ : trz;

        return new THREE.Matrix4()
            .premultiply(_trz)
            .premultiply(new THREE.Matrix4().makeRotationX(_pitch))
            .premultiply(new THREE.Matrix4().makeRotationZ(_angle));
    },

    updateCameraState() {
        let t = this.map.transform;
        if (!t.height) return;

        // Set camera orientation and move it to a proper distance from the map
        //t._camera.setPitchBearing(t._pitch, t.angle);

        const dir = t._camera.forward();
        const distance = t.cameraToCenterDistance;
        const center = t.point;

        // Use camera zoom (if terrain is enabled) to maintain constant altitude to sea level
        const zoom = t._cameraZoom ? t._cameraZoom : t._zoom;
        const altitude = this.mercatorZfromZoom(t);
        const height = altitude - this.mercatorZfromAltitude(t._centerAltitude, t.center.lat);

        // simplified version of: this._worldSizeFromZoom(this._zoomFromMercatorZ(height))
        const updatedWorldSize = t.cameraToCenterDistance / height;
        return [
            center.x / this.worldSize() - (dir[0] * distance) / updatedWorldSize,
            center.y / this.worldSize() - (dir[1] * distance) / updatedWorldSize,
            this.mercatorZfromAltitude(t._centerAltitude, t._center.lat) + (-dir[2] * distance) / updatedWorldSize
        ];

    },

    getWorldToCamera(worldSize, pixelsPerMeter) {
        // transformation chain from world space to camera space:
        // 1. Height value (z) of renderables is in meters. Scale z coordinate by pixelsPerMeter
        // 2. Transform from pixel coordinates to camera space with cameraMatrix^-1
        // 3. flip Y if required

        // worldToCamera: flip * cam^-1 * zScale
        // cameraToWorld: (flip * cam^-1 * zScale)^-1 => (zScale^-1 * cam * flip^-1)
        let t = this.map.transform;
        const matrix = new THREE.Matrix4();
        const matrixT = new THREE.Matrix4();

        // Compute inverse of camera matrix and post-multiply negated translation
        const o = t._camera._orientation;
        const p = t._camera.position;
        const invPosition = new THREE.Vector3(p[0], p[1], p[2]);

        const quat = new THREE.Quaternion();
        quat.set(o[0], o[1], o[2], o[3]);
        const invOrientation = quat.conjugate();
        invPosition.multiplyScalar(-worldSize);

        matrixT.makeTranslation(invPosition.x, invPosition.y, invPosition.z);
        matrix
            .makeRotationFromQuaternion(invOrientation)
            .premultiply(matrixT);
        //this would make the matrix exact to getWorldToCamera but breaks
        //this.translate(matrix.elements, matrix.elements, invPosition);

        // Pre-multiply y (2nd row)
        matrix.elements[1] *= -1.0;
        matrix.elements[5] *= -1.0;
        matrix.elements[9] *= -1.0;
        matrix.elements[13] *= -1.0;

        // Post-multiply z (3rd column)
        matrix.elements[8] *= pixelsPerMeter;
        matrix.elements[9] *= pixelsPerMeter;
        matrix.elements[10] *= pixelsPerMeter;
        matrix.elements[11] *= pixelsPerMeter;
        //console.log(matrix.elements);
        return matrix;
    },

    translate(out, a, v) {
        let x = v[0] || v.x,
            y = v[1] || v.y,
            z = v[2] || v.z;
        let a00, a01, a02, a03;
        let a10, a11, a12, a13;
        let a20, a21, a22, a23;
        if (a === out) {
            out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
            out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
            out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
            out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        } else {
            a00 = a[0];
            a01 = a[1];
            a02 = a[2];
            a03 = a[3];
            a10 = a[4];
            a11 = a[5];
            a12 = a[6];
            a13 = a[7];
            a20 = a[8];
            a21 = a[9];
            a22 = a[10];
            a23 = a[11];
            out[0] = a00;
            out[1] = a01;
            out[2] = a02;
            out[3] = a03;
            out[4] = a10;
            out[5] = a11;
            out[6] = a12;
            out[7] = a13;
            out[8] = a20;
            out[9] = a21;
            out[10] = a22;
            out[11] = a23;
            out[12] = a00 * x + a10 * y + a20 * z + a[12];
            out[13] = a01 * x + a11 * y + a21 * z + a[13];
            out[14] = a02 * x + a12 * y + a22 * z + a[14];
            out[15] = a03 * x + a13 * y + a23 * z + a[15];
        }
        return out;
    }
}

module.exports = exports = CameraSync;
},{"../three.js":25,"../utils/constants.js":26,"../utils/utils.js":29}],7:[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 */

const THREE = require('../three.js');
THREE.CSS2DObject = function (element) {

	THREE.Object3D.call(this);

	this.element = element || document.createElement('div');

	this.element.style.position = 'absolute';

	//[jscastro] some labels must be always visible
	this.alwaysVisible = false;

	//[jscastro] layer is needed to be rendered/hidden based on layer visibility
	Object.defineProperty(this, 'layer', {
		get() { return (this.parent && this.parent.parent ? this.parent.parent.layer : null) }
	});

	this.dispose = function () {
		this.remove();
		this.element = null;
	}

	this.remove = function () {
		if (this.element instanceof Element && this.element.parentNode !== null) {
			this.element.parentNode.removeChild(this.element);
		}
	}

	this.addEventListener('removed', function () {

		this.remove();

	});

};

THREE.CSS2DObject.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {

	constructor: THREE.CSS2DObject,

	copy: function (source, recursive) {

		THREE.Object3D.prototype.copy.call(this, source, recursive);

		this.element = source.element.cloneNode(true);

		return this;

	}

});

THREE.CSS2DRenderer = function () {

	var _this = this;

	var _width, _height;
	var _widthHalf, _heightHalf;

	var vector = new THREE.Vector3();
	var viewMatrix = new THREE.Matrix4();
	var viewProjectionMatrix = new THREE.Matrix4();

	var cache = {
		objects: new WeakMap(),
		list: new Map()
	};
	this.cacheList = cache.list;
	var domElement = document.createElement('div');
	domElement.style.overflow = 'hidden';

	this.domElement = domElement;

	this.getSize = function () {

		return {
			width: _width,
			height: _height
		};

	};

	this.setSize = function (width, height) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';

	};

	this.renderObject = function (object, scene, camera) {

		if (object instanceof THREE.CSS2DObject) {

			//[jscastro] optimize performance and don't update and remove the labels that are not visible
			if (!object.visible) {
				cache.objects.delete({ key: object.uuid });
				cache.list.delete(object.uuid);
				object.remove();
			}
			else {

				object.onBeforeRender(_this, scene, camera);

				vector.setFromMatrixPosition(object.matrixWorld);
				vector.applyMatrix4(viewProjectionMatrix);

				var element = object.element;
				var style = 'translate(-50%,-50%) translate(' + (vector.x * _widthHalf + _widthHalf) + 'px,' + (- vector.y * _heightHalf + _heightHalf) + 'px)';

				element.style.WebkitTransform = style;
				element.style.MozTransform = style;
				element.style.oTransform = style;
				element.style.transform = style;

				element.style.display = (object.visible && vector.z >= - 1 && vector.z <= 1) ? '' : 'none';

				var objectData = {
					distanceToCameraSquared: getDistanceToSquared(camera, object)
				};

				cache.objects.set({ key: object.uuid }, objectData);
				cache.list.set(object.uuid, object);

				if (element.parentNode !== domElement) {

					domElement.appendChild(element);

				}

				object.onAfterRender(_this, scene, camera);
			}
		}

		for (var i = 0, l = object.children.length; i < l; i++) {

			this.renderObject(object.children[i], scene, camera);

		}

	};

	var getDistanceToSquared = function () {

		var a = new THREE.Vector3();
		var b = new THREE.Vector3();

		return function (object1, object2) {

			a.setFromMatrixPosition(object1.matrixWorld);
			b.setFromMatrixPosition(object2.matrixWorld);

			return a.distanceToSquared(b);

		};

	}();

	var filterAndFlatten = function (scene) {

		var result = [];

		scene.traverse(function (object) {

			if (object instanceof THREE.CSS2DObject) result.push(object);

		});

		return result;

	};

	var zOrder = function (scene) {

		var sorted = filterAndFlatten(scene).sort(function (a, b) {
			//[jscastro] check the objects already exist in the cache
			let cacheA = cache.objects.get({ key: a.uuid });
			let cacheB = cache.objects.get({ key: b.uuid });

			if (cacheA && cacheB) {
				var distanceA = cacheA.distanceToCameraSquared;
				var distanceB = cacheB.distanceToCameraSquared;

				return distanceA - distanceB;
			}

		});

		var zMax = sorted.length;

		for (var i = 0, l = sorted.length; i < l; i++) {

			sorted[i].element.style.zIndex = zMax - i;

		}

	};

	this.render = function (scene, camera) {

		if (scene.autoUpdate === true) scene.updateMatrixWorld();
		if (camera.parent === null) camera.updateMatrixWorld();

		viewMatrix.copy(camera.matrixWorldInverse);
		viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, viewMatrix);

		this.renderObject(scene, scene, camera);
		zOrder(scene);

	};

};

module.exports = exports = { CSS2DRenderer: THREE.CSS2DRenderer, CSS2DObject: THREE.CSS2DObject };


},{"../three.js":25}],8:[function(require,module,exports){
/**
 * @author jscastro / https://github.com/jscastro76
 */

const THREE = require("./CSS2DRenderer.js");

function LabelRenderer(map) {

	this.map = map;

	this.renderer = new THREE.CSS2DRenderer();

	this.renderer.setSize(this.map.getCanvas().clientWidth, this.map.getCanvas().clientHeight);
	this.renderer.domElement.style.position = 'absolute';
	this.renderer.domElement.id = 'labelCanvas'; //TODO: this value must come by parameter
	this.renderer.domElement.style.top = 0;
	this.renderer.domElement.style.zIndex = "0";
	this.map.getCanvasContainer().appendChild(this.renderer.domElement);

	this.scene, this.camera;

	this.dispose = function () {
		this.map.getCanvasContainer().removeChild(this.renderer.domElement)
		this.renderer.domElement.remove();
		this.renderer = {};
	}

	this.setSize = function (width, height) {
		this.renderer.setSize(width, height);
	}

	this.map.on('resize', function () {
		this.renderer.setSize(this.map.getCanvas().clientWidth, this.map.getCanvas().clientHeight);
	}.bind(this));

	this.state = {
		reset: function () {
			//TODO: Implement a good state reset, check out what is made in WebGlRenderer
		}
	}

	this.render = async function (scene, camera) {
		this.scene = scene;
		this.camera = camera;
		return new Promise((resolve) => { resolve(this.renderer.render(scene, camera)) }); 
	}

	//[jscastro] method to toggle Layer visibility
	this.toggleLabels = async function (layerId, visible) {
		return new Promise((resolve) => {
			resolve(this.setVisibility(layerId, visible, this.scene, this.camera, this.renderer));
		}) 
	};

	//[jscastro] method to set visibility
	this.setVisibility = function (layerId, visible, scene, camera, renderer) {
		var cache = this.renderer.cacheList;
		cache.forEach(function (l) {
			if (l.visible != visible && l.layer === layerId) {
				if ((visible && l.alwaysVisible) || !visible) {
					l.visible = visible;
					renderer.renderObject(l, scene, camera);
				}
			}
		});
	};

}

module.exports = exports = LabelRenderer;
},{"./CSS2DRenderer.js":7}],9:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
 */
const Objects = require('./objects.js');
const utils = require("../utils/utils.js");

function Object3D(opt) {
	opt = utils._validate(opt, Objects.prototype._defaults.Object3D);
	// [jscastro] full refactor of Object3D to behave exactly like 3D Models loadObj
	let obj = opt.obj;
	// [jscastro] options.rotation was wrongly used
	const r = utils.types.rotation(opt.rotation, [0, 0, 0]);
	const s = utils.types.scale(opt.scale, [1, 1, 1]);
	obj.rotation.set(r[0], r[1], r[2]);
	obj.scale.set(s[0], s[1], s[2]);
	obj.name = "model";
	let userScaleGroup = Objects.prototype._makeGroup(obj, opt);
	opt.obj.name = "model";
	Objects.prototype._addMethods(userScaleGroup);
	//[jscastro] calculate automatically the pivotal center of the object
	userScaleGroup.setAnchor(opt.anchor);
	//[jscastro] override the center calculated if the object has adjustments
	userScaleGroup.setCenter(opt.adjustment);
	//[jscastro] if the object is excluded from raycasting
	userScaleGroup.raycasted = opt.raycasted;
	userScaleGroup.visibility = true;

	return userScaleGroup
}

module.exports = exports = Object3D;
},{"../utils/utils.js":29,"./objects.js":21}],10:[function(require,module,exports){
const SunCalc = require('../../utils/suncalc.js');

class BuildingShadows {
	constructor(options, threebox) {
		this.id = options.layerId;
		this.type = 'custom';
		this.renderingMode = '3d';
		this.opacity = 0.5;
		this.buildingsLayerId = options.buildingsLayerId;
		this.minAltitude = options.minAltitude || 0.10;
		this.tb = threebox;
	}
	onAdd(map, gl) {
		this.map = map;
		const vertexSource = `
			uniform mat4 u_matrix;
			uniform float u_height_factor;
			uniform float u_altitude;
			uniform float u_azimuth;
			attribute vec2 a_pos;
			attribute vec4 a_normal_ed;
			attribute lowp vec2 a_base;
			attribute lowp vec2 a_height;
			void main() {
				float base = max(0.0, a_base.x);
				float height = max(0.0, a_height.x);
				float t = mod(a_normal_ed.x, 2.0);
				vec4 pos = vec4(a_pos, t > 0.0 ? height : base, 1);
				float len = pos.z * u_height_factor / tan(u_altitude);
				pos.x += cos(u_azimuth) * len;
				pos.y += sin(u_azimuth) * len;
				pos.z = 0.0;
				gl_Position = u_matrix * pos;
			}
			`;
		const fragmentSource = `
			void main() {
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.7);
			}
			`;
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexSource);
		gl.compileShader(vertexShader);
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentSource);
		gl.compileShader(fragmentShader);
		this.program = gl.createProgram();
		gl.attachShader(this.program, vertexShader);
		gl.attachShader(this.program, fragmentShader);
		gl.linkProgram(this.program);
		gl.validateProgram(this.program);
		this.uMatrix = gl.getUniformLocation(this.program, "u_matrix");
		this.uHeightFactor = gl.getUniformLocation(this.program, "u_height_factor");
		this.uAltitude = gl.getUniformLocation(this.program, "u_altitude");
		this.uAzimuth = gl.getUniformLocation(this.program, "u_azimuth");
		this.aPos = gl.getAttribLocation(this.program, "a_pos");
		this.aNormal = gl.getAttribLocation(this.program, "a_normal_ed");
		this.aBase = gl.getAttribLocation(this.program, "a_base");
		this.aHeight = gl.getAttribLocation(this.program, "a_height");
	}
	render(gl, matrix) {
		gl.useProgram(this.program);
		const source = this.map.style.sourceCaches['composite'];
		const coords = source.getVisibleCoordinates().reverse();
		const buildingsLayer = this.map.getLayer(this.buildingsLayerId);
		const context = this.map.painter.context;
		const { lng, lat } = this.map.getCenter();
		const pos = this.tb.getSunPosition(this.tb.lightDateTime, [lng, lat]);
		gl.uniform1f(this.uAltitude, (pos.altitude > this.minAltitude ? pos.altitude : 0));
		gl.uniform1f(this.uAzimuth, pos.azimuth + 3 * Math.PI / 2);
		//this.opacity = Math.sin(Math.max(pos.altitude, 0)) * 0.6;
		gl.enable(gl.BLEND);
		//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.DST_ALPHA, gl.SRC_ALPHA);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		var ext = gl.getExtension('EXT_blend_minmax');
		//gl.blendEquationSeparate(gl.FUNC_SUBTRACT, ext.MIN_EXT);
		//gl.blendEquation(gl.FUNC_ADD);
		gl.disable(gl.DEPTH_TEST);
		for (const coord of coords) {
			const tile = source.getTile(coord);
			const bucket = tile.getBucket(buildingsLayer);
			if (!bucket) continue;
			const [heightBuffer, baseBuffer] = bucket.programConfigurations.programConfigurations[this.buildingsLayerId]._buffers;
			gl.uniformMatrix4fv(this.uMatrix, false, coord.posMatrix);
			gl.uniform1f(this.uHeightFactor, Math.pow(2, coord.overscaledZ) / tile.tileSize / 8);
			for (const segment of bucket.segments.get()) {
				const numPrevAttrib = context.currentNumAttributes || 0;
				const numNextAttrib = 2;
				for (let i = numNextAttrib; i < numPrevAttrib; i++) gl.disableVertexAttribArray(i);
				const vertexOffset = segment.vertexOffset || 0;
				gl.enableVertexAttribArray(this.aPos);
				gl.enableVertexAttribArray(this.aNormal);
				gl.enableVertexAttribArray(this.aHeight);
				gl.enableVertexAttribArray(this.aBase);
				bucket.layoutVertexBuffer.bind();
				gl.vertexAttribPointer(this.aPos, 2, gl.SHORT, false, 12, 12 * vertexOffset);
				gl.vertexAttribPointer(this.aNormal, 4, gl.SHORT, false, 12, 4 + 12 * vertexOffset);
				heightBuffer.bind();
				gl.vertexAttribPointer(this.aHeight, 1, gl.FLOAT, false, 4, 4 * vertexOffset);
				baseBuffer.bind();
				gl.vertexAttribPointer(this.aBase, 1, gl.FLOAT, false, 4, 4 * vertexOffset);
				bucket.indexBuffer.bind();
				context.currentNumAttributes = numNextAttrib;
				gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
			}
		}
	}
}


module.exports = exports = BuildingShadows;
},{"../../utils/suncalc.js":28}],11:[function(require,module,exports){
/**
 * @author jscastro / https://github.com/jscastro76
 */
const Objects = require('./objects.js');
const utils = require("../utils/utils.js");
const THREE = require("../three.js");
const Object3D = require('./Object3D.js');

/**
 * 
 * @param {any} opt must fit the default defined in Objects.prototype._defaults.extrusion 
 * @param {arr} opt.coordinates could receive a feature.geometry.coordinates
 */
function extrusion(opt) {

	opt = utils._validate(opt, Objects.prototype._defaults.extrusion);
	let shape = extrusion.prototype.buildShape(opt.coordinates);
	let geometry = extrusion.prototype.buildGeometry(shape, opt.geometryOptions);
	let mesh = new THREE.Mesh(geometry, opt.materials);
	opt.obj = mesh;
	//[jscastro] we convert it in Object3D to add methods, bounding box, model, tooltip...
	return new Object3D(opt);

}

extrusion.prototype = {

	buildShape: function (coords) {
		if (coords[0] instanceof (THREE.Vector2 || THREE.Vector3)) return new THREE.Shape(coords);
		let shape = new THREE.Shape();
		for (let i = 0; i < coords.length; i++) {
			if (i === 0) {
				shape = new THREE.Shape(this.buildPoints(coords[0], coords[0]));
			} else {
				shape.holes.push(new THREE.Path(this.buildPoints(coords[i], coords[0])));
			}
		}
		return shape;
	},

	buildPoints: function (coords, initCoords) {
		const points = [];
		let init = utils.projectToWorld([initCoords[0][0], initCoords[0][1], 0]);
		for (let i = 0; i < coords.length; i++) {
			let pos = utils.projectToWorld([coords[i][0], coords[i][1], 0]);
			points.push(new THREE.Vector2(utils.toDecimal((pos.x - init.x), 9), utils.toDecimal((pos.y - init.y), 9)));
		}
		return points;
	},

	buildGeometry: function (shape, settings) {
		let geometry = new THREE.ExtrudeBufferGeometry(shape, settings);
		geometry.computeBoundingBox();
		return geometry;
	}

}

module.exports = exports = extrusion;
},{"../three.js":25,"../utils/utils.js":29,"./Object3D.js":9,"./objects.js":21}],12:[function(require,module,exports){
(function (setImmediate){(function (){
/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
*/
!function(f){typeof module!='undefined'&&typeof exports=='object'?module.exports=f():typeof define!='undefined'&&define.amd?define(['fflate',f]):(typeof self!='undefined'?self:this).fflate=f()}(function(){var _e={};"use strict";_e.__esModule=!0;var t=(typeof module!='undefined'&&typeof exports=='object'?function(_f){"use strict";var e;var r=";var __w=require('worker_threads');__w.parentPort.on('message',function(m){onmessage({data:m})}),postMessage=function(m,t){__w.parentPort.postMessage(m,t)},close=process.exit;self=global";try{e("require('worker_threads')").Worker}catch(e){}exports.default=e?function(t,n,o,s,a){var u=!1,i=new e(t+r,{eval:!0}).on("error",(function(e){return a(e,null)})).on("message",(function(e){return a(null,e)})).on("exit",(function(e){e&&!u&&a(Error("exited with code "+e),null)}));return i.postMessage(o,s),i.terminate=function(){return u=!0,e.prototype.terminate.call(i)},i}:function(e,r,t,n,o){setImmediate((function(){return o(Error("async operations unsupported - update to Node 12+ (or Node 10-11 with the --experimental-worker CLI flag)"),null)}));var s=function(){};return{terminate:s,postMessage:s}};return _f}:function(_f){"use strict";var e=eval;_f.default=function(r,t,n,o,s){var u=e[t]||(e[t]=URL.createObjectURL(new Blob([r],{type:"text/javascript"}))),a=new Worker(u);return a.onerror=function(e){return s(e.error,null)},a.onmessage=function(e){return s(null,e.data)},a.postMessage(n,o),a};return _f})({}),n=Uint8Array,r=Uint16Array,e=Uint32Array,i=new n([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),o=new n([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),a=new n([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),s=function(t,n){for(var i=new r(31),o=0;o<31;++o)i[o]=n+=1<<t[o-1];var a=new e(i[30]);for(o=1;o<30;++o)for(var s=i[o];s<i[o+1];++s)a[s]=s-i[o]<<5|o;return[i,a]},f=s(i,2),u=f[0],h=f[1];u[28]=258,h[258]=28;for(var c=s(o,0),l=c[0],p=c[1],v=new r(32768),d=0;d<32768;++d){var g=(43690&d)>>>1|(21845&d)<<1;v[d]=((65280&(g=(61680&(g=(52428&g)>>>2|(13107&g)<<2))>>>4|(3855&g)<<4))>>>8|(255&g)<<8)>>>1}var w=function(t,n,e){for(var i=t.length,o=0,a=new r(n);o<i;++o)++a[t[o]-1];var s,f=new r(n);for(o=0;o<n;++o)f[o]=f[o-1]+a[o-1]<<1;if(e){s=new r(1<<n);var u=15-n;for(o=0;o<i;++o)if(t[o])for(var h=o<<4|t[o],c=n-t[o],l=f[t[o]-1]++<<c,p=l|(1<<c)-1;l<=p;++l)s[v[l]>>>u]=h}else for(s=new r(i),o=0;o<i;++o)t[o]&&(s[o]=v[f[t[o]-1]++]>>>15-t[o]);return s},y=new n(288);for(d=0;d<144;++d)y[d]=8;for(d=144;d<256;++d)y[d]=9;for(d=256;d<280;++d)y[d]=7;for(d=280;d<288;++d)y[d]=8;var m=new n(32);for(d=0;d<32;++d)m[d]=5;var b=w(y,9,0),x=w(y,9,1),z=w(m,5,0),k=w(m,5,1),M=function(t){for(var n=t[0],r=1;r<t.length;++r)t[r]>n&&(n=t[r]);return n},A=function(t,n,r){var e=n/8|0;return(t[e]|t[e+1]<<8)>>(7&n)&r},S=function(t,n){var r=n/8|0;return(t[r]|t[r+1]<<8|t[r+2]<<16)>>(7&n)},D=function(t){return(t/8|0)+(7&t&&1)},C=function(t,i,o){(null==i||i<0)&&(i=0),(null==o||o>t.length)&&(o=t.length);var a=new(t instanceof r?r:t instanceof e?e:n)(o-i);return a.set(t.subarray(i,o)),a},U=function(t,r,e){var s=t.length;if(!s||e&&!e.l&&s<5)return r||new n(0);var f=!r||e,h=!e||e.i;e||(e={}),r||(r=new n(3*s));var c=function(t){var e=r.length;if(t>e){var i=new n(Math.max(2*e,t));i.set(r),r=i}},p=e.f||0,v=e.p||0,d=e.b||0,g=e.l,y=e.d,m=e.m,b=e.n,z=8*s;do{if(!g){e.f=p=A(t,v,1);var U=A(t,v+1,3);if(v+=3,!U){var O=t[(H=D(v)+4)-4]|t[H-3]<<8,T=H+O;if(T>s){if(h)throw"unexpected EOF";break}f&&c(d+O),r.set(t.subarray(H,T),d),e.b=d+=O,e.p=v=8*T;continue}if(1==U)g=x,y=k,m=9,b=5;else{if(2!=U)throw"invalid block type";var Z=A(t,v,31)+257,I=A(t,v+10,15)+4,F=Z+A(t,v+5,31)+1;v+=14;for(var E=new n(F),G=new n(19),P=0;P<I;++P)G[a[P]]=A(t,v+3*P,7);v+=3*I;var j=M(G),_=(1<<j)-1;if(!h&&v+F*(j+7)>z)break;var q=w(G,j,1);for(P=0;P<F;){var H,Y=q[A(t,v,_)];if(v+=15&Y,(H=Y>>>4)<16)E[P++]=H;else{var B=0,J=0;for(16==H?(J=3+A(t,v,3),v+=2,B=E[P-1]):17==H?(J=3+A(t,v,7),v+=3):18==H&&(J=11+A(t,v,127),v+=7);J--;)E[P++]=B}}var K=E.subarray(0,Z),L=E.subarray(Z);m=M(K),b=M(L),g=w(K,m,1),y=w(L,b,1)}if(v>z)throw"unexpected EOF"}f&&c(d+131072);for(var N=(1<<m)-1,Q=(1<<b)-1,R=m+b+18;h||v+R<z;){var V=(B=g[S(t,v)&N])>>>4;if((v+=15&B)>z)throw"unexpected EOF";if(!B)throw"invalid length/literal";if(V<256)r[d++]=V;else{if(256==V){g=null;break}var W=V-254;V>264&&(W=A(t,v,(1<<(tt=i[P=V-257]))-1)+u[P],v+=tt);var X=y[S(t,v)&Q],$=X>>>4;if(!X)throw"invalid distance";if(v+=15&X,L=l[$],$>3){var tt=o[$];L+=S(t,v)&(1<<tt)-1,v+=tt}if(v>z)throw"unexpected EOF";f&&c(d+131072);for(var nt=d+W;d<nt;d+=4)r[d]=r[d-L],r[d+1]=r[d+1-L],r[d+2]=r[d+2-L],r[d+3]=r[d+3-L];d=nt}}e.l=g,e.p=v,e.b=d,g&&(p=1,e.m=m,e.d=y,e.n=b)}while(!p);return d==r.length?r:C(r,0,d)},O=function(t,n,r){var e=n/8|0;t[e]|=r<<=7&n,t[e+1]|=r>>>8},T=function(t,n,r){var e=n/8|0;t[e]|=r<<=7&n,t[e+1]|=r>>>8,t[e+2]|=r>>>16},Z=function(t,e){for(var i=[],o=0;o<t.length;++o)t[o]&&i.push({s:o,f:t[o]});var a=i.length,s=i.slice();if(!a)return[_,0];if(1==a){var f=new n(i[0].s+1);return f[i[0].s]=1,[f,1]}i.sort((function(t,n){return t.f-n.f})),i.push({s:-1,f:25001});var u=i[0],h=i[1],c=0,l=1,p=2;for(i[0]={s:-1,f:u.f+h.f,l:u,r:h};l!=a-1;)u=i[i[c].f<i[p].f?c++:p++],h=i[c!=l&&i[c].f<i[p].f?c++:p++],i[l++]={s:-1,f:u.f+h.f,l:u,r:h};var v=s[0].s;for(o=1;o<a;++o)s[o].s>v&&(v=s[o].s);var d=new r(v+1),g=I(i[l-1],d,0);if(g>e){o=0;var w=0,y=g-e,m=1<<y;for(s.sort((function(t,n){return d[n.s]-d[t.s]||t.f-n.f}));o<a;++o){var b=s[o].s;if(!(d[b]>e))break;w+=m-(1<<g-d[b]),d[b]=e}for(w>>>=y;w>0;){var x=s[o].s;d[x]<e?w-=1<<e-d[x]++-1:++o}for(;o>=0&&w;--o){var z=s[o].s;d[z]==e&&(--d[z],++w)}g=e}return[new n(d),g]},I=function(t,n,r){return-1==t.s?Math.max(I(t.l,n,r+1),I(t.r,n,r+1)):n[t.s]=r},F=function(t){for(var n=t.length;n&&!t[--n];);for(var e=new r(++n),i=0,o=t[0],a=1,s=function(t){e[i++]=t},f=1;f<=n;++f)if(t[f]==o&&f!=n)++a;else{if(!o&&a>2){for(;a>138;a-=138)s(32754);a>2&&(s(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(s(o),--a;a>6;a-=6)s(8304);a>2&&(s(a-3<<5|8208),a=0)}for(;a--;)s(o);a=1,o=t[f]}return[e.subarray(0,i),n]},E=function(t,n){for(var r=0,e=0;e<n.length;++e)r+=t[e]*n[e];return r},G=function(t,n,r){var e=r.length,i=D(n+2);t[i]=255&e,t[i+1]=e>>>8,t[i+2]=255^t[i],t[i+3]=255^t[i+1];for(var o=0;o<e;++o)t[i+o+4]=r[o];return 8*(i+4+e)},P=function(t,n,e,s,f,u,h,c,l,p,v){O(n,v++,e),++f[256];for(var d=Z(f,15),g=d[0],x=d[1],k=Z(u,15),M=k[0],A=k[1],S=F(g),D=S[0],C=S[1],U=F(M),I=U[0],P=U[1],j=new r(19),_=0;_<D.length;++_)j[31&D[_]]++;for(_=0;_<I.length;++_)j[31&I[_]]++;for(var q=Z(j,7),H=q[0],Y=q[1],B=19;B>4&&!H[a[B-1]];--B);var J,K,L,N,Q=p+5<<3,R=E(f,y)+E(u,m)+h,V=E(f,g)+E(u,M)+h+14+3*B+E(j,H)+(2*j[16]+3*j[17]+7*j[18]);if(Q<=R&&Q<=V)return G(n,v,t.subarray(l,l+p));if(O(n,v,1+(V<R)),v+=2,V<R){J=w(g,x,0),K=g,L=w(M,A,0),N=M;var W=w(H,Y,0);for(O(n,v,C-257),O(n,v+5,P-1),O(n,v+10,B-4),v+=14,_=0;_<B;++_)O(n,v+3*_,H[a[_]]);v+=3*B;for(var X=[D,I],$=0;$<2;++$){var tt=X[$];for(_=0;_<tt.length;++_)O(n,v,W[nt=31&tt[_]]),v+=H[nt],nt>15&&(O(n,v,tt[_]>>>5&127),v+=tt[_]>>>12)}}else J=b,K=y,L=z,N=m;for(_=0;_<c;++_)if(s[_]>255){var nt;T(n,v,J[257+(nt=s[_]>>>18&31)]),v+=K[nt+257],nt>7&&(O(n,v,s[_]>>>23&31),v+=i[nt]);var rt=31&s[_];T(n,v,L[rt]),v+=N[rt],rt>3&&(T(n,v,s[_]>>>5&8191),v+=o[rt])}else T(n,v,J[s[_]]),v+=K[s[_]];return T(n,v,J[256]),v+K[256]},j=new e([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),_=new n(0),q=function(t,a,s,f,u,c){var l=t.length,v=new n(f+l+5*(1+Math.ceil(l/7e3))+u),d=v.subarray(f,v.length-u),g=0;if(!a||l<8)for(var w=0;w<=l;w+=65535){var y=w+65535;y<l?g=G(d,g,t.subarray(w,y)):(d[w]=c,g=G(d,g,t.subarray(w,l)))}else{for(var m=j[a-1],b=m>>>13,x=8191&m,z=(1<<s)-1,k=new r(32768),M=new r(z+1),A=Math.ceil(s/3),S=2*A,U=function(n){return(t[n]^t[n+1]<<A^t[n+2]<<S)&z},O=new e(25e3),T=new r(288),Z=new r(32),I=0,F=0,E=(w=0,0),q=0,H=0;w<l;++w){var Y=U(w),B=32767&w,J=M[Y];if(k[B]=J,M[Y]=B,q<=w){var K=l-w;if((I>7e3||E>24576)&&K>423){g=P(t,d,0,O,T,Z,F,E,H,w-H,g),E=I=F=0,H=w;for(var L=0;L<286;++L)T[L]=0;for(L=0;L<30;++L)Z[L]=0}var N=2,Q=0,R=x,V=B-J&32767;if(K>2&&Y==U(w-V))for(var W=Math.min(b,K)-1,X=Math.min(32767,w),$=Math.min(258,K);V<=X&&--R&&B!=J;){if(t[w+N]==t[w+N-V]){for(var tt=0;tt<$&&t[w+tt]==t[w+tt-V];++tt);if(tt>N){if(N=tt,Q=V,tt>W)break;var nt=Math.min(V,tt-2),rt=0;for(L=0;L<nt;++L){var et=w-V+L+32768&32767,it=et-k[et]+32768&32767;it>rt&&(rt=it,J=et)}}}V+=(B=J)-(J=k[B])+32768&32767}if(Q){O[E++]=268435456|h[N]<<18|p[Q];var ot=31&h[N],at=31&p[Q];F+=i[ot]+o[at],++T[257+ot],++Z[at],q=w+N,++I}else O[E++]=t[w],++T[t[w]]}}g=P(t,d,c,O,T,Z,F,E,H,w-H,g),!c&&7&g&&(g=G(d,g+1,_))}return C(v,0,f+D(g)+u)},H=function(){for(var t=new e(256),n=0;n<256;++n){for(var r=n,i=9;--i;)r=(1&r&&3988292384)^r>>>1;t[n]=r}return t}(),Y=function(){var t=-1;return{p:function(n){for(var r=t,e=0;e<n.length;++e)r=H[255&r^n[e]]^r>>>8;t=r},d:function(){return~t}}},B=function(){var t=1,n=0;return{p:function(r){for(var e=t,i=n,o=r.length,a=0;a!=o;){for(var s=Math.min(a+2655,o);a<s;++a)i+=e+=r[a];e=(65535&e)+15*(e>>16),i=(65535&i)+15*(i>>16)}t=e,n=i},d:function(){return((t%=65521)>>>8<<16|(255&(n%=65521))<<8|n>>>8)+2*((255&t)<<23)}}},J=function(t,n,r,e,i){return q(t,null==n.level?6:n.level,null==n.mem?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(t.length)))):12+n.mem,r,e,!i)},K=function(t,n){var r={};for(var e in t)r[e]=t[e];for(var e in n)r[e]=n[e];return r},L=function(t,n,r){for(var e=t(),i=""+t,o=i.slice(i.indexOf("[")+1,i.lastIndexOf("]")).replace(/ /g,"").split(","),a=0;a<e.length;++a){var s=e[a],f=o[a];if("function"==typeof s){n+=";"+f+"=";var u=""+s;if(s.prototype)if(-1!=u.indexOf("[native code]")){var h=u.indexOf(" ",8)+1;n+=u.slice(h,u.indexOf("(",h))}else for(var c in n+=u,s.prototype)n+=";"+f+".prototype."+c+"="+s.prototype[c];else n+=u}else r[f]=s}return[n,r]},N=[],Q=function(t){var i=[];for(var o in t)(t[o]instanceof n||t[o]instanceof r||t[o]instanceof e)&&i.push((t[o]=new t[o].constructor(t[o])).buffer);return i},R=function(n,r,e,i){var o;if(!N[e]){for(var a="",s={},f=n.length-1,u=0;u<f;++u)a=(o=L(n[u],a,s))[0],s=o[1];N[e]=L(n[f],a,s)}var h=K({},N[e][1]);return t.default(N[e][0]+";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage="+r+"}",e,h,Q(h),i)},V=function(){return[n,r,e,i,o,a,u,l,x,k,v,w,M,A,S,D,C,U,At,rt,et]},W=function(){return[n,r,e,i,o,a,h,p,b,y,z,m,v,j,_,w,O,T,Z,I,F,E,G,P,D,C,q,J,xt,rt]},X=function(){return[ct,vt,ht,Y,H]},$=function(){return[lt,pt]},tt=function(){return[dt,ht,B]},nt=function(){return[gt]},rt=function(t){return postMessage(t,[t.buffer])},et=function(t){return t&&t.size&&new n(t.size)},it=function(t,n,r,e,i,o){var a=R(r,e,i,(function(t,n){a.terminate(),o(t,n)}));return a.postMessage([t,n],n.consume?[t.buffer]:[]),function(){a.terminate()}},ot=function(t){return t.ondata=function(t,n){return postMessage([t,n],[t.buffer])},function(n){return t.push(n.data[0],n.data[1])}},at=function(t,n,r,e,i){var o,a=R(t,e,i,(function(t,r){t?(a.terminate(),n.ondata.call(n,t)):(r[1]&&a.terminate(),n.ondata.call(n,t,r[0],r[1]))}));a.postMessage(r),n.push=function(t,r){if(o)throw"stream finished";if(!n.ondata)throw"no stream handler";a.postMessage([t,o=r],[t.buffer])},n.terminate=function(){a.terminate()}},st=function(t,n){return t[n]|t[n+1]<<8},ft=function(t,n){return(t[n]|t[n+1]<<8|t[n+2]<<16)+2*(t[n+3]<<23)},ut=function(t,n){return ft(t,n)|4294967296*ft(t,n)},ht=function(t,n,r){for(;r;++n)t[n]=r,r>>>=8},ct=function(t,n){var r=n.filename;if(t[0]=31,t[1]=139,t[2]=8,t[8]=n.level<2?4:9==n.level?2:0,t[9]=3,0!=n.mtime&&ht(t,4,Math.floor(new Date(n.mtime||Date.now())/1e3)),r){t[3]=8;for(var e=0;e<=r.length;++e)t[e+10]=r.charCodeAt(e)}},lt=function(t){if(31!=t[0]||139!=t[1]||8!=t[2])throw"invalid gzip data";var n=t[3],r=10;4&n&&(r+=t[10]|2+(t[11]<<8));for(var e=(n>>3&1)+(n>>4&1);e>0;e-=!t[r++]);return r+(2&n)},pt=function(t){var n=t.length;return(t[n-4]|t[n-3]<<8|t[n-2]<<16)+2*(t[n-1]<<23)},vt=function(t){return 10+(t.filename&&t.filename.length+1||0)},dt=function(t,n){var r=n.level,e=0==r?0:r<6?1:9==r?3:2;t[0]=120,t[1]=e<<6|(e?32-2*e:1)},gt=function(t){if(8!=(15&t[0])||t[0]>>>4>7||(t[0]<<8|t[1])%31)throw"invalid zlib data";if(32&t[1])throw"invalid zlib data: preset dictionaries not supported"};function wt(t,n){return n||"function"!=typeof t||(n=t,t={}),this.ondata=n,t}var yt=function(){function t(t,n){n||"function"!=typeof t||(n=t,t={}),this.ondata=n,this.o=t||{}}return t.prototype.p=function(t,n){this.ondata(J(t,this.o,0,0,!n),n)},t.prototype.push=function(t,n){if(this.d)throw"stream finished";if(!this.ondata)throw"no stream handler";this.d=n,this.p(t,n||!1)},t}();_e.Deflate=yt;var mt=function(){return function(t,n){at([W,function(){return[ot,yt]}],this,wt.call(this,t,n),(function(t){var n=new yt(t.data);onmessage=ot(n)}),6)}}();function bt(t,n,r){if(r||(r=n,n={}),"function"!=typeof r)throw"no callback";return it(t,n,[W],(function(t){return rt(xt(t.data[0],t.data[1]))}),0,r)}function xt(t,n){return J(t,n||{},0,0)}_e.AsyncDeflate=mt,_e.deflate=bt,_e.deflateSync=xt;var zt=function(){function t(t){this.s={},this.p=new n(0),this.ondata=t}return t.prototype.e=function(t){if(this.d)throw"stream finished";if(!this.ondata)throw"no stream handler";var r=this.p.length,e=new n(r+t.length);e.set(this.p),e.set(t,r),this.p=e},t.prototype.c=function(t){this.d=this.s.i=t||!1;var n=this.s.b,r=U(this.p,this.o,this.s);this.ondata(C(r,n,this.s.b),this.d),this.o=C(r,this.s.b-32768),this.s.b=this.o.length,this.p=C(this.p,this.s.p/8|0),this.s.p&=7},t.prototype.push=function(t,n){this.e(t),this.c(n)},t}();_e.Inflate=zt;var kt=function(){return function(t){this.ondata=t,at([V,function(){return[ot,zt]}],this,0,(function(){var t=new zt;onmessage=ot(t)}),7)}}();function Mt(t,n,r){if(r||(r=n,n={}),"function"!=typeof r)throw"no callback";return it(t,n,[V],(function(t){return rt(At(t.data[0],et(t.data[1])))}),1,r)}function At(t,n){return U(t,n)}_e.AsyncInflate=kt,_e.inflate=Mt,_e.inflateSync=At;var St=function(){function t(t,n){this.c=Y(),this.l=0,this.v=1,yt.call(this,t,n)}return t.prototype.push=function(t,n){yt.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){this.c.p(t),this.l+=t.length;var r=J(t,this.o,this.v&&vt(this.o),n&&8,!n);this.v&&(ct(r,this.o),this.v=0),n&&(ht(r,r.length-8,this.c.d()),ht(r,r.length-4,this.l)),this.ondata(r,n)},t}();_e.Gzip=St,_e.Compress=St;var Dt=function(){return function(t,n){at([W,X,function(){return[ot,yt,St]}],this,wt.call(this,t,n),(function(t){var n=new St(t.data);onmessage=ot(n)}),8)}}();function Ct(t,n,r){if(r||(r=n,n={}),"function"!=typeof r)throw"no callback";return it(t,n,[W,X,function(){return[Ut]}],(function(t){return rt(Ut(t.data[0],t.data[1]))}),2,r)}function Ut(t,n){n||(n={});var r=Y(),e=t.length;r.p(t);var i=J(t,n,vt(n),8),o=i.length;return ct(i,n),ht(i,o-8,r.d()),ht(i,o-4,e),i}_e.AsyncGzip=Dt,_e.AsyncCompress=Dt,_e.gzip=Ct,_e.compress=Ct,_e.gzipSync=Ut,_e.compressSync=Ut;var Ot=function(){function t(t){this.v=1,zt.call(this,t)}return t.prototype.push=function(t,n){if(zt.prototype.e.call(this,t),this.v){var r=this.p.length>3?lt(this.p):4;if(r>=this.p.length&&!n)return;this.p=this.p.subarray(r),this.v=0}if(n){if(this.p.length<8)throw"invalid gzip stream";this.p=this.p.subarray(0,-8)}zt.prototype.c.call(this,n)},t}();_e.Gunzip=Ot;var Tt=function(){return function(t){this.ondata=t,at([V,$,function(){return[ot,zt,Ot]}],this,0,(function(){var t=new Ot;onmessage=ot(t)}),9)}}();function Zt(t,n,r){if(r||(r=n,n={}),"function"!=typeof r)throw"no callback";return it(t,n,[V,$,function(){return[It]}],(function(t){return rt(It(t.data[0]))}),3,r)}function It(t,r){return U(t.subarray(lt(t),-8),r||new n(pt(t)))}_e.AsyncGunzip=Tt,_e.gunzip=Zt,_e.gunzipSync=It;var Ft=function(){function t(t,n){this.c=B(),this.v=1,yt.call(this,t,n)}return t.prototype.push=function(t,n){yt.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){this.c.p(t);var r=J(t,this.o,this.v&&2,n&&4,!n);this.v&&(dt(r,this.o),this.v=0),n&&ht(r,r.length-4,this.c.d()),this.ondata(r,n)},t}();_e.Zlib=Ft;var Et=function(){return function(t,n){at([W,tt,function(){return[ot,yt,Ft]}],this,wt.call(this,t,n),(function(t){var n=new Ft(t.data);onmessage=ot(n)}),10)}}();function Gt(t,n,r){if(r||(r=n,n={}),"function"!=typeof r)throw"no callback";return it(t,n,[W,tt,function(){return[Pt]}],(function(t){return rt(Pt(t.data[0],t.data[1]))}),4,r)}function Pt(t,n){n||(n={});var r=B();r.p(t);var e=J(t,n,2,4);return dt(e,n),ht(e,e.length-4,r.d()),e}_e.AsyncZlib=Et,_e.zlib=Gt,_e.zlibSync=Pt;var jt=function(){function t(t){this.v=1,zt.call(this,t)}return t.prototype.push=function(t,n){if(zt.prototype.e.call(this,t),this.v){if(this.p.length<2&&!n)return;this.p=this.p.subarray(2),this.v=0}if(n){if(this.p.length<4)throw"invalid zlib stream";this.p=this.p.subarray(0,-4)}zt.prototype.c.call(this,n)},t}();_e.Unzlib=jt;var _t=function(){return function(t){this.ondata=t,at([V,nt,function(){return[ot,zt,jt]}],this,0,(function(){var t=new jt;onmessage=ot(t)}),11)}}();function qt(t,n,r){if(r||(r=n,n={}),"function"!=typeof r)throw"no callback";return it(t,n,[V,nt,function(){return[Ht]}],(function(t){return rt(Ht(t.data[0],et(t.data[1])))}),5,r)}function Ht(t,n){return U((gt(t),t.subarray(2,-4)),n)}_e.AsyncUnzlib=_t,_e.unzlib=qt,_e.unzlibSync=Ht;var Yt=function(){function t(t){this.G=Ot,this.I=zt,this.Z=jt,this.ondata=t}return t.prototype.push=function(t,r){if(!this.ondata)throw"no stream handler";if(this.s)this.s.push(t,r);else{if(this.p&&this.p.length){var e=new n(this.p.length+t.length);e.set(this.p),e.set(t,this.p.length)}else this.p=t;if(this.p.length>2){var i=this,o=function(){i.ondata.apply(i,arguments)};this.s=31==this.p[0]&&139==this.p[1]&&8==this.p[2]?new this.G(o):8!=(15&this.p[0])||this.p[0]>>4>7||(this.p[0]<<8|this.p[1])%31?new this.I(o):new this.Z(o),this.s.push(this.p,r),this.p=null}}},t}();_e.Decompress=Yt;var Bt=function(){function t(t){this.G=Tt,this.I=kt,this.Z=_t,this.ondata=t}return t.prototype.push=function(t,n){Yt.prototype.push.call(this,t,n)},t}();function Jt(t,n,r){if(r||(r=n,n={}),"function"!=typeof r)throw"no callback";return 31==t[0]&&139==t[1]&&8==t[2]?Zt(t,n,r):8!=(15&t[0])||t[0]>>4>7||(t[0]<<8|t[1])%31?Mt(t,n,r):qt(t,n,r)}function Kt(t,n){return 31==t[0]&&139==t[1]&&8==t[2]?It(t,n):8!=(15&t[0])||t[0]>>4>7||(t[0]<<8|t[1])%31?At(t,n):Ht(t,n)}_e.AsyncDecompress=Bt,_e.decompress=Jt,_e.decompressSync=Kt;var Lt=function(t,r,e,i){for(var o in t){var a=t[o],s=r+o;a instanceof n?e[s]=[a,i]:Array.isArray(a)?e[s]=[a[0],K(i,a[1])]:Lt(a,s+"/",e,i)}},Nt="undefined"!=typeof TextEncoder&&new TextEncoder,Qt="undefined"!=typeof TextDecoder&&new TextDecoder,Rt=0;try{Qt.decode(_,{stream:!0}),Rt=1}catch(t){}var Vt=function(t){for(var n="",r=0;;){var e=t[r++],i=(e>127)+(e>223)+(e>239);if(r+i>t.length)return[n,C(t,r-1)];i?3==i?(e=((15&e)<<18|(63&t[r++])<<12|(63&t[r++])<<6|63&t[r++])-65536,n+=String.fromCharCode(55296|e>>10,56320|1023&e)):n+=String.fromCharCode(1&i?(31&e)<<6|63&t[r++]:(15&e)<<12|(63&t[r++])<<6|63&t[r++]):n+=String.fromCharCode(e)}},Wt=function(){function t(t){this.ondata=t,Rt?this.t=new TextDecoder:this.p=_}return t.prototype.push=function(t,r){if(!this.ondata)throw"no callback";if(r||(r=!1),this.t)return this.ondata(this.t.decode(t,{stream:!r}),r);var e=new n(this.p.length+t.length);e.set(this.p),e.set(t,this.p.length);var i=Vt(e),o=i[0],a=i[1];if(r&&a.length)throw"invalid utf-8 data";this.p=a,this.ondata(o,r)},t}();_e.DecodeUTF8=Wt;var Xt=function(){function t(t){this.ondata=t}return t.prototype.push=function(t,n){if(!this.ondata)throw"no callback";this.ondata($t(t),n||!1)},t}();function $t(t,r){if(r){for(var e=new n(t.length),i=0;i<t.length;++i)e[i]=t.charCodeAt(i);return e}if(Nt)return Nt.encode(t);var o=t.length,a=new n(t.length+(t.length>>1)),s=0,f=function(t){a[s++]=t};for(i=0;i<o;++i){if(s+5>a.length){var u=new n(s+8+(o-i<<1));u.set(a),a=u}var h=t.charCodeAt(i);h<128||r?f(h):h<2048?(f(192|h>>>6),f(128|63&h)):h>55295&&h<57344?(f(240|(h=65536+(1047552&h)|1023&t.charCodeAt(++i))>>>18),f(128|h>>>12&63),f(128|h>>>6&63),f(128|63&h)):(f(224|h>>>12),f(128|h>>>6&63),f(128|63&h))}return C(a,0,s)}function tn(t,n){if(n){for(var r="",e=0;e<t.length;e+=16384)r+=String.fromCharCode.apply(null,t.subarray(e,e+16384));return r}if(Qt)return Qt.decode(t);var i=Vt(t);if(i[1].length)throw"invalid utf-8 data";return i[0]}_e.EncodeUTF8=Xt,_e.strToU8=$t,_e.strFromU8=tn;var nn=function(t){return 1==t?3:t<6?2:9==t?1:0},rn=function(t,n){return n+30+st(t,n+26)+st(t,n+28)},en=function(t,n,r){var e=st(t,n+28),i=tn(t.subarray(n+46,n+46+e),!(2048&st(t,n+8))),o=n+46+e,a=ft(t,n+20),s=r&&4294967295==a?on(t,o):[a,ft(t,n+24),ft(t,n+42)],f=s[0],u=s[1],h=s[2];return[st(t,n+10),f,u,i,o+st(t,n+30)+st(t,n+32),h]},on=function(t,n){for(;1!=st(t,n);n+=4+st(t,n+2));return[ut(t,n+12),ut(t,n+4),ut(t,n+20)]},an=function(t){var n=0;if(t)for(var r in t){var e=t[r].length;if(e>65535)throw"extra field too long";n+=e+4}return n},sn=function(t,n,r,e,i,o,a,s){var f=e.length,u=r.extra,h=s&&s.length,c=an(u);ht(t,n,null!=a?33639248:67324752),n+=4,null!=a&&(t[n++]=20,t[n++]=r.os),t[n]=20,n+=2,t[n++]=r.flag<<1|(null==o&&8),t[n++]=i&&8,t[n++]=255&r.compression,t[n++]=r.compression>>8;var l=new Date(null==r.mtime?Date.now():r.mtime),p=l.getFullYear()-1980;if(p<0||p>119)throw"date not in range 1980-2099";if(ht(t,n,2*(p<<24)|l.getMonth()+1<<21|l.getDate()<<16|l.getHours()<<11|l.getMinutes()<<5|l.getSeconds()>>>1),n+=4,null!=o&&(ht(t,n,r.crc),ht(t,n+4,o),ht(t,n+8,r.size)),ht(t,n+12,f),ht(t,n+14,c),n+=16,null!=a&&(ht(t,n,h),ht(t,n+6,r.attrs),ht(t,n+10,a),n+=14),t.set(e,n),n+=f,c)for(var v in u){var d=u[v],g=d.length;ht(t,n,+v),ht(t,n+2,g),t.set(d,n+4),n+=4+g}return h&&(t.set(s,n),n+=h),n},fn=function(t,n,r,e,i){ht(t,n,101010256),ht(t,n+8,r),ht(t,n+10,r),ht(t,n+12,e),ht(t,n+16,i)},un=function(){function t(t){this.filename=t,this.c=Y(),this.size=0,this.compression=0}return t.prototype.process=function(t,n){this.ondata(null,t,n)},t.prototype.push=function(t,n){if(!this.ondata)throw"no callback - add to ZIP archive before pushing";this.c.p(t),this.size+=t.length,n&&(this.crc=this.c.d()),this.process(t,n||!1)},t}();_e.ZipPassThrough=un;var hn=function(){function t(t,n){var r=this;n||(n={}),un.call(this,t),this.d=new yt(n,(function(t,n){r.ondata(null,t,n)})),this.compression=8,this.flag=nn(n.level)}return t.prototype.process=function(t,n){try{this.d.push(t,n)}catch(t){this.ondata(t,null,n)}},t.prototype.push=function(t,n){un.prototype.push.call(this,t,n)},t}();_e.ZipDeflate=hn;var cn=function(){function t(t,n){var r=this;n||(n={}),un.call(this,t),this.d=new mt(n,(function(t,n,e){r.ondata(t,n,e)})),this.compression=8,this.flag=nn(n.level),this.terminate=this.d.terminate}return t.prototype.process=function(t,n){this.d.push(t,n)},t.prototype.push=function(t,n){un.prototype.push.call(this,t,n)},t}();_e.AsyncZipDeflate=cn;var ln=function(){function t(t){this.ondata=t,this.u=[],this.d=1}return t.prototype.add=function(t){var r=this;if(2&this.d)throw"stream finished";var e=$t(t.filename),i=e.length,o=t.comment,a=o&&$t(o),s=i!=t.filename.length||a&&o.length!=a.length,f=i+an(t.extra)+30;if(i>65535)throw"filename too long";var u=new n(f);sn(u,0,t,e,s);var h=[u],c=function(){for(var t=0,n=h;t<n.length;t++)r.ondata(null,n[t],!1);h=[]},l=this.d;this.d=0;var p=this.u.length,v=K(t,{f:e,u:s,o:a,t:function(){t.terminate&&t.terminate()},r:function(){if(c(),l){var t=r.u[p+1];t?t.r():r.d=1}l=1}}),d=0;t.ondata=function(e,i,o){if(e)r.ondata(e,i,o),r.terminate();else if(d+=i.length,h.push(i),o){var a=new n(16);ht(a,0,134695760),ht(a,4,t.crc),ht(a,8,d),ht(a,12,t.size),h.push(a),v.c=d,v.b=f+d+16,v.crc=t.crc,v.size=t.size,l&&v.r(),l=1}else l&&c()},this.u.push(v)},t.prototype.end=function(){var t=this;if(2&this.d){if(1&this.d)throw"stream finishing";throw"stream finished"}this.d?this.e():this.u.push({r:function(){1&t.d&&(t.u.splice(-1,1),t.e())},t:function(){}}),this.d=3},t.prototype.e=function(){for(var t=0,r=0,e=0,i=0,o=this.u;i<o.length;i++)e+=46+(u=o[i]).f.length+an(u.extra)+(u.o?u.o.length:0);for(var a=new n(e+22),s=0,f=this.u;s<f.length;s++){var u;sn(a,t,u=f[s],u.f,u.u,u.c,r,u.o),t+=46+u.f.length+an(u.extra)+(u.o?u.o.length:0),r+=u.b}fn(a,t,this.u.length,e,r),this.ondata(null,a,!0),this.d=2},t.prototype.terminate=function(){for(var t=0,n=this.u;t<n.length;t++)n[t].t();this.d=2},t}();function pn(t,r,e){if(e||(e=r,r={}),"function"!=typeof e)throw"no callback";var i={};Lt(t,"",i,r);var o=Object.keys(i),a=o.length,s=0,f=0,u=a,h=Array(a),c=[],l=function(){for(var t=0;t<c.length;++t)c[t]()},p=function(){var t=new n(f+22),r=s,i=f-s;f=0;for(var o=0;o<u;++o){var a=h[o];try{var c=a.c.length;sn(t,f,a,a.f,a.u,c);var l=30+a.f.length+an(a.extra),p=f+l;t.set(a.c,p),sn(t,s,a,a.f,a.u,c,f,a.m),s+=16+l+(a.m?a.m.length:0),f=p+c}catch(t){return e(t,null)}}fn(t,s,h.length,i,r),e(null,t)};a||p();for(var v=function(t){var n=o[t],r=i[n],u=r[0],v=r[1],d=Y(),g=u.length;d.p(u);var w=$t(n),y=w.length,m=v.comment,b=m&&$t(m),x=b&&b.length,z=an(v.extra),k=0==v.level?0:8,M=function(r,i){if(r)l(),e(r,null);else{var o=i.length;h[t]=K(v,{size:g,crc:d.d(),c:i,f:w,m:b,u:y!=n.length||b&&m.length!=x,compression:k}),s+=30+y+z+o,f+=76+2*(y+z)+(x||0)+o,--a||p()}};if(y>65535&&M("filename too long",null),k)if(g<16e4)try{M(null,xt(u,v))}catch(t){M(t,null)}else c.push(bt(u,v,M));else M(null,u)},d=0;d<u;++d)v(d);return l}function vn(t,r){r||(r={});var e={},i=[];Lt(t,"",e,r);var o=0,a=0;for(var s in e){var f=e[s],u=f[0],h=f[1],c=0==h.level?0:8,l=(M=$t(s)).length,p=h.comment,v=p&&$t(p),d=v&&v.length,g=an(h.extra);if(l>65535)throw"filename too long";var w=c?xt(u,h):u,y=w.length,m=Y();m.p(u),i.push(K(h,{size:u.length,crc:m.d(),c:w,f:M,m:v,u:l!=s.length||v&&p.length!=d,o:o,compression:c})),o+=30+l+g+y,a+=76+2*(l+g)+(d||0)+y}for(var b=new n(a+22),x=o,z=a-o,k=0;k<i.length;++k){var M;sn(b,(M=i[k]).o,M,M.f,M.u,M.c.length);var A=30+M.f.length+an(M.extra);b.set(M.c,M.o+A),sn(b,o,M,M.f,M.u,M.c.length,M.o,M.m),o+=16+A+(M.m?M.m.length:0)}return fn(b,o,i.length,z,x),b}_e.Zip=ln,_e.zip=pn,_e.zipSync=vn;var dn=function(){function t(){}return t.prototype.push=function(t,n){this.ondata(null,t,n)},t.compression=0,t}();_e.UnzipPassThrough=dn;var gn=function(){function t(){var t=this;this.i=new zt((function(n,r){t.ondata(null,n,r)}))}return t.prototype.push=function(t,n){try{this.i.push(t,n)}catch(r){this.ondata(r,t,n)}},t.compression=8,t}();_e.UnzipInflate=gn;var wn=function(){function t(t,n){var r=this;n<32e4?this.i=new zt((function(t,n){r.ondata(null,t,n)})):(this.i=new kt((function(t,n,e){r.ondata(t,n,e)})),this.terminate=this.i.terminate)}return t.prototype.push=function(t,n){this.i.terminate&&(t=C(t,0)),this.i.push(t,n)},t.compression=8,t}();_e.AsyncUnzipInflate=wn;var yn=function(){function t(t){this.onfile=t,this.k=[],this.o={0:dn},this.p=_}return t.prototype.push=function(t,r){var e=this;if(!this.onfile)throw"no callback";if(this.c>0){var i=Math.min(this.c,t.length),o=t.subarray(0,i);if(this.c-=i,this.d?this.d.push(o,!this.c):this.k[0].push(o),(t=t.subarray(i)).length)return this.push(t,r)}else{var a=0,s=0,f=void 0,u=void 0;this.p.length?t.length?((u=new n(this.p.length+t.length)).set(this.p),u.set(t,this.p.length)):u=this.p:u=t;for(var h=u.length,c=this.c,l=c&&this.d,p=function(){var t,n=ft(u,s);if(67324752==n){a=1,f=s,v.d=null,v.c=0;var r=st(u,s+6),i=st(u,s+8),o=2048&r,l=8&r,p=st(u,s+26),d=st(u,s+28);if(h>s+30+p+d){var g=[];v.k.unshift(g),a=2;var w=ft(u,s+18),y=ft(u,s+22),m=tn(u.subarray(s+30,s+=30+p),!o);4294967295==w?(t=l?[-2]:on(u,s),w=t[0],y=t[1]):l&&(w=-1),s+=d,v.c=w;var b={name:m,compression:i,start:function(){if(!b.ondata)throw"no callback";if(w){var t=e.o[i];if(!t)throw"unknown compression type "+i;var n=w<0?new t(m):new t(m,w,y);n.ondata=function(t,n,r){b.ondata(t,n,r)};for(var r=0,o=g;r<o.length;r++)n.push(o[r],!1);e.k[0]==g?e.d=n:n.push(_,!0)}else b.ondata(null,_,!0)},terminate:function(){e.k[0]==g&&e.d.terminate&&e.d.terminate()}};w>=0&&(b.size=w,b.originalSize=y),v.onfile(b)}return"break"}if(c){if(134695760==n)return f=s+=12+(-2==c&&8),a=2,v.c=0,"break";if(33639248==n)return f=s-=4,a=2,v.c=0,"break"}},v=this;s<h-4&&"break"!==p();++s);if(this.p=_,c<0){var d=u.subarray(0,a?f-12-(-2==c&&8)-(134695760==ft(u,f-16)&&4):s);l?l.push(d,!!a):this.k[+(2==a)].push(d)}if(2&a)return this.push(u.subarray(s),r);this.p=u.subarray(s)}if(r&&this.c)throw"invalid zip file"},t.prototype.register=function(t){this.o[t.compression]=t},t}();function mn(t,r){if("function"!=typeof r)throw"no callback";for(var e=[],i=function(){for(var t=0;t<e.length;++t)e[t]()},o={},a=t.length-22;101010256!=ft(t,a);--a)if(!a||t.length-a>65558)return void r("invalid zip file",null);var s=st(t,a+8);s||r(null,{});var f=s,u=ft(t,a+16),h=4294967295==u;if(h){if(a=ft(t,a-12),101075792!=ft(t,a))return void r("invalid zip file",null);f=s=ft(t,a+32),u=ft(t,a+48)}for(var c=function(a){var f=en(t,u,h),c=f[0],l=f[1],p=f[2],v=f[3],d=f[4],g=rn(t,f[5]);u=d;var w=function(t,n){t?(i(),r(t,null)):(o[v]=n,--s||r(null,o))};if(c)if(8==c){var y=t.subarray(g,g+l);if(l<32e4)try{w(null,At(y,new n(p)))}catch(t){w(t,null)}else e.push(Mt(y,{size:p},w))}else w("unknown compression type "+c,null);else w(null,C(t,g,g+l))},l=0;l<f;++l)c();return i}function bn(t){for(var r={},e=t.length-22;101010256!=ft(t,e);--e)if(!e||t.length-e>65558)throw"invalid zip file";var i=st(t,e+8);if(!i)return{};var o=ft(t,e+16),a=4294967295==o;if(a){if(e=ft(t,e-12),101075792!=ft(t,e))throw"invalid zip file";i=ft(t,e+32),o=ft(t,e+48)}for(var s=0;s<i;++s){var f=en(t,o,a),u=f[0],h=f[1],c=f[2],l=f[3],p=f[4],v=rn(t,f[5]);if(o=p,u){if(8!=u)throw"unknown compression type "+u;r[l]=At(t.subarray(v,v+h),new n(c))}else r[l]=C(t,v,v+h)}return r}_e.Unzip=yn,_e.unzip=mn,_e.unzipSync=bn;return _e})

}).call(this)}).call(this,require("timers").setImmediate)
},{"timers":3}],13:[function(require,module,exports){
/**
 * @author jscastro / https://github.com/jscastro76
 */
const utils = require("../utils/utils.js");
const Objects = require('./objects.js');
const CSS2D = require('./CSS2DRenderer.js');

function Label(obj) {

	obj = utils._validate(obj, Objects.prototype._defaults.label);

	let div = Objects.prototype.drawLabelHTML(obj.htmlElement, obj.cssClass);

	let label = new CSS2D.CSS2DObject(div);
	label.name = "label";
	label.visible = obj.alwaysVisible;
	label.alwaysVisible = obj.alwaysVisible;
	var userScaleGroup = Objects.prototype._makeGroup(label, obj);
	Objects.prototype._addMethods(userScaleGroup);
	userScaleGroup.visibility = obj.alwaysVisible;

	return userScaleGroup;
}


module.exports = exports = Label;
},{"../utils/utils.js":29,"./CSS2DRenderer.js":7,"./objects.js":21}],14:[function(require,module,exports){
const THREE = require("../three.js");
const utils = require("../utils/utils.js");
const Objects = require('./objects.js');

function line(obj){

	obj = utils._validate(obj, Objects.prototype._defaults.line);

	// Geometry
    var straightProject = utils.lnglatsToWorld(obj.geometry);
	var normalized = utils.normalizeVertices(straightProject);
    var flattenedArray = utils.flattenVectors(normalized.vertices);
	//console.log('line', normalized.vertices)

	var geometry = new THREE.LineGeometry();
	geometry.setPositions( flattenedArray );

	// Material
	let matLine = new THREE.LineMaterial( {
		color: obj.color,
		linewidth: obj.width, // in pixels
		dashed: false,
		opacity: obj.opacity
	} );
	
	matLine.resolution.set( window.innerWidth, window.innerHeight );
	matLine.isMaterial = true;
	matLine.transparent = true;
	matLine.depthWrite = false;

	// Mesh
	line = new THREE.Line2( geometry, matLine );
	line.position.copy(normalized.position)
	line.computeLineDistances();

	return line
}

module.exports = exports = line;

/**
 * custom line shader by WestLangley, sourced from https://github.com/mrdoob/three.js/tree/master/examples/js/lines
 *
 */

THREE.LineSegmentsGeometry = function () {

	THREE.InstancedBufferGeometry.call(this);

	this.type = 'LineSegmentsGeometry';

	var positions = [- 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0];
	var uvs = [- 1, 2, 1, 2, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 2, 1, - 2];
	var index = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];

	this.setIndex(index);
	this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

};

THREE.LineSegmentsGeometry.prototype = Object.assign(Object.create(THREE.InstancedBufferGeometry.prototype), {

	constructor: THREE.LineSegmentsGeometry,

	isLineSegmentsGeometry: true,

	applyMatrix4: function (matrix) {

		var start = this.attributes.instanceStart;
		var end = this.attributes.instanceEnd;

		if (start !== undefined) {

			start.applyMatrix4(matrix);

			end.applyMatrix4(matrix);

			start.needsUpdate = true;

		}

		if (this.boundingBox !== null) {

			this.computeBoundingBox();

		}

		if (this.boundingSphere !== null) {

			this.computeBoundingSphere();

		}

		return this;

	},

	setPositions: function (array) {

		var lineSegments;

		if (array instanceof Float32Array) {

			lineSegments = array;

		} else if (Array.isArray(array)) {

			lineSegments = new Float32Array(array);

		}

		var instanceBuffer = new THREE.InstancedInterleavedBuffer(lineSegments, 6, 1); // xyz, xyz

		this.setAttribute('instanceStart', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 0)); // xyz
		this.setAttribute('instanceEnd', new THREE.InterleavedBufferAttribute(instanceBuffer, 3, 3)); // xyz

		//

		this.computeBoundingBox();
		this.computeBoundingSphere();

		return this;

	},

	setColors: function (array) {

		var colors;

		if (array instanceof Float32Array) {

			colors = array;

		} else if (Array.isArray(array)) {

			colors = new Float32Array(array);

		}

		var instanceColorBuffer = new THREE.InstancedInterleavedBuffer(colors, 6, 1); // rgb, rgb

		this.setAttribute('instanceColorStart', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 0)); // rgb
		this.setAttribute('instanceColorEnd', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 3, 3)); // rgb

		return this;

	},

	fromWireframeGeometry: function (geometry) {

		this.setPositions(geometry.attributes.position.array);

		return this;

	},

	fromEdgesGeometry: function (geometry) {

		this.setPositions(geometry.attributes.position.array);

		return this;

	},

	fromMesh: function (mesh) {

		this.fromWireframeGeometry(new THREE.WireframeGeometry(mesh.geometry));

		// set colors, maybe

		return this;

	},

	fromLineSegments: function (lineSegments) {

		var geometry = lineSegments.geometry;

		if (geometry.isGeometry) {

			console.error('THREE.LineSegmentsGeometry no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.');
			return;

		} else if (geometry.isBufferGeometry) {

			this.setPositions(geometry.attributes.position.array); // assumes non-indexed

		}

		// set colors, maybe

		return this;

	},

	computeBoundingBox: function () {

		var box = new THREE.Box3();

		return function computeBoundingBox() {

			if (this.boundingBox === null) {

				this.boundingBox = new THREE.Box3();

			}

			var start = this.attributes.instanceStart;
			var end = this.attributes.instanceEnd;

			if (start !== undefined && end !== undefined) {

				this.boundingBox.setFromBufferAttribute(start);

				box.setFromBufferAttribute(end);

				this.boundingBox.union(box);

			}

		};

	}(),

	computeBoundingSphere: function () {

		var vector = new THREE.Vector3();

		return function computeBoundingSphere() {

			if (this.boundingSphere === null) {

				this.boundingSphere = new THREE.Sphere();

			}

			if (this.boundingBox === null) {

				this.computeBoundingBox();

			}

			var start = this.attributes.instanceStart;
			var end = this.attributes.instanceEnd;

			if (start !== undefined && end !== undefined) {

				var center = this.boundingSphere.center;

				this.boundingBox.getCenter(center);

				var maxRadiusSq = 0;

				for (var i = 0, il = start.count; i < il; i++) {

					vector.fromBufferAttribute(start, i);
					maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));

					vector.fromBufferAttribute(end, i);
					maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));

				}

				this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

				if (isNaN(this.boundingSphere.radius)) {

					console.error('THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.', this);

				}

			}

		};

	}(),

	toJSON: function () {

		// todo

	},

	applyMatrix: function (matrix) {

		console.warn('THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().');

		return this.applyMatrix4(matrix);

	}

});

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.LineGeometry = function () {

	THREE.LineSegmentsGeometry.call(this);

	this.type = 'LineGeometry';

};

THREE.LineGeometry.prototype = Object.assign(Object.create(THREE.LineSegmentsGeometry.prototype), {

	constructor: THREE.LineGeometry,

	isLineGeometry: true,

	setPositions: function (array) {

		// converts [ x1, y1, z1,  x2, y2, z2, ... ] to pairs format

		var length = array.length - 3;
		var points = new Float32Array(2 * length);

		for (var i = 0; i < length; i += 3) {

			points[2 * i] = array[i];
			points[2 * i + 1] = array[i + 1];
			points[2 * i + 2] = array[i + 2];

			points[2 * i + 3] = array[i + 3];
			points[2 * i + 4] = array[i + 4];
			points[2 * i + 5] = array[i + 5];

		}

		THREE.LineSegmentsGeometry.prototype.setPositions.call(this, points);

		return this;

	},

	setColors: function (array) {

		// converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format

		var length = array.length - 3;
		var colors = new Float32Array(2 * length);

		for (var i = 0; i < length; i += 3) {

			colors[2 * i] = array[i];
			colors[2 * i + 1] = array[i + 1];
			colors[2 * i + 2] = array[i + 2];

			colors[2 * i + 3] = array[i + 3];
			colors[2 * i + 4] = array[i + 4];
			colors[2 * i + 5] = array[i + 5];

		}

		THREE.LineSegmentsGeometry.prototype.setColors.call(this, colors);

		return this;

	},

	fromLine: function (line) {

		var geometry = line.geometry;

		if (geometry.isGeometry) {

			console.error('THREE.LineGeometry no longer supports THREE.Geometry. Use THREE.BufferGeometry instead.');
			return;

		} else if (geometry.isBufferGeometry) {

			this.setPositions(geometry.attributes.position.array); // assumes non-indexed

		}

		// set colors, maybe

		return this;

	},

	copy: function ( /* source */) {

		// todo

		return this;

	}

});

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.WireframeGeometry2 = function (geometry) {

	THREE.LineSegmentsGeometry.call(this);

	this.type = 'WireframeGeometry2';

	this.fromWireframeGeometry(new THREE.WireframeGeometry(geometry));

	// set colors, maybe

};

THREE.WireframeGeometry2.prototype = Object.assign(Object.create(THREE.LineSegmentsGeometry.prototype), {

	constructor: THREE.WireframeGeometry2,

	isWireframeGeometry2: true

});

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

/**
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  dashOffset: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

THREE.UniformsLib.line = {

	linewidth: { value: 1 },
	resolution: { value: new THREE.Vector2(1, 1) },
	dashScale: { value: 1 },
	dashSize: { value: 1 },
	dashOffset: { value: 0 },
	gapSize: { value: 1 }, // todo FIX - maybe change to totalSize
	opacity: { value: 1 }

};

THREE.ShaderLib['line'] = {

	uniforms: THREE.UniformsUtils.merge([
		THREE.UniformsLib.common,
		THREE.UniformsLib.fog,
		THREE.UniformsLib.line
	]),

	vertexShader:
		`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

	fragmentShader:
		`
		uniform vec3 diffuse;
		uniform float opacity;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float dashOffset;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			if ( abs( vUv.y ) > 1.0 ) {

				float a = vUv.x;
				float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				float len2 = a * a + b * b;

				if ( len2 > 1.0 ) discard;

			}

			vec4 diffuseColor = vec4( diffuse, opacity );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );

			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`
};

THREE.LineMaterial = function (parameters) {

	THREE.ShaderMaterial.call(this, {

		type: 'LineMaterial',

		uniforms: THREE.UniformsUtils.clone(THREE.ShaderLib['line'].uniforms),

		vertexShader: THREE.ShaderLib['line'].vertexShader,
		fragmentShader: THREE.ShaderLib['line'].fragmentShader,

		clipping: true // required for clipping support

	});

	this.dashed = false;

	Object.defineProperties(this, {

		color: {

			enumerable: true,

			get: function () {

				return this.uniforms.diffuse.value;

			},

			set: function (value) {

				this.uniforms.diffuse.value = value;

			}

		},

		linewidth: {

			enumerable: true,

			get: function () {

				return this.uniforms.linewidth.value;

			},

			set: function (value) {

				this.uniforms.linewidth.value = value;

			}

		},

		dashScale: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashScale.value;

			},

			set: function (value) {

				this.uniforms.dashScale.value = value;

			}

		},

		dashSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashSize.value;

			},

			set: function (value) {

				this.uniforms.dashSize.value = value;

			}

		},

		dashOffset: {

			enumerable: true,

			get: function () {

				return this.uniforms.dashOffset.value;

			},

			set: function (value) {

				this.uniforms.dashOffset.value = value;

			}

		},

		gapSize: {

			enumerable: true,

			get: function () {

				return this.uniforms.gapSize.value;

			},

			set: function (value) {

				this.uniforms.gapSize.value = value;

			}

		},

		opacity: {

			enumerable: true,

			get: function () {

				return this.uniforms.opacity.value;

			},

			set: function (value) {

				this.uniforms.opacity.value = value;

			}

		},

		resolution: {

			enumerable: true,

			get: function () {

				return this.uniforms.resolution.value;

			},

			set: function (value) {

				this.uniforms.resolution.value.copy(value);

			}

		}

	});

	this.setValues(parameters);

};

THREE.LineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
THREE.LineMaterial.prototype.constructor = THREE.LineMaterial;

THREE.LineMaterial.prototype.isLineMaterial = true;

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.LineSegments2 = function (geometry, material) {

	if (geometry === undefined) geometry = new THREE.LineSegmentsGeometry();
	if (material === undefined) material = new THREE.LineMaterial({ color: Math.random() * 0xffffff });

	THREE.Mesh.call(this, geometry, material);

	this.type = 'LineSegments2';

};

THREE.LineSegments2.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {

	constructor: THREE.LineSegments2,

	isLineSegments2: true,

	computeLineDistances: (function () { // for backwards-compatability, but could be a method of LineSegmentsGeometry...

		var start = new THREE.Vector3();
		var end = new THREE.Vector3();

		return function computeLineDistances() {

			var geometry = this.geometry;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;
			var lineDistances = new Float32Array(2 * instanceStart.data.count);

			for (var i = 0, j = 0, l = instanceStart.data.count; i < l; i++, j += 2) {

				start.fromBufferAttribute(instanceStart, i);
				end.fromBufferAttribute(instanceEnd, i);

				lineDistances[j] = (j === 0) ? 0 : lineDistances[j - 1];
				lineDistances[j + 1] = lineDistances[j] + start.distanceTo(end);

			}

			var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1); // d0, d1

			geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)); // d0
			geometry.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)); // d1

			return this;

		};

	}()),

	raycast: (function () {

		var start = new THREE.Vector4();
		var end = new THREE.Vector4();

		var ssOrigin = new THREE.Vector4();
		var ssOrigin3 = new THREE.Vector3();
		var mvMatrix = new THREE.Matrix4();
		var line = new THREE.Line3();
		var closestPoint = new THREE.Vector3();

		return function raycast(raycaster, intersects) {

			if (raycaster.camera === null) {

				console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2.');

			}

			var threshold = (raycaster.params.Line2 !== undefined) ? raycaster.params.Line2.threshold || 0 : 0;

			var ray = raycaster.ray;
			var camera = raycaster.camera;
			var projectionMatrix = camera.projectionMatrix;

			var geometry = this.geometry;
			var material = this.material;
			var resolution = material.resolution;
			var lineWidth = material.linewidth + threshold;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;

			// camera forward is negative
			var near = - camera.near;

			// pick a point 1 unit out along the ray to avoid the ray origin
			// sitting at the camera origin which will cause "w" to be 0 when
			// applying the projection matrix.
			ray.at(1, ssOrigin);

			// ndc space [ - 1.0, 1.0 ]
			ssOrigin.w = 1;
			ssOrigin.applyMatrix4(camera.matrixWorldInverse);
			ssOrigin.applyMatrix4(projectionMatrix);
			ssOrigin.multiplyScalar(1 / ssOrigin.w);

			// screen space
			ssOrigin.x *= resolution.x / 2;
			ssOrigin.y *= resolution.y / 2;
			ssOrigin.z = 0;

			ssOrigin3.copy(ssOrigin);

			var matrixWorld = this.matrixWorld;
			mvMatrix.multiplyMatrices(camera.matrixWorldInverse, matrixWorld);

			for (var i = 0, l = instanceStart.count; i < l; i++) {

				start.fromBufferAttribute(instanceStart, i);
				end.fromBufferAttribute(instanceEnd, i);

				start.w = 1;
				end.w = 1;

				// camera space
				start.applyMatrix4(mvMatrix);
				end.applyMatrix4(mvMatrix);

				// skip the segment if it's entirely behind the camera
				var isBehindCameraNear = start.z > near && end.z > near;
				if (isBehindCameraNear) {

					continue;

				}

				// trim the segment if it extends behind camera near
				if (start.z > near) {

					const deltaDist = start.z - end.z;
					const t = (start.z - near) / deltaDist;
					start.lerp(end, t);

				} else if (end.z > near) {

					const deltaDist = end.z - start.z;
					const t = (end.z - near) / deltaDist;
					end.lerp(start, t);

				}

				// clip space
				start.applyMatrix4(projectionMatrix);
				end.applyMatrix4(projectionMatrix);

				// ndc space [ - 1.0, 1.0 ]
				start.multiplyScalar(1 / start.w);
				end.multiplyScalar(1 / end.w);

				// screen space
				start.x *= resolution.x / 2;
				start.y *= resolution.y / 2;

				end.x *= resolution.x / 2;
				end.y *= resolution.y / 2;

				// create 2d segment
				line.start.copy(start);
				line.start.z = 0;

				line.end.copy(end);
				line.end.z = 0;

				// get closest point on ray to segment
				var param = line.closestPointToPointParameter(ssOrigin3, true);
				line.at(param, closestPoint);

				// check if the intersection point is within clip space
				var zPos = THREE.MathUtils.lerp(start.z, end.z, param);
				var isInClipSpace = zPos >= - 1 && zPos <= 1;

				var isInside = ssOrigin3.distanceTo(closestPoint) < lineWidth * 0.5;

				if (isInClipSpace && isInside) {

					line.start.fromBufferAttribute(instanceStart, i);
					line.end.fromBufferAttribute(instanceEnd, i);

					line.start.applyMatrix4(matrixWorld);
					line.end.applyMatrix4(matrixWorld);

					var pointOnLine = new THREE.Vector3();
					var point = new THREE.Vector3();

					ray.distanceSqToSegment(line.start, line.end, point, pointOnLine);

					intersects.push({

						point: point,
						pointOnLine: pointOnLine,
						distance: ray.origin.distanceTo(point),

						object: this,
						face: null,
						faceIndex: i,
						uv: null,
						uv2: null,

					});

				}

			}

		};

	}())

});

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.Line2 = function (geometry, material) {

	if (geometry === undefined) geometry = new THREE.LineGeometry();
	if (material === undefined) material = new THREE.LineMaterial({ color: Math.random() * 0xffffff });

	THREE.LineSegments2.call(this, geometry, material);

	this.type = 'Line2';

};

THREE.Line2.prototype = Object.assign(Object.create(THREE.LineSegments2.prototype), {

	constructor: THREE.Line2,

	isLine2: true

});

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */

THREE.Wireframe = function (geometry, material) {

	THREE.Mesh.call(this);

	this.type = 'Wireframe';

	this.geometry = geometry !== undefined ? geometry : new THREE.LineSegmentsGeometry();
	this.material = material !== undefined ? material : new THREE.LineMaterial({ color: Math.random() * 0xffffff });

};

THREE.Wireframe.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {

	constructor: THREE.Wireframe,

	isWireframe: true,

	computeLineDistances: (function () { // for backwards-compatability, but could be a method of LineSegmentsGeometry...

		var start = new THREE.Vector3();
		var end = new THREE.Vector3();

		return function computeLineDistances() {

			var geometry = this.geometry;

			var instanceStart = geometry.attributes.instanceStart;
			var instanceEnd = geometry.attributes.instanceEnd;
			var lineDistances = new Float32Array(2 * instanceStart.data.count);

			for (var i = 0, j = 0, l = instanceStart.data.count; i < l; i++, j += 2) {

				start.fromBufferAttribute(instanceStart, i);
				end.fromBufferAttribute(instanceEnd, i);

				lineDistances[j] = (j === 0) ? 0 : lineDistances[j - 1];
				lineDistances[j + 1] = lineDistances[j] + start.distanceTo(end);

			}

			var instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer(lineDistances, 2, 1); // d0, d1

			geometry.setAttribute('instanceDistanceStart', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 0)); // d0
			geometry.setAttribute('instanceDistanceEnd', new THREE.InterleavedBufferAttribute(instanceDistanceBuffer, 1, 1)); // d1

			return this;

		};

	}())

});

},{"../three.js":25,"../utils/utils.js":29,"./objects.js":21}],15:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
 */
const utils = require("../utils/utils.js");
const Objects = require('./objects.js');
const OBJLoader = require("./loaders/OBJLoader.js");
const MTLLoader = require("./loaders/MTLLoader.js");
const FBXLoader = require("./loaders/FBXLoader.js");
const GLTFLoader = require("./loaders/GLTFLoader.js");
const ColladaLoader = require("./loaders/ColladaLoader.js");
const objLoader = new OBJLoader();
const materialLoader = new MTLLoader();
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();
const daeLoader = new ColladaLoader();

function loadObj(options, cb, promise) {

	if (options === undefined) return console.error("Invalid options provided to loadObj()");
	options = utils._validate(options, Objects.prototype._defaults.loadObj);

	let loader;
	if (!options.type) { options.type = 'mtl'; };
	//[jscastro] support other models
	switch (options.type) {
		case "mtl":
			// TODO: Support formats other than OBJ/MTL
			loader = objLoader;
			break;
		case "gltf":
		case "glb":
			// [jscastro] Support for GLTF/GLB
			loader = gltfLoader;
			break;
		case "fbx":
			loader = fbxLoader;
			break;
		case "dae":
			loader = daeLoader;
			break;
	}

	materialLoader.load(options.mtl, loadObject, () => (null), error => {
		console.warn("No material file found " + error.stack);
	});

	function loadObject(materials) {

		if (materials && options.type == "mtl") {
			materials.preload();
			loader.setMaterials(materials);
		}

		loader.load(options.obj, obj => {

			//[jscastro] MTL/GLTF/FBX models have a different structure
			let animations = [];
			switch (options.type) {
				case "mtl":
					obj = obj.children[0];
					break;
				case "gltf":
				case "glb":
				case "dae":
					animations = obj.animations;
					obj = obj.scene;
					break;
				case "fbx":
					animations = obj.animations;
					break;
			}
			obj.animations = animations;
			// [jscastro] options.rotation was wrongly used
			const r = utils.types.rotation(options.rotation, [0, 0, 0]);
			const s = utils.types.scale(options.scale, [1, 1, 1]);
			obj.rotation.set(r[0], r[1], r[2]);
			obj.scale.set(s[0], s[1], s[2]);
			// [jscastro] normalize specular/metalness/shininess from meshes in FBX and GLB model as it would need 5 lights to illuminate them properly
			if (options.normalize) { normalizeSpecular(obj); }
			obj.name = "model";
			let userScaleGroup = Objects.prototype._makeGroup(obj, options);
			Objects.prototype._addMethods(userScaleGroup);
			//[jscastro] calculate automatically the pivotal center of the object
			userScaleGroup.setAnchor(options.anchor);
			//[jscastro] override the center calculated if the object has adjustments
			userScaleGroup.setCenter(options.adjustment);
			//[jscastro] if the object is excluded from raycasting
			userScaleGroup.raycasted = options.raycasted;
			//[jscastro] return to cache
			promise(userScaleGroup);
			//[jscastro] then return to the client-side callback
			cb(userScaleGroup);
			//[jscastro] apply the fixed zoom scale if needed
			userScaleGroup.setFixedZoom(options.mapScale);
			//[jscastro] initialize the default animation to avoid issues with skeleton position
			userScaleGroup.idle();

		}, () => (null), error => {
				console.error("Could not load model file: " + options.obj + " \n " + error.stack);
				promise("Error loading the model");
		});

	};

	//[jscastro] some FBX/GLTF models have too much specular effects for mapbox
	function normalizeSpecular(model) {
		model.traverse(function (c) {

			if (c.isMesh) {
				//c.castShadow = true;
				let specularColor;
				if (c.material.type == 'MeshStandardMaterial') {

					if (c.material.metalness) { c.material.metalness *= 0.1; }
					if (c.material.glossiness) { c.material.glossiness *= 0.25; }
					specularColor = new THREE.Color(12, 12, 12);

				} else if (c.material.type == 'MeshPhongMaterial') {
					c.material.shininess = 0.1;
					specularColor = new THREE.Color(20, 20, 20);
				}
				if (c.material.specular && c.material.specular.isColor) {
					c.material.specular = specularColor;
				}
				//c.material.needsUpdate = true;

			}

		});
	}

}

module.exports = exports = loadObj;
},{"../utils/utils.js":29,"./loaders/ColladaLoader.js":16,"./loaders/FBXLoader.js":17,"./loaders/GLTFLoader.js":18,"./loaders/MTLLoader.js":19,"./loaders/OBJLoader.js":20,"./objects.js":21}],16:[function(require,module,exports){
const THREE = require('../../three.js');

/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.ColladaLoader = function (manager) {

	THREE.Loader.call(this, manager);

};

THREE.ColladaLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {

	constructor: THREE.ColladaLoader,

	load: function (url, onLoad, onProgress, onError) {

		var scope = this;

		var path = (scope.path === '') ? THREE.LoaderUtils.extractUrlBase(url) : scope.path;

		var loader = new THREE.FileLoader(scope.manager);
		loader.setPath(scope.path);
		loader.setRequestHeader(scope.requestHeader);
		loader.setWithCredentials(scope.withCredentials);
		loader.load(url, function (text) {

			try {

				onLoad(scope.parse(text, path));

			} catch (e) {

				if (onError) {

					onError(e);

				} else {

					console.error(e);

				}

				scope.manager.itemError(url);

			}

		}, onProgress, onError);

	},

	options: {

		set convertUpAxis(value) {

			console.warn('THREE.ColladaLoader: options.convertUpAxis() has been removed. Up axis is converted automatically.');

		}

	},

	parse: function (text, path) {

		function getElementsByTagName(xml, name) {

			// Non recursive xml.getElementsByTagName() ...

			var array = [];
			var childNodes = xml.childNodes;

			for (var i = 0, l = childNodes.length; i < l; i++) {

				var child = childNodes[i];

				if (child.nodeName === name) {

					array.push(child);

				}

			}

			return array;

		}

		function parseStrings(text) {

			if (text.length === 0) return [];

			var parts = text.trim().split(/\s+/);
			var array = new Array(parts.length);

			for (var i = 0, l = parts.length; i < l; i++) {

				array[i] = parts[i];

			}

			return array;

		}

		function parseFloats(text) {

			if (text.length === 0) return [];

			var parts = text.trim().split(/\s+/);
			var array = new Array(parts.length);

			for (var i = 0, l = parts.length; i < l; i++) {

				array[i] = parseFloat(parts[i]);

			}

			return array;

		}

		function parseInts(text) {

			if (text.length === 0) return [];

			var parts = text.trim().split(/\s+/);
			var array = new Array(parts.length);

			for (var i = 0, l = parts.length; i < l; i++) {

				array[i] = parseInt(parts[i]);

			}

			return array;

		}

		function parseId(text) {

			return text.substring(1);

		}

		function generateId() {

			return 'three_default_' + (count++);

		}

		function isEmpty(object) {

			return Object.keys(object).length === 0;

		}

		// asset

		function parseAsset(xml) {

			return {
				unit: parseAssetUnit(getElementsByTagName(xml, 'unit')[0]),
				upAxis: parseAssetUpAxis(getElementsByTagName(xml, 'up_axis')[0])
			};

		}

		function parseAssetUnit(xml) {

			if ((xml !== undefined) && (xml.hasAttribute('meter') === true)) {

				return parseFloat(xml.getAttribute('meter'));

			} else {

				return 1; // default 1 meter

			}

		}

		function parseAssetUpAxis(xml) {

			return xml !== undefined ? xml.textContent : 'Y_UP';

		}

		// library

		function parseLibrary(xml, libraryName, nodeName, parser) {

			var library = getElementsByTagName(xml, libraryName)[0];

			if (library !== undefined) {

				var elements = getElementsByTagName(library, nodeName);

				for (var i = 0; i < elements.length; i++) {

					parser(elements[i]);

				}

			}

		}

		function buildLibrary(data, builder) {

			for (var name in data) {

				var object = data[name];
				object.build = builder(data[name]);

			}

		}

		// get

		function getBuild(data, builder) {

			if (data.build !== undefined) return data.build;

			data.build = builder(data);

			return data.build;

		}

		// animation

		function parseAnimation(xml) {

			var data = {
				sources: {},
				samplers: {},
				channels: {}
			};

			var hasChildren = false;

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				var id;

				switch (child.nodeName) {

					case 'source':
						id = child.getAttribute('id');
						data.sources[id] = parseSource(child);
						break;

					case 'sampler':
						id = child.getAttribute('id');
						data.samplers[id] = parseAnimationSampler(child);
						break;

					case 'channel':
						id = child.getAttribute('target');
						data.channels[id] = parseAnimationChannel(child);
						break;

					case 'animation':
						// hierarchy of related animations
						parseAnimation(child);
						hasChildren = true;
						break;

					default:
						console.log(child);

				}

			}

			if (hasChildren === false) {

				// since 'id' attributes can be optional, it's necessary to generate a UUID for unqiue assignment

				library.animations[xml.getAttribute('id') || THREE.MathUtils.generateUUID()] = data;

			}

		}

		function parseAnimationSampler(xml) {

			var data = {
				inputs: {},
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'input':
						var id = parseId(child.getAttribute('source'));
						var semantic = child.getAttribute('semantic');
						data.inputs[semantic] = id;
						break;

				}

			}

			return data;

		}

		function parseAnimationChannel(xml) {

			var data = {};

			var target = xml.getAttribute('target');

			// parsing SID Addressing Syntax

			var parts = target.split('/');

			var id = parts.shift();
			var sid = parts.shift();

			// check selection syntax

			var arraySyntax = (sid.indexOf('(') !== - 1);
			var memberSyntax = (sid.indexOf('.') !== - 1);

			if (memberSyntax) {

				//  member selection access

				parts = sid.split('.');
				sid = parts.shift();
				data.member = parts.shift();

			} else if (arraySyntax) {

				// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

				var indices = sid.split('(');
				sid = indices.shift();

				for (var i = 0; i < indices.length; i++) {

					indices[i] = parseInt(indices[i].replace(/\)/, ''));

				}

				data.indices = indices;

			}

			data.id = id;
			data.sid = sid;

			data.arraySyntax = arraySyntax;
			data.memberSyntax = memberSyntax;

			data.sampler = parseId(xml.getAttribute('source'));

			return data;

		}

		function buildAnimation(data) {

			var tracks = [];

			var channels = data.channels;
			var samplers = data.samplers;
			var sources = data.sources;

			for (var target in channels) {

				if (channels.hasOwnProperty(target)) {

					var channel = channels[target];
					var sampler = samplers[channel.sampler];

					var inputId = sampler.inputs.INPUT;
					var outputId = sampler.inputs.OUTPUT;

					var inputSource = sources[inputId];
					var outputSource = sources[outputId];

					var animation = buildAnimationChannel(channel, inputSource, outputSource);

					createKeyframeTracks(animation, tracks);

				}

			}

			return tracks;

		}

		function getAnimation(id) {

			return getBuild(library.animations[id], buildAnimation);

		}

		function buildAnimationChannel(channel, inputSource, outputSource) {

			var node = library.nodes[channel.id];
			var object3D = getNode(node.id);

			var transform = node.transforms[channel.sid];
			var defaultMatrix = node.matrix.clone().transpose();

			var time, stride;
			var i, il, j, jl;

			var data = {};

			// the collada spec allows the animation of data in various ways.
			// depending on the transform type (matrix, translate, rotate, scale), we execute different logic

			switch (transform) {

				case 'matrix':

					for (i = 0, il = inputSource.array.length; i < il; i++) {

						time = inputSource.array[i];
						stride = i * outputSource.stride;

						if (data[time] === undefined) data[time] = {};

						if (channel.arraySyntax === true) {

							var value = outputSource.array[stride];
							var index = channel.indices[0] + 4 * channel.indices[1];

							data[time][index] = value;

						} else {

							for (j = 0, jl = outputSource.stride; j < jl; j++) {

								data[time][j] = outputSource.array[stride + j];

							}

						}

					}

					break;

				case 'translate':
					console.warn('THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform);
					break;

				case 'rotate':
					console.warn('THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform);
					break;

				case 'scale':
					console.warn('THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform);
					break;

			}

			var keyframes = prepareAnimationData(data, defaultMatrix);

			var animation = {
				name: object3D.uuid,
				keyframes: keyframes
			};

			return animation;

		}

		function prepareAnimationData(data, defaultMatrix) {

			var keyframes = [];

			// transfer data into a sortable array

			for (var time in data) {

				keyframes.push({ time: parseFloat(time), value: data[time] });

			}

			// ensure keyframes are sorted by time

			keyframes.sort(ascending);

			// now we clean up all animation data, so we can use them for keyframe tracks

			for (var i = 0; i < 16; i++) {

				transformAnimationData(keyframes, i, defaultMatrix.elements[i]);

			}

			return keyframes;

			// array sort function

			function ascending(a, b) {

				return a.time - b.time;

			}

		}

		var position = new THREE.Vector3();
		var scale = new THREE.Vector3();
		var quaternion = new THREE.Quaternion();

		function createKeyframeTracks(animation, tracks) {

			var keyframes = animation.keyframes;
			var name = animation.name;

			var times = [];
			var positionData = [];
			var quaternionData = [];
			var scaleData = [];

			for (var i = 0, l = keyframes.length; i < l; i++) {

				var keyframe = keyframes[i];

				var time = keyframe.time;
				var value = keyframe.value;

				matrix.fromArray(value).transpose();
				matrix.decompose(position, quaternion, scale);

				times.push(time);
				positionData.push(position.x, position.y, position.z);
				quaternionData.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
				scaleData.push(scale.x, scale.y, scale.z);

			}

			if (positionData.length > 0) tracks.push(new THREE.VectorKeyframeTrack(name + '.position', times, positionData));
			if (quaternionData.length > 0) tracks.push(new THREE.QuaternionKeyframeTrack(name + '.quaternion', times, quaternionData));
			if (scaleData.length > 0) tracks.push(new THREE.VectorKeyframeTrack(name + '.scale', times, scaleData));

			return tracks;

		}

		function transformAnimationData(keyframes, property, defaultValue) {

			var keyframe;

			var empty = true;
			var i, l;

			// check, if values of a property are missing in our keyframes

			for (i = 0, l = keyframes.length; i < l; i++) {

				keyframe = keyframes[i];

				if (keyframe.value[property] === undefined) {

					keyframe.value[property] = null; // mark as missing

				} else {

					empty = false;

				}

			}

			if (empty === true) {

				// no values at all, so we set a default value

				for (i = 0, l = keyframes.length; i < l; i++) {

					keyframe = keyframes[i];

					keyframe.value[property] = defaultValue;

				}

			} else {

				// filling gaps

				createMissingKeyframes(keyframes, property);

			}

		}

		function createMissingKeyframes(keyframes, property) {

			var prev, next;

			for (var i = 0, l = keyframes.length; i < l; i++) {

				var keyframe = keyframes[i];

				if (keyframe.value[property] === null) {

					prev = getPrev(keyframes, i, property);
					next = getNext(keyframes, i, property);

					if (prev === null) {

						keyframe.value[property] = next.value[property];
						continue;

					}

					if (next === null) {

						keyframe.value[property] = prev.value[property];
						continue;

					}

					interpolate(keyframe, prev, next, property);

				}

			}

		}

		function getPrev(keyframes, i, property) {

			while (i >= 0) {

				var keyframe = keyframes[i];

				if (keyframe.value[property] !== null) return keyframe;

				i--;

			}

			return null;

		}

		function getNext(keyframes, i, property) {

			while (i < keyframes.length) {

				var keyframe = keyframes[i];

				if (keyframe.value[property] !== null) return keyframe;

				i++;

			}

			return null;

		}

		function interpolate(key, prev, next, property) {

			if ((next.time - prev.time) === 0) {

				key.value[property] = prev.value[property];
				return;

			}

			key.value[property] = ((key.time - prev.time) * (next.value[property] - prev.value[property]) / (next.time - prev.time)) + prev.value[property];

		}

		// animation clips

		function parseAnimationClip(xml) {

			var data = {
				name: xml.getAttribute('id') || 'default',
				start: parseFloat(xml.getAttribute('start') || 0),
				end: parseFloat(xml.getAttribute('end') || 0),
				animations: []
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'instance_animation':
						data.animations.push(parseId(child.getAttribute('url')));
						break;

				}

			}

			library.clips[xml.getAttribute('id')] = data;

		}

		function buildAnimationClip(data) {

			var tracks = [];

			var name = data.name;
			var duration = (data.end - data.start) || - 1;
			var animations = data.animations;

			for (var i = 0, il = animations.length; i < il; i++) {

				var animationTracks = getAnimation(animations[i]);

				for (var j = 0, jl = animationTracks.length; j < jl; j++) {

					tracks.push(animationTracks[j]);

				}

			}

			return new THREE.AnimationClip(name, duration, tracks);

		}

		function getAnimationClip(id) {

			return getBuild(library.clips[id], buildAnimationClip);

		}

		// controller

		function parseController(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'skin':
						// there is exactly one skin per controller
						data.id = parseId(child.getAttribute('source'));
						data.skin = parseSkin(child);
						break;

					case 'morph':
						data.id = parseId(child.getAttribute('source'));
						console.warn('THREE.ColladaLoader: Morph target animation not supported yet.');
						break;

				}

			}

			library.controllers[xml.getAttribute('id')] = data;

		}

		function parseSkin(xml) {

			var data = {
				sources: {}
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'bind_shape_matrix':
						data.bindShapeMatrix = parseFloats(child.textContent);
						break;

					case 'source':
						var id = child.getAttribute('id');
						data.sources[id] = parseSource(child);
						break;

					case 'joints':
						data.joints = parseJoints(child);
						break;

					case 'vertex_weights':
						data.vertexWeights = parseVertexWeights(child);
						break;

				}

			}

			return data;

		}

		function parseJoints(xml) {

			var data = {
				inputs: {}
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'input':
						var semantic = child.getAttribute('semantic');
						var id = parseId(child.getAttribute('source'));
						data.inputs[semantic] = id;
						break;

				}

			}

			return data;

		}

		function parseVertexWeights(xml) {

			var data = {
				inputs: {}
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'input':
						var semantic = child.getAttribute('semantic');
						var id = parseId(child.getAttribute('source'));
						var offset = parseInt(child.getAttribute('offset'));
						data.inputs[semantic] = { id: id, offset: offset };
						break;

					case 'vcount':
						data.vcount = parseInts(child.textContent);
						break;

					case 'v':
						data.v = parseInts(child.textContent);
						break;

				}

			}

			return data;

		}

		function buildController(data) {

			var build = {
				id: data.id
			};

			var geometry = library.geometries[build.id];

			if (data.skin !== undefined) {

				build.skin = buildSkin(data.skin);

				// we enhance the 'sources' property of the corresponding geometry with our skin data

				geometry.sources.skinIndices = build.skin.indices;
				geometry.sources.skinWeights = build.skin.weights;

			}

			return build;

		}

		function buildSkin(data) {

			var BONE_LIMIT = 4;

			var build = {
				joints: [], // this must be an array to preserve the joint order
				indices: {
					array: [],
					stride: BONE_LIMIT
				},
				weights: {
					array: [],
					stride: BONE_LIMIT
				}
			};

			var sources = data.sources;
			var vertexWeights = data.vertexWeights;

			var vcount = vertexWeights.vcount;
			var v = vertexWeights.v;
			var jointOffset = vertexWeights.inputs.JOINT.offset;
			var weightOffset = vertexWeights.inputs.WEIGHT.offset;

			var jointSource = data.sources[data.joints.inputs.JOINT];
			var inverseSource = data.sources[data.joints.inputs.INV_BIND_MATRIX];

			var weights = sources[vertexWeights.inputs.WEIGHT.id].array;
			var stride = 0;

			var i, j, l;

			// procces skin data for each vertex

			for (i = 0, l = vcount.length; i < l; i++) {

				var jointCount = vcount[i]; // this is the amount of joints that affect a single vertex
				var vertexSkinData = [];

				for (j = 0; j < jointCount; j++) {

					var skinIndex = v[stride + jointOffset];
					var weightId = v[stride + weightOffset];
					var skinWeight = weights[weightId];

					vertexSkinData.push({ index: skinIndex, weight: skinWeight });

					stride += 2;

				}

				// we sort the joints in descending order based on the weights.
				// this ensures, we only procced the most important joints of the vertex

				vertexSkinData.sort(descending);

				// now we provide for each vertex a set of four index and weight values.
				// the order of the skin data matches the order of vertices

				for (j = 0; j < BONE_LIMIT; j++) {

					var d = vertexSkinData[j];

					if (d !== undefined) {

						build.indices.array.push(d.index);
						build.weights.array.push(d.weight);

					} else {

						build.indices.array.push(0);
						build.weights.array.push(0);

					}

				}

			}

			// setup bind matrix

			if (data.bindShapeMatrix) {

				build.bindMatrix = new THREE.Matrix4().fromArray(data.bindShapeMatrix).transpose();

			} else {

				build.bindMatrix = new THREE.Matrix4().identity();

			}

			// process bones and inverse bind matrix data

			for (i = 0, l = jointSource.array.length; i < l; i++) {

				var name = jointSource.array[i];
				var boneInverse = new THREE.Matrix4().fromArray(inverseSource.array, i * inverseSource.stride).transpose();

				build.joints.push({ name: name, boneInverse: boneInverse });

			}

			return build;

			// array sort function

			function descending(a, b) {

				return b.weight - a.weight;

			}

		}

		function getController(id) {

			return getBuild(library.controllers[id], buildController);

		}

		// image

		function parseImage(xml) {

			var data = {
				init_from: getElementsByTagName(xml, 'init_from')[0].textContent
			};

			library.images[xml.getAttribute('id')] = data;

		}

		function buildImage(data) {

			if (data.build !== undefined) return data.build;

			return data.init_from;

		}

		function getImage(id) {

			var data = library.images[id];

			if (data !== undefined) {

				return getBuild(data, buildImage);

			}

			console.warn('THREE.ColladaLoader: Couldn\'t find image with ID:', id);

			return null;

		}

		// effect

		function parseEffect(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'profile_COMMON':
						data.profile = parseEffectProfileCOMMON(child);
						break;

				}

			}

			library.effects[xml.getAttribute('id')] = data;

		}

		function parseEffectProfileCOMMON(xml) {

			var data = {
				surfaces: {},
				samplers: {}
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'newparam':
						parseEffectNewparam(child, data);
						break;

					case 'technique':
						data.technique = parseEffectTechnique(child);
						break;

					case 'extra':
						data.extra = parseEffectExtra(child);
						break;

				}

			}

			return data;

		}

		function parseEffectNewparam(xml, data) {

			var sid = xml.getAttribute('sid');

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'surface':
						data.surfaces[sid] = parseEffectSurface(child);
						break;

					case 'sampler2D':
						data.samplers[sid] = parseEffectSampler(child);
						break;

				}

			}

		}

		function parseEffectSurface(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'init_from':
						data.init_from = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectSampler(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'source':
						data.source = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectTechnique(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'constant':
					case 'lambert':
					case 'blinn':
					case 'phong':
						data.type = child.nodeName;
						data.parameters = parseEffectParameters(child);
						break;

				}

			}

			return data;

		}

		function parseEffectParameters(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'emission':
					case 'diffuse':
					case 'specular':
					case 'bump':
					case 'ambient':
					case 'shininess':
					case 'transparency':
						data[child.nodeName] = parseEffectParameter(child);
						break;
					case 'transparent':
						data[child.nodeName] = {
							opaque: child.getAttribute('opaque'),
							data: parseEffectParameter(child)
						};
						break;

				}

			}

			return data;

		}

		function parseEffectParameter(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'color':
						data[child.nodeName] = parseFloats(child.textContent);
						break;

					case 'float':
						data[child.nodeName] = parseFloat(child.textContent);
						break;

					case 'texture':
						data[child.nodeName] = { id: child.getAttribute('texture'), extra: parseEffectParameterTexture(child) };
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTexture(xml) {

			var data = {
				technique: {}
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'extra':
						parseEffectParameterTextureExtra(child, data);
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTextureExtra(xml, data) {

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'technique':
						parseEffectParameterTextureExtraTechnique(child, data);
						break;

				}

			}

		}

		function parseEffectParameterTextureExtraTechnique(xml, data) {

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'repeatU':
					case 'repeatV':
					case 'offsetU':
					case 'offsetV':
						data.technique[child.nodeName] = parseFloat(child.textContent);
						break;

					case 'wrapU':
					case 'wrapV':

						// some files have values for wrapU/wrapV which become NaN via parseInt

						if (child.textContent.toUpperCase() === 'TRUE') {

							data.technique[child.nodeName] = 1;

						} else if (child.textContent.toUpperCase() === 'FALSE') {

							data.technique[child.nodeName] = 0;

						} else {

							data.technique[child.nodeName] = parseInt(child.textContent);

						}

						break;

				}

			}

		}

		function parseEffectExtra(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'technique':
						data.technique = parseEffectExtraTechnique(child);
						break;

				}

			}

			return data;

		}

		function parseEffectExtraTechnique(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'double_sided':
						data[child.nodeName] = parseInt(child.textContent);
						break;

				}

			}

			return data;

		}

		function buildEffect(data) {

			return data;

		}

		function getEffect(id) {

			return getBuild(library.effects[id], buildEffect);

		}

		// material

		function parseMaterial(xml) {

			var data = {
				name: xml.getAttribute('name')
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'instance_effect':
						data.url = parseId(child.getAttribute('url'));
						break;

				}

			}

			library.materials[xml.getAttribute('id')] = data;

		}

		function getTextureLoader(image) {

			var loader;

			var extension = image.slice((image.lastIndexOf('.') - 1 >>> 0) + 2); // http://www.jstips.co/en/javascript/get-file-extension/
			extension = extension.toLowerCase();

			switch (extension) {

				case 'tga':
					loader = tgaLoader;
					break;

				default:
					loader = textureLoader;

			}

			return loader;

		}

		function buildMaterial(data) {

			var effect = getEffect(data.url);
			var technique = effect.profile.technique;
			var extra = effect.profile.extra;

			var material;

			switch (technique.type) {

				case 'phong':
				case 'blinn':
					material = new THREE.MeshPhongMaterial();
					break;

				case 'lambert':
					material = new THREE.MeshLambertMaterial();
					break;

				default:
					material = new THREE.MeshBasicMaterial();
					break;

			}

			material.name = data.name || '';

			function getTexture(textureObject) {

				var sampler = effect.profile.samplers[textureObject.id];
				var image = null;

				// get image

				if (sampler !== undefined) {

					var surface = effect.profile.surfaces[sampler.source];
					image = getImage(surface.init_from);

				} else {

					console.warn('THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).');
					image = getImage(textureObject.id);

				}

				// create texture if image is avaiable

				if (image !== null) {

					var loader = getTextureLoader(image);

					if (loader !== undefined) {

						var texture = loader.load(image);

						var extra = textureObject.extra;

						if (extra !== undefined && extra.technique !== undefined && isEmpty(extra.technique) === false) {

							var technique = extra.technique;

							texture.wrapS = technique.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
							texture.wrapT = technique.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

							texture.offset.set(technique.offsetU || 0, technique.offsetV || 0);
							texture.repeat.set(technique.repeatU || 1, technique.repeatV || 1);

						} else {

							texture.wrapS = THREE.RepeatWrapping;
							texture.wrapT = THREE.RepeatWrapping;

						}

						return texture;

					} else {

						console.warn('THREE.ColladaLoader: Loader for texture %s not found.', image);

						return null;

					}

				} else {

					console.warn('THREE.ColladaLoader: Couldn\'t create texture with ID:', textureObject.id);

					return null;

				}

			}

			var parameters = technique.parameters;

			for (var key in parameters) {

				var parameter = parameters[key];

				switch (key) {

					case 'diffuse':
						if (parameter.color) material.color.fromArray(parameter.color);
						if (parameter.texture) material.map = getTexture(parameter.texture);
						break;
					case 'specular':
						if (parameter.color && material.specular) material.specular.fromArray(parameter.color);
						if (parameter.texture) material.specularMap = getTexture(parameter.texture);
						break;
					case 'bump':
						if (parameter.texture) material.normalMap = getTexture(parameter.texture);
						break;
					case 'ambient':
						if (parameter.texture) material.lightMap = getTexture(parameter.texture);
						break;
					case 'shininess':
						if (parameter.float && material.shininess) material.shininess = parameter.float;
						break;
					case 'emission':
						if (parameter.color && material.emissive) material.emissive.fromArray(parameter.color);
						if (parameter.texture) material.emissiveMap = getTexture(parameter.texture);
						break;

				}

			}

			//

			var transparent = parameters['transparent'];
			var transparency = parameters['transparency'];

			// <transparency> does not exist but <transparent>

			if (transparency === undefined && transparent) {

				transparency = {
					float: 1
				};

			}

			// <transparent> does not exist but <transparency>

			if (transparent === undefined && transparency) {

				transparent = {
					opaque: 'A_ONE',
					data: {
						color: [1, 1, 1, 1]
					}
				};

			}

			if (transparent && transparency) {

				// handle case if a texture exists but no color

				if (transparent.data.texture) {

					// we do not set an alpha map (see #13792)

					material.transparent = true;

				} else {

					var color = transparent.data.color;

					switch (transparent.opaque) {

						case 'A_ONE':
							material.opacity = color[3] * transparency.float;
							break;
						case 'RGB_ZERO':
							material.opacity = 1 - (color[0] * transparency.float);
							break;
						case 'A_ZERO':
							material.opacity = 1 - (color[3] * transparency.float);
							break;
						case 'RGB_ONE':
							material.opacity = color[0] * transparency.float;
							break;
						default:
							console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.', transparent.opaque);

					}

					if (material.opacity < 1) material.transparent = true;

				}

			}

			//

			if (extra !== undefined && extra.technique !== undefined && extra.technique.double_sided === 1) {

				material.side = THREE.DoubleSide;

			}

			return material;

		}

		function getMaterial(id) {

			return getBuild(library.materials[id], buildMaterial);

		}

		// camera

		function parseCamera(xml) {

			var data = {
				name: xml.getAttribute('name')
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'optics':
						data.optics = parseCameraOptics(child);
						break;

				}

			}

			library.cameras[xml.getAttribute('id')] = data;

		}

		function parseCameraOptics(xml) {

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				switch (child.nodeName) {

					case 'technique_common':
						return parseCameraTechnique(child);

				}

			}

			return {};

		}

		function parseCameraTechnique(xml) {

			var data = {};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				switch (child.nodeName) {

					case 'perspective':
					case 'orthographic':

						data.technique = child.nodeName;
						data.parameters = parseCameraParameters(child);

						break;

				}

			}

			return data;

		}

		function parseCameraParameters(xml) {

			var data = {};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				switch (child.nodeName) {

					case 'xfov':
					case 'yfov':
					case 'xmag':
					case 'ymag':
					case 'znear':
					case 'zfar':
					case 'aspect_ratio':
						data[child.nodeName] = parseFloat(child.textContent);
						break;

				}

			}

			return data;

		}

		function buildCamera(data) {

			var camera;

			switch (data.optics.technique) {

				case 'perspective':
					camera = new THREE.PerspectiveCamera(
						data.optics.parameters.yfov,
						data.optics.parameters.aspect_ratio,
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				case 'orthographic':
					var ymag = data.optics.parameters.ymag;
					var xmag = data.optics.parameters.xmag;
					var aspectRatio = data.optics.parameters.aspect_ratio;

					xmag = (xmag === undefined) ? (ymag * aspectRatio) : xmag;
					ymag = (ymag === undefined) ? (xmag / aspectRatio) : ymag;

					xmag *= 0.5;
					ymag *= 0.5;

					camera = new THREE.OrthographicCamera(
						- xmag, xmag, ymag, - ymag, // left, right, top, bottom
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				default:
					camera = new THREE.PerspectiveCamera();
					break;

			}

			camera.name = data.name || '';

			return camera;

		}

		function getCamera(id) {

			var data = library.cameras[id];

			if (data !== undefined) {

				return getBuild(data, buildCamera);

			}

			console.warn('THREE.ColladaLoader: Couldn\'t find camera with ID:', id);

			return null;

		}

		// light

		function parseLight(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'technique_common':
						data = parseLightTechnique(child);
						break;

				}

			}

			library.lights[xml.getAttribute('id')] = data;

		}

		function parseLightTechnique(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'directional':
					case 'point':
					case 'spot':
					case 'ambient':

						data.technique = child.nodeName;
						data.parameters = parseLightParameters(child);

				}

			}

			return data;

		}

		function parseLightParameters(xml) {

			var data = {};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'color':
						var array = parseFloats(child.textContent);
						data.color = new THREE.Color().fromArray(array);
						break;

					case 'falloff_angle':
						data.falloffAngle = parseFloat(child.textContent);
						break;

					case 'quadratic_attenuation':
						var f = parseFloat(child.textContent);
						data.distance = f ? Math.sqrt(1 / f) : 0;
						break;

				}

			}

			return data;

		}

		function buildLight(data) {

			var light;

			switch (data.technique) {

				case 'directional':
					light = new THREE.DirectionalLight();
					break;

				case 'point':
					light = new THREE.PointLight();
					break;

				case 'spot':
					light = new THREE.SpotLight();
					break;

				case 'ambient':
					light = new THREE.AmbientLight();
					break;

			}

			if (data.parameters.color) light.color.copy(data.parameters.color);
			if (data.parameters.distance) light.distance = data.parameters.distance;

			return light;

		}

		function getLight(id) {

			var data = library.lights[id];

			if (data !== undefined) {

				return getBuild(data, buildLight);

			}

			console.warn('THREE.ColladaLoader: Couldn\'t find light with ID:', id);

			return null;

		}

		// geometry

		function parseGeometry(xml) {

			var data = {
				name: xml.getAttribute('name'),
				sources: {},
				vertices: {},
				primitives: []
			};

			var mesh = getElementsByTagName(xml, 'mesh')[0];

			// the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
			if (mesh === undefined) return;

			for (var i = 0; i < mesh.childNodes.length; i++) {

				var child = mesh.childNodes[i];

				if (child.nodeType !== 1) continue;

				var id = child.getAttribute('id');

				switch (child.nodeName) {

					case 'source':
						data.sources[id] = parseSource(child);
						break;

					case 'vertices':
						// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
						data.vertices = parseGeometryVertices(child);
						break;

					case 'polygons':
						console.warn('THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName);
						break;

					case 'lines':
					case 'linestrips':
					case 'polylist':
					case 'triangles':
						data.primitives.push(parseGeometryPrimitive(child));
						break;

					default:
						console.log(child);

				}

			}

			library.geometries[xml.getAttribute('id')] = data;

		}

		function parseSource(xml) {

			var data = {
				array: [],
				stride: 3
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'float_array':
						data.array = parseFloats(child.textContent);
						break;

					case 'Name_array':
						data.array = parseStrings(child.textContent);
						break;

					case 'technique_common':
						var accessor = getElementsByTagName(child, 'accessor')[0];

						if (accessor !== undefined) {

							data.stride = parseInt(accessor.getAttribute('stride'));

						}

						break;

				}

			}

			return data;

		}

		function parseGeometryVertices(xml) {

			var data = {};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				data[child.getAttribute('semantic')] = parseId(child.getAttribute('source'));

			}

			return data;

		}

		function parseGeometryPrimitive(xml) {

			var primitive = {
				type: xml.nodeName,
				material: xml.getAttribute('material'),
				count: parseInt(xml.getAttribute('count')),
				inputs: {},
				stride: 0,
				hasUV: false
			};

			for (var i = 0, l = xml.childNodes.length; i < l; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'input':
						var id = parseId(child.getAttribute('source'));
						var semantic = child.getAttribute('semantic');
						var offset = parseInt(child.getAttribute('offset'));
						var set = parseInt(child.getAttribute('set'));
						var inputname = (set > 0 ? semantic + set : semantic);
						primitive.inputs[inputname] = { id: id, offset: offset };
						primitive.stride = Math.max(primitive.stride, offset + 1);
						if (semantic === 'TEXCOORD') primitive.hasUV = true;
						break;

					case 'vcount':
						primitive.vcount = parseInts(child.textContent);
						break;

					case 'p':
						primitive.p = parseInts(child.textContent);
						break;

				}

			}

			return primitive;

		}

		function groupPrimitives(primitives) {

			var build = {};

			for (var i = 0; i < primitives.length; i++) {

				var primitive = primitives[i];

				if (build[primitive.type] === undefined) build[primitive.type] = [];

				build[primitive.type].push(primitive);

			}

			return build;

		}

		function checkUVCoordinates(primitives) {

			var count = 0;

			for (var i = 0, l = primitives.length; i < l; i++) {

				var primitive = primitives[i];

				if (primitive.hasUV === true) {

					count++;

				}

			}

			if (count > 0 && count < primitives.length) {

				primitives.uvsNeedsFix = true;

			}

		}

		function buildGeometry(data) {

			var build = {};

			var sources = data.sources;
			var vertices = data.vertices;
			var primitives = data.primitives;

			if (primitives.length === 0) return {};

			// our goal is to create one buffer geometry for a single type of primitives
			// first, we group all primitives by their type

			var groupedPrimitives = groupPrimitives(primitives);

			for (var type in groupedPrimitives) {

				var primitiveType = groupedPrimitives[type];

				// second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

				checkUVCoordinates(primitiveType);

				// third, create a buffer geometry for each type of primitives

				build[type] = buildGeometryType(primitiveType, sources, vertices);

			}

			return build;

		}

		function buildGeometryType(primitives, sources, vertices) {

			var build = {};

			var position = { array: [], stride: 0 };
			var normal = { array: [], stride: 0 };
			var uv = { array: [], stride: 0 };
			var uv2 = { array: [], stride: 0 };
			var color = { array: [], stride: 0 };

			var skinIndex = { array: [], stride: 4 };
			var skinWeight = { array: [], stride: 4 };

			var geometry = new THREE.BufferGeometry();

			var materialKeys = [];

			var start = 0;

			for (var p = 0; p < primitives.length; p++) {

				var primitive = primitives[p];
				var inputs = primitive.inputs;

				// groups

				var count = 0;

				switch (primitive.type) {

					case 'lines':
					case 'linestrips':
						count = primitive.count * 2;
						break;

					case 'triangles':
						count = primitive.count * 3;
						break;

					case 'polylist':

						for (var g = 0; g < primitive.count; g++) {

							var vc = primitive.vcount[g];

							switch (vc) {

								case 3:
									count += 3; // single triangle
									break;

								case 4:
									count += 6; // quad, subdivided into two triangles
									break;

								default:
									count += (vc - 2) * 3; // polylist with more than four vertices
									break;

							}

						}

						break;

					default:
						console.warn('THREE.ColladaLoader: Unknow primitive type:', primitive.type);

				}

				geometry.addGroup(start, count, p);
				start += count;

				// material

				if (primitive.material) {

					materialKeys.push(primitive.material);

				}

				// geometry data

				for (var name in inputs) {

					var input = inputs[name];

					switch (name) {

						case 'VERTEX':
							for (var key in vertices) {

								var id = vertices[key];

								switch (key) {

									case 'POSITION':
										var prevLength = position.array.length;
										buildGeometryData(primitive, sources[id], input.offset, position.array);
										position.stride = sources[id].stride;

										if (sources.skinWeights && sources.skinIndices) {

											buildGeometryData(primitive, sources.skinIndices, input.offset, skinIndex.array);
											buildGeometryData(primitive, sources.skinWeights, input.offset, skinWeight.array);

										}

										// see #3803

										if (primitive.hasUV === false && primitives.uvsNeedsFix === true) {

											var count = (position.array.length - prevLength) / position.stride;

											for (var i = 0; i < count; i++) {

												// fill missing uv coordinates

												uv.array.push(0, 0);

											}

										}

										break;

									case 'NORMAL':
										buildGeometryData(primitive, sources[id], input.offset, normal.array);
										normal.stride = sources[id].stride;
										break;

									case 'COLOR':
										buildGeometryData(primitive, sources[id], input.offset, color.array);
										color.stride = sources[id].stride;
										break;

									case 'TEXCOORD':
										buildGeometryData(primitive, sources[id], input.offset, uv.array);
										uv.stride = sources[id].stride;
										break;

									case 'TEXCOORD1':
										buildGeometryData(primitive, sources[id], input.offset, uv2.array);
										uv.stride = sources[id].stride;
										break;

									default:
										console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key);

								}

							}

							break;

						case 'NORMAL':
							buildGeometryData(primitive, sources[input.id], input.offset, normal.array);
							normal.stride = sources[input.id].stride;
							break;

						case 'COLOR':
							buildGeometryData(primitive, sources[input.id], input.offset, color.array);
							color.stride = sources[input.id].stride;
							break;

						case 'TEXCOORD':
							buildGeometryData(primitive, sources[input.id], input.offset, uv.array);
							uv.stride = sources[input.id].stride;
							break;

						case 'TEXCOORD1':
							buildGeometryData(primitive, sources[input.id], input.offset, uv2.array);
							uv2.stride = sources[input.id].stride;
							break;

					}

				}

			}

			// build geometry

			if (position.array.length > 0) geometry.setAttribute('position', new THREE.Float32BufferAttribute(position.array, position.stride));
			if (normal.array.length > 0) geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal.array, normal.stride));
			if (color.array.length > 0) geometry.setAttribute('color', new THREE.Float32BufferAttribute(color.array, color.stride));
			if (uv.array.length > 0) geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv.array, uv.stride));
			if (uv2.array.length > 0) geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(uv2.array, uv2.stride));

			if (skinIndex.array.length > 0) geometry.setAttribute('skinIndex', new THREE.Float32BufferAttribute(skinIndex.array, skinIndex.stride));
			if (skinWeight.array.length > 0) geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight.array, skinWeight.stride));

			build.data = geometry;
			build.type = primitives[0].type;
			build.materialKeys = materialKeys;

			return build;

		}

		function buildGeometryData(primitive, source, offset, array) {

			var indices = primitive.p;
			var stride = primitive.stride;
			var vcount = primitive.vcount;

			function pushVector(i) {

				var index = indices[i + offset] * sourceStride;
				var length = index + sourceStride;

				for (; index < length; index++) {

					array.push(sourceArray[index]);

				}

			}

			var sourceArray = source.array;
			var sourceStride = source.stride;

			if (primitive.vcount !== undefined) {

				var index = 0;

				for (var i = 0, l = vcount.length; i < l; i++) {

					var count = vcount[i];

					if (count === 4) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;
						var d = index + stride * 3;

						pushVector(a); pushVector(b); pushVector(d);
						pushVector(b); pushVector(c); pushVector(d);

					} else if (count === 3) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;

						pushVector(a); pushVector(b); pushVector(c);

					} else if (count > 4) {

						for (var k = 1, kl = (count - 2); k <= kl; k++) {

							var a = index + stride * 0;
							var b = index + stride * k;
							var c = index + stride * (k + 1);

							pushVector(a); pushVector(b); pushVector(c);

						}

					}

					index += stride * count;

				}

			} else {

				for (var i = 0, l = indices.length; i < l; i += stride) {

					pushVector(i);

				}

			}

		}

		function getGeometry(id) {

			return getBuild(library.geometries[id], buildGeometry);

		}

		// kinematics

		function parseKinematicsModel(xml) {

			var data = {
				name: xml.getAttribute('name') || '',
				joints: {},
				links: []
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'technique_common':
						parseKinematicsTechniqueCommon(child, data);
						break;

				}

			}

			library.kinematicsModels[xml.getAttribute('id')] = data;

		}

		function buildKinematicsModel(data) {

			if (data.build !== undefined) return data.build;

			return data;

		}

		function getKinematicsModel(id) {

			return getBuild(library.kinematicsModels[id], buildKinematicsModel);

		}

		function parseKinematicsTechniqueCommon(xml, data) {

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'joint':
						data.joints[child.getAttribute('sid')] = parseKinematicsJoint(child);
						break;

					case 'link':
						data.links.push(parseKinematicsLink(child));
						break;

				}

			}

		}

		function parseKinematicsJoint(xml) {

			var data;

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'prismatic':
					case 'revolute':
						data = parseKinematicsJointParameter(child);
						break;

				}

			}

			return data;

		}

		function parseKinematicsJointParameter(xml, data) {

			var data = {
				sid: xml.getAttribute('sid'),
				name: xml.getAttribute('name') || '',
				axis: new THREE.Vector3(),
				limits: {
					min: 0,
					max: 0
				},
				type: xml.nodeName,
				static: false,
				zeroPosition: 0,
				middlePosition: 0
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'axis':
						var array = parseFloats(child.textContent);
						data.axis.fromArray(array);
						break;
					case 'limits':
						var max = child.getElementsByTagName('max')[0];
						var min = child.getElementsByTagName('min')[0];

						data.limits.max = parseFloat(max.textContent);
						data.limits.min = parseFloat(min.textContent);
						break;

				}

			}

			// if min is equal to or greater than max, consider the joint static

			if (data.limits.min >= data.limits.max) {

				data.static = true;

			}

			// calculate middle position

			data.middlePosition = (data.limits.min + data.limits.max) / 2.0;

			return data;

		}

		function parseKinematicsLink(xml) {

			var data = {
				sid: xml.getAttribute('sid'),
				name: xml.getAttribute('name') || '',
				attachments: [],
				transforms: []
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'attachment_full':
						data.attachments.push(parseKinematicsAttachment(child));
						break;

					case 'matrix':
					case 'translate':
					case 'rotate':
						data.transforms.push(parseKinematicsTransform(child));
						break;

				}

			}

			return data;

		}

		function parseKinematicsAttachment(xml) {

			var data = {
				joint: xml.getAttribute('joint').split('/').pop(),
				transforms: [],
				links: []
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'link':
						data.links.push(parseKinematicsLink(child));
						break;

					case 'matrix':
					case 'translate':
					case 'rotate':
						data.transforms.push(parseKinematicsTransform(child));
						break;

				}

			}

			return data;

		}

		function parseKinematicsTransform(xml) {

			var data = {
				type: xml.nodeName
			};

			var array = parseFloats(xml.textContent);

			switch (data.type) {

				case 'matrix':
					data.obj = new THREE.Matrix4();
					data.obj.fromArray(array).transpose();
					break;

				case 'translate':
					data.obj = new THREE.Vector3();
					data.obj.fromArray(array);
					break;

				case 'rotate':
					data.obj = new THREE.Vector3();
					data.obj.fromArray(array);
					data.angle = THREE.MathUtils.degToRad(array[3]);
					break;

			}

			return data;

		}

		// physics

		function parsePhysicsModel(xml) {

			var data = {
				name: xml.getAttribute('name') || '',
				rigidBodies: {}
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'rigid_body':
						data.rigidBodies[child.getAttribute('name')] = {};
						parsePhysicsRigidBody(child, data.rigidBodies[child.getAttribute('name')]);
						break;

				}

			}

			library.physicsModels[xml.getAttribute('id')] = data;

		}

		function parsePhysicsRigidBody(xml, data) {

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'technique_common':
						parsePhysicsTechniqueCommon(child, data);
						break;

				}

			}

		}

		function parsePhysicsTechniqueCommon(xml, data) {

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'inertia':
						data.inertia = parseFloats(child.textContent);
						break;

					case 'mass':
						data.mass = parseFloats(child.textContent)[0];
						break;

				}

			}

		}

		// scene

		function parseKinematicsScene(xml) {

			var data = {
				bindJointAxis: []
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'bind_joint_axis':
						data.bindJointAxis.push(parseKinematicsBindJointAxis(child));
						break;

				}

			}

			library.kinematicsScenes[parseId(xml.getAttribute('url'))] = data;

		}

		function parseKinematicsBindJointAxis(xml) {

			var data = {
				target: xml.getAttribute('target').split('/').pop()
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'axis':
						var param = child.getElementsByTagName('param')[0];
						data.axis = param.textContent;
						var tmpJointIndex = data.axis.split('inst_').pop().split('axis')[0];
						data.jointIndex = tmpJointIndex.substr(0, tmpJointIndex.length - 1);
						break;

				}

			}

			return data;

		}

		function buildKinematicsScene(data) {

			if (data.build !== undefined) return data.build;

			return data;

		}

		function getKinematicsScene(id) {

			return getBuild(library.kinematicsScenes[id], buildKinematicsScene);

		}

		function setupKinematics() {

			var kinematicsModelId = Object.keys(library.kinematicsModels)[0];
			var kinematicsSceneId = Object.keys(library.kinematicsScenes)[0];
			var visualSceneId = Object.keys(library.visualScenes)[0];

			if (kinematicsModelId === undefined || kinematicsSceneId === undefined) return;

			var kinematicsModel = getKinematicsModel(kinematicsModelId);
			var kinematicsScene = getKinematicsScene(kinematicsSceneId);
			var visualScene = getVisualScene(visualSceneId);

			var bindJointAxis = kinematicsScene.bindJointAxis;
			var jointMap = {};

			for (var i = 0, l = bindJointAxis.length; i < l; i++) {

				var axis = bindJointAxis[i];

				// the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

				var targetElement = collada.querySelector('[sid="' + axis.target + '"]');

				if (targetElement) {

					// get the parent of the transform element

					var parentVisualElement = targetElement.parentElement;

					// connect the joint of the kinematics model with the element in the visual scene

					connect(axis.jointIndex, parentVisualElement);

				}

			}

			function connect(jointIndex, visualElement) {

				var visualElementName = visualElement.getAttribute('name');
				var joint = kinematicsModel.joints[jointIndex];

				visualScene.traverse(function (object) {

					if (object.name === visualElementName) {

						jointMap[jointIndex] = {
							object: object,
							transforms: buildTransformList(visualElement),
							joint: joint,
							position: joint.zeroPosition
						};

					}

				});

			}

			var m0 = new THREE.Matrix4();

			kinematics = {

				joints: kinematicsModel && kinematicsModel.joints,

				getJointValue: function (jointIndex) {

					var jointData = jointMap[jointIndex];

					if (jointData) {

						return jointData.position;

					} else {

						console.warn('THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.');

					}

				},

				setJointValue: function (jointIndex, value) {

					var jointData = jointMap[jointIndex];

					if (jointData) {

						var joint = jointData.joint;

						if (value > joint.limits.max || value < joint.limits.min) {

							console.warn('THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').');

						} else if (joint.static) {

							console.warn('THREE.ColladaLoader: Joint ' + jointIndex + ' is static.');

						} else {

							var object = jointData.object;
							var axis = joint.axis;
							var transforms = jointData.transforms;

							matrix.identity();

							// each update, we have to apply all transforms in the correct order

							for (var i = 0; i < transforms.length; i++) {

								var transform = transforms[i];

								// if there is a connection of the transform node with a joint, apply the joint value

								if (transform.sid && transform.sid.indexOf(jointIndex) !== - 1) {

									switch (joint.type) {

										case 'revolute':
											matrix.multiply(m0.makeRotationAxis(axis, THREE.MathUtils.degToRad(value)));
											break;

										case 'prismatic':
											matrix.multiply(m0.makeTranslation(axis.x * value, axis.y * value, axis.z * value));
											break;

										default:
											console.warn('THREE.ColladaLoader: Unknown joint type: ' + joint.type);
											break;

									}

								} else {

									switch (transform.type) {

										case 'matrix':
											matrix.multiply(transform.obj);
											break;

										case 'translate':
											matrix.multiply(m0.makeTranslation(transform.obj.x, transform.obj.y, transform.obj.z));
											break;

										case 'scale':
											matrix.scale(transform.obj);
											break;

										case 'rotate':
											matrix.multiply(m0.makeRotationAxis(transform.obj, transform.angle));
											break;

									}

								}

							}

							object.matrix.copy(matrix);
							object.matrix.decompose(object.position, object.quaternion, object.scale);

							jointMap[jointIndex].position = value;

						}

					} else {

						console.log('THREE.ColladaLoader: ' + jointIndex + ' does not exist.');

					}

				}

			};

		}

		function buildTransformList(node) {

			var transforms = [];

			var xml = collada.querySelector('[id="' + node.id + '"]');

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'matrix':
						var array = parseFloats(child.textContent);
						var matrix = new THREE.Matrix4().fromArray(array).transpose();
						transforms.push({
							sid: child.getAttribute('sid'),
							type: child.nodeName,
							obj: matrix
						});
						break;

					case 'translate':
					case 'scale':
						var array = parseFloats(child.textContent);
						var vector = new THREE.Vector3().fromArray(array);
						transforms.push({
							sid: child.getAttribute('sid'),
							type: child.nodeName,
							obj: vector
						});
						break;

					case 'rotate':
						var array = parseFloats(child.textContent);
						var vector = new THREE.Vector3().fromArray(array);
						var angle = THREE.MathUtils.degToRad(array[3]);
						transforms.push({
							sid: child.getAttribute('sid'),
							type: child.nodeName,
							obj: vector,
							angle: angle
						});
						break;

				}

			}

			return transforms;

		}

		// nodes

		function prepareNodes(xml) {

			var elements = xml.getElementsByTagName('node');

			// ensure all node elements have id attributes

			for (var i = 0; i < elements.length; i++) {

				var element = elements[i];

				if (element.hasAttribute('id') === false) {

					element.setAttribute('id', generateId());

				}

			}

		}

		var matrix = new THREE.Matrix4();
		var vector = new THREE.Vector3();

		function parseNode(xml) {

			var data = {
				name: xml.getAttribute('name') || '',
				type: xml.getAttribute('type'),
				id: xml.getAttribute('id'),
				sid: xml.getAttribute('sid'),
				matrix: new THREE.Matrix4(),
				nodes: [],
				instanceCameras: [],
				instanceControllers: [],
				instanceLights: [],
				instanceGeometries: [],
				instanceNodes: [],
				transforms: {}
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				if (child.nodeType !== 1) continue;

				switch (child.nodeName) {

					case 'node':
						data.nodes.push(child.getAttribute('id'));
						parseNode(child);
						break;

					case 'instance_camera':
						data.instanceCameras.push(parseId(child.getAttribute('url')));
						break;

					case 'instance_controller':
						data.instanceControllers.push(parseNodeInstance(child));
						break;

					case 'instance_light':
						data.instanceLights.push(parseId(child.getAttribute('url')));
						break;

					case 'instance_geometry':
						data.instanceGeometries.push(parseNodeInstance(child));
						break;

					case 'instance_node':
						data.instanceNodes.push(parseId(child.getAttribute('url')));
						break;

					case 'matrix':
						var array = parseFloats(child.textContent);
						data.matrix.multiply(matrix.fromArray(array).transpose());
						data.transforms[child.getAttribute('sid')] = child.nodeName;
						break;

					case 'translate':
						var array = parseFloats(child.textContent);
						vector.fromArray(array);
						data.matrix.multiply(matrix.makeTranslation(vector.x, vector.y, vector.z));
						data.transforms[child.getAttribute('sid')] = child.nodeName;
						break;

					case 'rotate':
						var array = parseFloats(child.textContent);
						var angle = THREE.MathUtils.degToRad(array[3]);
						data.matrix.multiply(matrix.makeRotationAxis(vector.fromArray(array), angle));
						data.transforms[child.getAttribute('sid')] = child.nodeName;
						break;

					case 'scale':
						var array = parseFloats(child.textContent);
						data.matrix.scale(vector.fromArray(array));
						data.transforms[child.getAttribute('sid')] = child.nodeName;
						break;

					case 'extra':
						break;

					default:
						console.log(child);

				}

			}

			if (hasNode(data.id)) {

				console.warn('THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id);

			} else {

				library.nodes[data.id] = data;

			}

			return data;

		}

		function parseNodeInstance(xml) {

			var data = {
				id: parseId(xml.getAttribute('url')),
				materials: {},
				skeletons: []
			};

			for (var i = 0; i < xml.childNodes.length; i++) {

				var child = xml.childNodes[i];

				switch (child.nodeName) {

					case 'bind_material':
						var instances = child.getElementsByTagName('instance_material');

						for (var j = 0; j < instances.length; j++) {

							var instance = instances[j];
							var symbol = instance.getAttribute('symbol');
							var target = instance.getAttribute('target');

							data.materials[symbol] = parseId(target);

						}

						break;

					case 'skeleton':
						data.skeletons.push(parseId(child.textContent));
						break;

					default:
						break;

				}

			}

			return data;

		}

		function buildSkeleton(skeletons, joints) {

			var boneData = [];
			var sortedBoneData = [];

			var i, j, data;

			// a skeleton can have multiple root bones. collada expresses this
			// situtation with multiple "skeleton" tags per controller instance

			for (i = 0; i < skeletons.length; i++) {

				var skeleton = skeletons[i];

				var root;

				if (hasNode(skeleton)) {

					root = getNode(skeleton);
					buildBoneHierarchy(root, joints, boneData);

				} else if (hasVisualScene(skeleton)) {

					// handle case where the skeleton refers to the visual scene (#13335)

					var visualScene = library.visualScenes[skeleton];
					var children = visualScene.children;

					for (var j = 0; j < children.length; j++) {

						var child = children[j];

						if (child.type === 'JOINT') {

							var root = getNode(child.id);
							buildBoneHierarchy(root, joints, boneData);

						}

					}

				} else {

					console.error('THREE.ColladaLoader: Unable to find root bone of skeleton with ID:', skeleton);

				}

			}

			// sort bone data (the order is defined in the corresponding controller)

			for (i = 0; i < joints.length; i++) {

				for (j = 0; j < boneData.length; j++) {

					data = boneData[j];

					if (data.bone.name === joints[i].name) {

						sortedBoneData[i] = data;
						data.processed = true;
						break;

					}

				}

			}

			// add unprocessed bone data at the end of the list

			for (i = 0; i < boneData.length; i++) {

				data = boneData[i];

				if (data.processed === false) {

					sortedBoneData.push(data);
					data.processed = true;

				}

			}

			// setup arrays for skeleton creation

			var bones = [];
			var boneInverses = [];

			for (i = 0; i < sortedBoneData.length; i++) {

				data = sortedBoneData[i];

				bones.push(data.bone);
				boneInverses.push(data.boneInverse);

			}

			return new THREE.Skeleton(bones, boneInverses);

		}

		function buildBoneHierarchy(root, joints, boneData) {

			// setup bone data from visual scene

			root.traverse(function (object) {

				if (object.isBone === true) {

					var boneInverse;

					// retrieve the boneInverse from the controller data

					for (var i = 0; i < joints.length; i++) {

						var joint = joints[i];

						if (joint.name === object.name) {

							boneInverse = joint.boneInverse;
							break;

						}

					}

					if (boneInverse === undefined) {

						// Unfortunately, there can be joints in the visual scene that are not part of the
						// corresponding controller. In this case, we have to create a dummy boneInverse matrix
						// for the respective bone. This bone won't affect any vertices, because there are no skin indices
						// and weights defined for it. But we still have to add the bone to the sorted bone list in order to
						// ensure a correct animation of the model.

						boneInverse = new THREE.Matrix4();

					}

					boneData.push({ bone: object, boneInverse: boneInverse, processed: false });

				}

			});

		}

		function buildNode(data) {

			var objects = [];

			var matrix = data.matrix;
			var nodes = data.nodes;
			var type = data.type;
			var instanceCameras = data.instanceCameras;
			var instanceControllers = data.instanceControllers;
			var instanceLights = data.instanceLights;
			var instanceGeometries = data.instanceGeometries;
			var instanceNodes = data.instanceNodes;

			// nodes

			for (var i = 0, l = nodes.length; i < l; i++) {

				objects.push(getNode(nodes[i]));

			}

			// instance cameras

			for (var i = 0, l = instanceCameras.length; i < l; i++) {

				var instanceCamera = getCamera(instanceCameras[i]);

				if (instanceCamera !== null) {

					objects.push(instanceCamera.clone());

				}

			}

			// instance controllers

			for (var i = 0, l = instanceControllers.length; i < l; i++) {

				var instance = instanceControllers[i];
				var controller = getController(instance.id);
				var geometries = getGeometry(controller.id);
				var newObjects = buildObjects(geometries, instance.materials);

				var skeletons = instance.skeletons;
				var joints = controller.skin.joints;

				var skeleton = buildSkeleton(skeletons, joints);

				for (var j = 0, jl = newObjects.length; j < jl; j++) {

					var object = newObjects[j];

					if (object.isSkinnedMesh) {

						object.bind(skeleton, controller.skin.bindMatrix);
						object.normalizeSkinWeights();

					}

					objects.push(object);

				}

			}

			// instance lights

			for (var i = 0, l = instanceLights.length; i < l; i++) {

				var instanceLight = getLight(instanceLights[i]);

				if (instanceLight !== null) {

					objects.push(instanceLight.clone());

				}

			}

			// instance geometries

			for (var i = 0, l = instanceGeometries.length; i < l; i++) {

				var instance = instanceGeometries[i];

				// a single geometry instance in collada can lead to multiple object3Ds.
				// this is the case when primitives are combined like triangles and lines

				var geometries = getGeometry(instance.id);
				var newObjects = buildObjects(geometries, instance.materials);

				for (var j = 0, jl = newObjects.length; j < jl; j++) {

					objects.push(newObjects[j]);

				}

			}

			// instance nodes

			for (var i = 0, l = instanceNodes.length; i < l; i++) {

				objects.push(getNode(instanceNodes[i]).clone());

			}

			var object;

			if (nodes.length === 0 && objects.length === 1) {

				object = objects[0];

			} else {

				object = (type === 'JOINT') ? new THREE.Bone() : new THREE.Group();

				for (var i = 0; i < objects.length; i++) {

					object.add(objects[i]);

				}

			}

			object.name = (type === 'JOINT') ? data.sid : data.name;
			object.matrix.copy(matrix);
			object.matrix.decompose(object.position, object.quaternion, object.scale);

			return object;

		}

		var fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

		function resolveMaterialBinding(keys, instanceMaterials) {

			var materials = [];

			for (var i = 0, l = keys.length; i < l; i++) {

				var id = instanceMaterials[keys[i]];

				if (id === undefined) {

					console.warn('THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[i]);
					materials.push(fallbackMaterial);

				} else {

					materials.push(getMaterial(id));

				}

			}

			return materials;

		}

		function buildObjects(geometries, instanceMaterials) {

			var objects = [];

			for (var type in geometries) {

				var geometry = geometries[type];

				var materials = resolveMaterialBinding(geometry.materialKeys, instanceMaterials);

				// handle case if no materials are defined

				if (materials.length === 0) {

					if (type === 'lines' || type === 'linestrips') {

						materials.push(new THREE.LineBasicMaterial());

					} else {

						materials.push(new THREE.MeshPhongMaterial());

					}

				}

				// regard skinning

				var skinning = (geometry.data.attributes.skinIndex !== undefined);

				if (skinning) {

					for (var i = 0, l = materials.length; i < l; i++) {

						materials[i].skinning = true;

					}

				}

				// choose between a single or multi materials (material array)

				var material = (materials.length === 1) ? materials[0] : materials;

				// now create a specific 3D object

				var object;

				switch (type) {

					case 'lines':
						object = new THREE.LineSegments(geometry.data, material);
						break;

					case 'linestrips':
						object = new THREE.Line(geometry.data, material);
						break;

					case 'triangles':
					case 'polylist':
						if (skinning) {

							object = new THREE.SkinnedMesh(geometry.data, material);

						} else {

							object = new THREE.Mesh(geometry.data, material);

						}

						break;

				}

				objects.push(object);

			}

			return objects;

		}

		function hasNode(id) {

			return library.nodes[id] !== undefined;

		}

		function getNode(id) {

			return getBuild(library.nodes[id], buildNode);

		}

		// visual scenes

		function parseVisualScene(xml) {

			var data = {
				name: xml.getAttribute('name'),
				children: []
			};

			prepareNodes(xml);

			var elements = getElementsByTagName(xml, 'node');

			for (var i = 0; i < elements.length; i++) {

				data.children.push(parseNode(elements[i]));

			}

			library.visualScenes[xml.getAttribute('id')] = data;

		}

		function buildVisualScene(data) {

			var group = new THREE.Group();
			group.name = data.name;

			var children = data.children;

			for (var i = 0; i < children.length; i++) {

				var child = children[i];

				group.add(getNode(child.id));

			}

			return group;

		}

		function hasVisualScene(id) {

			return library.visualScenes[id] !== undefined;

		}

		function getVisualScene(id) {

			return getBuild(library.visualScenes[id], buildVisualScene);

		}

		// scenes

		function parseScene(xml) {

			var instance = getElementsByTagName(xml, 'instance_visual_scene')[0];
			return getVisualScene(parseId(instance.getAttribute('url')));

		}

		function setupAnimations() {

			var clips = library.clips;

			if (isEmpty(clips) === true) {

				if (isEmpty(library.animations) === false) {

					// if there are animations but no clips, we create a default clip for playback

					var tracks = [];

					for (var id in library.animations) {

						var animationTracks = getAnimation(id);

						for (var i = 0, l = animationTracks.length; i < l; i++) {

							tracks.push(animationTracks[i]);

						}

					}

					animations.push(new THREE.AnimationClip('default', - 1, tracks));

				}

			} else {

				for (var id in clips) {

					animations.push(getAnimationClip(id));

				}

			}

		}

		// convert the parser error element into text with each child elements text
		// separated by new lines.

		function parserErrorToText(parserError) {

			var result = '';
			var stack = [parserError];

			while (stack.length) {

				var node = stack.shift();

				if (node.nodeType === Node.TEXT_NODE) {

					result += node.textContent;

				} else {

					result += '\n';
					stack.push.apply(stack, node.childNodes);

				}

			}

			return result.trim();

		}

		if (text.length === 0) {

			return { scene: new THREE.Scene() };

		}

		var xml = new DOMParser().parseFromString(text, 'application/xml');

		var collada = getElementsByTagName(xml, 'COLLADA')[0];

		var parserError = xml.getElementsByTagName('parsererror')[0];
		if (parserError !== undefined) {

			// Chrome will return parser error with a div in it

			var errorElement = getElementsByTagName(parserError, 'div')[0];
			var errorText;

			if (errorElement) {

				errorText = errorElement.textContent;

			} else {

				errorText = parserErrorToText(parserError);

			}

			console.error('THREE.ColladaLoader: Failed to parse collada file.\n', errorText);

			return null;

		}

		// metadata

		var version = collada.getAttribute('version');
		console.log('THREE.ColladaLoader: File version', version);

		var asset = parseAsset(getElementsByTagName(collada, 'asset')[0]);
		var textureLoader = new THREE.TextureLoader(this.manager);
		textureLoader.setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);

		var tgaLoader;

		if (THREE.TGALoader) {

			tgaLoader = new THREE.TGALoader(this.manager);
			tgaLoader.setPath(this.resourcePath || path);

		}

		//

		var animations = [];
		var kinematics = {};
		var count = 0;

		//

		var library = {
			animations: {},
			clips: {},
			controllers: {},
			images: {},
			effects: {},
			materials: {},
			cameras: {},
			lights: {},
			geometries: {},
			nodes: {},
			visualScenes: {},
			kinematicsModels: {},
			physicsModels: {},
			kinematicsScenes: {}
		};

		parseLibrary(collada, 'library_animations', 'animation', parseAnimation);
		parseLibrary(collada, 'library_animation_clips', 'animation_clip', parseAnimationClip);
		parseLibrary(collada, 'library_controllers', 'controller', parseController);
		parseLibrary(collada, 'library_images', 'image', parseImage);
		parseLibrary(collada, 'library_effects', 'effect', parseEffect);
		parseLibrary(collada, 'library_materials', 'material', parseMaterial);
		parseLibrary(collada, 'library_cameras', 'camera', parseCamera);
		parseLibrary(collada, 'library_lights', 'light', parseLight);
		parseLibrary(collada, 'library_geometries', 'geometry', parseGeometry);
		parseLibrary(collada, 'library_nodes', 'node', parseNode);
		parseLibrary(collada, 'library_visual_scenes', 'visual_scene', parseVisualScene);
		parseLibrary(collada, 'library_kinematics_models', 'kinematics_model', parseKinematicsModel);
		parseLibrary(collada, 'library_physics_models', 'physics_model', parsePhysicsModel);
		parseLibrary(collada, 'scene', 'instance_kinematics_scene', parseKinematicsScene);

		buildLibrary(library.animations, buildAnimation);
		buildLibrary(library.clips, buildAnimationClip);
		buildLibrary(library.controllers, buildController);
		buildLibrary(library.images, buildImage);
		buildLibrary(library.effects, buildEffect);
		buildLibrary(library.materials, buildMaterial);
		buildLibrary(library.cameras, buildCamera);
		buildLibrary(library.lights, buildLight);
		buildLibrary(library.geometries, buildGeometry);
		buildLibrary(library.visualScenes, buildVisualScene);

		setupAnimations();
		setupKinematics();

		var scene = parseScene(getElementsByTagName(collada, 'scene')[0]);
		scene.animations = animations;

		if (asset.upAxis === 'Z_UP') {

			scene.quaternion.setFromEuler(new THREE.Euler(- Math.PI / 2, 0, 0));

		}

		scene.scale.multiplyScalar(asset.unit);

		return {
			get animations() {

				console.warn('THREE.ColladaLoader: Please access animations over scene.animations now.');
				return animations;

			},
			kinematics: kinematics,
			library: library,
			scene: scene
		};

	}

});

module.exports = exports = THREE.ColladaLoader;

},{"../../three.js":25}],17:[function(require,module,exports){
const THREE = require('../../three.js');
const fflate = require('../fflate.min.js');

/**co
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Takahiro https://github.com/takahirox
 * @author Lewy Blue https://github.com/looeee
 *
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
 * Versions lower than this may load but will probably have errors
 *
 * Needs Support:
 *  Morph normals / blend shape normals
 *
 * FBX format references:
 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 * 	http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
 *
 * 	Binary format specification:
 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 */


/**
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
 * Versions lower than this may load but will probably have errors
 *
 * Needs Support:
 *  Morph normals / blend shape normals
 *
 * FBX format references:
 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 * 	http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
 *
 * 	Binary format specification:
 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 */


THREE.FBXLoader = (function () {

	var fbxTree;
	var connections;
	var sceneGraph;

	function FBXLoader(manager) {

		THREE.Loader.call(this, manager);

	}

	FBXLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {

		constructor: FBXLoader,

		load: function (url, onLoad, onProgress, onError) {

			var scope = this;

			var path = (scope.path === '') ? THREE.LoaderUtils.extractUrlBase(url) : scope.path;

			var loader = new THREE.FileLoader(this.manager);
			loader.setPath(scope.path);
			loader.setResponseType('arraybuffer');
			loader.setRequestHeader(scope.requestHeader);
			loader.setWithCredentials(scope.withCredentials);

			loader.load(url, function (buffer) {

				try {

					onLoad(scope.parse(buffer, path));

				} catch (e) {

					if (onError) {

						onError(e);

					} else {

						console.error(e);

					}

					scope.manager.itemError(url);

				}

			}, onProgress, onError);

		},

		parse: function (FBXBuffer, path) {

			if (isFbxFormatBinary(FBXBuffer)) {

				fbxTree = new BinaryParser().parse(FBXBuffer);

			} else {

				var FBXText = convertArrayBufferToString(FBXBuffer);

				if (!isFbxFormatASCII(FBXText)) {

					throw new Error('THREE.FBXLoader: Unknown format.');

				}

				if (getFbxVersion(FBXText) < 7000) {

					throw new Error('THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion(FBXText));

				}

				fbxTree = new TextParser().parse(FBXText);

			}

			// console.log( fbxTree );

			var textureLoader = new THREE.TextureLoader(this.manager).setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);

			return new FBXTreeParser(textureLoader, this.manager).parse(fbxTree);

		}

	});

	// Parse the FBXTree object returned by the BinaryParser or TextParser and return a THREE.Group
	function FBXTreeParser(textureLoader, manager) {

		this.textureLoader = textureLoader;
		this.manager = manager;

	}

	FBXTreeParser.prototype = {

		constructor: FBXTreeParser,

		parse: function () {

			connections = this.parseConnections();

			var images = this.parseImages();
			var textures = this.parseTextures(images);
			var materials = this.parseMaterials(textures);
			var deformers = this.parseDeformers();
			var geometryMap = new GeometryParser().parse(deformers);

			this.parseScene(deformers, geometryMap, materials);

			return sceneGraph;

		},

		// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
		// and details the connection type
		parseConnections: function () {

			var connectionMap = new Map();

			if ('Connections' in fbxTree) {

				var rawConnections = fbxTree.Connections.connections;

				rawConnections.forEach(function (rawConnection) {

					var fromID = rawConnection[0];
					var toID = rawConnection[1];
					var relationship = rawConnection[2];

					if (!connectionMap.has(fromID)) {

						connectionMap.set(fromID, {
							parents: [],
							children: []
						});

					}

					var parentRelationship = { ID: toID, relationship: relationship };
					connectionMap.get(fromID).parents.push(parentRelationship);

					if (!connectionMap.has(toID)) {

						connectionMap.set(toID, {
							parents: [],
							children: []
						});

					}

					var childRelationship = { ID: fromID, relationship: relationship };
					connectionMap.get(toID).children.push(childRelationship);

				});

			}

			return connectionMap;

		},

		// Parse FBXTree.Objects.Video for embedded image data
		// These images are connected to textures in FBXTree.Objects.Textures
		// via FBXTree.Connections.
		parseImages: function () {

			var images = {};
			var blobs = {};

			if ('Video' in fbxTree.Objects) {

				var videoNodes = fbxTree.Objects.Video;

				for (var nodeID in videoNodes) {

					var videoNode = videoNodes[nodeID];

					var id = parseInt(nodeID);

					images[id] = videoNode.RelativeFilename || videoNode.Filename;

					// raw image data is in videoNode.Content
					if ('Content' in videoNode) {

						var arrayBufferContent = (videoNode.Content instanceof ArrayBuffer) && (videoNode.Content.byteLength > 0);
						var base64Content = (typeof videoNode.Content === 'string') && (videoNode.Content !== '');

						if (arrayBufferContent || base64Content) {

							var image = this.parseImage(videoNodes[nodeID]);

							blobs[videoNode.RelativeFilename || videoNode.Filename] = image;

						}

					}

				}

			}

			for (var id in images) {

				var filename = images[id];

				if (blobs[filename] !== undefined) images[id] = blobs[filename];
				else images[id] = images[id].split('\\').pop();

			}

			return images;

		},

		// Parse embedded image data in FBXTree.Video.Content
		parseImage: function (videoNode) {

			var content = videoNode.Content;
			var fileName = videoNode.RelativeFilename || videoNode.Filename;
			var extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();

			var type;

			switch (extension) {

				case 'bmp':

					type = 'image/bmp';
					break;

				case 'jpg':
				case 'jpeg':

					type = 'image/jpeg';
					break;

				case 'png':

					type = 'image/png';
					break;

				case 'tif':

					type = 'image/tiff';
					break;

				case 'tga':

					if (this.manager.getHandler('.tga') === null) {

						console.warn('FBXLoader: TGA loader not found, skipping ', fileName);

					}

					type = 'image/tga';
					break;

				default:

					console.warn('FBXLoader: Image type "' + extension + '" is not supported.');
					return;

			}

			if (typeof content === 'string') { // ASCII format

				return 'data:' + type + ';base64,' + content;

			} else { // Binary Format

				var array = new Uint8Array(content);
				return window.URL.createObjectURL(new Blob([array], { type: type }));

			}

		},

		// Parse nodes in FBXTree.Objects.Texture
		// These contain details such as UV scaling, cropping, rotation etc and are connected
		// to images in FBXTree.Objects.Video
		parseTextures: function (images) {

			var textureMap = new Map();

			if ('Texture' in fbxTree.Objects) {

				var textureNodes = fbxTree.Objects.Texture;
				for (var nodeID in textureNodes) {

					var texture = this.parseTexture(textureNodes[nodeID], images);
					textureMap.set(parseInt(nodeID), texture);

				}

			}

			return textureMap;

		},

		// Parse individual node in FBXTree.Objects.Texture
		parseTexture: function (textureNode, images) {

			var texture = this.loadTexture(textureNode, images);

			texture.ID = textureNode.id;

			texture.name = textureNode.attrName;

			var wrapModeU = textureNode.WrapModeU;
			var wrapModeV = textureNode.WrapModeV;

			var valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
			var valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

			// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
			// 0: repeat(default), 1: clamp

			texture.wrapS = valueU === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			texture.wrapT = valueV === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

			if ('Scaling' in textureNode) {

				var values = textureNode.Scaling.value;

				texture.repeat.x = values[0];
				texture.repeat.y = values[1];

			}

			return texture;

		},

		// load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
		loadTexture: function (textureNode, images) {

			var fileName;

			var currentPath = this.textureLoader.path;

			var children = connections.get(textureNode.id).children;

			if (children !== undefined && children.length > 0 && images[children[0].ID] !== undefined) {

				fileName = images[children[0].ID];

				if (fileName.indexOf('blob:') === 0 || fileName.indexOf('data:') === 0) {

					this.textureLoader.setPath(undefined);

				}

			}

			var texture;

			var extension = textureNode.FileName.slice(- 3).toLowerCase();

			if (extension === 'tga') {

				var loader = this.manager.getHandler('.tga');

				if (loader === null) {

					console.warn('FBXLoader: TGA loader not found, creating placeholder texture for', textureNode.RelativeFilename);
					texture = new THREE.Texture();

				} else {

					texture = loader.load(fileName);

				}

			} else if (extension === 'psd') {

				console.warn('FBXLoader: PSD textures are not supported, creating placeholder texture for', textureNode.RelativeFilename);
				texture = new THREE.Texture();

			} else {

				texture = this.textureLoader.load(fileName);

			}

			this.textureLoader.setPath(currentPath);

			return texture;

		},

		// Parse nodes in FBXTree.Objects.Material
		parseMaterials: function (textureMap) {

			var materialMap = new Map();

			if ('Material' in fbxTree.Objects) {

				var materialNodes = fbxTree.Objects.Material;

				for (var nodeID in materialNodes) {

					var material = this.parseMaterial(materialNodes[nodeID], textureMap);

					if (material !== null) materialMap.set(parseInt(nodeID), material);

				}

			}

			return materialMap;

		},

		// Parse single node in FBXTree.Objects.Material
		// Materials are connected to texture maps in FBXTree.Objects.Textures
		// FBX format currently only supports Lambert and Phong shading models
		parseMaterial: function (materialNode, textureMap) {

			var ID = materialNode.id;
			var name = materialNode.attrName;
			var type = materialNode.ShadingModel;

			// Case where FBX wraps shading model in property object.
			if (typeof type === 'object') {

				type = type.value;

			}

			// Ignore unused materials which don't have any connections.
			if (!connections.has(ID)) return null;

			var parameters = this.parseParameters(materialNode, textureMap, ID);

			var material;

			switch (type.toLowerCase()) {

				case 'phong':
					material = new THREE.MeshPhongMaterial();
					break;
				case 'lambert':
					material = new THREE.MeshLambertMaterial();
					break;
				default:
					console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type);
					material = new THREE.MeshPhongMaterial();
					break;

			}

			material.setValues(parameters);
			material.name = name;

			return material;

		},

		// Parse FBX material and return parameters suitable for a three.js material
		// Also parse the texture map and return any textures associated with the material
		parseParameters: function (materialNode, textureMap, ID) {

			var parameters = {};

			if (materialNode.BumpFactor) {

				parameters.bumpScale = materialNode.BumpFactor.value;

			}

			if (materialNode.Diffuse) {

				parameters.color = new THREE.Color().fromArray(materialNode.Diffuse.value);

			} else if (materialNode.DiffuseColor && (materialNode.DiffuseColor.type === 'Color' || materialNode.DiffuseColor.type === 'ColorRGB')) {

				// The blender exporter exports diffuse here instead of in materialNode.Diffuse
				parameters.color = new THREE.Color().fromArray(materialNode.DiffuseColor.value);

			}

			if (materialNode.DisplacementFactor) {

				parameters.displacementScale = materialNode.DisplacementFactor.value;

			}

			if (materialNode.Emissive) {

				parameters.emissive = new THREE.Color().fromArray(materialNode.Emissive.value);

			} else if (materialNode.EmissiveColor && (materialNode.EmissiveColor.type === 'Color' || materialNode.EmissiveColor.type === 'ColorRGB')) {

				// The blender exporter exports emissive color here instead of in materialNode.Emissive
				parameters.emissive = new THREE.Color().fromArray(materialNode.EmissiveColor.value);

			}

			if (materialNode.EmissiveFactor) {

				parameters.emissiveIntensity = parseFloat(materialNode.EmissiveFactor.value);

			}

			if (materialNode.Opacity) {

				parameters.opacity = parseFloat(materialNode.Opacity.value);

			}

			if (parameters.opacity < 1.0) {

				parameters.transparent = true;

			}

			if (materialNode.ReflectionFactor) {

				parameters.reflectivity = materialNode.ReflectionFactor.value;

			}

			if (materialNode.Shininess) {

				parameters.shininess = materialNode.Shininess.value;

			}

			if (materialNode.Specular) {

				parameters.specular = new THREE.Color().fromArray(materialNode.Specular.value);

			} else if (materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color') {

				// The blender exporter exports specular color here instead of in materialNode.Specular
				parameters.specular = new THREE.Color().fromArray(materialNode.SpecularColor.value);

			}

			var scope = this;
			connections.get(ID).children.forEach(function (child) {

				var type = child.relationship;

				switch (type) {

					case 'Bump':
						parameters.bumpMap = scope.getTexture(textureMap, child.ID);
						break;

					case 'Maya|TEX_ao_map':
						parameters.aoMap = scope.getTexture(textureMap, child.ID);
						break;

					case 'DiffuseColor':
					case 'Maya|TEX_color_map':
						parameters.map = scope.getTexture(textureMap, child.ID);
						parameters.map.encoding = THREE.sRGBEncoding;
						break;

					case 'DisplacementColor':
						parameters.displacementMap = scope.getTexture(textureMap, child.ID);
						break;

					case 'EmissiveColor':
						parameters.emissiveMap = scope.getTexture(textureMap, child.ID);
						parameters.emissiveMap.encoding = THREE.sRGBEncoding;
						break;

					case 'NormalMap':
					case 'Maya|TEX_normal_map':
						parameters.normalMap = scope.getTexture(textureMap, child.ID);
						break;

					case 'ReflectionColor':
						parameters.envMap = scope.getTexture(textureMap, child.ID);
						parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
						parameters.envMap.encoding = THREE.sRGBEncoding;
						break;

					case 'SpecularColor':
						parameters.specularMap = scope.getTexture(textureMap, child.ID);
						parameters.specularMap.encoding = THREE.sRGBEncoding;
						break;

					case 'TransparentColor':
					case 'TransparencyFactor':
						parameters.alphaMap = scope.getTexture(textureMap, child.ID);
						parameters.transparent = true;
						break;

					case 'AmbientColor':
					case 'ShininessExponent': // AKA glossiness map
					case 'SpecularFactor': // AKA specularLevel
					case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
					default:
						console.warn('THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type);
						break;

				}

			});

			return parameters;

		},

		// get a texture from the textureMap for use by a material.
		getTexture: function (textureMap, id) {

			// if the texture is a layered texture, just use the first layer and issue a warning
			if ('LayeredTexture' in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture) {

				console.warn('THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.');
				id = connections.get(id).children[0].ID;

			}

			return textureMap.get(id);

		},

		// Parse nodes in FBXTree.Objects.Deformer
		// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
		// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
		parseDeformers: function () {

			var skeletons = {};
			var morphTargets = {};

			if ('Deformer' in fbxTree.Objects) {

				var DeformerNodes = fbxTree.Objects.Deformer;

				for (var nodeID in DeformerNodes) {

					var deformerNode = DeformerNodes[nodeID];

					var relationships = connections.get(parseInt(nodeID));

					if (deformerNode.attrType === 'Skin') {

						var skeleton = this.parseSkeleton(relationships, DeformerNodes);
						skeleton.ID = nodeID;

						if (relationships.parents.length > 1) console.warn('THREE.FBXLoader: skeleton attached to more than one geometry is not supported.');
						skeleton.geometryID = relationships.parents[0].ID;

						skeletons[nodeID] = skeleton;

					} else if (deformerNode.attrType === 'BlendShape') {

						var morphTarget = {
							id: nodeID,
						};

						morphTarget.rawTargets = this.parseMorphTargets(relationships, DeformerNodes);
						morphTarget.id = nodeID;

						if (relationships.parents.length > 1) console.warn('THREE.FBXLoader: morph target attached to more than one geometry is not supported.');

						morphTargets[nodeID] = morphTarget;

					}

				}

			}

			return {

				skeletons: skeletons,
				morphTargets: morphTargets,

			};

		},

		// Parse single nodes in FBXTree.Objects.Deformer
		// The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
		// Each skin node represents a skeleton and each cluster node represents a bone
		parseSkeleton: function (relationships, deformerNodes) {

			var rawBones = [];

			relationships.children.forEach(function (child) {

				var boneNode = deformerNodes[child.ID];

				if (boneNode.attrType !== 'Cluster') return;

				var rawBone = {

					ID: child.ID,
					indices: [],
					weights: [],
					transformLink: new THREE.Matrix4().fromArray(boneNode.TransformLink.a),
					// transform: new THREE.Matrix4().fromArray( boneNode.Transform.a ),
					// linkMode: boneNode.Mode,

				};

				if ('Indexes' in boneNode) {

					rawBone.indices = boneNode.Indexes.a;
					rawBone.weights = boneNode.Weights.a;

				}

				rawBones.push(rawBone);

			});

			return {

				rawBones: rawBones,
				bones: []

			};

		},

		// The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
		parseMorphTargets: function (relationships, deformerNodes) {

			var rawMorphTargets = [];

			for (var i = 0; i < relationships.children.length; i++) {

				var child = relationships.children[i];

				var morphTargetNode = deformerNodes[child.ID];

				var rawMorphTarget = {

					name: morphTargetNode.attrName,
					initialWeight: morphTargetNode.DeformPercent,
					id: morphTargetNode.id,
					fullWeights: morphTargetNode.FullWeights.a

				};

				if (morphTargetNode.attrType !== 'BlendShapeChannel') return;

				rawMorphTarget.geoID = connections.get(parseInt(child.ID)).children.filter(function (child) {

					return child.relationship === undefined;

				})[0].ID;

				rawMorphTargets.push(rawMorphTarget);

			}

			return rawMorphTargets;

		},

		// create the main THREE.Group() to be returned by the loader
		parseScene: function (deformers, geometryMap, materialMap) {

			sceneGraph = new THREE.Group();

			var modelMap = this.parseModels(deformers.skeletons, geometryMap, materialMap);

			var modelNodes = fbxTree.Objects.Model;

			var scope = this;
			modelMap.forEach(function (model) {

				var modelNode = modelNodes[model.ID];
				scope.setLookAtProperties(model, modelNode);

				var parentConnections = connections.get(model.ID).parents;

				parentConnections.forEach(function (connection) {

					var parent = modelMap.get(connection.ID);
					if (parent !== undefined) parent.add(model);

				});

				if (model.parent === null) {

					sceneGraph.add(model);

				}


			});

			this.bindSkeleton(deformers.skeletons, geometryMap, modelMap);

			this.createAmbientLight();

			this.setupMorphMaterials();

			sceneGraph.traverse(function (node) {

				if (node.userData.transformData) {

					if (node.parent) {

						node.userData.transformData.parentMatrix = node.parent.matrix;
						node.userData.transformData.parentMatrixWorld = node.parent.matrixWorld;

					}

					var transform = generateTransform(node.userData.transformData);

					node.applyMatrix4(transform);
					node.updateWorldMatrix();

				}

			});

			var animations = new AnimationParser().parse();

			// if all the models where already combined in a single group, just return that
			if (sceneGraph.children.length === 1 && sceneGraph.children[0].isGroup) {

				sceneGraph.children[0].animations = animations;
				sceneGraph = sceneGraph.children[0];

			}

			sceneGraph.animations = animations;

		},

		// parse nodes in FBXTree.Objects.Model
		parseModels: function (skeletons, geometryMap, materialMap) {

			var modelMap = new Map();
			var modelNodes = fbxTree.Objects.Model;

			for (var nodeID in modelNodes) {

				var id = parseInt(nodeID);
				var node = modelNodes[nodeID];
				var relationships = connections.get(id);

				var model = this.buildSkeleton(relationships, skeletons, id, node.attrName);

				if (!model) {

					switch (node.attrType) {

						case 'Camera':
							model = this.createCamera(relationships);
							break;
						case 'Light':
							model = this.createLight(relationships);
							break;
						case 'Mesh':
							model = this.createMesh(relationships, geometryMap, materialMap);
							break;
						case 'NurbsCurve':
							model = this.createCurve(relationships, geometryMap);
							break;
						case 'LimbNode':
						case 'Root':
							model = new THREE.Bone();
							break;
						case 'Null':
						default:
							model = new THREE.Group();
							break;

					}

					model.name = node.attrName ? THREE.PropertyBinding.sanitizeNodeName(node.attrName) : '';

					model.ID = id;

				}

				this.getTransformData(model, node);
				modelMap.set(id, model);

			}

			return modelMap;

		},

		buildSkeleton: function (relationships, skeletons, id, name) {

			var bone = null;

			relationships.parents.forEach(function (parent) {

				for (var ID in skeletons) {

					var skeleton = skeletons[ID];

					skeleton.rawBones.forEach(function (rawBone, i) {

						if (rawBone.ID === parent.ID) {

							var subBone = bone;
							bone = new THREE.Bone();

							bone.matrixWorld.copy(rawBone.transformLink);

							// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id

							bone.name = name ? THREE.PropertyBinding.sanitizeNodeName(name) : '';
							bone.ID = id;

							skeleton.bones[i] = bone;

							// In cases where a bone is shared between multiple meshes
							// duplicate the bone here and and it as a child of the first bone
							if (subBone !== null) {

								bone.add(subBone);

							}

						}

					});

				}

			});

			return bone;

		},

		// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
		createCamera: function (relationships) {

			var model;
			var cameraAttribute;

			relationships.children.forEach(function (child) {

				var attr = fbxTree.Objects.NodeAttribute[child.ID];

				if (attr !== undefined) {

					cameraAttribute = attr;

				}

			});

			if (cameraAttribute === undefined) {

				model = new THREE.Object3D();

			} else {

				var type = 0;
				if (cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1) {

					type = 1;

				}

				var nearClippingPlane = 1;
				if (cameraAttribute.NearPlane !== undefined) {

					nearClippingPlane = cameraAttribute.NearPlane.value / 1000;

				}

				var farClippingPlane = 1000;
				if (cameraAttribute.FarPlane !== undefined) {

					farClippingPlane = cameraAttribute.FarPlane.value / 1000;

				}


				var width = window.innerWidth;
				var height = window.innerHeight;

				if (cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined) {

					width = cameraAttribute.AspectWidth.value;
					height = cameraAttribute.AspectHeight.value;

				}

				var aspect = width / height;

				var fov = 45;
				if (cameraAttribute.FieldOfView !== undefined) {

					fov = cameraAttribute.FieldOfView.value;

				}

				var focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

				switch (type) {

					case 0: // Perspective
						model = new THREE.PerspectiveCamera(fov, aspect, nearClippingPlane, farClippingPlane);
						if (focalLength !== null) model.setFocalLength(focalLength);
						break;

					case 1: // Orthographic
						model = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, nearClippingPlane, farClippingPlane);
						break;

					default:
						console.warn('THREE.FBXLoader: Unknown camera type ' + type + '.');
						model = new THREE.Object3D();
						break;

				}

			}

			return model;

		},

		// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
		createLight: function (relationships) {

			var model;
			var lightAttribute;

			relationships.children.forEach(function (child) {

				var attr = fbxTree.Objects.NodeAttribute[child.ID];

				if (attr !== undefined) {

					lightAttribute = attr;

				}

			});

			if (lightAttribute === undefined) {

				model = new THREE.Object3D();

			} else {

				var type;

				// LightType can be undefined for Point lights
				if (lightAttribute.LightType === undefined) {

					type = 0;

				} else {

					type = lightAttribute.LightType.value;

				}

				var color = 0xffffff;

				if (lightAttribute.Color !== undefined) {

					color = new THREE.Color().fromArray(lightAttribute.Color.value);

				}

				var intensity = (lightAttribute.Intensity === undefined) ? 1 : lightAttribute.Intensity.value / 100;

				// light disabled
				if (lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0) {

					intensity = 0;

				}

				var distance = 0;
				if (lightAttribute.FarAttenuationEnd !== undefined) {

					if (lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0) {

						distance = 0;

					} else {

						distance = lightAttribute.FarAttenuationEnd.value;

					}

				}

				// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
				var decay = 1;

				switch (type) {

					case 0: // Point
						model = new THREE.PointLight(color, intensity, distance, decay);
						break;

					case 1: // Directional
						model = new THREE.DirectionalLight(color, intensity);
						break;

					case 2: // Spot
						var angle = Math.PI / 3;

						if (lightAttribute.InnerAngle !== undefined) {

							angle = THREE.MathUtils.degToRad(lightAttribute.InnerAngle.value);

						}

						var penumbra = 0;
						if (lightAttribute.OuterAngle !== undefined) {

							// TODO: this is not correct - FBX calculates outer and inner angle in degrees
							// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
							// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
							penumbra = THREE.MathUtils.degToRad(lightAttribute.OuterAngle.value);
							penumbra = Math.max(penumbra, 1);

						}

						model = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
						break;

					default:
						console.warn('THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a THREE.PointLight.');
						model = new THREE.PointLight(color, intensity);
						break;

				}

				if (lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1) {

					model.castShadow = true;

				}

			}

			return model;

		},

		createMesh: function (relationships, geometryMap, materialMap) {

			var model;
			var geometry = null;
			var material = null;
			var materials = [];

			// get geometry and materials(s) from connections
			relationships.children.forEach(function (child) {

				if (geometryMap.has(child.ID)) {

					geometry = geometryMap.get(child.ID);

				}

				if (materialMap.has(child.ID)) {

					materials.push(materialMap.get(child.ID));

				}

			});

			if (materials.length > 1) {

				material = materials;

			} else if (materials.length > 0) {

				material = materials[0];

			} else {

				material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
				materials.push(material);

			}

			if ('color' in geometry.attributes) {

				materials.forEach(function (material) {

					material.vertexColors = true;

				});

			}

			if (geometry.FBX_Deformer) {

				materials.forEach(function (material) {

					material.skinning = true;

				});

				model = new THREE.SkinnedMesh(geometry, material);
				model.normalizeSkinWeights();

			} else {

				model = new THREE.Mesh(geometry, material);

			}

			return model;

		},

		createCurve: function (relationships, geometryMap) {

			var geometry = relationships.children.reduce(function (geo, child) {

				if (geometryMap.has(child.ID)) geo = geometryMap.get(child.ID);

				return geo;

			}, null);

			// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
			var material = new THREE.LineBasicMaterial({ color: 0x3300ff, linewidth: 1 });
			return new THREE.Line(geometry, material);

		},

		// parse the model node for transform data
		getTransformData: function (model, modelNode) {

			var transformData = {};

			if ('InheritType' in modelNode) transformData.inheritType = parseInt(modelNode.InheritType.value);

			if ('RotationOrder' in modelNode) transformData.eulerOrder = getEulerOrder(modelNode.RotationOrder.value);
			else transformData.eulerOrder = 'ZYX';

			if ('Lcl_Translation' in modelNode) transformData.translation = modelNode.Lcl_Translation.value;

			if ('PreRotation' in modelNode) transformData.preRotation = modelNode.PreRotation.value;
			if ('Lcl_Rotation' in modelNode) transformData.rotation = modelNode.Lcl_Rotation.value;
			if ('PostRotation' in modelNode) transformData.postRotation = modelNode.PostRotation.value;

			if ('Lcl_Scaling' in modelNode) transformData.scale = modelNode.Lcl_Scaling.value;

			if ('ScalingOffset' in modelNode) transformData.scalingOffset = modelNode.ScalingOffset.value;
			if ('ScalingPivot' in modelNode) transformData.scalingPivot = modelNode.ScalingPivot.value;

			if ('RotationOffset' in modelNode) transformData.rotationOffset = modelNode.RotationOffset.value;
			if ('RotationPivot' in modelNode) transformData.rotationPivot = modelNode.RotationPivot.value;

			model.userData.transformData = transformData;

		},

		setLookAtProperties: function (model, modelNode) {

			if ('LookAtProperty' in modelNode) {

				var children = connections.get(model.ID).children;

				children.forEach(function (child) {

					if (child.relationship === 'LookAtProperty') {

						var lookAtTarget = fbxTree.Objects.Model[child.ID];

						if ('Lcl_Translation' in lookAtTarget) {

							var pos = lookAtTarget.Lcl_Translation.value;

							// DirectionalLight, SpotLight
							if (model.target !== undefined) {

								model.target.position.fromArray(pos);
								sceneGraph.add(model.target);

							} else { // Cameras and other Object3Ds

								model.lookAt(new THREE.Vector3().fromArray(pos));

							}

						}

					}

				});

			}

		},

		bindSkeleton: function (skeletons, geometryMap, modelMap) {

			var bindMatrices = this.parsePoseNodes();

			for (var ID in skeletons) {

				var skeleton = skeletons[ID];

				var parents = connections.get(parseInt(skeleton.ID)).parents;

				parents.forEach(function (parent) {

					if (geometryMap.has(parent.ID)) {

						var geoID = parent.ID;
						var geoRelationships = connections.get(geoID);

						geoRelationships.parents.forEach(function (geoConnParent) {

							if (modelMap.has(geoConnParent.ID)) {

								var model = modelMap.get(geoConnParent.ID);

								model.bind(new THREE.Skeleton(skeleton.bones), bindMatrices[geoConnParent.ID]);

							}

						});

					}

				});

			}

		},

		parsePoseNodes: function () {

			var bindMatrices = {};

			if ('Pose' in fbxTree.Objects) {

				var BindPoseNode = fbxTree.Objects.Pose;

				for (var nodeID in BindPoseNode) {

					if (BindPoseNode[nodeID].attrType === 'BindPose') {

						var poseNodes = BindPoseNode[nodeID].PoseNode;

						if (Array.isArray(poseNodes)) {

							poseNodes.forEach(function (poseNode) {

								bindMatrices[poseNode.Node] = new THREE.Matrix4().fromArray(poseNode.Matrix.a);

							});

						} else {

							bindMatrices[poseNodes.Node] = new THREE.Matrix4().fromArray(poseNodes.Matrix.a);

						}

					}

				}

			}

			return bindMatrices;

		},

		// Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
		createAmbientLight: function () {

			if ('GlobalSettings' in fbxTree && 'AmbientColor' in fbxTree.GlobalSettings) {

				var ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
				var r = ambientColor[0];
				var g = ambientColor[1];
				var b = ambientColor[2];

				if (r !== 0 || g !== 0 || b !== 0) {

					var color = new THREE.Color(r, g, b);
					sceneGraph.add(new THREE.AmbientLight(color, 1));

				}

			}

		},

		setupMorphMaterials: function () {

			var scope = this;
			sceneGraph.traverse(function (child) {

				if (child.isMesh) {

					if (child.geometry.morphAttributes.position && child.geometry.morphAttributes.position.length) {

						if (Array.isArray(child.material)) {

							child.material.forEach(function (material, i) {

								scope.setupMorphMaterial(child, material, i);

							});

						} else {

							scope.setupMorphMaterial(child, child.material);

						}

					}

				}

			});

		},

		setupMorphMaterial: function (child, material, index) {

			var uuid = child.uuid;
			var matUuid = material.uuid;

			// if a geometry has morph targets, it cannot share the material with other geometries
			var sharedMat = false;

			sceneGraph.traverse(function (node) {

				if (node.isMesh) {

					if (Array.isArray(node.material)) {

						node.material.forEach(function (mat) {

							if (mat.uuid === matUuid && node.uuid !== uuid) sharedMat = true;

						});

					} else if (node.material.uuid === matUuid && node.uuid !== uuid) sharedMat = true;

				}

			});

			if (sharedMat === true) {

				var clonedMat = material.clone();
				clonedMat.morphTargets = true;

				if (index === undefined) child.material = clonedMat;
				else child.material[index] = clonedMat;

			} else material.morphTargets = true;

		}

	};

	// parse Geometry data from FBXTree and return map of BufferGeometries
	function GeometryParser() { }

	GeometryParser.prototype = {

		constructor: GeometryParser,

		// Parse nodes in FBXTree.Objects.Geometry
		parse: function (deformers) {

			var geometryMap = new Map();

			if ('Geometry' in fbxTree.Objects) {

				var geoNodes = fbxTree.Objects.Geometry;

				for (var nodeID in geoNodes) {

					var relationships = connections.get(parseInt(nodeID));
					var geo = this.parseGeometry(relationships, geoNodes[nodeID], deformers);

					geometryMap.set(parseInt(nodeID), geo);

				}

			}

			return geometryMap;

		},

		// Parse single node in FBXTree.Objects.Geometry
		parseGeometry: function (relationships, geoNode, deformers) {

			switch (geoNode.attrType) {

				case 'Mesh':
					return this.parseMeshGeometry(relationships, geoNode, deformers);
					break;

				case 'NurbsCurve':
					return this.parseNurbsGeometry(geoNode);
					break;

			}

		},


		// Parse single node mesh geometry in FBXTree.Objects.Geometry
		parseMeshGeometry: function (relationships, geoNode, deformers) {

			var skeletons = deformers.skeletons;
			var morphTargets = [];

			var modelNodes = relationships.parents.map(function (parent) {

				return fbxTree.Objects.Model[parent.ID];

			});

			// don't create geometry if it is not associated with any models
			if (modelNodes.length === 0) return;

			var skeleton = relationships.children.reduce(function (skeleton, child) {

				if (skeletons[child.ID] !== undefined) skeleton = skeletons[child.ID];

				return skeleton;

			}, null);

			relationships.children.forEach(function (child) {

				if (deformers.morphTargets[child.ID] !== undefined) {

					morphTargets.push(deformers.morphTargets[child.ID]);

				}

			});

			// Assume one model and get the preRotation from that
			// if there is more than one model associated with the geometry this may cause problems
			var modelNode = modelNodes[0];

			var transformData = {};

			if ('RotationOrder' in modelNode) transformData.eulerOrder = getEulerOrder(modelNode.RotationOrder.value);
			if ('InheritType' in modelNode) transformData.inheritType = parseInt(modelNode.InheritType.value);

			if ('GeometricTranslation' in modelNode) transformData.translation = modelNode.GeometricTranslation.value;
			if ('GeometricRotation' in modelNode) transformData.rotation = modelNode.GeometricRotation.value;
			if ('GeometricScaling' in modelNode) transformData.scale = modelNode.GeometricScaling.value;

			var transform = generateTransform(transformData);

			return this.genGeometry(geoNode, skeleton, morphTargets, transform);

		},

		// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
		genGeometry: function (geoNode, skeleton, morphTargets, preTransform) {

			var geo = new THREE.BufferGeometry();
			if (geoNode.attrName) geo.name = geoNode.attrName;

			var geoInfo = this.parseGeoNode(geoNode, skeleton);
			var buffers = this.genBuffers(geoInfo);

			var positionAttribute = new THREE.Float32BufferAttribute(buffers.vertex, 3);

			positionAttribute.applyMatrix4(preTransform);

			geo.setAttribute('position', positionAttribute);

			if (buffers.colors.length > 0) {

				geo.setAttribute('color', new THREE.Float32BufferAttribute(buffers.colors, 3));

			}

			if (skeleton) {

				geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(buffers.weightsIndices, 4));

				geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(buffers.vertexWeights, 4));

				// used later to bind the skeleton to the model
				geo.FBX_Deformer = skeleton;

			}

			if (buffers.normal.length > 0) {

				var normalMatrix = new THREE.Matrix3().getNormalMatrix(preTransform);

				var normalAttribute = new THREE.Float32BufferAttribute(buffers.normal, 3);
				normalAttribute.applyNormalMatrix(normalMatrix);

				geo.setAttribute('normal', normalAttribute);

			}

			buffers.uvs.forEach(function (uvBuffer, i) {

				// subsequent uv buffers are called 'uv1', 'uv2', ...
				var name = 'uv' + (i + 1).toString();

				// the first uv buffer is just called 'uv'
				if (i === 0) {

					name = 'uv';

				}

				geo.setAttribute(name, new THREE.Float32BufferAttribute(buffers.uvs[i], 2));

			});

			if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {

				// Convert the material indices of each vertex into rendering groups on the geometry.
				var prevMaterialIndex = buffers.materialIndex[0];
				var startIndex = 0;

				buffers.materialIndex.forEach(function (currentIndex, i) {

					if (currentIndex !== prevMaterialIndex) {

						geo.addGroup(startIndex, i - startIndex, prevMaterialIndex);

						prevMaterialIndex = currentIndex;
						startIndex = i;

					}

				});

				// the loop above doesn't add the last group, do that here.
				if (geo.groups.length > 0) {

					var lastGroup = geo.groups[geo.groups.length - 1];
					var lastIndex = lastGroup.start + lastGroup.count;

					if (lastIndex !== buffers.materialIndex.length) {

						geo.addGroup(lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex);

					}

				}

				// case where there are multiple materials but the whole geometry is only
				// using one of them
				if (geo.groups.length === 0) {

					geo.addGroup(0, buffers.materialIndex.length, buffers.materialIndex[0]);

				}

			}

			this.addMorphTargets(geo, geoNode, morphTargets, preTransform);

			return geo;

		},

		parseGeoNode: function (geoNode, skeleton) {

			var geoInfo = {};

			geoInfo.vertexPositions = (geoNode.Vertices !== undefined) ? geoNode.Vertices.a : [];
			geoInfo.vertexIndices = (geoNode.PolygonVertexIndex !== undefined) ? geoNode.PolygonVertexIndex.a : [];

			if (geoNode.LayerElementColor) {

				geoInfo.color = this.parseVertexColors(geoNode.LayerElementColor[0]);

			}

			if (geoNode.LayerElementMaterial) {

				geoInfo.material = this.parseMaterialIndices(geoNode.LayerElementMaterial[0]);

			}

			if (geoNode.LayerElementNormal) {

				geoInfo.normal = this.parseNormals(geoNode.LayerElementNormal[0]);

			}

			if (geoNode.LayerElementUV) {

				geoInfo.uv = [];

				var i = 0;
				while (geoNode.LayerElementUV[i]) {

					if (geoNode.LayerElementUV[i].UV) {

						geoInfo.uv.push(this.parseUVs(geoNode.LayerElementUV[i]));

					}

					i++;

				}

			}

			geoInfo.weightTable = {};

			if (skeleton !== null) {

				geoInfo.skeleton = skeleton;

				skeleton.rawBones.forEach(function (rawBone, i) {

					// loop over the bone's vertex indices and weights
					rawBone.indices.forEach(function (index, j) {

						if (geoInfo.weightTable[index] === undefined) geoInfo.weightTable[index] = [];

						geoInfo.weightTable[index].push({

							id: i,
							weight: rawBone.weights[j],

						});

					});

				});

			}

			return geoInfo;

		},

		genBuffers: function (geoInfo) {

			var buffers = {
				vertex: [],
				normal: [],
				colors: [],
				uvs: [],
				materialIndex: [],
				vertexWeights: [],
				weightsIndices: [],
			};

			var polygonIndex = 0;
			var faceLength = 0;
			var displayedWeightsWarning = false;

			// these will hold data for a single face
			var facePositionIndexes = [];
			var faceNormals = [];
			var faceColors = [];
			var faceUVs = [];
			var faceWeights = [];
			var faceWeightIndices = [];

			var scope = this;
			geoInfo.vertexIndices.forEach(function (vertexIndex, polygonVertexIndex) {

				var endOfFace = false;

				// Face index and vertex index arrays are combined in a single array
				// A cube with quad faces looks like this:
				// PolygonVertexIndex: *24 {
				//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
				//  }
				// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
				// to find index of last vertex bit shift the index: ^ - 1
				if (vertexIndex < 0) {

					vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
					endOfFace = true;

				}

				var weightIndices = [];
				var weights = [];

				facePositionIndexes.push(vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2);

				if (geoInfo.color) {

					var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color);

					faceColors.push(data[0], data[1], data[2]);

				}

				if (geoInfo.skeleton) {

					if (geoInfo.weightTable[vertexIndex] !== undefined) {

						geoInfo.weightTable[vertexIndex].forEach(function (wt) {

							weights.push(wt.weight);
							weightIndices.push(wt.id);

						});


					}

					if (weights.length > 4) {

						if (!displayedWeightsWarning) {

							console.warn('THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.');
							displayedWeightsWarning = true;

						}

						var wIndex = [0, 0, 0, 0];
						var Weight = [0, 0, 0, 0];

						weights.forEach(function (weight, weightIndex) {

							var currentWeight = weight;
							var currentIndex = weightIndices[weightIndex];

							Weight.forEach(function (comparedWeight, comparedWeightIndex, comparedWeightArray) {

								if (currentWeight > comparedWeight) {

									comparedWeightArray[comparedWeightIndex] = currentWeight;
									currentWeight = comparedWeight;

									var tmp = wIndex[comparedWeightIndex];
									wIndex[comparedWeightIndex] = currentIndex;
									currentIndex = tmp;

								}

							});

						});

						weightIndices = wIndex;
						weights = Weight;

					}

					// if the weight array is shorter than 4 pad with 0s
					while (weights.length < 4) {

						weights.push(0);
						weightIndices.push(0);

					}

					for (var i = 0; i < 4; ++i) {

						faceWeights.push(weights[i]);
						faceWeightIndices.push(weightIndices[i]);

					}

				}

				if (geoInfo.normal) {

					var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal);

					faceNormals.push(data[0], data[1], data[2]);

				}

				if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {

					var materialIndex = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material)[0];

				}

				if (geoInfo.uv) {

					geoInfo.uv.forEach(function (uv, i) {

						var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, uv);

						if (faceUVs[i] === undefined) {

							faceUVs[i] = [];

						}

						faceUVs[i].push(data[0]);
						faceUVs[i].push(data[1]);

					});

				}

				faceLength++;

				if (endOfFace) {

					scope.genFace(buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength);

					polygonIndex++;
					faceLength = 0;

					// reset arrays for the next face
					facePositionIndexes = [];
					faceNormals = [];
					faceColors = [];
					faceUVs = [];
					faceWeights = [];
					faceWeightIndices = [];

				}

			});

			return buffers;

		},

		// Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
		genFace: function (buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength) {

			for (var i = 2; i < faceLength; i++) {

				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[0]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[1]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[2]]);

				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 1]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 2]]);

				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 1]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 2]]);

				if (geoInfo.skeleton) {

					buffers.vertexWeights.push(faceWeights[0]);
					buffers.vertexWeights.push(faceWeights[1]);
					buffers.vertexWeights.push(faceWeights[2]);
					buffers.vertexWeights.push(faceWeights[3]);

					buffers.vertexWeights.push(faceWeights[(i - 1) * 4]);
					buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 1]);
					buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 2]);
					buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 3]);

					buffers.vertexWeights.push(faceWeights[i * 4]);
					buffers.vertexWeights.push(faceWeights[i * 4 + 1]);
					buffers.vertexWeights.push(faceWeights[i * 4 + 2]);
					buffers.vertexWeights.push(faceWeights[i * 4 + 3]);

					buffers.weightsIndices.push(faceWeightIndices[0]);
					buffers.weightsIndices.push(faceWeightIndices[1]);
					buffers.weightsIndices.push(faceWeightIndices[2]);
					buffers.weightsIndices.push(faceWeightIndices[3]);

					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4]);
					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 1]);
					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 2]);
					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 3]);

					buffers.weightsIndices.push(faceWeightIndices[i * 4]);
					buffers.weightsIndices.push(faceWeightIndices[i * 4 + 1]);
					buffers.weightsIndices.push(faceWeightIndices[i * 4 + 2]);
					buffers.weightsIndices.push(faceWeightIndices[i * 4 + 3]);

				}

				if (geoInfo.color) {

					buffers.colors.push(faceColors[0]);
					buffers.colors.push(faceColors[1]);
					buffers.colors.push(faceColors[2]);

					buffers.colors.push(faceColors[(i - 1) * 3]);
					buffers.colors.push(faceColors[(i - 1) * 3 + 1]);
					buffers.colors.push(faceColors[(i - 1) * 3 + 2]);

					buffers.colors.push(faceColors[i * 3]);
					buffers.colors.push(faceColors[i * 3 + 1]);
					buffers.colors.push(faceColors[i * 3 + 2]);

				}

				if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {

					buffers.materialIndex.push(materialIndex);
					buffers.materialIndex.push(materialIndex);
					buffers.materialIndex.push(materialIndex);

				}

				if (geoInfo.normal) {

					buffers.normal.push(faceNormals[0]);
					buffers.normal.push(faceNormals[1]);
					buffers.normal.push(faceNormals[2]);

					buffers.normal.push(faceNormals[(i - 1) * 3]);
					buffers.normal.push(faceNormals[(i - 1) * 3 + 1]);
					buffers.normal.push(faceNormals[(i - 1) * 3 + 2]);

					buffers.normal.push(faceNormals[i * 3]);
					buffers.normal.push(faceNormals[i * 3 + 1]);
					buffers.normal.push(faceNormals[i * 3 + 2]);

				}

				if (geoInfo.uv) {

					geoInfo.uv.forEach(function (uv, j) {

						if (buffers.uvs[j] === undefined) buffers.uvs[j] = [];

						buffers.uvs[j].push(faceUVs[j][0]);
						buffers.uvs[j].push(faceUVs[j][1]);

						buffers.uvs[j].push(faceUVs[j][(i - 1) * 2]);
						buffers.uvs[j].push(faceUVs[j][(i - 1) * 2 + 1]);

						buffers.uvs[j].push(faceUVs[j][i * 2]);
						buffers.uvs[j].push(faceUVs[j][i * 2 + 1]);

					});

				}

			}

		},

		addMorphTargets: function (parentGeo, parentGeoNode, morphTargets, preTransform) {

			if (morphTargets.length === 0) return;

			parentGeo.morphTargetsRelative = true;

			parentGeo.morphAttributes.position = [];
			// parentGeo.morphAttributes.normal = []; // not implemented

			var scope = this;
			morphTargets.forEach(function (morphTarget) {

				morphTarget.rawTargets.forEach(function (rawTarget) {

					var morphGeoNode = fbxTree.Objects.Geometry[rawTarget.geoID];

					if (morphGeoNode !== undefined) {

						scope.genMorphGeometry(parentGeo, parentGeoNode, morphGeoNode, preTransform, rawTarget.name);

					}

				});

			});

		},

		// a morph geometry node is similar to a standard  node, and the node is also contained
		// in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
		// and a special attribute Index defining which vertices of the original geometry are affected
		// Normal and position attributes only have data for the vertices that are affected by the morph
		genMorphGeometry: function (parentGeo, parentGeoNode, morphGeoNode, preTransform, name) {

			var vertexIndices = (parentGeoNode.PolygonVertexIndex !== undefined) ? parentGeoNode.PolygonVertexIndex.a : [];

			var morphPositionsSparse = (morphGeoNode.Vertices !== undefined) ? morphGeoNode.Vertices.a : [];
			var indices = (morphGeoNode.Indexes !== undefined) ? morphGeoNode.Indexes.a : [];

			var length = parentGeo.attributes.position.count * 3;
			var morphPositions = new Float32Array(length);

			for (var i = 0; i < indices.length; i++) {

				var morphIndex = indices[i] * 3;

				morphPositions[morphIndex] = morphPositionsSparse[i * 3];
				morphPositions[morphIndex + 1] = morphPositionsSparse[i * 3 + 1];
				morphPositions[morphIndex + 2] = morphPositionsSparse[i * 3 + 2];

			}

			// TODO: add morph normal support
			var morphGeoInfo = {
				vertexIndices: vertexIndices,
				vertexPositions: morphPositions,

			};

			var morphBuffers = this.genBuffers(morphGeoInfo);

			var positionAttribute = new THREE.Float32BufferAttribute(morphBuffers.vertex, 3);
			positionAttribute.name = name || morphGeoNode.attrName;

			positionAttribute.applyMatrix4(preTransform);

			parentGeo.morphAttributes.position.push(positionAttribute);

		},

		// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
		parseNormals: function (NormalNode) {

			var mappingType = NormalNode.MappingInformationType;
			var referenceType = NormalNode.ReferenceInformationType;
			var buffer = NormalNode.Normals.a;
			var indexBuffer = [];
			if (referenceType === 'IndexToDirect') {

				if ('NormalIndex' in NormalNode) {

					indexBuffer = NormalNode.NormalIndex.a;

				} else if ('NormalsIndex' in NormalNode) {

					indexBuffer = NormalNode.NormalsIndex.a;

				}

			}

			return {
				dataSize: 3,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
		parseUVs: function (UVNode) {

			var mappingType = UVNode.MappingInformationType;
			var referenceType = UVNode.ReferenceInformationType;
			var buffer = UVNode.UV.a;
			var indexBuffer = [];
			if (referenceType === 'IndexToDirect') {

				indexBuffer = UVNode.UVIndex.a;

			}

			return {
				dataSize: 2,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
		parseVertexColors: function (ColorNode) {

			var mappingType = ColorNode.MappingInformationType;
			var referenceType = ColorNode.ReferenceInformationType;
			var buffer = ColorNode.Colors.a;
			var indexBuffer = [];
			if (referenceType === 'IndexToDirect') {

				indexBuffer = ColorNode.ColorIndex.a;

			}

			return {
				dataSize: 4,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
		parseMaterialIndices: function (MaterialNode) {

			var mappingType = MaterialNode.MappingInformationType;
			var referenceType = MaterialNode.ReferenceInformationType;

			if (mappingType === 'NoMappingInformation') {

				return {
					dataSize: 1,
					buffer: [0],
					indices: [0],
					mappingType: 'AllSame',
					referenceType: referenceType
				};

			}

			var materialIndexBuffer = MaterialNode.Materials.a;

			// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
			// we expect.So we create an intermediate buffer that points to the index in the buffer,
			// for conforming with the other functions we've written for other data.
			var materialIndices = [];

			for (var i = 0; i < materialIndexBuffer.length; ++i) {

				materialIndices.push(i);

			}

			return {
				dataSize: 1,
				buffer: materialIndexBuffer,
				indices: materialIndices,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
		parseNurbsGeometry: function (geoNode) {

			if (THREE.NURBSCurve === undefined) {

				console.error('THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.');
				return new THREE.BufferGeometry();

			}

			var order = parseInt(geoNode.Order);

			if (isNaN(order)) {

				console.error('THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id);
				return new THREE.BufferGeometry();

			}

			var degree = order - 1;

			var knots = geoNode.KnotVector.a;
			var controlPoints = [];
			var pointsValues = geoNode.Points.a;

			for (var i = 0, l = pointsValues.length; i < l; i += 4) {

				controlPoints.push(new THREE.Vector4().fromArray(pointsValues, i));

			}

			var startKnot, endKnot;

			if (geoNode.Form === 'Closed') {

				controlPoints.push(controlPoints[0]);

			} else if (geoNode.Form === 'Periodic') {

				startKnot = degree;
				endKnot = knots.length - 1 - startKnot;

				for (var i = 0; i < degree; ++i) {

					controlPoints.push(controlPoints[i]);

				}

			}

			var curve = new THREE.NURBSCurve(degree, knots, controlPoints, startKnot, endKnot);
			var vertices = curve.getPoints(controlPoints.length * 7);

			var positions = new Float32Array(vertices.length * 3);

			vertices.forEach(function (vertex, i) {

				vertex.toArray(positions, i * 3);

			});

			var geometry = new THREE.BufferGeometry();
			geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

			return geometry;

		},

	};

	// parse animation data from FBXTree
	function AnimationParser() { }

	AnimationParser.prototype = {

		constructor: AnimationParser,

		// take raw animation clips and turn them into three.js animation clips
		parse: function () {

			var animationClips = [];

			var rawClips = this.parseClips();

			if (rawClips !== undefined) {

				for (var key in rawClips) {

					var rawClip = rawClips[key];

					var clip = this.addClip(rawClip);

					animationClips.push(clip);

				}

			}

			return animationClips;

		},

		parseClips: function () {

			// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
			// if this is undefined we can safely assume there are no animations
			if (fbxTree.Objects.AnimationCurve === undefined) return undefined;

			var curveNodesMap = this.parseAnimationCurveNodes();

			this.parseAnimationCurves(curveNodesMap);

			var layersMap = this.parseAnimationLayers(curveNodesMap);
			var rawClips = this.parseAnimStacks(layersMap);

			return rawClips;

		},

		// parse nodes in FBXTree.Objects.AnimationCurveNode
		// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
		// and is referenced by an AnimationLayer
		parseAnimationCurveNodes: function () {

			var rawCurveNodes = fbxTree.Objects.AnimationCurveNode;

			var curveNodesMap = new Map();

			for (var nodeID in rawCurveNodes) {

				var rawCurveNode = rawCurveNodes[nodeID];

				if (rawCurveNode.attrName.match(/S|R|T|DeformPercent/) !== null) {

					var curveNode = {

						id: rawCurveNode.id,
						attr: rawCurveNode.attrName,
						curves: {},

					};

					curveNodesMap.set(curveNode.id, curveNode);

				}

			}

			return curveNodesMap;

		},

		// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
		// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
		// axis ( e.g. times and values of x rotation)
		parseAnimationCurves: function (curveNodesMap) {

			var rawCurves = fbxTree.Objects.AnimationCurve;

			// TODO: Many values are identical up to roundoff error, but won't be optimised
			// e.g. position times: [0, 0.4, 0. 8]
			// position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
			// clearly, this should be optimised to
			// times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
			// this shows up in nearly every FBX file, and generally time array is length > 100

			for (var nodeID in rawCurves) {

				var animationCurve = {

					id: rawCurves[nodeID].id,
					times: rawCurves[nodeID].KeyTime.a.map(convertFBXTimeToSeconds),
					values: rawCurves[nodeID].KeyValueFloat.a,

				};

				var relationships = connections.get(animationCurve.id);

				if (relationships !== undefined) {

					var animationCurveID = relationships.parents[0].ID;
					var animationCurveRelationship = relationships.parents[0].relationship;

					if (animationCurveRelationship.match(/X/)) {

						curveNodesMap.get(animationCurveID).curves['x'] = animationCurve;

					} else if (animationCurveRelationship.match(/Y/)) {

						curveNodesMap.get(animationCurveID).curves['y'] = animationCurve;

					} else if (animationCurveRelationship.match(/Z/)) {

						curveNodesMap.get(animationCurveID).curves['z'] = animationCurve;

					} else if (animationCurveRelationship.match(/d|DeformPercent/) && curveNodesMap.has(animationCurveID)) {

						curveNodesMap.get(animationCurveID).curves['morph'] = animationCurve;

					}

				}

			}

		},

		// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
		// to various AnimationCurveNodes and is referenced by an AnimationStack node
		// note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
		parseAnimationLayers: function (curveNodesMap) {

			var rawLayers = fbxTree.Objects.AnimationLayer;

			var layersMap = new Map();

			for (var nodeID in rawLayers) {

				var layerCurveNodes = [];

				var connection = connections.get(parseInt(nodeID));

				if (connection !== undefined) {

					// all the animationCurveNodes used in the layer
					var children = connection.children;

					children.forEach(function (child, i) {

						if (curveNodesMap.has(child.ID)) {

							var curveNode = curveNodesMap.get(child.ID);

							// check that the curves are defined for at least one axis, otherwise ignore the curveNode
							if (curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined) {

								if (layerCurveNodes[i] === undefined) {

									var modelID = connections.get(child.ID).parents.filter(function (parent) {

										return parent.relationship !== undefined;

									})[0].ID;

									if (modelID !== undefined) {

										var rawModel = fbxTree.Objects.Model[modelID.toString()];

										if (rawModel === undefined) {

											console.warn('THREE.FBXLoader: Encountered a unused curve.', child);
											return;

										}

										var node = {

											modelName: rawModel.attrName ? THREE.PropertyBinding.sanitizeNodeName(rawModel.attrName) : '',
											ID: rawModel.id,
											initialPosition: [0, 0, 0],
											initialRotation: [0, 0, 0],
											initialScale: [1, 1, 1],

										};

										sceneGraph.traverse(function (child) {

											if (child.ID === rawModel.id) {

												node.transform = child.matrix;

												if (child.userData.transformData) node.eulerOrder = child.userData.transformData.eulerOrder;

											}

										});

										if (!node.transform) node.transform = new THREE.Matrix4();

										// if the animated model is pre rotated, we'll have to apply the pre rotations to every
										// animation value as well
										if ('PreRotation' in rawModel) node.preRotation = rawModel.PreRotation.value;
										if ('PostRotation' in rawModel) node.postRotation = rawModel.PostRotation.value;

										layerCurveNodes[i] = node;

									}

								}

								if (layerCurveNodes[i]) layerCurveNodes[i][curveNode.attr] = curveNode;

							} else if (curveNode.curves.morph !== undefined) {

								if (layerCurveNodes[i] === undefined) {

									var deformerID = connections.get(child.ID).parents.filter(function (parent) {

										return parent.relationship !== undefined;

									})[0].ID;

									var morpherID = connections.get(deformerID).parents[0].ID;
									var geoID = connections.get(morpherID).parents[0].ID;

									// assuming geometry is not used in more than one model
									var modelID = connections.get(geoID).parents[0].ID;

									var rawModel = fbxTree.Objects.Model[modelID];

									var node = {

										modelName: rawModel.attrName ? THREE.PropertyBinding.sanitizeNodeName(rawModel.attrName) : '',
										morphName: fbxTree.Objects.Deformer[deformerID].attrName,

									};

									layerCurveNodes[i] = node;

								}

								layerCurveNodes[i][curveNode.attr] = curveNode;

							}

						}

					});

					layersMap.set(parseInt(nodeID), layerCurveNodes);

				}

			}

			return layersMap;

		},

		// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
		// hierarchy. Each Stack node will be used to create a THREE.AnimationClip
		parseAnimStacks: function (layersMap) {

			var rawStacks = fbxTree.Objects.AnimationStack;

			// connect the stacks (clips) up to the layers
			var rawClips = {};

			for (var nodeID in rawStacks) {

				var children = connections.get(parseInt(nodeID)).children;

				if (children.length > 1) {

					// it seems like stacks will always be associated with a single layer. But just in case there are files
					// where there are multiple layers per stack, we'll display a warning
					console.warn('THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.');

				}

				var layer = layersMap.get(children[0].ID);

				rawClips[nodeID] = {

					name: rawStacks[nodeID].attrName,
					layer: layer,

				};

			}

			return rawClips;

		},

		addClip: function (rawClip) {

			var tracks = [];

			var scope = this;
			rawClip.layer.forEach(function (rawTracks) {

				tracks = tracks.concat(scope.generateTracks(rawTracks));

			});

			return new THREE.AnimationClip(rawClip.name, - 1, tracks);

		},

		generateTracks: function (rawTracks) {

			var tracks = [];

			var initialPosition = new THREE.Vector3();
			var initialRotation = new THREE.Quaternion();
			var initialScale = new THREE.Vector3();

			if (rawTracks.transform) rawTracks.transform.decompose(initialPosition, initialRotation, initialScale);

			initialPosition = initialPosition.toArray();
			initialRotation = new THREE.Euler().setFromQuaternion(initialRotation, rawTracks.eulerOrder).toArray();
			initialScale = initialScale.toArray();

			if (rawTracks.T !== undefined && Object.keys(rawTracks.T.curves).length > 0) {

				var positionTrack = this.generateVectorTrack(rawTracks.modelName, rawTracks.T.curves, initialPosition, 'position');
				if (positionTrack !== undefined) tracks.push(positionTrack);

			}

			if (rawTracks.R !== undefined && Object.keys(rawTracks.R.curves).length > 0) {

				var rotationTrack = this.generateRotationTrack(rawTracks.modelName, rawTracks.R.curves, initialRotation, rawTracks.preRotation, rawTracks.postRotation, rawTracks.eulerOrder);
				if (rotationTrack !== undefined) tracks.push(rotationTrack);

			}

			if (rawTracks.S !== undefined && Object.keys(rawTracks.S.curves).length > 0) {

				var scaleTrack = this.generateVectorTrack(rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale');
				if (scaleTrack !== undefined) tracks.push(scaleTrack);

			}

			if (rawTracks.DeformPercent !== undefined) {

				var morphTrack = this.generateMorphTrack(rawTracks);
				if (morphTrack !== undefined) tracks.push(morphTrack);

			}

			return tracks;

		},

		generateVectorTrack: function (modelName, curves, initialValue, type) {

			var times = this.getTimesForAllAxes(curves);
			var values = this.getKeyframeTrackValues(times, curves, initialValue);

			return new THREE.VectorKeyframeTrack(modelName + '.' + type, times, values);

		},

		generateRotationTrack: function (modelName, curves, initialValue, preRotation, postRotation, eulerOrder) {

			if (curves.x !== undefined) {

				this.interpolateRotations(curves.x);
				curves.x.values = curves.x.values.map(THREE.MathUtils.degToRad);

			}

			if (curves.y !== undefined) {

				this.interpolateRotations(curves.y);
				curves.y.values = curves.y.values.map(THREE.MathUtils.degToRad);

			}

			if (curves.z !== undefined) {

				this.interpolateRotations(curves.z);
				curves.z.values = curves.z.values.map(THREE.MathUtils.degToRad);

			}

			var times = this.getTimesForAllAxes(curves);
			var values = this.getKeyframeTrackValues(times, curves, initialValue);

			if (preRotation !== undefined) {

				preRotation = preRotation.map(THREE.MathUtils.degToRad);
				preRotation.push(eulerOrder);

				preRotation = new THREE.Euler().fromArray(preRotation);
				preRotation = new THREE.Quaternion().setFromEuler(preRotation);

			}

			if (postRotation !== undefined) {

				postRotation = postRotation.map(THREE.MathUtils.degToRad);
				postRotation.push(eulerOrder);

				postRotation = new THREE.Euler().fromArray(postRotation);
				postRotation = new THREE.Quaternion().setFromEuler(postRotation).invert();

			}

			var quaternion = new THREE.Quaternion();
			var euler = new THREE.Euler();

			var quaternionValues = [];

			for (var i = 0; i < values.length; i += 3) {

				euler.set(values[i], values[i + 1], values[i + 2], eulerOrder);

				quaternion.setFromEuler(euler);

				if (preRotation !== undefined) quaternion.premultiply(preRotation);
				if (postRotation !== undefined) quaternion.multiply(postRotation);

				quaternion.toArray(quaternionValues, (i / 3) * 4);

			}

			return new THREE.QuaternionKeyframeTrack(modelName + '.quaternion', times, quaternionValues);

		},

		generateMorphTrack: function (rawTracks) {

			var curves = rawTracks.DeformPercent.curves.morph;
			var values = curves.values.map(function (val) {

				return val / 100;

			});

			var morphNum = sceneGraph.getObjectByName(rawTracks.modelName).morphTargetDictionary[rawTracks.morphName];

			return new THREE.NumberKeyframeTrack(rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']', curves.times, values);

		},

		// For all animated objects, times are defined separately for each axis
		// Here we'll combine the times into one sorted array without duplicates
		getTimesForAllAxes: function (curves) {

			var times = [];

			// first join together the times for each axis, if defined
			if (curves.x !== undefined) times = times.concat(curves.x.times);
			if (curves.y !== undefined) times = times.concat(curves.y.times);
			if (curves.z !== undefined) times = times.concat(curves.z.times);

			// then sort them
			times = times.sort(function (a, b) {

				return a - b;

			});

			// and remove duplicates
			if (times.length > 1) {

				var targetIndex = 1;
				var lastValue = times[0];
				for (var i = 1; i < times.length; i++) {

					var currentValue = times[i];
					if (currentValue !== lastValue) {

						times[targetIndex] = currentValue;
						lastValue = currentValue;
						targetIndex++;

					}

				}

				times = times.slice(0, targetIndex);

			}

			return times;

		},

		getKeyframeTrackValues: function (times, curves, initialValue) {

			var prevValue = initialValue;

			var values = [];

			var xIndex = - 1;
			var yIndex = - 1;
			var zIndex = - 1;

			times.forEach(function (time) {

				if (curves.x) xIndex = curves.x.times.indexOf(time);
				if (curves.y) yIndex = curves.y.times.indexOf(time);
				if (curves.z) zIndex = curves.z.times.indexOf(time);

				// if there is an x value defined for this frame, use that
				if (xIndex !== - 1) {

					var xValue = curves.x.values[xIndex];
					values.push(xValue);
					prevValue[0] = xValue;

				} else {

					// otherwise use the x value from the previous frame
					values.push(prevValue[0]);

				}

				if (yIndex !== - 1) {

					var yValue = curves.y.values[yIndex];
					values.push(yValue);
					prevValue[1] = yValue;

				} else {

					values.push(prevValue[1]);

				}

				if (zIndex !== - 1) {

					var zValue = curves.z.values[zIndex];
					values.push(zValue);
					prevValue[2] = zValue;

				} else {

					values.push(prevValue[2]);

				}

			});

			return values;

		},

		// Rotations are defined as Euler angles which can have values  of any size
		// These will be converted to quaternions which don't support values greater than
		// PI, so we'll interpolate large rotations
		interpolateRotations: function (curve) {

			for (var i = 1; i < curve.values.length; i++) {

				var initialValue = curve.values[i - 1];
				var valuesSpan = curve.values[i] - initialValue;

				var absoluteSpan = Math.abs(valuesSpan);

				if (absoluteSpan >= 180) {

					var numSubIntervals = absoluteSpan / 180;

					var step = valuesSpan / numSubIntervals;
					var nextValue = initialValue + step;

					var initialTime = curve.times[i - 1];
					var timeSpan = curve.times[i] - initialTime;
					var interval = timeSpan / numSubIntervals;
					var nextTime = initialTime + interval;

					var interpolatedTimes = [];
					var interpolatedValues = [];

					while (nextTime < curve.times[i]) {

						interpolatedTimes.push(nextTime);
						nextTime += interval;

						interpolatedValues.push(nextValue);
						nextValue += step;

					}

					curve.times = inject(curve.times, i, interpolatedTimes);
					curve.values = inject(curve.values, i, interpolatedValues);

				}

			}

		},

	};

	// parse an FBX file in ASCII format
	function TextParser() { }

	TextParser.prototype = {

		constructor: TextParser,

		getPrevNode: function () {

			return this.nodeStack[this.currentIndent - 2];

		},

		getCurrentNode: function () {

			return this.nodeStack[this.currentIndent - 1];

		},

		getCurrentProp: function () {

			return this.currentProp;

		},

		pushStack: function (node) {

			this.nodeStack.push(node);
			this.currentIndent += 1;

		},

		popStack: function () {

			this.nodeStack.pop();
			this.currentIndent -= 1;

		},

		setCurrentProp: function (val, name) {

			this.currentProp = val;
			this.currentPropName = name;

		},

		parse: function (text) {

			this.currentIndent = 0;

			this.allNodes = new FBXTree();
			this.nodeStack = [];
			this.currentProp = [];
			this.currentPropName = '';

			var scope = this;

			var split = text.split(/[\r\n]+/);

			split.forEach(function (line, i) {

				var matchComment = line.match(/^[\s\t]*;/);
				var matchEmpty = line.match(/^[\s\t]*$/);

				if (matchComment || matchEmpty) return;

				var matchBeginning = line.match('^\\t{' + scope.currentIndent + '}(\\w+):(.*){', '');
				var matchProperty = line.match('^\\t{' + (scope.currentIndent) + '}(\\w+):[\\s\\t\\r\\n](.*)');
				var matchEnd = line.match('^\\t{' + (scope.currentIndent - 1) + '}}');

				if (matchBeginning) {

					scope.parseNodeBegin(line, matchBeginning);

				} else if (matchProperty) {

					scope.parseNodeProperty(line, matchProperty, split[++i]);

				} else if (matchEnd) {

					scope.popStack();

				} else if (line.match(/^[^\s\t}]/)) {

					// large arrays are split over multiple lines terminated with a ',' character
					// if this is encountered the line needs to be joined to the previous line
					scope.parseNodePropertyContinued(line);

				}

			});

			return this.allNodes;

		},

		parseNodeBegin: function (line, property) {

			var nodeName = property[1].trim().replace(/^"/, '').replace(/"$/, '');

			var nodeAttrs = property[2].split(',').map(function (attr) {

				return attr.trim().replace(/^"/, '').replace(/"$/, '');

			});

			var node = { name: nodeName };
			var attrs = this.parseNodeAttr(nodeAttrs);

			var currentNode = this.getCurrentNode();

			// a top node
			if (this.currentIndent === 0) {

				this.allNodes.add(nodeName, node);

			} else { // a subnode

				// if the subnode already exists, append it
				if (nodeName in currentNode) {

					// special case Pose needs PoseNodes as an array
					if (nodeName === 'PoseNode') {

						currentNode.PoseNode.push(node);

					} else if (currentNode[nodeName].id !== undefined) {

						currentNode[nodeName] = {};
						currentNode[nodeName][currentNode[nodeName].id] = currentNode[nodeName];

					}

					if (attrs.id !== '') currentNode[nodeName][attrs.id] = node;

				} else if (typeof attrs.id === 'number') {

					currentNode[nodeName] = {};
					currentNode[nodeName][attrs.id] = node;

				} else if (nodeName !== 'Properties70') {

					if (nodeName === 'PoseNode') currentNode[nodeName] = [node];
					else currentNode[nodeName] = node;

				}

			}

			if (typeof attrs.id === 'number') node.id = attrs.id;
			if (attrs.name !== '') node.attrName = attrs.name;
			if (attrs.type !== '') node.attrType = attrs.type;

			this.pushStack(node);

		},

		parseNodeAttr: function (attrs) {

			var id = attrs[0];

			if (attrs[0] !== '') {

				id = parseInt(attrs[0]);

				if (isNaN(id)) {

					id = attrs[0];

				}

			}

			var name = '', type = '';

			if (attrs.length > 1) {

				name = attrs[1].replace(/^(\w+)::/, '');
				type = attrs[2];

			}

			return { id: id, name: name, type: type };

		},

		parseNodeProperty: function (line, property, contentLine) {

			var propName = property[1].replace(/^"/, '').replace(/"$/, '').trim();
			var propValue = property[2].replace(/^"/, '').replace(/"$/, '').trim();

			// for special case: base64 image data follows "Content: ," line
			//	Content: ,
			//	 "/9j/4RDaRXhpZgAATU0A..."
			if (propName === 'Content' && propValue === ',') {

				propValue = contentLine.replace(/"/g, '').replace(/,$/, '').trim();

			}

			var currentNode = this.getCurrentNode();
			var parentName = currentNode.name;

			if (parentName === 'Properties70') {

				this.parseNodeSpecialProperty(line, propName, propValue);
				return;

			}

			// Connections
			if (propName === 'C') {

				var connProps = propValue.split(',').slice(1);
				var from = parseInt(connProps[0]);
				var to = parseInt(connProps[1]);

				var rest = propValue.split(',').slice(3);

				rest = rest.map(function (elem) {

					return elem.trim().replace(/^"/, '');

				});

				propName = 'connections';
				propValue = [from, to];
				append(propValue, rest);

				if (currentNode[propName] === undefined) {

					currentNode[propName] = [];

				}

			}

			// Node
			if (propName === 'Node') currentNode.id = propValue;

			// connections
			if (propName in currentNode && Array.isArray(currentNode[propName])) {

				currentNode[propName].push(propValue);

			} else {

				if (propName !== 'a') currentNode[propName] = propValue;
				else currentNode.a = propValue;

			}

			this.setCurrentProp(currentNode, propName);

			// convert string to array, unless it ends in ',' in which case more will be added to it
			if (propName === 'a' && propValue.slice(- 1) !== ',') {

				currentNode.a = parseNumberArray(propValue);

			}

		},

		parseNodePropertyContinued: function (line) {

			var currentNode = this.getCurrentNode();

			currentNode.a += line;

			// if the line doesn't end in ',' we have reached the end of the property value
			// so convert the string to an array
			if (line.slice(- 1) !== ',') {

				currentNode.a = parseNumberArray(currentNode.a);

			}

		},

		// parse "Property70"
		parseNodeSpecialProperty: function (line, propName, propValue) {

			// split this
			// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
			// into array like below
			// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
			var props = propValue.split('",').map(function (prop) {

				return prop.trim().replace(/^\"/, '').replace(/\s/, '_');

			});

			var innerPropName = props[0];
			var innerPropType1 = props[1];
			var innerPropType2 = props[2];
			var innerPropFlag = props[3];
			var innerPropValue = props[4];

			// cast values where needed, otherwise leave as strings
			switch (innerPropType1) {

				case 'int':
				case 'enum':
				case 'bool':
				case 'ULongLong':
				case 'double':
				case 'Number':
				case 'FieldOfView':
					innerPropValue = parseFloat(innerPropValue);
					break;

				case 'Color':
				case 'ColorRGB':
				case 'Vector3D':
				case 'Lcl_Translation':
				case 'Lcl_Rotation':
				case 'Lcl_Scaling':
					innerPropValue = parseNumberArray(innerPropValue);
					break;

			}

			// CAUTION: these props must append to parent's parent
			this.getPrevNode()[innerPropName] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

			this.setCurrentProp(this.getPrevNode(), innerPropName);

		},

	};

	// Parse an FBX file in Binary format
	function BinaryParser() { }

	BinaryParser.prototype = {

		constructor: BinaryParser,

		parse: function (buffer) {

			var reader = new BinaryReader(buffer);
			reader.skip(23); // skip magic 23 bytes

			var version = reader.getUint32();

			if (version < 6400) {

				throw new Error('THREE.FBXLoader: FBX version not supported, FileVersion: ' + version);

			}

			var allNodes = new FBXTree();

			while (!this.endOfContent(reader)) {

				var node = this.parseNode(reader, version);
				if (node !== null) allNodes.add(node.name, node);

			}

			return allNodes;

		},

		// Check if reader has reached the end of content.
		endOfContent: function (reader) {

			// footer size: 160bytes + 16-byte alignment padding
			// - 16bytes: magic
			// - padding til 16-byte alignment (at least 1byte?)
			//	(seems like some exporters embed fixed 15 or 16bytes?)
			// - 4bytes: magic
			// - 4bytes: version
			// - 120bytes: zero
			// - 16bytes: magic
			if (reader.size() % 16 === 0) {

				return ((reader.getOffset() + 160 + 16) & ~0xf) >= reader.size();

			} else {

				return reader.getOffset() + 160 + 16 >= reader.size();

			}

		},

		// recursively parse nodes until the end of the file is reached
		parseNode: function (reader, version) {

			var node = {};

			// The first three data sizes depends on version.
			var endOffset = (version >= 7500) ? reader.getUint64() : reader.getUint32();
			var numProperties = (version >= 7500) ? reader.getUint64() : reader.getUint32();

			(version >= 7500) ? reader.getUint64() : reader.getUint32(); // the returned propertyListLen is not used

			var nameLen = reader.getUint8();
			var name = reader.getString(nameLen);

			// Regards this node as NULL-record if endOffset is zero
			if (endOffset === 0) return null;

			var propertyList = [];

			for (var i = 0; i < numProperties; i++) {

				propertyList.push(this.parseProperty(reader));

			}

			// Regards the first three elements in propertyList as id, attrName, and attrType
			var id = propertyList.length > 0 ? propertyList[0] : '';
			var attrName = propertyList.length > 1 ? propertyList[1] : '';
			var attrType = propertyList.length > 2 ? propertyList[2] : '';

			// check if this node represents just a single property
			// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
			node.singleProperty = (numProperties === 1 && reader.getOffset() === endOffset) ? true : false;

			while (endOffset > reader.getOffset()) {

				var subNode = this.parseNode(reader, version);

				if (subNode !== null) this.parseSubNode(name, node, subNode);

			}

			node.propertyList = propertyList; // raw property list used by parent

			if (typeof id === 'number') node.id = id;
			if (attrName !== '') node.attrName = attrName;
			if (attrType !== '') node.attrType = attrType;
			if (name !== '') node.name = name;

			return node;

		},

		parseSubNode: function (name, node, subNode) {

			// special case: child node is single property
			if (subNode.singleProperty === true) {

				var value = subNode.propertyList[0];

				if (Array.isArray(value)) {

					node[subNode.name] = subNode;

					subNode.a = value;

				} else {

					node[subNode.name] = value;

				}

			} else if (name === 'Connections' && subNode.name === 'C') {

				var array = [];

				subNode.propertyList.forEach(function (property, i) {

					// first Connection is FBX type (OO, OP, etc.). We'll discard these
					if (i !== 0) array.push(property);

				});

				if (node.connections === undefined) {

					node.connections = [];

				}

				node.connections.push(array);

			} else if (subNode.name === 'Properties70') {

				var keys = Object.keys(subNode);

				keys.forEach(function (key) {

					node[key] = subNode[key];

				});

			} else if (name === 'Properties70' && subNode.name === 'P') {

				var innerPropName = subNode.propertyList[0];
				var innerPropType1 = subNode.propertyList[1];
				var innerPropType2 = subNode.propertyList[2];
				var innerPropFlag = subNode.propertyList[3];
				var innerPropValue;

				if (innerPropName.indexOf('Lcl ') === 0) innerPropName = innerPropName.replace('Lcl ', 'Lcl_');
				if (innerPropType1.indexOf('Lcl ') === 0) innerPropType1 = innerPropType1.replace('Lcl ', 'Lcl_');

				if (innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf('Lcl_') === 0) {

					innerPropValue = [
						subNode.propertyList[4],
						subNode.propertyList[5],
						subNode.propertyList[6]
					];

				} else {

					innerPropValue = subNode.propertyList[4];

				}

				// this will be copied to parent, see above
				node[innerPropName] = {

					'type': innerPropType1,
					'type2': innerPropType2,
					'flag': innerPropFlag,
					'value': innerPropValue

				};

			} else if (node[subNode.name] === undefined) {

				if (typeof subNode.id === 'number') {

					node[subNode.name] = {};
					node[subNode.name][subNode.id] = subNode;

				} else {

					node[subNode.name] = subNode;

				}

			} else {

				if (subNode.name === 'PoseNode') {

					if (!Array.isArray(node[subNode.name])) {

						node[subNode.name] = [node[subNode.name]];

					}

					node[subNode.name].push(subNode);

				} else if (node[subNode.name][subNode.id] === undefined) {

					node[subNode.name][subNode.id] = subNode;

				}

			}

		},

		parseProperty: function (reader) {

			var type = reader.getString(1);

			switch (type) {

				case 'C':
					return reader.getBoolean();

				case 'D':
					return reader.getFloat64();

				case 'F':
					return reader.getFloat32();

				case 'I':
					return reader.getInt32();

				case 'L':
					return reader.getInt64();

				case 'R':
					var length = reader.getUint32();
					return reader.getArrayBuffer(length);

				case 'S':
					var length = reader.getUint32();
					return reader.getString(length);

				case 'Y':
					return reader.getInt16();

				case 'b':
				case 'c':
				case 'd':
				case 'f':
				case 'i':
				case 'l':

					var arrayLength = reader.getUint32();
					var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
					var compressedLength = reader.getUint32();

					if (encoding === 0) {

						switch (type) {

							case 'b':
							case 'c':
								return reader.getBooleanArray(arrayLength);

							case 'd':
								return reader.getFloat64Array(arrayLength);

							case 'f':
								return reader.getFloat32Array(arrayLength);

							case 'i':
								return reader.getInt32Array(arrayLength);

							case 'l':
								return reader.getInt64Array(arrayLength);

						}

					}

					if (typeof fflate === 'undefined') {

						console.error('THREE.FBXLoader: External library fflate.min.js required.');

					}

					var data = fflate.unzlibSync(new Uint8Array(reader.getArrayBuffer(compressedLength))); // eslint-disable-line no-undef
					var reader2 = new BinaryReader(data.buffer);

					switch (type) {

						case 'b':
						case 'c':
							return reader2.getBooleanArray(arrayLength);

						case 'd':
							return reader2.getFloat64Array(arrayLength);

						case 'f':
							return reader2.getFloat32Array(arrayLength);

						case 'i':
							return reader2.getInt32Array(arrayLength);

						case 'l':
							return reader2.getInt64Array(arrayLength);

					}

				default:
					throw new Error('THREE.FBXLoader: Unknown property type ' + type);

			}

		}

	};

	function BinaryReader(buffer, littleEndian) {

		this.dv = new DataView(buffer);
		this.offset = 0;
		this.littleEndian = (littleEndian !== undefined) ? littleEndian : true;

	}

	BinaryReader.prototype = {

		constructor: BinaryReader,

		getOffset: function () {

			return this.offset;

		},

		size: function () {

			return this.dv.buffer.byteLength;

		},

		skip: function (length) {

			this.offset += length;

		},

		// seems like true/false representation depends on exporter.
		// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
		// then sees LSB.
		getBoolean: function () {

			return (this.getUint8() & 1) === 1;

		},

		getBooleanArray: function (size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getBoolean());

			}

			return a;

		},

		getUint8: function () {

			var value = this.dv.getUint8(this.offset);
			this.offset += 1;
			return value;

		},

		getInt16: function () {

			var value = this.dv.getInt16(this.offset, this.littleEndian);
			this.offset += 2;
			return value;

		},

		getInt32: function () {

			var value = this.dv.getInt32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;

		},

		getInt32Array: function (size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt32());

			}

			return a;

		},

		getUint32: function () {

			var value = this.dv.getUint32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;

		},

		// JavaScript doesn't support 64-bit integer so calculate this here
		// 1 << 32 will return 1 so using multiply operation instead here.
		// There's a possibility that this method returns wrong value if the value
		// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
		// TODO: safely handle 64-bit integer
		getInt64: function () {

			var low, high;

			if (this.littleEndian) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			// calculate negative value
			if (high & 0x80000000) {

				high = ~high & 0xFFFFFFFF;
				low = ~low & 0xFFFFFFFF;

				if (low === 0xFFFFFFFF) high = (high + 1) & 0xFFFFFFFF;

				low = (low + 1) & 0xFFFFFFFF;

				return - (high * 0x100000000 + low);

			}

			return high * 0x100000000 + low;

		},

		getInt64Array: function (size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt64());

			}

			return a;

		},

		// Note: see getInt64() comment
		getUint64: function () {

			var low, high;

			if (this.littleEndian) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			return high * 0x100000000 + low;

		},

		getFloat32: function () {

			var value = this.dv.getFloat32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;

		},

		getFloat32Array: function (size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getFloat32());

			}

			return a;

		},

		getFloat64: function () {

			var value = this.dv.getFloat64(this.offset, this.littleEndian);
			this.offset += 8;
			return value;

		},

		getFloat64Array: function (size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getFloat64());

			}

			return a;

		},

		getArrayBuffer: function (size) {

			var value = this.dv.buffer.slice(this.offset, this.offset + size);
			this.offset += size;
			return value;

		},

		getString: function (size) {

			// note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
			var a = [];

			for (var i = 0; i < size; i++) {

				a[i] = this.getUint8();

			}

			var nullByte = a.indexOf(0);
			if (nullByte >= 0) a = a.slice(0, nullByte);

			return THREE.LoaderUtils.decodeText(new Uint8Array(a));

		}

	};

	// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
	// and BinaryParser( FBX Binary format)
	function FBXTree() { }

	FBXTree.prototype = {

		constructor: FBXTree,

		add: function (key, val) {

			this[key] = val;

		},

	};

	// ************** UTILITY FUNCTIONS **************

	function isFbxFormatBinary(buffer) {

		var CORRECT = 'Kaydara FBX Binary  \0';

		return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString(buffer, 0, CORRECT.length);

	}

	function isFbxFormatASCII(text) {

		var CORRECT = ['K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\'];

		var cursor = 0;

		function read(offset) {

			var result = text[offset - 1];
			text = text.slice(cursor + offset);
			cursor++;
			return result;

		}

		for (var i = 0; i < CORRECT.length; ++i) {

			var num = read(1);
			if (num === CORRECT[i]) {

				return false;

			}

		}

		return true;

	}

	function getFbxVersion(text) {

		var versionRegExp = /FBXVersion: (\d+)/;
		var match = text.match(versionRegExp);

		if (match) {

			var version = parseInt(match[1]);
			return version;

		}

		throw new Error('THREE.FBXLoader: Cannot find the version number for the file given.');

	}

	// Converts FBX ticks into real time seconds.
	function convertFBXTimeToSeconds(time) {

		return time / 46186158000;

	}

	var dataArray = [];

	// extracts the data from the correct position in the FBX array based on indexing type
	function getData(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

		var index;

		switch (infoObject.mappingType) {

			case 'ByPolygonVertex':
				index = polygonVertexIndex;
				break;
			case 'ByPolygon':
				index = polygonIndex;
				break;
			case 'ByVertice':
				index = vertexIndex;
				break;
			case 'AllSame':
				index = infoObject.indices[0];
				break;
			default:
				console.warn('THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType);

		}

		if (infoObject.referenceType === 'IndexToDirect') index = infoObject.indices[index];

		var from = index * infoObject.dataSize;
		var to = from + infoObject.dataSize;

		return slice(dataArray, infoObject.buffer, from, to);

	}

	var tempEuler = new THREE.Euler();
	var tempVec = new THREE.Vector3();

	// generate transformation from FBX transform data
	// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
	// ref: http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/_transformations_2main_8cxx-example.html,topicNumber=cpp_ref__transformations_2main_8cxx_example_htmlfc10a1e1-b18d-4e72-9dc0-70d0f1959f5e
	function generateTransform(transformData) {

		var lTranslationM = new THREE.Matrix4();
		var lPreRotationM = new THREE.Matrix4();
		var lRotationM = new THREE.Matrix4();
		var lPostRotationM = new THREE.Matrix4();

		var lScalingM = new THREE.Matrix4();
		var lScalingPivotM = new THREE.Matrix4();
		var lScalingOffsetM = new THREE.Matrix4();
		var lRotationOffsetM = new THREE.Matrix4();
		var lRotationPivotM = new THREE.Matrix4();

		var lParentGX = new THREE.Matrix4();
		var lParentLX = new THREE.Matrix4();
		var lGlobalT = new THREE.Matrix4();

		var inheritType = (transformData.inheritType) ? transformData.inheritType : 0;

		if (transformData.translation) lTranslationM.setPosition(tempVec.fromArray(transformData.translation));

		if (transformData.preRotation) {

			var array = transformData.preRotation.map(THREE.MathUtils.degToRad);
			array.push(transformData.eulerOrder);
			lPreRotationM.makeRotationFromEuler(tempEuler.fromArray(array));

		}

		if (transformData.rotation) {

			var array = transformData.rotation.map(THREE.MathUtils.degToRad);
			array.push(transformData.eulerOrder);
			lRotationM.makeRotationFromEuler(tempEuler.fromArray(array));

		}

		if (transformData.postRotation) {

			var array = transformData.postRotation.map(THREE.MathUtils.degToRad);
			array.push(transformData.eulerOrder);
			lPostRotationM.makeRotationFromEuler(tempEuler.fromArray(array));
			lPostRotationM.invert();

		}

		if (transformData.scale) lScalingM.scale(tempVec.fromArray(transformData.scale));

		// Pivots and offsets
		if (transformData.scalingOffset) lScalingOffsetM.setPosition(tempVec.fromArray(transformData.scalingOffset));
		if (transformData.scalingPivot) lScalingPivotM.setPosition(tempVec.fromArray(transformData.scalingPivot));
		if (transformData.rotationOffset) lRotationOffsetM.setPosition(tempVec.fromArray(transformData.rotationOffset));
		if (transformData.rotationPivot) lRotationPivotM.setPosition(tempVec.fromArray(transformData.rotationPivot));

		// parent transform
		if (transformData.parentMatrixWorld) {

			lParentLX.copy(transformData.parentMatrix);
			lParentGX.copy(transformData.parentMatrixWorld);

		}

		var lLRM = new THREE.Matrix4().copy(lPreRotationM).multiply(lRotationM).multiply(lPostRotationM);
		// Global Rotation
		var lParentGRM = new THREE.Matrix4();
		lParentGRM.extractRotation(lParentGX);

		// Global Shear*Scaling
		var lParentTM = new THREE.Matrix4();
		lParentTM.copyPosition(lParentGX);

		var lParentGSM = new THREE.Matrix4();
		var lParentGRSM = new THREE.Matrix4().copy(lParentTM).invert().multiply(lParentGX);
		lParentGSM.copy(lParentGRM).invert().multiply(lParentGRSM);
		var lLSM = lScalingM;

		var lGlobalRS = new THREE.Matrix4();

		if (inheritType === 0) {

			lGlobalRS.copy(lParentGRM).multiply(lLRM).multiply(lParentGSM).multiply(lLSM);

		} else if (inheritType === 1) {

			lGlobalRS.copy(lParentGRM).multiply(lParentGSM).multiply(lLRM).multiply(lLSM);

		} else {

			var lParentLSM = new THREE.Matrix4().scale(new THREE.Vector3().setFromMatrixScale(lParentLX));
			var lParentLSM_inv = new THREE.Matrix4().copy(lParentLSM).invert();
			var lParentGSM_noLocal = new THREE.Matrix4().copy(lParentGSM).multiply(lParentLSM_inv);

			lGlobalRS.copy(lParentGRM).multiply(lLRM).multiply(lParentGSM_noLocal).multiply(lLSM);

		}

		var lRotationPivotM_inv = new THREE.Matrix4();
		lRotationPivotM_inv.copy(lRotationPivotM).invert();
		var lScalingPivotM_inv = new THREE.Matrix4();
		lScalingPivotM_inv.copy(lScalingPivotM).invert();
		// Calculate the local transform matrix
		var lTransform = new THREE.Matrix4();
		lTransform.copy(lTranslationM).multiply(lRotationOffsetM).multiply(lRotationPivotM).multiply(lPreRotationM).multiply(lRotationM).multiply(lPostRotationM).multiply(lRotationPivotM_inv).multiply(lScalingOffsetM).multiply(lScalingPivotM).multiply(lScalingM).multiply(lScalingPivotM_inv);

		var lLocalTWithAllPivotAndOffsetInfo = new THREE.Matrix4().copyPosition(lTransform);

		var lGlobalTranslation = new THREE.Matrix4().copy(lParentGX).multiply(lLocalTWithAllPivotAndOffsetInfo);
		lGlobalT.copyPosition(lGlobalTranslation);

		lTransform = new THREE.Matrix4().copy(lGlobalT).multiply(lGlobalRS);

		// from global to local
		lTransform.premultiply(lParentGX.invert());

		return lTransform;

	}

	// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
	// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
	function getEulerOrder(order) {

		order = order || 0;

		var enums = [
			'ZYX', // -> XYZ extrinsic
			'YZX', // -> XZY extrinsic
			'XZY', // -> YZX extrinsic
			'ZXY', // -> YXZ extrinsic
			'YXZ', // -> ZXY extrinsic
			'XYZ', // -> ZYX extrinsic
			//'SphericXYZ', // not possible to support
		];

		if (order === 6) {

			console.warn('THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.');
			return enums[0];

		}

		return enums[order];

	}

	// Parses comma separated list of numbers and returns them an array.
	// Used internally by the TextParser
	function parseNumberArray(value) {

		var array = value.split(',').map(function (val) {

			return parseFloat(val);

		});

		return array;

	}

	function convertArrayBufferToString(buffer, from, to) {

		if (from === undefined) from = 0;
		if (to === undefined) to = buffer.byteLength;

		return THREE.LoaderUtils.decodeText(new Uint8Array(buffer, from, to));

	}

	function append(a, b) {

		for (var i = 0, j = a.length, l = b.length; i < l; i++, j++) {

			a[j] = b[i];

		}

	}

	function slice(a, b, from, to) {

		for (var i = from, j = 0; i < to; i++, j++) {

			a[j] = b[i];

		}

		return a;

	}

	// inject array a2 into array a1 at index
	function inject(a1, index, a2) {

		return a1.slice(0, index).concat(a2).concat(a1.slice(index));

	}

	return FBXLoader;

})();

module.exports = exports = THREE.FBXLoader;

},{"../../three.js":25,"../fflate.min.js":12}],18:[function(require,module,exports){
const THREE = require('../../three.js');

/**
 * @author Rich Tibbett / https://github.com/richtr
 * @author mrdoob / http://mrdoob.com/
 * @author Tony Parisi / http://www.tonyparisi.com/
 * @author Takahiro / https://github.com/takahirox
 * @author Don McCurdy / https://www.donmccurdy.com
 */

THREE.GLTFLoader = (function () {

	function GLTFLoader(manager) {

		THREE.Loader.call(this, manager);

		this.dracoLoader = null;
		this.ktx2Loader = null;
		this.meshoptDecoder = null;

		this.pluginCallbacks = [];

		this.register(function (parser) {

			return new GLTFMaterialsClearcoatExtension(parser);

		});

		this.register(function (parser) {

			return new GLTFTextureBasisUExtension(parser);

		});

		this.register(function (parser) {

			return new GLTFTextureWebPExtension(parser);

		});

		this.register(function (parser) {

			return new GLTFMaterialsTransmissionExtension(parser);

		});

		this.register(function (parser) {

			return new GLTFLightsExtension(parser);

		});

		this.register(function (parser) {

			return new GLTFMeshoptCompression(parser);

		});

	}

	GLTFLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {

		constructor: GLTFLoader,

		load: function (url, onLoad, onProgress, onError) {

			var scope = this;

			var resourcePath;

			if (this.resourcePath !== '') {

				resourcePath = this.resourcePath;

			} else if (this.path !== '') {

				resourcePath = this.path;

			} else {

				resourcePath = THREE.LoaderUtils.extractUrlBase(url);

			}

			// Tells the LoadingManager to track an extra item, which resolves after
			// the model is fully loaded. This means the count of items loaded will
			// be incorrect, but ensures manager.onLoad() does not fire early.
			this.manager.itemStart(url);

			var _onError = function (e) {

				if (onError) {

					onError(e);

				} else {

					console.error(e);

				}

				scope.manager.itemError(url);
				scope.manager.itemEnd(url);

			};

			var loader = new THREE.FileLoader(this.manager);

			loader.setPath(this.path);
			loader.setResponseType('arraybuffer');
			loader.setRequestHeader(this.requestHeader);
			loader.setWithCredentials(this.withCredentials);

			loader.load(url, function (data) {

				try {

					scope.parse(data, resourcePath, function (gltf) {

						onLoad(gltf);

						scope.manager.itemEnd(url);

					}, _onError);

				} catch (e) {

					_onError(e);

				}

			}, onProgress, _onError);

		},

		setDRACOLoader: function (dracoLoader) {

			this.dracoLoader = dracoLoader;
			return this;

		},

		setDDSLoader: function () {

			throw new Error(

				'THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".'

			);

		},

		setKTX2Loader: function (ktx2Loader) {

			this.ktx2Loader = ktx2Loader;
			return this;

		},

		setMeshoptDecoder: function (meshoptDecoder) {

			this.meshoptDecoder = meshoptDecoder;
			return this;

		},

		register: function (callback) {

			if (this.pluginCallbacks.indexOf(callback) === - 1) {

				this.pluginCallbacks.push(callback);

			}

			return this;

		},

		unregister: function (callback) {

			if (this.pluginCallbacks.indexOf(callback) !== - 1) {

				this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);

			}

			return this;

		},

		parse: function (data, path, onLoad, onError) {

			var content;
			var extensions = {};
			var plugins = {};

			if (typeof data === 'string') {

				content = data;

			} else {

				var magic = THREE.LoaderUtils.decodeText(new Uint8Array(data, 0, 4));

				if (magic === BINARY_EXTENSION_HEADER_MAGIC) {

					try {

						extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);

					} catch (error) {

						if (onError) onError(error);
						return;

					}

					content = extensions[EXTENSIONS.KHR_BINARY_GLTF].content;

				} else {

					content = THREE.LoaderUtils.decodeText(new Uint8Array(data));

				}

			}

			var json = JSON.parse(content);

			if (json.asset === undefined || json.asset.version[0] < 2) {

				if (onError) onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'));
				return;

			}

			var parser = new GLTFParser(json, {

				path: path || this.resourcePath || '',
				crossOrigin: this.crossOrigin,
				requestHeader: this.requestHeader,
				manager: this.manager,
				ktx2Loader: this.ktx2Loader,
				meshoptDecoder: this.meshoptDecoder

			});

			parser.fileLoader.setRequestHeader(this.requestHeader);

			for (var i = 0; i < this.pluginCallbacks.length; i++) {

				var plugin = this.pluginCallbacks[i](parser);
				plugins[plugin.name] = plugin;

				// Workaround to avoid determining as unknown extension
				// in addUnknownExtensionsToUserData().
				// Remove this workaround if we move all the existing
				// extension handlers to plugin system
				extensions[plugin.name] = true;

			}

			if (json.extensionsUsed) {

				for (var i = 0; i < json.extensionsUsed.length; ++i) {

					var extensionName = json.extensionsUsed[i];
					var extensionsRequired = json.extensionsRequired || [];

					switch (extensionName) {

						case EXTENSIONS.KHR_MATERIALS_UNLIT:
							extensions[extensionName] = new GLTFMaterialsUnlitExtension();
							break;

						case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
							extensions[extensionName] = new GLTFMaterialsPbrSpecularGlossinessExtension();
							break;

						case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
							extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
							break;

						case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
							extensions[extensionName] = new GLTFTextureTransformExtension();
							break;

						case EXTENSIONS.KHR_MESH_QUANTIZATION:
							extensions[extensionName] = new GLTFMeshQuantizationExtension();
							break;

						default:

							if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === undefined) {

								console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".');

							}

					}

				}

			}

			parser.setExtensions(extensions);
			parser.setPlugins(plugins);
			parser.parse(onLoad, onError);

		}

	});

	/* GLTFREGISTRY */

	function GLTFRegistry() {

		var objects = {};

		return {

			get: function (key) {

				return objects[key];

			},

			add: function (key, object) {

				objects[key] = object;

			},

			remove: function (key) {

				delete objects[key];

			},

			removeAll: function () {

				objects = {};

			}

		};

	}

	/*********************************/
	/********** EXTENSIONS ***********/
	/*********************************/

	var EXTENSIONS = {
		KHR_BINARY_GLTF: 'KHR_binary_glTF',
		KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
		KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
		KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
		KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
		KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
		KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
		KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
		KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
		KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
		EXT_TEXTURE_WEBP: 'EXT_texture_webp',
		EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression'
	};

	/**
	 * Punctual Lights Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
	 */
	function GLTFLightsExtension(parser) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

		// Object3D instance caches
		this.cache = { refs: {}, uses: {} };

	}

	GLTFLightsExtension.prototype._markDefs = function () {

		var parser = this.parser;
		var nodeDefs = this.parser.json.nodes || [];

		for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {

			var nodeDef = nodeDefs[nodeIndex];

			if (nodeDef.extensions
				&& nodeDef.extensions[this.name]
				&& nodeDef.extensions[this.name].light !== undefined) {

				parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);

			}

		}

	};

	GLTFLightsExtension.prototype._loadLight = function (lightIndex) {

		var parser = this.parser;
		var cacheKey = 'light:' + lightIndex;
		var dependency = parser.cache.get(cacheKey);

		if (dependency) return dependency;

		var json = parser.json;
		var extensions = (json.extensions && json.extensions[this.name]) || {};
		var lightDefs = extensions.lights || [];
		var lightDef = lightDefs[lightIndex];
		var lightNode;

		var color = new THREE.Color(0xffffff);

		if (lightDef.color !== undefined) color.fromArray(lightDef.color);

		var range = lightDef.range !== undefined ? lightDef.range : 0;

		switch (lightDef.type) {

			case 'directional':
				lightNode = new THREE.DirectionalLight(color);
				lightNode.target.position.set(0, 0, - 1);
				lightNode.add(lightNode.target);
				break;

			case 'point':
				lightNode = new THREE.PointLight(color);
				lightNode.distance = range;
				break;

			case 'spot':
				lightNode = new THREE.SpotLight(color);
				lightNode.distance = range;
				// Handle spotlight properties.
				lightDef.spot = lightDef.spot || {};
				lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0;
				lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0;
				lightNode.angle = lightDef.spot.outerConeAngle;
				lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
				lightNode.target.position.set(0, 0, - 1);
				lightNode.add(lightNode.target);
				break;

			default:
				throw new Error('THREE.GLTFLoader: Unexpected light type: ' + lightDef.type);

		}

		// Some lights (e.g. spot) default to a position other than the origin. Reset the position
		// here, because node-level parsing will only override position if explicitly specified.
		lightNode.position.set(0, 0, 0);

		lightNode.decay = 2;

		if (lightDef.intensity !== undefined) lightNode.intensity = lightDef.intensity;

		lightNode.name = parser.createUniqueName(lightDef.name || ('light_' + lightIndex));

		dependency = Promise.resolve(lightNode);

		parser.cache.add(cacheKey, dependency);

		return dependency;

	};

	GLTFLightsExtension.prototype.createNodeAttachment = function (nodeIndex) {

		var self = this;
		var parser = this.parser;
		var json = parser.json;
		var nodeDef = json.nodes[nodeIndex];
		var lightDef = (nodeDef.extensions && nodeDef.extensions[this.name]) || {};
		var lightIndex = lightDef.light;

		if (lightIndex === undefined) return null;

		return this._loadLight(lightIndex).then(function (light) {

			return parser._getNodeRef(self.cache, lightIndex, light);

		});

	};

	/**
	 * Unlit Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
	 */
	function GLTFMaterialsUnlitExtension() {

		this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;

	}

	GLTFMaterialsUnlitExtension.prototype.getMaterialType = function () {

		return THREE.MeshBasicMaterial;

	};

	GLTFMaterialsUnlitExtension.prototype.extendParams = function (materialParams, materialDef, parser) {

		var pending = [];

		materialParams.color = new THREE.Color(1.0, 1.0, 1.0);
		materialParams.opacity = 1.0;

		var metallicRoughness = materialDef.pbrMetallicRoughness;

		if (metallicRoughness) {

			if (Array.isArray(metallicRoughness.baseColorFactor)) {

				var array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray(array);
				materialParams.opacity = array[3];

			}

			if (metallicRoughness.baseColorTexture !== undefined) {

				pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));

			}

		}

		return Promise.all(pending);

	};

	/**
	 * Clearcoat Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
	 */
	function GLTFMaterialsClearcoatExtension(parser) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;

	}

	GLTFMaterialsClearcoatExtension.prototype.getMaterialType = function (materialIndex) {

		var parser = this.parser;
		var materialDef = parser.json.materials[materialIndex];

		if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;

		return THREE.MeshPhysicalMaterial;

	};

	GLTFMaterialsClearcoatExtension.prototype.extendMaterialParams = function (materialIndex, materialParams) {

		var parser = this.parser;
		var materialDef = parser.json.materials[materialIndex];

		if (!materialDef.extensions || !materialDef.extensions[this.name]) {

			return Promise.resolve();

		}

		var pending = [];

		var extension = materialDef.extensions[this.name];

		if (extension.clearcoatFactor !== undefined) {

			materialParams.clearcoat = extension.clearcoatFactor;

		}

		if (extension.clearcoatTexture !== undefined) {

			pending.push(parser.assignTexture(materialParams, 'clearcoatMap', extension.clearcoatTexture));

		}

		if (extension.clearcoatRoughnessFactor !== undefined) {

			materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;

		}

		if (extension.clearcoatRoughnessTexture !== undefined) {

			pending.push(parser.assignTexture(materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture));

		}

		if (extension.clearcoatNormalTexture !== undefined) {

			pending.push(parser.assignTexture(materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture));

			if (extension.clearcoatNormalTexture.scale !== undefined) {

				var scale = extension.clearcoatNormalTexture.scale;

				// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
				materialParams.clearcoatNormalScale = new THREE.Vector2(scale, - scale);

			}

		}

		return Promise.all(pending);

	};

	/**
	 * Transmission Materials Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
	 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
	 */
	function GLTFMaterialsTransmissionExtension(parser) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;

	}

	GLTFMaterialsTransmissionExtension.prototype.getMaterialType = function (materialIndex) {

		var parser = this.parser;
		var materialDef = parser.json.materials[materialIndex];

		if (!materialDef.extensions || !materialDef.extensions[this.name]) return null;

		return THREE.MeshPhysicalMaterial;

	};

	GLTFMaterialsTransmissionExtension.prototype.extendMaterialParams = function (materialIndex, materialParams) {

		var parser = this.parser;
		var materialDef = parser.json.materials[materialIndex];

		if (!materialDef.extensions || !materialDef.extensions[this.name]) {

			return Promise.resolve();

		}

		var pending = [];

		var extension = materialDef.extensions[this.name];

		if (extension.transmissionFactor !== undefined) {

			materialParams.transmission = extension.transmissionFactor;

		}

		if (extension.transmissionTexture !== undefined) {

			pending.push(parser.assignTexture(materialParams, 'transmissionMap', extension.transmissionTexture));

		}

		return Promise.all(pending);

	};

	/**
	 * BasisU Texture Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
	 */
	function GLTFTextureBasisUExtension(parser) {

		this.parser = parser;
		this.name = EXTENSIONS.KHR_TEXTURE_BASISU;

	}

	GLTFTextureBasisUExtension.prototype.loadTexture = function (textureIndex) {

		var parser = this.parser;
		var json = parser.json;

		var textureDef = json.textures[textureIndex];

		if (!textureDef.extensions || !textureDef.extensions[this.name]) {

			return null;

		}

		var extension = textureDef.extensions[this.name];
		var source = json.images[extension.source];
		var loader = parser.options.ktx2Loader;

		if (!loader) {

			if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {

				throw new Error('THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures');

			} else {

				// Assumes that the extension is optional and that a fallback texture is present
				return null;

			}

		}

		return parser.loadTextureImage(textureIndex, source, loader);

	};

	/**
	 * WebP Texture Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
	 */
	function GLTFTextureWebPExtension(parser) {

		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
		this.isSupported = null;

	}

	GLTFTextureWebPExtension.prototype.loadTexture = function (textureIndex) {

		var name = this.name;
		var parser = this.parser;
		var json = parser.json;

		var textureDef = json.textures[textureIndex];

		if (!textureDef.extensions || !textureDef.extensions[name]) {

			return null;

		}

		var extension = textureDef.extensions[name];
		var source = json.images[extension.source];

		var loader = parser.textureLoader;
		if (source.uri) {

			var handler = parser.options.manager.getHandler(source.uri);
			if (handler !== null) loader = handler;

		}

		return this.detectSupport().then(function (isSupported) {

			if (isSupported) return parser.loadTextureImage(textureIndex, source, loader);

			if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {

				throw new Error('THREE.GLTFLoader: WebP required by asset but unsupported.');

			}

			// Fall back to PNG or JPEG.
			return parser.loadTexture(textureIndex);

		});

	};

	GLTFTextureWebPExtension.prototype.detectSupport = function () {

		if (!this.isSupported) {

			this.isSupported = new Promise(function (resolve) {

				var image = new Image();

				// Lossy test image. Support for lossy images doesn't guarantee support for all
				// WebP images, unfortunately.
				image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

				image.onload = image.onerror = function () {

					resolve(image.height === 1);

				};

			});

		}

		return this.isSupported;

	};

	/**
	* meshopt BufferView Compression Extension
	*
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
	*/
	function GLTFMeshoptCompression(parser) {

		this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
		this.parser = parser;

	}

	GLTFMeshoptCompression.prototype.loadBufferView = function (index) {

		var json = this.parser.json;
		var bufferView = json.bufferViews[index];

		if (bufferView.extensions && bufferView.extensions[this.name]) {

			var extensionDef = bufferView.extensions[this.name];

			var buffer = this.parser.getDependency('buffer', extensionDef.buffer);
			var decoder = this.parser.options.meshoptDecoder;

			if (!decoder || !decoder.supported) {

				if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {

					throw new Error('THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files');

				} else {

					// Assumes that the extension is optional and that fallback buffer data is present
					return null;

				}

			}

			return Promise.all([buffer, decoder.ready]).then(function (res) {

				var byteOffset = extensionDef.byteOffset || 0;
				var byteLength = extensionDef.byteLength || 0;

				var count = extensionDef.count;
				var stride = extensionDef.byteStride;

				var result = new ArrayBuffer(count * stride);
				var source = new Uint8Array(res[0], byteOffset, byteLength);

				decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
				return result;

			});

		} else {

			return null;

		}

	};

	/* BINARY EXTENSION */
	var BINARY_EXTENSION_HEADER_MAGIC = 'glTF';
	var BINARY_EXTENSION_HEADER_LENGTH = 12;
	var BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

	function GLTFBinaryExtension(data) {

		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;

		var headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);

		this.header = {
			magic: THREE.LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
			version: headerView.getUint32(4, true),
			length: headerView.getUint32(8, true)
		};

		if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {

			throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.');

		} else if (this.header.version < 2.0) {

			throw new Error('THREE.GLTFLoader: Legacy binary file detected.');

		}

		var chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
		var chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
		var chunkIndex = 0;

		while (chunkIndex < chunkContentsLength) {

			var chunkLength = chunkView.getUint32(chunkIndex, true);
			chunkIndex += 4;

			var chunkType = chunkView.getUint32(chunkIndex, true);
			chunkIndex += 4;

			if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {

				var contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
				this.content = THREE.LoaderUtils.decodeText(contentArray);

			} else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {

				var byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice(byteOffset, byteOffset + chunkLength);

			}

			// Clients must ignore chunks with unknown types.

			chunkIndex += chunkLength;

		}

		if (this.content === null) {

			throw new Error('THREE.GLTFLoader: JSON content not found.');

		}

	}

	/**
	 * DRACO Mesh Compression Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
	 */
	function GLTFDracoMeshCompressionExtension(json, dracoLoader) {

		if (!dracoLoader) {

			throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.');

		}

		this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
		this.json = json;
		this.dracoLoader = dracoLoader;
		this.dracoLoader.preload();

	}

	GLTFDracoMeshCompressionExtension.prototype.decodePrimitive = function (primitive, parser) {

		var json = this.json;
		var dracoLoader = this.dracoLoader;
		var bufferViewIndex = primitive.extensions[this.name].bufferView;
		var gltfAttributeMap = primitive.extensions[this.name].attributes;
		var threeAttributeMap = {};
		var attributeNormalizedMap = {};
		var attributeTypeMap = {};

		for (var attributeName in gltfAttributeMap) {

			var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();

			threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];

		}

		for (attributeName in primitive.attributes) {

			var threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();

			if (gltfAttributeMap[attributeName] !== undefined) {

				var accessorDef = json.accessors[primitive.attributes[attributeName]];
				var componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType];

				attributeTypeMap[threeAttributeName] = componentType;
				attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;

			}

		}

		return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {

			return new Promise(function (resolve) {

				dracoLoader.decodeDracoFile(bufferView, function (geometry) {

					for (var attributeName in geometry.attributes) {

						var attribute = geometry.attributes[attributeName];
						var normalized = attributeNormalizedMap[attributeName];

						if (normalized !== undefined) attribute.normalized = normalized;

					}

					resolve(geometry);

				}, threeAttributeMap, attributeTypeMap);

			});

		});

	};

	/**
	 * Texture Transform Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
	 */
	function GLTFTextureTransformExtension() {

		this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;

	}

	GLTFTextureTransformExtension.prototype.extendTexture = function (texture, transform) {

		texture = texture.clone();

		if (transform.offset !== undefined) {

			texture.offset.fromArray(transform.offset);

		}

		if (transform.rotation !== undefined) {

			texture.rotation = transform.rotation;

		}

		if (transform.scale !== undefined) {

			texture.repeat.fromArray(transform.scale);

		}

		if (transform.texCoord !== undefined) {

			console.warn('THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.');

		}

		texture.needsUpdate = true;

		return texture;

	};

	/**
	 * Specular-Glossiness Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
	 */

	/**
	 * A sub class of THREE.StandardMaterial with some of the functionality
	 * changed via the `onBeforeCompile` callback
	 * @pailhead
	 */

	function GLTFMeshStandardSGMaterial(params) {

		THREE.MeshStandardMaterial.call(this);

		this.isGLTFSpecularGlossinessMaterial = true;

		//various chunks that need replacing
		var specularMapParsFragmentChunk = [
			'#ifdef USE_SPECULARMAP',
			'	uniform sampler2D specularMap;',
			'#endif'
		].join('\n');

		var glossinessMapParsFragmentChunk = [
			'#ifdef USE_GLOSSINESSMAP',
			'	uniform sampler2D glossinessMap;',
			'#endif'
		].join('\n');

		var specularMapFragmentChunk = [
			'vec3 specularFactor = specular;',
			'#ifdef USE_SPECULARMAP',
			'	vec4 texelSpecular = texture2D( specularMap, vUv );',
			'	texelSpecular = sRGBToLinear( texelSpecular );',
			'	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	specularFactor *= texelSpecular.rgb;',
			'#endif'
		].join('\n');

		var glossinessMapFragmentChunk = [
			'float glossinessFactor = glossiness;',
			'#ifdef USE_GLOSSINESSMAP',
			'	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
			'	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
			'	glossinessFactor *= texelGlossiness.a;',
			'#endif'
		].join('\n');

		var lightPhysicalFragmentChunk = [
			'PhysicalMaterial material;',
			'material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );',
			'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
			'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
			'material.specularRoughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.',
			'material.specularRoughness += geometryRoughness;',
			'material.specularRoughness = min( material.specularRoughness, 1.0 );',
			'material.specularColor = specularFactor;',
		].join('\n');

		var uniforms = {
			specular: { value: new THREE.Color().setHex(0xffffff) },
			glossiness: { value: 1 },
			specularMap: { value: null },
			glossinessMap: { value: null }
		};

		this._extraUniforms = uniforms;

		this.onBeforeCompile = function (shader) {

			for (var uniformName in uniforms) {

				shader.uniforms[uniformName] = uniforms[uniformName];

			}

			shader.fragmentShader = shader.fragmentShader
				.replace('uniform float roughness;', 'uniform vec3 specular;')
				.replace('uniform float metalness;', 'uniform float glossiness;')
				.replace('#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk)
				.replace('#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk)
				.replace('#include <roughnessmap_fragment>', specularMapFragmentChunk)
				.replace('#include <metalnessmap_fragment>', glossinessMapFragmentChunk)
				.replace('#include <lights_physical_fragment>', lightPhysicalFragmentChunk);

		};

		Object.defineProperties(this, {

			specular: {
				get: function () {

					return uniforms.specular.value;

				},
				set: function (v) {

					uniforms.specular.value = v;

				}
			},

			specularMap: {
				get: function () {

					return uniforms.specularMap.value;

				},
				set: function (v) {

					uniforms.specularMap.value = v;

					if (v) {

						this.defines.USE_SPECULARMAP = ''; // USE_UV is set by the renderer for specular maps

					} else {

						delete this.defines.USE_SPECULARMAP;

					}

				}
			},

			glossiness: {
				get: function () {

					return uniforms.glossiness.value;

				},
				set: function (v) {

					uniforms.glossiness.value = v;

				}
			},

			glossinessMap: {
				get: function () {

					return uniforms.glossinessMap.value;

				},
				set: function (v) {

					uniforms.glossinessMap.value = v;

					if (v) {

						this.defines.USE_GLOSSINESSMAP = '';
						this.defines.USE_UV = '';

					} else {

						delete this.defines.USE_GLOSSINESSMAP;
						delete this.defines.USE_UV;

					}

				}
			}

		});

		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;

		this.setValues(params);

	}

	GLTFMeshStandardSGMaterial.prototype = Object.create(THREE.MeshStandardMaterial.prototype);
	GLTFMeshStandardSGMaterial.prototype.constructor = GLTFMeshStandardSGMaterial;

	GLTFMeshStandardSGMaterial.prototype.copy = function (source) {

		THREE.MeshStandardMaterial.prototype.copy.call(this, source);
		this.specularMap = source.specularMap;
		this.specular.copy(source.specular);
		this.glossinessMap = source.glossinessMap;
		this.glossiness = source.glossiness;
		delete this.metalness;
		delete this.roughness;
		delete this.metalnessMap;
		delete this.roughnessMap;
		return this;

	};

	function GLTFMaterialsPbrSpecularGlossinessExtension() {

		return {

			name: EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,

			specularGlossinessParams: [
				'color',
				'map',
				'lightMap',
				'lightMapIntensity',
				'aoMap',
				'aoMapIntensity',
				'emissive',
				'emissiveIntensity',
				'emissiveMap',
				'bumpMap',
				'bumpScale',
				'normalMap',
				'normalMapType',
				'displacementMap',
				'displacementScale',
				'displacementBias',
				'specularMap',
				'specular',
				'glossinessMap',
				'glossiness',
				'alphaMap',
				'envMap',
				'envMapIntensity',
				'refractionRatio',
			],

			getMaterialType: function () {

				return GLTFMeshStandardSGMaterial;

			},

			extendParams: function (materialParams, materialDef, parser) {

				var pbrSpecularGlossiness = materialDef.extensions[this.name];

				materialParams.color = new THREE.Color(1.0, 1.0, 1.0);
				materialParams.opacity = 1.0;

				var pending = [];

				if (Array.isArray(pbrSpecularGlossiness.diffuseFactor)) {

					var array = pbrSpecularGlossiness.diffuseFactor;

					materialParams.color.fromArray(array);
					materialParams.opacity = array[3];

				}

				if (pbrSpecularGlossiness.diffuseTexture !== undefined) {

					pending.push(parser.assignTexture(materialParams, 'map', pbrSpecularGlossiness.diffuseTexture));

				}

				materialParams.emissive = new THREE.Color(0.0, 0.0, 0.0);
				materialParams.glossiness = pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0;
				materialParams.specular = new THREE.Color(1.0, 1.0, 1.0);

				if (Array.isArray(pbrSpecularGlossiness.specularFactor)) {

					materialParams.specular.fromArray(pbrSpecularGlossiness.specularFactor);

				}

				if (pbrSpecularGlossiness.specularGlossinessTexture !== undefined) {

					var specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture;
					pending.push(parser.assignTexture(materialParams, 'glossinessMap', specGlossMapDef));
					pending.push(parser.assignTexture(materialParams, 'specularMap', specGlossMapDef));

				}

				return Promise.all(pending);

			},

			createMaterial: function (materialParams) {

				var material = new GLTFMeshStandardSGMaterial(materialParams);
				material.fog = true;

				material.color = materialParams.color;

				material.map = materialParams.map === undefined ? null : materialParams.map;

				material.lightMap = null;
				material.lightMapIntensity = 1.0;

				material.aoMap = materialParams.aoMap === undefined ? null : materialParams.aoMap;
				material.aoMapIntensity = 1.0;

				material.emissive = materialParams.emissive;
				material.emissiveIntensity = 1.0;
				material.emissiveMap = materialParams.emissiveMap === undefined ? null : materialParams.emissiveMap;

				material.bumpMap = materialParams.bumpMap === undefined ? null : materialParams.bumpMap;
				material.bumpScale = 1;

				material.normalMap = materialParams.normalMap === undefined ? null : materialParams.normalMap;
				material.normalMapType = THREE.TangentSpaceNormalMap;

				if (materialParams.normalScale) material.normalScale = materialParams.normalScale;

				material.displacementMap = null;
				material.displacementScale = 1;
				material.displacementBias = 0;

				material.specularMap = materialParams.specularMap === undefined ? null : materialParams.specularMap;
				material.specular = materialParams.specular;

				material.glossinessMap = materialParams.glossinessMap === undefined ? null : materialParams.glossinessMap;
				material.glossiness = materialParams.glossiness;

				material.alphaMap = null;

				material.envMap = materialParams.envMap === undefined ? null : materialParams.envMap;
				material.envMapIntensity = 1.0;

				material.refractionRatio = 0.98;

				return material;

			},

		};

	}

	/**
	 * Mesh Quantization Extension
	 *
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
	 */
	function GLTFMeshQuantizationExtension() {

		this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;

	}

	/*********************************/
	/********** INTERPOLATION ********/
	/*********************************/

	// Spline Interpolation
	// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
	function GLTFCubicSplineInterpolant(parameterPositions, sampleValues, sampleSize, resultBuffer) {

		THREE.Interpolant.call(this, parameterPositions, sampleValues, sampleSize, resultBuffer);

	}

	GLTFCubicSplineInterpolant.prototype = Object.create(THREE.Interpolant.prototype);
	GLTFCubicSplineInterpolant.prototype.constructor = GLTFCubicSplineInterpolant;

	GLTFCubicSplineInterpolant.prototype.copySampleValue_ = function (index) {

		// Copies a sample value to the result buffer. See description of glTF
		// CUBICSPLINE values layout in interpolate_() function below.

		var result = this.resultBuffer,
			values = this.sampleValues,
			valueSize = this.valueSize,
			offset = index * valueSize * 3 + valueSize;

		for (var i = 0; i !== valueSize; i++) {

			result[i] = values[offset + i];

		}

		return result;

	};

	GLTFCubicSplineInterpolant.prototype.beforeStart_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

	GLTFCubicSplineInterpolant.prototype.afterEnd_ = GLTFCubicSplineInterpolant.prototype.copySampleValue_;

	GLTFCubicSplineInterpolant.prototype.interpolate_ = function (i1, t0, t, t1) {

		var result = this.resultBuffer;
		var values = this.sampleValues;
		var stride = this.valueSize;

		var stride2 = stride * 2;
		var stride3 = stride * 3;

		var td = t1 - t0;

		var p = (t - t0) / td;
		var pp = p * p;
		var ppp = pp * p;

		var offset1 = i1 * stride3;
		var offset0 = offset1 - stride3;

		var s2 = - 2 * ppp + 3 * pp;
		var s3 = ppp - pp;
		var s0 = 1 - s2;
		var s1 = s3 - pp + p;

		// Layout of keyframe output values for CUBICSPLINE animations:
		//   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
		for (var i = 0; i !== stride; i++) {

			var p0 = values[offset0 + i + stride]; // splineVertex_k
			var m0 = values[offset0 + i + stride2] * td; // outTangent_k * (t_k+1 - t_k)
			var p1 = values[offset1 + i + stride]; // splineVertex_k+1
			var m1 = values[offset1 + i] * td; // inTangent_k+1 * (t_k+1 - t_k)

			result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;

		}

		return result;

	};

	/*********************************/
	/********** INTERNALS ************/
	/*********************************/

	/* CONSTANTS */

	var WEBGL_CONSTANTS = {
		FLOAT: 5126,
		//FLOAT_MAT2: 35674,
		FLOAT_MAT3: 35675,
		FLOAT_MAT4: 35676,
		FLOAT_VEC2: 35664,
		FLOAT_VEC3: 35665,
		FLOAT_VEC4: 35666,
		LINEAR: 9729,
		REPEAT: 10497,
		SAMPLER_2D: 35678,
		POINTS: 0,
		LINES: 1,
		LINE_LOOP: 2,
		LINE_STRIP: 3,
		TRIANGLES: 4,
		TRIANGLE_STRIP: 5,
		TRIANGLE_FAN: 6,
		UNSIGNED_BYTE: 5121,
		UNSIGNED_SHORT: 5123
	};

	var WEBGL_COMPONENT_TYPES = {
		5120: Int8Array,
		5121: Uint8Array,
		5122: Int16Array,
		5123: Uint16Array,
		5125: Uint32Array,
		5126: Float32Array
	};

	var WEBGL_FILTERS = {
		9728: THREE.NearestFilter,
		9729: THREE.LinearFilter,
		9984: THREE.NearestMipmapNearestFilter,
		9985: THREE.LinearMipmapNearestFilter,
		9986: THREE.NearestMipmapLinearFilter,
		9987: THREE.LinearMipmapLinearFilter
	};

	var WEBGL_WRAPPINGS = {
		33071: THREE.ClampToEdgeWrapping,
		33648: THREE.MirroredRepeatWrapping,
		10497: THREE.RepeatWrapping
	};

	var WEBGL_TYPE_SIZES = {
		'SCALAR': 1,
		'VEC2': 2,
		'VEC3': 3,
		'VEC4': 4,
		'MAT2': 4,
		'MAT3': 9,
		'MAT4': 16
	};

	var ATTRIBUTES = {
		POSITION: 'position',
		NORMAL: 'normal',
		TANGENT: 'tangent',
		TEXCOORD_0: 'uv',
		TEXCOORD_1: 'uv2',
		COLOR_0: 'color',
		WEIGHTS_0: 'skinWeight',
		JOINTS_0: 'skinIndex',
	};

	var PATH_PROPERTIES = {
		scale: 'scale',
		translation: 'position',
		rotation: 'quaternion',
		weights: 'morphTargetInfluences'
	};

	var INTERPOLATION = {
		CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
		// keyframe track will be initialized with a default interpolation type, then modified.
		LINEAR: THREE.InterpolateLinear,
		STEP: THREE.InterpolateDiscrete
	};

	var ALPHA_MODES = {
		OPAQUE: 'OPAQUE',
		MASK: 'MASK',
		BLEND: 'BLEND'
	};

	/* UTILITY FUNCTIONS */

	function resolveURL(url, path) {

		// Invalid URL
		if (typeof url !== 'string' || url === '') return '';

		// Host Relative URL
		if (/^https?:\/\//i.test(path) && /^\//.test(url)) {

			path = path.replace(/(^https?:\/\/[^\/]+).*/i, '$1');

		}

		// Absolute URL http://,https://,//
		if (/^(https?:)?\/\//i.test(url)) return url;

		// Data URI
		if (/^data:.*,.*$/i.test(url)) return url;

		// Blob URL
		if (/^blob:.*$/i.test(url)) return url;

		// Relative URL
		return path + url;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
	 */
	function createDefaultMaterial(cache) {

		if (cache['DefaultMaterial'] === undefined) {

			cache['DefaultMaterial'] = new THREE.MeshStandardMaterial({
				color: 0xFFFFFF,
				emissive: 0x000000,
				metalness: 1,
				roughness: 1,
				transparent: false,
				depthTest: true,
				side: THREE.FrontSide
			});

		}

		return cache['DefaultMaterial'];

	}

	function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {

		// Add unknown glTF extensions to an object's userData.

		for (var name in objectDef.extensions) {

			if (knownExtensions[name] === undefined) {

				object.userData.gltfExtensions = object.userData.gltfExtensions || {};
				object.userData.gltfExtensions[name] = objectDef.extensions[name];

			}

		}

	}

	/**
	 * @param {THREE.Object3D|THREE.Material|THREE.BufferGeometry} object
	 * @param {GLTF.definition} gltfDef
	 */
	function assignExtrasToUserData(object, gltfDef) {

		if (gltfDef.extras !== undefined) {

			if (typeof gltfDef.extras === 'object') {

				Object.assign(object.userData, gltfDef.extras);

			} else {

				console.warn('THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras);

			}

		}

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
	 *
	 * @param {THREE.BufferGeometry} geometry
	 * @param {Array<GLTF.Target>} targets
	 * @param {GLTFParser} parser
	 * @return {Promise<THREE.BufferGeometry>}
	 */
	function addMorphTargets(geometry, targets, parser) {

		var hasMorphPosition = false;
		var hasMorphNormal = false;

		for (var i = 0, il = targets.length; i < il; i++) {

			var target = targets[i];

			if (target.POSITION !== undefined) hasMorphPosition = true;
			if (target.NORMAL !== undefined) hasMorphNormal = true;

			if (hasMorphPosition && hasMorphNormal) break;

		}

		if (!hasMorphPosition && !hasMorphNormal) return Promise.resolve(geometry);

		var pendingPositionAccessors = [];
		var pendingNormalAccessors = [];

		for (var i = 0, il = targets.length; i < il; i++) {

			var target = targets[i];

			if (hasMorphPosition) {

				var pendingAccessor = target.POSITION !== undefined
					? parser.getDependency('accessor', target.POSITION)
					: geometry.attributes.position;

				pendingPositionAccessors.push(pendingAccessor);

			}

			if (hasMorphNormal) {

				var pendingAccessor = target.NORMAL !== undefined
					? parser.getDependency('accessor', target.NORMAL)
					: geometry.attributes.normal;

				pendingNormalAccessors.push(pendingAccessor);

			}

		}

		return Promise.all([
			Promise.all(pendingPositionAccessors),
			Promise.all(pendingNormalAccessors)
		]).then(function (accessors) {

			var morphPositions = accessors[0];
			var morphNormals = accessors[1];

			if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
			if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
			geometry.morphTargetsRelative = true;

			return geometry;

		});

	}

	/**
	 * @param {THREE.Mesh} mesh
	 * @param {GLTF.Mesh} meshDef
	 */
	function updateMorphTargets(mesh, meshDef) {

		mesh.updateMorphTargets();

		if (meshDef.weights !== undefined) {

			for (var i = 0, il = meshDef.weights.length; i < il; i++) {

				mesh.morphTargetInfluences[i] = meshDef.weights[i];

			}

		}

		// .extras has user-defined data, so check that .extras.targetNames is an array.
		if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {

			var targetNames = meshDef.extras.targetNames;

			if (mesh.morphTargetInfluences.length === targetNames.length) {

				mesh.morphTargetDictionary = {};

				for (var i = 0, il = targetNames.length; i < il; i++) {

					mesh.morphTargetDictionary[targetNames[i]] = i;

				}

			} else {

				console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.');

			}

		}

	}

	function createPrimitiveKey(primitiveDef) {

		var dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
		var geometryKey;

		if (dracoExtension) {

			geometryKey = 'draco:' + dracoExtension.bufferView
				+ ':' + dracoExtension.indices
				+ ':' + createAttributesKey(dracoExtension.attributes);

		} else {

			geometryKey = primitiveDef.indices + ':' + createAttributesKey(primitiveDef.attributes) + ':' + primitiveDef.mode;

		}

		return geometryKey;

	}

	function createAttributesKey(attributes) {

		var attributesKey = '';

		var keys = Object.keys(attributes).sort();

		for (var i = 0, il = keys.length; i < il; i++) {

			attributesKey += keys[i] + ':' + attributes[keys[i]] + ';';

		}

		return attributesKey;

	}

	/* GLTF PARSER */

	function GLTFParser(json, options) {

		this.json = json || {};
		this.extensions = {};
		this.plugins = {};
		this.options = options || {};

		// loader object cache
		this.cache = new GLTFRegistry();

		// associations between Three.js objects and glTF elements
		this.associations = new Map();

		// BufferGeometry caching
		this.primitiveCache = {};

		// Object3D instance caches
		this.meshCache = { refs: {}, uses: {} };
		this.cameraCache = { refs: {}, uses: {} };
		this.lightCache = { refs: {}, uses: {} };

		// Track node names, to ensure no duplicates
		this.nodeNamesUsed = {};

		// Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
		// expensive work of uploading a texture to the GPU off the main thread.
		if (typeof createImageBitmap !== 'undefined' && /Firefox/.test(navigator.userAgent) === false) {

			this.textureLoader = new THREE.ImageBitmapLoader(this.options.manager);

		} else {

			this.textureLoader = new THREE.TextureLoader(this.options.manager);

		}

		this.textureLoader.setCrossOrigin(this.options.crossOrigin);
		this.textureLoader.setRequestHeader(this.options.requestHeader);

		this.fileLoader = new THREE.FileLoader(this.options.manager);
		this.fileLoader.setResponseType('arraybuffer');

		if (this.options.crossOrigin === 'use-credentials') {

			this.fileLoader.setWithCredentials(true);

		}

	}

	GLTFParser.prototype.setExtensions = function (extensions) {

		this.extensions = extensions;

	};

	GLTFParser.prototype.setPlugins = function (plugins) {

		this.plugins = plugins;

	};

	GLTFParser.prototype.parse = function (onLoad, onError) {

		var parser = this;
		var json = this.json;
		var extensions = this.extensions;

		// Clear the loader cache
		this.cache.removeAll();

		// Mark the special nodes/meshes in json for efficient parse
		this._invokeAll(function (ext) {

			return ext._markDefs && ext._markDefs();

		});

		Promise.all(this._invokeAll(function (ext) {

			return ext.beforeRoot && ext.beforeRoot();

		})).then(function () {

			return Promise.all([

				parser.getDependencies('scene'),
				parser.getDependencies('animation'),
				parser.getDependencies('camera'),

			]);

		}).then(function (dependencies) {

			var result = {
				scene: dependencies[0][json.scene || 0],
				scenes: dependencies[0],
				animations: dependencies[1],
				cameras: dependencies[2],
				asset: json.asset,
				parser: parser,
				userData: {}
			};

			addUnknownExtensionsToUserData(extensions, result, json);

			assignExtrasToUserData(result, json);

			Promise.all(parser._invokeAll(function (ext) {

				return ext.afterRoot && ext.afterRoot(result);

			})).then(function () {

				onLoad(result);

			});

		}).catch(onError);

	};

	/**
	 * Marks the special nodes/meshes in json for efficient parse.
	 */
	GLTFParser.prototype._markDefs = function () {

		var nodeDefs = this.json.nodes || [];
		var skinDefs = this.json.skins || [];
		var meshDefs = this.json.meshes || [];

		// Nothing in the node definition indicates whether it is a Bone or an
		// Object3D. Use the skins' joint references to mark bones.
		for (var skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {

			var joints = skinDefs[skinIndex].joints;

			for (var i = 0, il = joints.length; i < il; i++) {

				nodeDefs[joints[i]].isBone = true;

			}

		}

		// Iterate over all nodes, marking references to shared resources,
		// as well as skeleton joints.
		for (var nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {

			var nodeDef = nodeDefs[nodeIndex];

			if (nodeDef.mesh !== undefined) {

				this._addNodeRef(this.meshCache, nodeDef.mesh);

				// Nothing in the mesh definition indicates whether it is
				// a SkinnedMesh or Mesh. Use the node's mesh reference
				// to mark SkinnedMesh if node has skin.
				if (nodeDef.skin !== undefined) {

					meshDefs[nodeDef.mesh].isSkinnedMesh = true;

				}

			}

			if (nodeDef.camera !== undefined) {

				this._addNodeRef(this.cameraCache, nodeDef.camera);

			}

		}

	};

	/**
	 * Counts references to shared node / Object3D resources. These resources
	 * can be reused, or "instantiated", at multiple nodes in the scene
	 * hierarchy. Mesh, Camera, and Light instances are instantiated and must
	 * be marked. Non-scenegraph resources (like Materials, Geometries, and
	 * Textures) can be reused directly and are not marked here.
	 *
	 * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
	 */
	GLTFParser.prototype._addNodeRef = function (cache, index) {

		if (index === undefined) return;

		if (cache.refs[index] === undefined) {

			cache.refs[index] = cache.uses[index] = 0;

		}

		cache.refs[index]++;

	};

	/** Returns a reference to a shared resource, cloning it if necessary. */
	GLTFParser.prototype._getNodeRef = function (cache, index, object) {

		if (cache.refs[index] <= 1) return object;

		var ref = object.clone();

		ref.name += '_instance_' + (cache.uses[index]++);

		return ref;

	};

	GLTFParser.prototype._invokeOne = function (func) {

		var extensions = Object.values(this.plugins);
		extensions.push(this);

		for (var i = 0; i < extensions.length; i++) {

			var result = func(extensions[i]);

			if (result) return result;

		}

	};

	GLTFParser.prototype._invokeAll = function (func) {

		var extensions = Object.values(this.plugins);
		extensions.unshift(this);

		var pending = [];

		for (var i = 0; i < extensions.length; i++) {

			var result = func(extensions[i]);

			if (result) pending.push(result);

		}

		return pending;

	};

	/**
	 * Requests the specified dependency asynchronously, with caching.
	 * @param {string} type
	 * @param {number} index
	 * @return {Promise<THREE.Object3D|THREE.Material|THREE.Texture|THREE.AnimationClip|ArrayBuffer|Object>}
	 */
	GLTFParser.prototype.getDependency = function (type, index) {

		var cacheKey = type + ':' + index;
		var dependency = this.cache.get(cacheKey);

		if (!dependency) {

			switch (type) {

				case 'scene':
					dependency = this.loadScene(index);
					break;

				case 'node':
					dependency = this.loadNode(index);
					break;

				case 'mesh':
					dependency = this._invokeOne(function (ext) {

						return ext.loadMesh && ext.loadMesh(index);

					});
					break;

				case 'accessor':
					dependency = this.loadAccessor(index);
					break;

				case 'bufferView':
					dependency = this._invokeOne(function (ext) {

						return ext.loadBufferView && ext.loadBufferView(index);

					});
					break;

				case 'buffer':
					dependency = this.loadBuffer(index);
					break;

				case 'material':
					dependency = this._invokeOne(function (ext) {

						return ext.loadMaterial && ext.loadMaterial(index);

					});
					break;

				case 'texture':
					dependency = this._invokeOne(function (ext) {

						return ext.loadTexture && ext.loadTexture(index);

					});
					break;

				case 'skin':
					dependency = this.loadSkin(index);
					break;

				case 'animation':
					dependency = this.loadAnimation(index);
					break;

				case 'camera':
					dependency = this.loadCamera(index);
					break;

				default:
					throw new Error('Unknown type: ' + type);

			}

			this.cache.add(cacheKey, dependency);

		}

		return dependency;

	};

	/**
	 * Requests all dependencies of the specified type asynchronously, with caching.
	 * @param {string} type
	 * @return {Promise<Array<Object>>}
	 */
	GLTFParser.prototype.getDependencies = function (type) {

		var dependencies = this.cache.get(type);

		if (!dependencies) {

			var parser = this;
			var defs = this.json[type + (type === 'mesh' ? 'es' : 's')] || [];

			dependencies = Promise.all(defs.map(function (def, index) {

				return parser.getDependency(type, index);

			}));

			this.cache.add(type, dependencies);

		}

		return dependencies;

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	GLTFParser.prototype.loadBuffer = function (bufferIndex) {

		var bufferDef = this.json.buffers[bufferIndex];
		var loader = this.fileLoader;

		if (bufferDef.type && bufferDef.type !== 'arraybuffer') {

			throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.');

		}

		// If present, GLB container is required to be the first buffer.
		if (bufferDef.uri === undefined && bufferIndex === 0) {

			return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);

		}

		var options = this.options;

		return new Promise(function (resolve, reject) {

			loader.load(resolveURL(bufferDef.uri, options.path), resolve, undefined, function () {

				reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'));

			});

		});

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	 * @param {number} bufferViewIndex
	 * @return {Promise<ArrayBuffer>}
	 */
	GLTFParser.prototype.loadBufferView = function (bufferViewIndex) {

		var bufferViewDef = this.json.bufferViews[bufferViewIndex];

		return this.getDependency('buffer', bufferViewDef.buffer).then(function (buffer) {

			var byteLength = bufferViewDef.byteLength || 0;
			var byteOffset = bufferViewDef.byteOffset || 0;
			return buffer.slice(byteOffset, byteOffset + byteLength);

		});

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
	 * @param {number} accessorIndex
	 * @return {Promise<THREE.BufferAttribute|THREE.InterleavedBufferAttribute>}
	 */
	GLTFParser.prototype.loadAccessor = function (accessorIndex) {

		var parser = this;
		var json = this.json;

		var accessorDef = this.json.accessors[accessorIndex];

		if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {

			// Ignore empty accessors, which may be used to declare runtime
			// information about attributes coming from another source (e.g. Draco
			// compression extension).
			return Promise.resolve(null);

		}

		var pendingBufferViews = [];

		if (accessorDef.bufferView !== undefined) {

			pendingBufferViews.push(this.getDependency('bufferView', accessorDef.bufferView));

		} else {

			pendingBufferViews.push(null);

		}

		if (accessorDef.sparse !== undefined) {

			pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.indices.bufferView));
			pendingBufferViews.push(this.getDependency('bufferView', accessorDef.sparse.values.bufferView));

		}

		return Promise.all(pendingBufferViews).then(function (bufferViews) {

			var bufferView = bufferViews[0];

			var itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
			var TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];

			// For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
			var elementBytes = TypedArray.BYTES_PER_ELEMENT;
			var itemBytes = elementBytes * itemSize;
			var byteOffset = accessorDef.byteOffset || 0;
			var byteStride = accessorDef.bufferView !== undefined ? json.bufferViews[accessorDef.bufferView].byteStride : undefined;
			var normalized = accessorDef.normalized === true;
			var array, bufferAttribute;

			// The buffer is not interleaved if the stride is the item size in bytes.
			if (byteStride && byteStride !== itemBytes) {

				// Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
				// This makes sure that IBA.count reflects accessor.count properly
				var ibSlice = Math.floor(byteOffset / byteStride);
				var ibCacheKey = 'InterleavedBuffer:' + accessorDef.bufferView + ':' + accessorDef.componentType + ':' + ibSlice + ':' + accessorDef.count;
				var ib = parser.cache.get(ibCacheKey);

				if (!ib) {

					array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);

					// Integer parameters to IB/IBA are in array elements, not bytes.
					ib = new THREE.InterleavedBuffer(array, byteStride / elementBytes);

					parser.cache.add(ibCacheKey, ib);

				}

				bufferAttribute = new THREE.InterleavedBufferAttribute(ib, itemSize, (byteOffset % byteStride) / elementBytes, normalized);

			} else {

				if (bufferView === null) {

					array = new TypedArray(accessorDef.count * itemSize);

				} else {

					array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);

				}

				bufferAttribute = new THREE.BufferAttribute(array, itemSize, normalized);

			}

			// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
			if (accessorDef.sparse !== undefined) {

				var itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
				var TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];

				var byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
				var byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

				var sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
				var sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);

				if (bufferView !== null) {

					// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
					bufferAttribute = new THREE.BufferAttribute(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);

				}

				for (var i = 0, il = sparseIndices.length; i < il; i++) {

					var index = sparseIndices[i];

					bufferAttribute.setX(index, sparseValues[i * itemSize]);
					if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
					if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
					if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
					if (itemSize >= 5) throw new Error('THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.');

				}

			}

			return bufferAttribute;

		});

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
	 * @param {number} textureIndex
	 * @return {Promise<THREE.Texture>}
	 */
	GLTFParser.prototype.loadTexture = function (textureIndex) {

		var json = this.json;
		var options = this.options;
		var textureDef = json.textures[textureIndex];
		var source = json.images[textureDef.source];

		var loader = this.textureLoader;

		if (source.uri) {

			var handler = options.manager.getHandler(source.uri);
			if (handler !== null) loader = handler;

		}

		return this.loadTextureImage(textureIndex, source, loader);

	};

	GLTFParser.prototype.loadTextureImage = function (textureIndex, source, loader) {

		var parser = this;
		var json = this.json;
		var options = this.options;

		var textureDef = json.textures[textureIndex];

		var URL = self.URL || self.webkitURL;

		var sourceURI = source.uri;
		var isObjectURL = false;
		var hasAlpha = true;

		if (source.mimeType === 'image/jpeg') hasAlpha = false;

		if (source.bufferView !== undefined) {

			// Load binary image data from bufferView, if provided.

			sourceURI = parser.getDependency('bufferView', source.bufferView).then(function (bufferView) {

				if (source.mimeType === 'image/png') {

					// Inspect the PNG 'IHDR' chunk to determine whether the image could have an
					// alpha channel. This check is conservative � the image could have an alpha
					// channel with all values == 1, and the indexed type (colorType == 3) only
					// sometimes contains alpha.
					//
					// https://en.wikipedia.org/wiki/Portable_Network_Graphics#File_header
					var colorType = new DataView(bufferView, 25, 1).getUint8(0, false);
					hasAlpha = colorType === 6 || colorType === 4 || colorType === 3;

				}

				isObjectURL = true;
				var blob = new Blob([bufferView], { type: source.mimeType });
				sourceURI = URL.createObjectURL(blob);
				return sourceURI;

			});

		} else if (source.uri === undefined) {

			throw new Error('THREE.GLTFLoader: Image ' + textureIndex + ' is missing URI and bufferView');

		}

		return Promise.resolve(sourceURI).then(function (sourceURI) {

			return new Promise(function (resolve, reject) {

				var onLoad = resolve;

				if (loader.isImageBitmapLoader === true) {

					onLoad = function (imageBitmap) {

						resolve(new THREE.CanvasTexture(imageBitmap));

					};

				}

				loader.load(resolveURL(sourceURI, options.path), onLoad, undefined, reject);

			});

		}).then(function (texture) {

			// Clean up resources and configure Texture.

			if (isObjectURL === true) {

				URL.revokeObjectURL(sourceURI);

			}

			texture.flipY = false;

			if (textureDef.name) texture.name = textureDef.name;

			// When there is definitely no alpha channel in the texture, set RGBFormat to save space.
			if (!hasAlpha) texture.format = THREE.RGBFormat;

			var samplers = json.samplers || {};
			var sampler = samplers[textureDef.sampler] || {};

			texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || THREE.LinearFilter;
			texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || THREE.LinearMipmapLinearFilter;
			texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || THREE.RepeatWrapping;
			texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || THREE.RepeatWrapping;

			parser.associations.set(texture, {
				type: 'textures',
				index: textureIndex
			});

			return texture;

		});

	};

	/**
	 * Asynchronously assigns a texture to the given material parameters.
	 * @param {Object} materialParams
	 * @param {string} mapName
	 * @param {Object} mapDef
	 * @return {Promise}
	 */
	GLTFParser.prototype.assignTexture = function (materialParams, mapName, mapDef) {

		var parser = this;

		return this.getDependency('texture', mapDef.index).then(function (texture) {

			// Materials sample aoMap from UV set 1 and other maps from UV set 0 - this can't be configured
			// However, we will copy UV set 0 to UV set 1 on demand for aoMap
			if (mapDef.texCoord !== undefined && mapDef.texCoord != 0 && !(mapName === 'aoMap' && mapDef.texCoord == 1)) {

				console.warn('THREE.GLTFLoader: Custom UV set ' + mapDef.texCoord + ' for texture ' + mapName + ' not yet supported.');

			}

			if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {

				var transform = mapDef.extensions !== undefined ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : undefined;

				if (transform) {

					var gltfReference = parser.associations.get(texture);
					texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
					parser.associations.set(texture, gltfReference);

				}

			}

			materialParams[mapName] = texture;

		});

	};

	/**
	 * Assigns final material to a Mesh, Line, or Points instance. The instance
	 * already has a material (generated from the glTF material options alone)
	 * but reuse of the same glTF material may require multiple threejs materials
	 * to accommodate different primitive types, defines, etc. New materials will
	 * be created if necessary, and reused from a cache.
	 * @param  {THREE.Object3D} mesh Mesh, Line, or Points instance.
	 */
	GLTFParser.prototype.assignFinalMaterial = function (mesh) {

		var geometry = mesh.geometry;
		var material = mesh.material;

		var useVertexTangents = geometry.attributes.tangent !== undefined;
		var useVertexColors = geometry.attributes.color !== undefined;
		var useFlatShading = geometry.attributes.normal === undefined;
		var useSkinning = mesh.isSkinnedMesh === true;
		var useMorphTargets = Object.keys(geometry.morphAttributes).length > 0;
		var useMorphNormals = useMorphTargets && geometry.morphAttributes.normal !== undefined;

		if (mesh.isPoints) {

			var cacheKey = 'PointsMaterial:' + material.uuid;

			var pointsMaterial = this.cache.get(cacheKey);

			if (!pointsMaterial) {

				pointsMaterial = new THREE.PointsMaterial();
				THREE.Material.prototype.copy.call(pointsMaterial, material);
				pointsMaterial.color.copy(material.color);
				pointsMaterial.map = material.map;
				pointsMaterial.sizeAttenuation = false; // glTF spec says points should be 1px

				this.cache.add(cacheKey, pointsMaterial);

			}

			material = pointsMaterial;

		} else if (mesh.isLine) {

			var cacheKey = 'LineBasicMaterial:' + material.uuid;

			var lineMaterial = this.cache.get(cacheKey);

			if (!lineMaterial) {

				lineMaterial = new THREE.LineBasicMaterial();
				THREE.Material.prototype.copy.call(lineMaterial, material);
				lineMaterial.color.copy(material.color);

				this.cache.add(cacheKey, lineMaterial);

			}

			material = lineMaterial;

		}

		// Clone the material if it will be modified
		if (useVertexTangents || useVertexColors || useFlatShading || useSkinning || useMorphTargets) {

			var cacheKey = 'ClonedMaterial:' + material.uuid + ':';

			if (material.isGLTFSpecularGlossinessMaterial) cacheKey += 'specular-glossiness:';
			if (useSkinning) cacheKey += 'skinning:';
			if (useVertexTangents) cacheKey += 'vertex-tangents:';
			if (useVertexColors) cacheKey += 'vertex-colors:';
			if (useFlatShading) cacheKey += 'flat-shading:';
			if (useMorphTargets) cacheKey += 'morph-targets:';
			if (useMorphNormals) cacheKey += 'morph-normals:';

			var cachedMaterial = this.cache.get(cacheKey);

			if (!cachedMaterial) {

				cachedMaterial = material.clone();

				if (useSkinning) cachedMaterial.skinning = true;
				if (useVertexColors) cachedMaterial.vertexColors = true;
				if (useFlatShading) cachedMaterial.flatShading = true;
				if (useMorphTargets) cachedMaterial.morphTargets = true;
				if (useMorphNormals) cachedMaterial.morphNormals = true;

				if (useVertexTangents) {

					cachedMaterial.vertexTangents = true;

					// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
					if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= - 1;
					if (cachedMaterial.clearcoatNormalScale) cachedMaterial.clearcoatNormalScale.y *= - 1;

				}

				this.cache.add(cacheKey, cachedMaterial);

				this.associations.set(cachedMaterial, this.associations.get(material));

			}

			material = cachedMaterial;

		}

		// workarounds for mesh and geometry

		if (material.aoMap && geometry.attributes.uv2 === undefined && geometry.attributes.uv !== undefined) {

			geometry.setAttribute('uv2', geometry.attributes.uv);

		}

		mesh.material = material;

	};

	GLTFParser.prototype.getMaterialType = function ( /* materialIndex */) {

		return THREE.MeshStandardMaterial;

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
	 * @param {number} materialIndex
	 * @return {Promise<THREE.Material>}
	 */
	GLTFParser.prototype.loadMaterial = function (materialIndex) {

		var parser = this;
		var json = this.json;
		var extensions = this.extensions;
		var materialDef = json.materials[materialIndex];

		var materialType;
		var materialParams = {};
		var materialExtensions = materialDef.extensions || {};

		var pending = [];

		if (materialExtensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {

			var sgExtension = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
			materialType = sgExtension.getMaterialType();
			pending.push(sgExtension.extendParams(materialParams, materialDef, parser));

		} else if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {

			var kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
			materialType = kmuExtension.getMaterialType();
			pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));

		} else {

			// Specification:
			// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

			var metallicRoughness = materialDef.pbrMetallicRoughness || {};

			materialParams.color = new THREE.Color(1.0, 1.0, 1.0);
			materialParams.opacity = 1.0;

			if (Array.isArray(metallicRoughness.baseColorFactor)) {

				var array = metallicRoughness.baseColorFactor;

				materialParams.color.fromArray(array);
				materialParams.opacity = array[3];

			}

			if (metallicRoughness.baseColorTexture !== undefined) {

				pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture));

			}

			materialParams.metalness = metallicRoughness.metallicFactor !== undefined ? metallicRoughness.metallicFactor : 1.0;
			materialParams.roughness = metallicRoughness.roughnessFactor !== undefined ? metallicRoughness.roughnessFactor : 1.0;

			if (metallicRoughness.metallicRoughnessTexture !== undefined) {

				pending.push(parser.assignTexture(materialParams, 'metalnessMap', metallicRoughness.metallicRoughnessTexture));
				pending.push(parser.assignTexture(materialParams, 'roughnessMap', metallicRoughness.metallicRoughnessTexture));

			}

			materialType = this._invokeOne(function (ext) {

				return ext.getMaterialType && ext.getMaterialType(materialIndex);

			});

			pending.push(Promise.all(this._invokeAll(function (ext) {

				return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);

			})));

		}

		if (materialDef.doubleSided === true) {

			materialParams.side = THREE.DoubleSide;

		}

		var alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

		if (alphaMode === ALPHA_MODES.BLEND) {

			materialParams.transparent = true;

			// See: https://github.com/mrdoob/three.js/issues/17706
			materialParams.depthWrite = false;

		} else {

			materialParams.transparent = false;

			if (alphaMode === ALPHA_MODES.MASK) {

				materialParams.alphaTest = materialDef.alphaCutoff !== undefined ? materialDef.alphaCutoff : 0.5;

			}

		}

		if (materialDef.normalTexture !== undefined && materialType !== THREE.MeshBasicMaterial) {

			pending.push(parser.assignTexture(materialParams, 'normalMap', materialDef.normalTexture));

			// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
			materialParams.normalScale = new THREE.Vector2(1, - 1);

			if (materialDef.normalTexture.scale !== undefined) {

				materialParams.normalScale.set(materialDef.normalTexture.scale, - materialDef.normalTexture.scale);

			}

		}

		if (materialDef.occlusionTexture !== undefined && materialType !== THREE.MeshBasicMaterial) {

			pending.push(parser.assignTexture(materialParams, 'aoMap', materialDef.occlusionTexture));

			if (materialDef.occlusionTexture.strength !== undefined) {

				materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;

			}

		}

		if (materialDef.emissiveFactor !== undefined && materialType !== THREE.MeshBasicMaterial) {

			materialParams.emissive = new THREE.Color().fromArray(materialDef.emissiveFactor);

		}

		if (materialDef.emissiveTexture !== undefined && materialType !== THREE.MeshBasicMaterial) {

			pending.push(parser.assignTexture(materialParams, 'emissiveMap', materialDef.emissiveTexture));

		}

		return Promise.all(pending).then(function () {

			var material;

			if (materialType === GLTFMeshStandardSGMaterial) {

				material = extensions[EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].createMaterial(materialParams);

			} else {

				material = new materialType(materialParams);

			}

			if (materialDef.name) material.name = materialDef.name;

			// baseColorTexture, emissiveTexture, and specularGlossinessTexture use sRGB encoding.
			if (material.map) material.map.encoding = THREE.sRGBEncoding;
			if (material.emissiveMap) material.emissiveMap.encoding = THREE.sRGBEncoding;

			assignExtrasToUserData(material, materialDef);

			parser.associations.set(material, { type: 'materials', index: materialIndex });

			if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);

			return material;

		});

	};

	/** When Object3D instances are targeted by animation, they need unique names. */
	GLTFParser.prototype.createUniqueName = function (originalName) {

		var sanitizedName = THREE.PropertyBinding.sanitizeNodeName(originalName || '');

		var name = sanitizedName;

		for (var i = 1; this.nodeNamesUsed[name]; ++i) {

			name = sanitizedName + '_' + i;

		}

		this.nodeNamesUsed[name] = true;

		return name;

	};

	/**
	 * @param {THREE.BufferGeometry} geometry
	 * @param {GLTF.Primitive} primitiveDef
	 * @param {GLTFParser} parser
	 */
	function computeBounds(geometry, primitiveDef, parser) {

		var attributes = primitiveDef.attributes;

		var box = new THREE.Box3();

		if (attributes.POSITION !== undefined) {

			var accessor = parser.json.accessors[attributes.POSITION];

			var min = accessor.min;
			var max = accessor.max;

			// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

			if (min !== undefined && max !== undefined) {

				box.set(
					new THREE.Vector3(min[0], min[1], min[2]),
					new THREE.Vector3(max[0], max[1], max[2]));

			} else {

				console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.');

				return;

			}

		} else {

			return;

		}

		var targets = primitiveDef.targets;

		if (targets !== undefined) {

			var maxDisplacement = new THREE.Vector3();
			var vector = new THREE.Vector3();

			for (var i = 0, il = targets.length; i < il; i++) {

				var target = targets[i];

				if (target.POSITION !== undefined) {

					var accessor = parser.json.accessors[target.POSITION];
					var min = accessor.min;
					var max = accessor.max;

					// glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

					if (min !== undefined && max !== undefined) {

						// we need to get max of absolute components because target weight is [-1,1]
						vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
						vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
						vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));

						// Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
						// to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
						// are used to implement key-frame animations and as such only two are active at a time - this results in very large
						// boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
						maxDisplacement.max(vector);

					} else {

						console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.');

					}

				}

			}

			// As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
			box.expandByVector(maxDisplacement);

		}

		geometry.boundingBox = box;

		var sphere = new THREE.Sphere();

		box.getCenter(sphere.center);
		sphere.radius = box.min.distanceTo(box.max) / 2;

		geometry.boundingSphere = sphere;

	}

	/**
	 * @param {THREE.BufferGeometry} geometry
	 * @param {GLTF.Primitive} primitiveDef
	 * @param {GLTFParser} parser
	 * @return {Promise<THREE.BufferGeometry>}
	 */
	function addPrimitiveAttributes(geometry, primitiveDef, parser) {

		var attributes = primitiveDef.attributes;

		var pending = [];

		function assignAttributeAccessor(accessorIndex, attributeName) {

			return parser.getDependency('accessor', accessorIndex)
				.then(function (accessor) {

					geometry.setAttribute(attributeName, accessor);

				});

		}

		for (var gltfAttributeName in attributes) {

			var threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();

			// Skip attributes already provided by e.g. Draco extension.
			if (threeAttributeName in geometry.attributes) continue;

			pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));

		}

		if (primitiveDef.indices !== undefined && !geometry.index) {

			var accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {

				geometry.setIndex(accessor);

			});

			pending.push(accessor);

		}

		assignExtrasToUserData(geometry, primitiveDef);

		computeBounds(geometry, primitiveDef, parser);

		return Promise.all(pending).then(function () {

			return primitiveDef.targets !== undefined
				? addMorphTargets(geometry, primitiveDef.targets, parser)
				: geometry;

		});

	}

	/**
	 * @param {THREE.BufferGeometry} geometry
	 * @param {Number} drawMode
	 * @return {THREE.BufferGeometry}
	 */
	function toTrianglesDrawMode(geometry, drawMode) {

		var index = geometry.getIndex();

		// generate index if not present

		if (index === null) {

			var indices = [];

			var position = geometry.getAttribute('position');

			if (position !== undefined) {

				for (var i = 0; i < position.count; i++) {

					indices.push(i);

				}

				geometry.setIndex(indices);
				index = geometry.getIndex();

			} else {

				console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.');
				return geometry;

			}

		}

		//

		var numberOfTriangles = index.count - 2;
		var newIndices = [];

		if (drawMode === THREE.TriangleFanDrawMode) {

			// gl.TRIANGLE_FAN

			for (var i = 1; i <= numberOfTriangles; i++) {

				newIndices.push(index.getX(0));
				newIndices.push(index.getX(i));
				newIndices.push(index.getX(i + 1));

			}

		} else {

			// gl.TRIANGLE_STRIP

			for (var i = 0; i < numberOfTriangles; i++) {

				if (i % 2 === 0) {

					newIndices.push(index.getX(i));
					newIndices.push(index.getX(i + 1));
					newIndices.push(index.getX(i + 2));


				} else {

					newIndices.push(index.getX(i + 2));
					newIndices.push(index.getX(i + 1));
					newIndices.push(index.getX(i));

				}

			}

		}

		if ((newIndices.length / 3) !== numberOfTriangles) {

			console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.');

		}

		// build final geometry

		var newGeometry = geometry.clone();
		newGeometry.setIndex(newIndices);

		return newGeometry;

	}

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
	 *
	 * Creates BufferGeometries from primitives.
	 *
	 * @param {Array<GLTF.Primitive>} primitives
	 * @return {Promise<Array<THREE.BufferGeometry>>}
	 */
	GLTFParser.prototype.loadGeometries = function (primitives) {

		var parser = this;
		var extensions = this.extensions;
		var cache = this.primitiveCache;

		function createDracoPrimitive(primitive) {

			return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
				.decodePrimitive(primitive, parser)
				.then(function (geometry) {

					return addPrimitiveAttributes(geometry, primitive, parser);

				});

		}

		var pending = [];

		for (var i = 0, il = primitives.length; i < il; i++) {

			var primitive = primitives[i];
			var cacheKey = createPrimitiveKey(primitive);

			// See if we've already created this geometry
			var cached = cache[cacheKey];

			if (cached) {

				// Use the cached geometry if it exists
				pending.push(cached.promise);

			} else {

				var geometryPromise;

				if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) {

					// Use DRACO geometry if available
					geometryPromise = createDracoPrimitive(primitive);

				} else {

					// Otherwise create a new geometry
					geometryPromise = addPrimitiveAttributes(new THREE.BufferGeometry(), primitive, parser);

				}

				// Cache this geometry
				cache[cacheKey] = { primitive: primitive, promise: geometryPromise };

				pending.push(geometryPromise);

			}

		}

		return Promise.all(pending);

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
	 * @param {number} meshIndex
	 * @return {Promise<THREE.Group|THREE.Mesh|THREE.SkinnedMesh>}
	 */
	GLTFParser.prototype.loadMesh = function (meshIndex) {

		var parser = this;
		var json = this.json;
		var extensions = this.extensions;

		var meshDef = json.meshes[meshIndex];
		var primitives = meshDef.primitives;

		var pending = [];

		for (var i = 0, il = primitives.length; i < il; i++) {

			var material = primitives[i].material === undefined
				? createDefaultMaterial(this.cache)
				: this.getDependency('material', primitives[i].material);

			pending.push(material);

		}

		pending.push(parser.loadGeometries(primitives));

		return Promise.all(pending).then(function (results) {

			var materials = results.slice(0, results.length - 1);
			var geometries = results[results.length - 1];

			var meshes = [];

			for (var i = 0, il = geometries.length; i < il; i++) {

				var geometry = geometries[i];
				var primitive = primitives[i];

				// 1. create Mesh

				var mesh;

				var material = materials[i];

				if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
					primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
					primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
					primitive.mode === undefined) {

					// .isSkinnedMesh isn't in glTF spec. See ._markDefs()
					mesh = meshDef.isSkinnedMesh === true
						? new THREE.SkinnedMesh(geometry, material)
						: new THREE.Mesh(geometry, material);

					if (mesh.isSkinnedMesh === true && !mesh.geometry.attributes.skinWeight.normalized) {

						// we normalize floating point skin weight array to fix malformed assets (see #15319)
						// it's important to skip this for non-float32 data since normalizeSkinWeights assumes non-normalized inputs
						mesh.normalizeSkinWeights();

					}

					if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {

						mesh.geometry = toTrianglesDrawMode(mesh.geometry, THREE.TriangleStripDrawMode);

					} else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {

						mesh.geometry = toTrianglesDrawMode(mesh.geometry, THREE.TriangleFanDrawMode);

					}

				} else if (primitive.mode === WEBGL_CONSTANTS.LINES) {

					mesh = new THREE.LineSegments(geometry, material);

				} else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {

					mesh = new THREE.Line(geometry, material);

				} else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {

					mesh = new THREE.LineLoop(geometry, material);

				} else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {

					mesh = new THREE.Points(geometry, material);

				} else {

					throw new Error('THREE.GLTFLoader: Primitive mode unsupported: ' + primitive.mode);

				}

				if (Object.keys(mesh.geometry.morphAttributes).length > 0) {

					updateMorphTargets(mesh, meshDef);

				}

				mesh.name = parser.createUniqueName(meshDef.name || ('mesh_' + meshIndex));

				assignExtrasToUserData(mesh, meshDef);

				if (primitive.extensions) addUnknownExtensionsToUserData(extensions, mesh, primitive);

				parser.assignFinalMaterial(mesh);

				meshes.push(mesh);

			}

			if (meshes.length === 1) {

				return meshes[0];

			}

			var group = new THREE.Group();

			for (var i = 0, il = meshes.length; i < il; i++) {

				group.add(meshes[i]);

			}

			return group;

		});

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
	 * @param {number} cameraIndex
	 * @return {Promise<THREE.Camera>}
	 */
	GLTFParser.prototype.loadCamera = function (cameraIndex) {

		var camera;
		var cameraDef = this.json.cameras[cameraIndex];
		var params = cameraDef[cameraDef.type];

		if (!params) {

			console.warn('THREE.GLTFLoader: Missing camera parameters.');
			return;

		}

		if (cameraDef.type === 'perspective') {

			camera = new THREE.PerspectiveCamera(THREE.MathUtils.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);

		} else if (cameraDef.type === 'orthographic') {

			camera = new THREE.OrthographicCamera(- params.xmag, params.xmag, params.ymag, - params.ymag, params.znear, params.zfar);

		}

		if (cameraDef.name) camera.name = this.createUniqueName(cameraDef.name);

		assignExtrasToUserData(camera, cameraDef);

		return Promise.resolve(camera);

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
	 * @param {number} skinIndex
	 * @return {Promise<Object>}
	 */
	GLTFParser.prototype.loadSkin = function (skinIndex) {

		var skinDef = this.json.skins[skinIndex];

		var skinEntry = { joints: skinDef.joints };

		if (skinDef.inverseBindMatrices === undefined) {

			return Promise.resolve(skinEntry);

		}

		return this.getDependency('accessor', skinDef.inverseBindMatrices).then(function (accessor) {

			skinEntry.inverseBindMatrices = accessor;

			return skinEntry;

		});

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
	 * @param {number} animationIndex
	 * @return {Promise<THREE.AnimationClip>}
	 */
	GLTFParser.prototype.loadAnimation = function (animationIndex) {

		var json = this.json;

		var animationDef = json.animations[animationIndex];

		var pendingNodes = [];
		var pendingInputAccessors = [];
		var pendingOutputAccessors = [];
		var pendingSamplers = [];
		var pendingTargets = [];

		for (var i = 0, il = animationDef.channels.length; i < il; i++) {

			var channel = animationDef.channels[i];
			var sampler = animationDef.samplers[channel.sampler];
			var target = channel.target;
			var name = target.node !== undefined ? target.node : target.id; // NOTE: target.id is deprecated.
			var input = animationDef.parameters !== undefined ? animationDef.parameters[sampler.input] : sampler.input;
			var output = animationDef.parameters !== undefined ? animationDef.parameters[sampler.output] : sampler.output;

			pendingNodes.push(this.getDependency('node', name));
			pendingInputAccessors.push(this.getDependency('accessor', input));
			pendingOutputAccessors.push(this.getDependency('accessor', output));
			pendingSamplers.push(sampler);
			pendingTargets.push(target);

		}

		return Promise.all([

			Promise.all(pendingNodes),
			Promise.all(pendingInputAccessors),
			Promise.all(pendingOutputAccessors),
			Promise.all(pendingSamplers),
			Promise.all(pendingTargets)

		]).then(function (dependencies) {

			var nodes = dependencies[0];
			var inputAccessors = dependencies[1];
			var outputAccessors = dependencies[2];
			var samplers = dependencies[3];
			var targets = dependencies[4];

			var tracks = [];

			for (var i = 0, il = nodes.length; i < il; i++) {

				var node = nodes[i];
				var inputAccessor = inputAccessors[i];
				var outputAccessor = outputAccessors[i];
				var sampler = samplers[i];
				var target = targets[i];

				if (node === undefined) continue;

				node.updateMatrix();
				node.matrixAutoUpdate = true;

				var TypedKeyframeTrack;

				switch (PATH_PROPERTIES[target.path]) {

					case PATH_PROPERTIES.weights:

						TypedKeyframeTrack = THREE.NumberKeyframeTrack;
						break;

					case PATH_PROPERTIES.rotation:

						TypedKeyframeTrack = THREE.QuaternionKeyframeTrack;
						break;

					case PATH_PROPERTIES.position:
					case PATH_PROPERTIES.scale:
					default:

						TypedKeyframeTrack = THREE.VectorKeyframeTrack;
						break;

				}

				var targetName = node.name ? node.name : node.uuid;

				var interpolation = sampler.interpolation !== undefined ? INTERPOLATION[sampler.interpolation] : THREE.InterpolateLinear;

				var targetNames = [];

				if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {

					// Node may be a THREE.Group (glTF mesh with several primitives) or a THREE.Mesh.
					node.traverse(function (object) {

						if (object.isMesh === true && object.morphTargetInfluences) {

							targetNames.push(object.name ? object.name : object.uuid);

						}

					});

				} else {

					targetNames.push(targetName);

				}

				var outputArray = outputAccessor.array;

				if (outputAccessor.normalized) {

					var scale;

					if (outputArray.constructor === Int8Array) {

						scale = 1 / 127;

					} else if (outputArray.constructor === Uint8Array) {

						scale = 1 / 255;

					} else if (outputArray.constructor == Int16Array) {

						scale = 1 / 32767;

					} else if (outputArray.constructor === Uint16Array) {

						scale = 1 / 65535;

					} else {

						throw new Error('THREE.GLTFLoader: Unsupported output accessor component type.');

					}

					var scaled = new Float32Array(outputArray.length);

					for (var j = 0, jl = outputArray.length; j < jl; j++) {

						scaled[j] = outputArray[j] * scale;

					}

					outputArray = scaled;

				}

				for (var j = 0, jl = targetNames.length; j < jl; j++) {

					var track = new TypedKeyframeTrack(
						targetNames[j] + '.' + PATH_PROPERTIES[target.path],
						inputAccessor.array,
						outputArray,
						interpolation
					);

					// Override interpolation with custom factory method.
					if (sampler.interpolation === 'CUBICSPLINE') {

						track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {

							// A CUBICSPLINE keyframe in glTF has three output values for each input value,
							// representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
							// must be divided by three to get the interpolant's sampleSize argument.

							return new GLTFCubicSplineInterpolant(this.times, this.values, this.getValueSize() / 3, result);

						};

						// Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
						track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;

					}

					tracks.push(track);

				}

			}

			var name = animationDef.name ? animationDef.name : 'animation_' + animationIndex;

			return new THREE.AnimationClip(name, undefined, tracks);

		});

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
	 * @param {number} nodeIndex
	 * @return {Promise<THREE.Object3D>}
	 */
	GLTFParser.prototype.loadNode = function (nodeIndex) {

		var json = this.json;
		var extensions = this.extensions;
		var parser = this;

		var nodeDef = json.nodes[nodeIndex];

		// reserve node's name before its dependencies, so the root has the intended name.
		var nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : '';

		return (function () {

			var pending = [];

			if (nodeDef.mesh !== undefined) {

				pending.push(parser.getDependency('mesh', nodeDef.mesh).then(function (mesh) {

					var node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);

					// if weights are provided on the node, override weights on the mesh.
					if (nodeDef.weights !== undefined) {

						node.traverse(function (o) {

							if (!o.isMesh) return;

							for (var i = 0, il = nodeDef.weights.length; i < il; i++) {

								o.morphTargetInfluences[i] = nodeDef.weights[i];

							}

						});

					}

					return node;

				}));

			}

			if (nodeDef.camera !== undefined) {

				pending.push(parser.getDependency('camera', nodeDef.camera).then(function (camera) {

					return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);

				}));

			}

			parser._invokeAll(function (ext) {

				return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);

			}).forEach(function (promise) {

				pending.push(promise);

			});

			return Promise.all(pending);

		}()).then(function (objects) {

			var node;

			// .isBone isn't in glTF spec. See ._markDefs
			if (nodeDef.isBone === true) {

				node = new THREE.Bone();

			} else if (objects.length > 1) {

				node = new THREE.Group();

			} else if (objects.length === 1) {

				node = objects[0];

			} else {

				node = new THREE.Object3D();

			}

			if (node !== objects[0]) {

				for (var i = 0, il = objects.length; i < il; i++) {

					node.add(objects[i]);

				}

			}

			if (nodeDef.name) {

				node.userData.name = nodeDef.name;
				node.name = nodeName;

			}

			assignExtrasToUserData(node, nodeDef);

			if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);

			if (nodeDef.matrix !== undefined) {

				var matrix = new THREE.Matrix4();
				matrix.fromArray(nodeDef.matrix);
				node.applyMatrix4(matrix);

			} else {

				if (nodeDef.translation !== undefined) {

					node.position.fromArray(nodeDef.translation);

				}

				if (nodeDef.rotation !== undefined) {

					node.quaternion.fromArray(nodeDef.rotation);

				}

				if (nodeDef.scale !== undefined) {

					node.scale.fromArray(nodeDef.scale);

				}

			}

			parser.associations.set(node, { type: 'nodes', index: nodeIndex });

			return node;

		});

	};

	/**
	 * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
	 * @param {number} sceneIndex
	 * @return {Promise<THREE.Group>}
	 */
	GLTFParser.prototype.loadScene = function () {

		// scene node hierachy builder

		function buildNodeHierachy(nodeId, parentObject, json, parser) {

			var nodeDef = json.nodes[nodeId];

			return parser.getDependency('node', nodeId).then(function (node) {

				if (nodeDef.skin === undefined) return node;

				// build skeleton here as well

				var skinEntry;

				return parser.getDependency('skin', nodeDef.skin).then(function (skin) {

					skinEntry = skin;

					var pendingJoints = [];

					for (var i = 0, il = skinEntry.joints.length; i < il; i++) {

						pendingJoints.push(parser.getDependency('node', skinEntry.joints[i]));

					}

					return Promise.all(pendingJoints);

				}).then(function (jointNodes) {

					node.traverse(function (mesh) {

						if (!mesh.isMesh) return;

						var bones = [];
						var boneInverses = [];

						for (var j = 0, jl = jointNodes.length; j < jl; j++) {

							var jointNode = jointNodes[j];

							if (jointNode) {

								bones.push(jointNode);

								var mat = new THREE.Matrix4();

								if (skinEntry.inverseBindMatrices !== undefined) {

									mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16);

								}

								boneInverses.push(mat);

							} else {

								console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j]);

							}

						}

						mesh.bind(new THREE.Skeleton(bones, boneInverses), mesh.matrixWorld);

					});

					return node;

				});

			}).then(function (node) {

				// build node hierachy

				parentObject.add(node);

				var pending = [];

				if (nodeDef.children) {

					var children = nodeDef.children;

					for (var i = 0, il = children.length; i < il; i++) {

						var child = children[i];
						pending.push(buildNodeHierachy(child, node, json, parser));

					}

				}

				return Promise.all(pending);

			});

		}

		return function loadScene(sceneIndex) {

			var json = this.json;
			var extensions = this.extensions;
			var sceneDef = this.json.scenes[sceneIndex];
			var parser = this;

			// Loader returns Group, not Scene.
			// See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
			var scene = new THREE.Group();
			if (sceneDef.name) scene.name = parser.createUniqueName(sceneDef.name);

			assignExtrasToUserData(scene, sceneDef);

			if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene, sceneDef);

			var nodeIds = sceneDef.nodes || [];

			var pending = [];

			for (var i = 0, il = nodeIds.length; i < il; i++) {

				pending.push(buildNodeHierachy(nodeIds[i], scene, json, parser));

			}

			return Promise.all(pending).then(function () {

				return scene;

			});

		};

	}();

	return GLTFLoader;

})();

module.exports = exports = THREE.GLTFLoader;
},{"../../three.js":25}],19:[function(require,module,exports){
const THREE = require('../../three.js');

/**
 * Loads a Wavefront .mtl file specifying materials
 */

THREE.MTLLoader = function (manager) {

	THREE.Loader.call(this, manager);

};

THREE.MTLLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {

	constructor: THREE.MTLLoader,

	/**
	 * Loads and parses a MTL asset from a URL.
	 *
	 * @param {String} url - URL to the MTL file.
	 * @param {Function} [onLoad] - Callback invoked with the loaded object.
	 * @param {Function} [onProgress] - Callback for download progress.
	 * @param {Function} [onError] - Callback for download errors.
	 *
	 * @see setPath setResourcePath
	 *
	 * @note In order for relative texture references to resolve correctly
	 * you must call setResourcePath() explicitly prior to load.
	 */
	load: function (url, onLoad, onProgress, onError) {

		var scope = this;

		var path = (this.path === '') ? THREE.LoaderUtils.extractUrlBase(url || '') : this.path;

		var loader = new THREE.FileLoader(this.manager);
		loader.setPath(this.path);
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);
		loader.load(url, function (text) {

			try {

				onLoad(scope.parse(text, path));

			} catch (e) {

				if (onError) {

					onError(e);

				} else {

					console.error(e);

				}

				scope.manager.itemError(url);

			}

		}, onProgress, onError);

	},

	setMaterialOptions: function (value) {

		this.materialOptions = value;
		return this;

	},

	/**
	 * Parses a MTL file.
	 *
	 * @param {String} text - Content of MTL file
	 * @return {THREE.MTLLoader.MaterialCreator}
	 *
	 * @see setPath setResourcePath
	 *
	 * @note In order for relative texture references to resolve correctly
	 * you must call setResourcePath() explicitly prior to parse.
	 */
	parse: function (text, path) {

		var lines = text.split('\n');
		var info = {};
		var delimiter_pattern = /\s+/;
		var materialsInfo = {};

		for (var i = 0; i < lines.length; i++) {

			var line = lines[i];
			line = line.trim();

			if (line.length === 0 || line.charAt(0) === '#') {

				// Blank line or comment ignore
				continue;

			}

			var pos = line.indexOf(' ');

			var key = (pos >= 0) ? line.substring(0, pos) : line;
			key = key.toLowerCase();

			var value = (pos >= 0) ? line.substring(pos + 1) : '';
			value = value.trim();

			if (key === 'newmtl') {

				// New material

				info = { name: value };
				materialsInfo[value] = info;

			} else {

				if (key === 'ka' || key === 'kd' || key === 'ks' || key === 'ke') {

					var ss = value.split(delimiter_pattern, 3);
					info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];

				} else {

					info[key] = value;

				}

			}

		}

		var materialCreator = new THREE.MTLLoader.MaterialCreator(this.resourcePath || path, this.materialOptions);
		materialCreator.setCrossOrigin(this.crossOrigin);
		materialCreator.setManager(this.manager);
		materialCreator.setMaterials(materialsInfo);
		return materialCreator;

	}

});

/**
 * Create a new THREE.MTLLoader.MaterialCreator
 * @param baseUrl - Url relative to which textures are loaded
 * @param options - Set of options on how to construct the materials
 *                  side: Which side to apply the material
 *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
 *                  wrap: What type of wrapping to apply for textures
 *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
 *                                Default: false, assumed to be already normalized
 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
 *                                  Default: false
 * @constructor
 */

THREE.MTLLoader.MaterialCreator = function (baseUrl, options) {

	this.baseUrl = baseUrl || '';
	this.options = options;
	this.materialsInfo = {};
	this.materials = {};
	this.materialsArray = [];
	this.nameLookup = {};

	this.side = (this.options && this.options.side) ? this.options.side : THREE.FrontSide;
	this.wrap = (this.options && this.options.wrap) ? this.options.wrap : THREE.RepeatWrapping;

};

THREE.MTLLoader.MaterialCreator.prototype = {

	constructor: THREE.MTLLoader.MaterialCreator,

	crossOrigin: 'anonymous',

	setCrossOrigin: function (value) {

		this.crossOrigin = value;
		return this;

	},

	setManager: function (value) {

		this.manager = value;

	},

	setMaterials: function (materialsInfo) {

		this.materialsInfo = this.convert(materialsInfo);
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

	},

	convert: function (materialsInfo) {

		if (!this.options) return materialsInfo;

		var converted = {};

		for (var mn in materialsInfo) {

			// Convert materials info into normalized form based on options

			var mat = materialsInfo[mn];

			var covmat = {};

			converted[mn] = covmat;

			for (var prop in mat) {

				var save = true;
				var value = mat[prop];
				var lprop = prop.toLowerCase();

				switch (lprop) {

					case 'kd':
					case 'ka':
					case 'ks':

						// Diffuse color (color under white light) using RGB values

						if (this.options && this.options.normalizeRGB) {

							value = [value[0] / 255, value[1] / 255, value[2] / 255];

						}

						if (this.options && this.options.ignoreZeroRGBs) {

							if (value[0] === 0 && value[1] === 0 && value[2] === 0) {

								// ignore

								save = false;

							}

						}

						break;

					default:

						break;

				}

				if (save) {

					covmat[lprop] = value;

				}

			}

		}

		return converted;

	},

	preload: function () {

		for (var mn in this.materialsInfo) {

			this.create(mn);

		}

	},

	getIndex: function (materialName) {

		return this.nameLookup[materialName];

	},

	getAsArray: function () {

		var index = 0;

		for (var mn in this.materialsInfo) {

			this.materialsArray[index] = this.create(mn);
			this.nameLookup[mn] = index;
			index++;

		}

		return this.materialsArray;

	},

	create: function (materialName) {

		if (this.materials[materialName] === undefined) {

			this.createMaterial_(materialName);

		}

		return this.materials[materialName];

	},

	createMaterial_: function (materialName) {

		// Create material

		var scope = this;
		var mat = this.materialsInfo[materialName];
		var params = {

			name: materialName,
			side: this.side

		};

		function resolveURL(baseUrl, url) {

			if (typeof url !== 'string' || url === '')
				return '';

			// Absolute URL
			if (/^https?:\/\//i.test(url)) return url;

			return baseUrl + url;

		}

		function setMapForType(mapType, value) {

			if (params[mapType]) return; // Keep the first encountered texture

			var texParams = scope.getTextureParams(value, params);
			var map = scope.loadTexture(resolveURL(scope.baseUrl, texParams.url));

			map.repeat.copy(texParams.scale);
			map.offset.copy(texParams.offset);

			map.wrapS = scope.wrap;
			map.wrapT = scope.wrap;

			params[mapType] = map;

		}

		for (var prop in mat) {

			var value = mat[prop];
			var n;

			if (value === '') continue;

			switch (prop.toLowerCase()) {

				// Ns is material specular exponent

				case 'kd':

					// Diffuse color (color under white light) using RGB values

					params.color = new THREE.Color().fromArray(value);

					break;

				case 'ks':

					// Specular color (color when light is reflected from shiny surface) using RGB values
					params.specular = new THREE.Color().fromArray(value);

					break;

				case 'ke':

					// Emissive using RGB values
					params.emissive = new THREE.Color().fromArray(value);

					break;

				case 'map_kd':

					// Diffuse texture map

					setMapForType('map', value);

					break;

				case 'map_ks':

					// Specular map

					setMapForType('specularMap', value);

					break;

				case 'map_ke':

					// Emissive map

					setMapForType('emissiveMap', value);

					break;

				case 'norm':

					setMapForType('normalMap', value);

					break;

				case 'map_bump':
				case 'bump':

					// Bump texture map

					setMapForType('bumpMap', value);

					break;

				case 'map_d':

					// Alpha map

					setMapForType('alphaMap', value);
					params.transparent = true;

					break;

				case 'ns':

					// The specular exponent (defines the focus of the specular highlight)
					// A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

					params.shininess = parseFloat(value);

					break;

				case 'd':
					n = parseFloat(value);

					if (n < 1) {

						params.opacity = n;
						params.transparent = true;

					}

					break;

				case 'tr':
					n = parseFloat(value);

					if (this.options && this.options.invertTrProperty) n = 1 - n;

					if (n > 0) {

						params.opacity = 1 - n;
						params.transparent = true;

					}

					break;

				default:
					break;

			}

		}

		this.materials[materialName] = new THREE.MeshPhongMaterial(params);
		return this.materials[materialName];

	},

	getTextureParams: function (value, matParams) {

		var texParams = {

			scale: new THREE.Vector2(1, 1),
			offset: new THREE.Vector2(0, 0)

		};

		var items = value.split(/\s+/);
		var pos;

		pos = items.indexOf('-bm');

		if (pos >= 0) {

			matParams.bumpScale = parseFloat(items[pos + 1]);
			items.splice(pos, 2);

		}

		pos = items.indexOf('-s');

		if (pos >= 0) {

			texParams.scale.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
			items.splice(pos, 4); // we expect 3 parameters here!

		}

		pos = items.indexOf('-o');

		if (pos >= 0) {

			texParams.offset.set(parseFloat(items[pos + 1]), parseFloat(items[pos + 2]));
			items.splice(pos, 4); // we expect 3 parameters here!

		}

		texParams.url = items.join(' ').trim();
		return texParams;

	},

	loadTexture: function (url, mapping, onLoad, onProgress, onError) {

		var texture;
		var manager = (this.manager !== undefined) ? this.manager : THREE.DefaultLoadingManager;
		var loader = manager.getHandler(url);

		if (loader === null) {

			loader = new THREE.TextureLoader(manager);

		}

		if (loader.setCrossOrigin) loader.setCrossOrigin(this.crossOrigin);
		texture = loader.load(url, onLoad, onProgress, onError);

		if (mapping !== undefined) texture.mapping = mapping;

		return texture;

	}

};

module.exports = exports = THREE.MTLLoader;
},{"../../three.js":25}],20:[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 */
const THREE = require('../../three.js');

THREE.OBJLoader = (function () {

	// o object_name | g group_name
	var object_pattern = /^[og]\s*(.+)?/;
	// mtllib file_reference
	var material_library_pattern = /^mtllib /;
	// usemtl material_name
	var material_use_pattern = /^usemtl /;
	// usemap map_name
	var map_use_pattern = /^usemap /;

	var vA = new THREE.Vector3();
	var vB = new THREE.Vector3();
	var vC = new THREE.Vector3();

	var ab = new THREE.Vector3();
	var cb = new THREE.Vector3();

	function ParserState() {

		var state = {
			objects: [],
			object: {},

			vertices: [],
			normals: [],
			colors: [],
			uvs: [],

			materials: {},
			materialLibraries: [],

			startObject: function (name, fromDeclaration) {

				// If the current object (initial from reset) is not from a g/o declaration in the parsed
				// file. We need to use it for the first parsed g/o to keep things in sync.
				if (this.object && this.object.fromDeclaration === false) {

					this.object.name = name;
					this.object.fromDeclaration = (fromDeclaration !== false);
					return;

				}

				var previousMaterial = (this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined);

				if (this.object && typeof this.object._finalize === 'function') {

					this.object._finalize(true);

				}

				this.object = {
					name: name || '',
					fromDeclaration: (fromDeclaration !== false),

					geometry: {
						vertices: [],
						normals: [],
						colors: [],
						uvs: [],
						hasUVIndices: false
					},
					materials: [],
					smooth: true,

					startMaterial: function (name, libraries) {

						var previous = this._finalize(false);

						// New usemtl declaration overwrites an inherited material, except if faces were declared
						// after the material, then it must be preserved for proper MultiMaterial continuation.
						if (previous && (previous.inherited || previous.groupCount <= 0)) {

							this.materials.splice(previous.index, 1);

						}

						var material = {
							index: this.materials.length,
							name: name || '',
							mtllib: (Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : ''),
							smooth: (previous !== undefined ? previous.smooth : this.smooth),
							groupStart: (previous !== undefined ? previous.groupEnd : 0),
							groupEnd: - 1,
							groupCount: - 1,
							inherited: false,

							clone: function (index) {

								var cloned = {
									index: (typeof index === 'number' ? index : this.index),
									name: this.name,
									mtllib: this.mtllib,
									smooth: this.smooth,
									groupStart: 0,
									groupEnd: - 1,
									groupCount: - 1,
									inherited: false
								};
								cloned.clone = this.clone.bind(cloned);
								return cloned;

							}
						};

						this.materials.push(material);

						return material;

					},

					currentMaterial: function () {

						if (this.materials.length > 0) {

							return this.materials[this.materials.length - 1];

						}

						return undefined;

					},

					_finalize: function (end) {

						var lastMultiMaterial = this.currentMaterial();
						if (lastMultiMaterial && lastMultiMaterial.groupEnd === - 1) {

							lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
							lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
							lastMultiMaterial.inherited = false;

						}

						// Ignore objects tail materials if no face declarations followed them before a new o/g started.
						if (end && this.materials.length > 1) {

							for (var mi = this.materials.length - 1; mi >= 0; mi--) {

								if (this.materials[mi].groupCount <= 0) {

									this.materials.splice(mi, 1);

								}

							}

						}

						// Guarantee at least one empty material, this makes the creation later more straight forward.
						if (end && this.materials.length === 0) {

							this.materials.push({
								name: '',
								smooth: this.smooth
							});

						}

						return lastMultiMaterial;

					}
				};

				// Inherit previous objects material.
				// Spec tells us that a declared material must be set to all objects until a new material is declared.
				// If a usemtl declaration is encountered while this new object is being parsed, it will
				// overwrite the inherited material. Exception being that there was already face declarations
				// to the inherited material, then it will be preserved for proper MultiMaterial continuation.

				if (previousMaterial && previousMaterial.name && typeof previousMaterial.clone === 'function') {

					var declared = previousMaterial.clone(0);
					declared.inherited = true;
					this.object.materials.push(declared);

				}

				this.objects.push(this.object);

			},

			finalize: function () {

				if (this.object && typeof this.object._finalize === 'function') {

					this.object._finalize(true);

				}

			},

			parseVertexIndex: function (value, len) {

				var index = parseInt(value, 10);
				return (index >= 0 ? index - 1 : index + len / 3) * 3;

			},

			parseNormalIndex: function (value, len) {

				var index = parseInt(value, 10);
				return (index >= 0 ? index - 1 : index + len / 3) * 3;

			},

			parseUVIndex: function (value, len) {

				var index = parseInt(value, 10);
				return (index >= 0 ? index - 1 : index + len / 2) * 2;

			},

			addVertex: function (a, b, c) {

				var src = this.vertices;
				var dst = this.object.geometry.vertices;

				dst.push(src[a + 0], src[a + 1], src[a + 2]);
				dst.push(src[b + 0], src[b + 1], src[b + 2]);
				dst.push(src[c + 0], src[c + 1], src[c + 2]);

			},

			addVertexPoint: function (a) {

				var src = this.vertices;
				var dst = this.object.geometry.vertices;

				dst.push(src[a + 0], src[a + 1], src[a + 2]);

			},

			addVertexLine: function (a) {

				var src = this.vertices;
				var dst = this.object.geometry.vertices;

				dst.push(src[a + 0], src[a + 1], src[a + 2]);

			},

			addNormal: function (a, b, c) {

				var src = this.normals;
				var dst = this.object.geometry.normals;

				dst.push(src[a + 0], src[a + 1], src[a + 2]);
				dst.push(src[b + 0], src[b + 1], src[b + 2]);
				dst.push(src[c + 0], src[c + 1], src[c + 2]);

			},

			addFaceNormal: function (a, b, c) {

				var src = this.vertices;
				var dst = this.object.geometry.normals;

				vA.fromArray(src, a);
				vB.fromArray(src, b);
				vC.fromArray(src, c);

				cb.subVectors(vC, vB);
				ab.subVectors(vA, vB);
				cb.cross(ab);

				cb.normalize();

				dst.push(cb.x, cb.y, cb.z);
				dst.push(cb.x, cb.y, cb.z);
				dst.push(cb.x, cb.y, cb.z);

			},

			addColor: function (a, b, c) {

				var src = this.colors;
				var dst = this.object.geometry.colors;

				if (src[a] !== undefined) dst.push(src[a + 0], src[a + 1], src[a + 2]);
				if (src[b] !== undefined) dst.push(src[b + 0], src[b + 1], src[b + 2]);
				if (src[c] !== undefined) dst.push(src[c + 0], src[c + 1], src[c + 2]);

			},

			addUV: function (a, b, c) {

				var src = this.uvs;
				var dst = this.object.geometry.uvs;

				dst.push(src[a + 0], src[a + 1]);
				dst.push(src[b + 0], src[b + 1]);
				dst.push(src[c + 0], src[c + 1]);

			},

			addDefaultUV: function () {

				var dst = this.object.geometry.uvs;

				dst.push(0, 0);
				dst.push(0, 0);
				dst.push(0, 0);

			},

			addUVLine: function (a) {

				var src = this.uvs;
				var dst = this.object.geometry.uvs;

				dst.push(src[a + 0], src[a + 1]);

			},

			addFace: function (a, b, c, ua, ub, uc, na, nb, nc) {

				var vLen = this.vertices.length;

				var ia = this.parseVertexIndex(a, vLen);
				var ib = this.parseVertexIndex(b, vLen);
				var ic = this.parseVertexIndex(c, vLen);

				this.addVertex(ia, ib, ic);
				this.addColor(ia, ib, ic);

				// normals

				if (na !== undefined && na !== '') {

					var nLen = this.normals.length;

					ia = this.parseNormalIndex(na, nLen);
					ib = this.parseNormalIndex(nb, nLen);
					ic = this.parseNormalIndex(nc, nLen);

					this.addNormal(ia, ib, ic);

				} else {

					this.addFaceNormal(ia, ib, ic);

				}

				// uvs

				if (ua !== undefined && ua !== '') {

					var uvLen = this.uvs.length;

					ia = this.parseUVIndex(ua, uvLen);
					ib = this.parseUVIndex(ub, uvLen);
					ic = this.parseUVIndex(uc, uvLen);

					this.addUV(ia, ib, ic);

					this.object.geometry.hasUVIndices = true;

				} else {

					// add placeholder values (for inconsistent face definitions)

					this.addDefaultUV();

				}

			},

			addPointGeometry: function (vertices) {

				this.object.geometry.type = 'Points';

				var vLen = this.vertices.length;

				for (var vi = 0, l = vertices.length; vi < l; vi++) {

					var index = this.parseVertexIndex(vertices[vi], vLen);

					this.addVertexPoint(index);
					this.addColor(index);

				}

			},

			addLineGeometry: function (vertices, uvs) {

				this.object.geometry.type = 'Line';

				var vLen = this.vertices.length;
				var uvLen = this.uvs.length;

				for (var vi = 0, l = vertices.length; vi < l; vi++) {

					this.addVertexLine(this.parseVertexIndex(vertices[vi], vLen));

				}

				for (var uvi = 0, l = uvs.length; uvi < l; uvi++) {

					this.addUVLine(this.parseUVIndex(uvs[uvi], uvLen));

				}

			}

		};

		state.startObject('', false);

		return state;

	}

	//

	function OBJLoader(manager) {

		THREE.Loader.call(this, manager);

		this.materials = null;

	}

	OBJLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {

		constructor: OBJLoader,

		load: function (url, onLoad, onProgress, onError) {

			var scope = this;

			var loader = new THREE.FileLoader(this.manager);
			loader.setPath(this.path);
			loader.setRequestHeader(this.requestHeader);
			loader.setWithCredentials(this.withCredentials);
			loader.load(url, function (text) {

				try {

					onLoad(scope.parse(text));

				} catch (e) {

					if (onError) {

						onError(e);

					} else {

						console.error(e);

					}

					scope.manager.itemError(url);

				}

			}, onProgress, onError);

		},

		setMaterials: function (materials) {

			this.materials = materials;

			return this;

		},

		parse: function (text) {

			var state = new ParserState();

			if (text.indexOf('\r\n') !== - 1) {

				// This is faster than String.split with regex that splits on both
				text = text.replace(/\r\n/g, '\n');

			}

			if (text.indexOf('\\\n') !== - 1) {

				// join lines separated by a line continuation character (\)
				text = text.replace(/\\\n/g, '');

			}

			var lines = text.split('\n');
			var line = '', lineFirstChar = '';
			var lineLength = 0;
			var result = [];

			// Faster to just trim left side of the line. Use if available.
			var trimLeft = (typeof ''.trimLeft === 'function');

			for (var i = 0, l = lines.length; i < l; i++) {

				line = lines[i];

				line = trimLeft ? line.trimLeft() : line.trim();

				lineLength = line.length;

				if (lineLength === 0) continue;

				lineFirstChar = line.charAt(0);

				// @todo invoke passed in handler if any
				if (lineFirstChar === '#') continue;

				if (lineFirstChar === 'v') {

					var data = line.split(/\s+/);

					switch (data[0]) {

						case 'v':
							state.vertices.push(
								parseFloat(data[1]),
								parseFloat(data[2]),
								parseFloat(data[3])
							);
							if (data.length >= 7) {

								state.colors.push(
									parseFloat(data[4]),
									parseFloat(data[5]),
									parseFloat(data[6])

								);

							} else {

								// if no colors are defined, add placeholders so color and vertex indices match

								state.colors.push(undefined, undefined, undefined);

							}

							break;
						case 'vn':
							state.normals.push(
								parseFloat(data[1]),
								parseFloat(data[2]),
								parseFloat(data[3])
							);
							break;
						case 'vt':
							state.uvs.push(
								parseFloat(data[1]),
								parseFloat(data[2])
							);
							break;

					}

				} else if (lineFirstChar === 'f') {

					var lineData = line.substr(1).trim();
					var vertexData = lineData.split(/\s+/);
					var faceVertices = [];

					// Parse the face vertex data into an easy to work with format

					for (var j = 0, jl = vertexData.length; j < jl; j++) {

						var vertex = vertexData[j];

						if (vertex.length > 0) {

							var vertexParts = vertex.split('/');
							faceVertices.push(vertexParts);

						}

					}

					// Draw an edge between the first vertex and all subsequent vertices to form an n-gon

					var v1 = faceVertices[0];

					for (var j = 1, jl = faceVertices.length - 1; j < jl; j++) {

						var v2 = faceVertices[j];
						var v3 = faceVertices[j + 1];

						state.addFace(
							v1[0], v2[0], v3[0],
							v1[1], v2[1], v3[1],
							v1[2], v2[2], v3[2]
						);

					}

				} else if (lineFirstChar === 'l') {

					var lineParts = line.substring(1).trim().split(' ');
					var lineVertices = [], lineUVs = [];

					if (line.indexOf('/') === - 1) {

						lineVertices = lineParts;

					} else {

						for (var li = 0, llen = lineParts.length; li < llen; li++) {

							var parts = lineParts[li].split('/');

							if (parts[0] !== '') lineVertices.push(parts[0]);
							if (parts[1] !== '') lineUVs.push(parts[1]);

						}

					}

					state.addLineGeometry(lineVertices, lineUVs);

				} else if (lineFirstChar === 'p') {

					var lineData = line.substr(1).trim();
					var pointData = lineData.split(' ');

					state.addPointGeometry(pointData);

				} else if ((result = object_pattern.exec(line)) !== null) {

					// o object_name
					// or
					// g group_name

					// WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
					// var name = result[ 0 ].substr( 1 ).trim();
					var name = (' ' + result[0].substr(1).trim()).substr(1);

					state.startObject(name);

				} else if (material_use_pattern.test(line)) {

					// material

					state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);

				} else if (material_library_pattern.test(line)) {

					// mtl file

					state.materialLibraries.push(line.substring(7).trim());

				} else if (map_use_pattern.test(line)) {

					// the line is parsed but ignored since the loader assumes textures are defined MTL files
					// (according to https://www.okino.com/conv/imp_wave.htm, 'usemap' is the old-style Wavefront texture reference method)

					console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');

				} else if (lineFirstChar === 's') {

					result = line.split(' ');

					// smooth shading

					// @todo Handle files that have varying smooth values for a set of faces inside one geometry,
					// but does not define a usemtl for each face set.
					// This should be detected and a dummy material created (later MultiMaterial and geometry groups).
					// This requires some care to not create extra material on each smooth value for "normal" obj files.
					// where explicit usemtl defines geometry groups.
					// Example asset: examples/models/obj/cerberus/Cerberus.obj

					/*
					 * http://paulbourke.net/dataformats/obj/
					 * or
					 * http://www.cs.utah.edu/~boulos/cs3505/obj_spec.pdf
					 *
					 * From chapter "Grouping" Syntax explanation "s group_number":
					 * "group_number is the smoothing group number. To turn off smoothing groups, use a value of 0 or off.
					 * Polygonal elements use group numbers to put elements in different smoothing groups. For free-form
					 * surfaces, smoothing groups are either turned on or off; there is no difference between values greater
					 * than 0."
					 */
					if (result.length > 1) {

						var value = result[1].trim().toLowerCase();
						state.object.smooth = (value !== '0' && value !== 'off');

					} else {

						// ZBrush can produce "s" lines #11707
						state.object.smooth = true;

					}

					var material = state.object.currentMaterial();
					if (material) material.smooth = state.object.smooth;

				} else {

					// Handle null terminated files without exception
					if (line === '\0') continue;

					console.warn('THREE.OBJLoader: Unexpected line: "' + line + '"');

				}

			}

			state.finalize();

			var container = new THREE.Group();
			container.materialLibraries = [].concat(state.materialLibraries);

			var hasPrimitives = !(state.objects.length === 1 && state.objects[0].geometry.vertices.length === 0);

			if (hasPrimitives === true) {

				for (var i = 0, l = state.objects.length; i < l; i++) {

					var object = state.objects[i];
					var geometry = object.geometry;
					var materials = object.materials;
					var isLine = (geometry.type === 'Line');
					var isPoints = (geometry.type === 'Points');
					var hasVertexColors = false;

					// Skip o/g line declarations that did not follow with any faces
					if (geometry.vertices.length === 0) continue;

					var buffergeometry = new THREE.BufferGeometry();

					buffergeometry.setAttribute('position', new THREE.Float32BufferAttribute(geometry.vertices, 3));

					if (geometry.normals.length > 0) {

						buffergeometry.setAttribute('normal', new THREE.Float32BufferAttribute(geometry.normals, 3));

					}

					if (geometry.colors.length > 0) {

						hasVertexColors = true;
						buffergeometry.setAttribute('color', new THREE.Float32BufferAttribute(geometry.colors, 3));

					}

					if (geometry.hasUVIndices === true) {

						buffergeometry.setAttribute('uv', new THREE.Float32BufferAttribute(geometry.uvs, 2));

					}

					// Create materials

					var createdMaterials = [];

					for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

						var sourceMaterial = materials[mi];
						var materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
						var material = state.materials[materialHash];

						if (this.materials !== null) {

							material = this.materials.create(sourceMaterial.name);

							// mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
							if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {

								var materialLine = new THREE.LineBasicMaterial();
								THREE.Material.prototype.copy.call(materialLine, material);
								materialLine.color.copy(material.color);
								material = materialLine;

							} else if (isPoints && material && !(material instanceof THREE.PointsMaterial)) {

								var materialPoints = new THREE.PointsMaterial({ size: 10, sizeAttenuation: false });
								THREE.Material.prototype.copy.call(materialPoints, material);
								materialPoints.color.copy(material.color);
								materialPoints.map = material.map;
								material = materialPoints;

							}

						}

						if (material === undefined) {

							if (isLine) {

								material = new THREE.LineBasicMaterial();

							} else if (isPoints) {

								material = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });

							} else {

								material = new THREE.MeshPhongMaterial();

							}

							material.name = sourceMaterial.name;
							material.flatShading = sourceMaterial.smooth ? false : true;
							material.vertexColors = hasVertexColors;

							state.materials[materialHash] = material;

						}

						createdMaterials.push(material);

					}

					// Create mesh

					var mesh;

					if (createdMaterials.length > 1) {

						for (var mi = 0, miLen = materials.length; mi < miLen; mi++) {

							var sourceMaterial = materials[mi];
							buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);

						}

						if (isLine) {

							mesh = new THREE.LineSegments(buffergeometry, createdMaterials);

						} else if (isPoints) {

							mesh = new THREE.Points(buffergeometry, createdMaterials);

						} else {

							mesh = new THREE.Mesh(buffergeometry, createdMaterials);

						}

					} else {

						if (isLine) {

							mesh = new THREE.LineSegments(buffergeometry, createdMaterials[0]);

						} else if (isPoints) {

							mesh = new THREE.Points(buffergeometry, createdMaterials[0]);

						} else {

							mesh = new THREE.Mesh(buffergeometry, createdMaterials[0]);

						}

					}

					mesh.name = object.name;

					container.add(mesh);

				}

			} else {

				// if there is only the default parser state object with no geometry data, interpret data as point cloud

				if (state.vertices.length > 0) {

					var material = new THREE.PointsMaterial({ size: 1, sizeAttenuation: false });

					var buffergeometry = new THREE.BufferGeometry();

					buffergeometry.setAttribute('position', new THREE.Float32BufferAttribute(state.vertices, 3));

					if (state.colors.length > 0 && state.colors[0] !== undefined) {

						buffergeometry.setAttribute('color', new THREE.Float32BufferAttribute(state.colors, 3));
						material.vertexColors = true;

					}

					var points = new THREE.Points(buffergeometry, material);
					container.add(points);

				}

			}

			return container;

		}

	});

	return OBJLoader;

})();

module.exports = exports = THREE.OBJLoader;
},{"../../three.js":25}],21:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
 */
const utils = require("../utils/utils.js");
const material = require("../utils/material.js");
const THREE = require('../three.js');
const AnimationManager = require("../animation/AnimationManager.js");
const CSS2D = require("./CSS2DRenderer.js");

function Objects(){

}

Objects.prototype = {

	// standard 1px line with gl
	line: function (obj) {

		obj = utils._validate(obj, this._defaults.line);

		//project to world and normalize
		var straightProject = utils.lnglatsToWorld(obj.geometry);
		var normalized = utils.normalizeVertices(straightProject);

		//flatten array for buffergeometry
		var flattenedArray = utils.flattenVectors(normalized.vertices);

		var positions = new Float32Array(flattenedArray); // 3 vertices per point
		var geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

		// material
		var material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 21 });
		var line = new THREE.Line(geometry, material);

		line.options = options || {};
		line.position.copy(normalized.position)

		return line
	},

	extrusion: function (options) {

	},

	unenroll: function (obj, isStatic) {
		var root = this;

		if (isStatic) {

		}

		else {
			// Bestow this mesh with animation superpowers and keeps track of its movements in the global animation queue			
			root.animationManager.unenroll(obj);

		}

	},

	_addMethods: function (obj, isStatic) {

		var root = this;
		const labelName = "label";
		const tooltipName = "tooltip";
		const helpName = "help";
		const shadowPlane = "shadowPlane";

		if (isStatic) {

		}

		else {
			
			if (!obj.coordinates) obj.coordinates = [0, 0, 0];

			//[jscastro] added property for the internal 3D model
			Object.defineProperty(obj, 'model', {
				get() {
					return obj.getObjectByName("model");
				}
			});

			let _animations;
			//[jscastro] added property for the internal 3D model
			Object.defineProperty(obj, 'animations', {
				get() {
					const model = obj.model;
					if (model) {
						return model.animations
					} else return null;
				},
				//set(value) { _animations = value}
			});

			// Bestow this mesh with animation superpowers and keeps track of its movements in the global animation queue			
			root.animationManager.enroll(obj);

			// Place an object on the map at the given lnglat 
			obj.setCoords = function (lnglat) {

				// CSS2DObjects could bring an specific vertical positioning to correct in units
				if (obj.userData.topMargin && obj.userData.feature) {
					lnglat[2] += ((obj.userData.feature.properties.height || 0) - (obj.userData.feature.properties.base_height || obj.userData.feature.properties.min_height || 0)) * (obj.userData.topMargin || 0);
				}

				obj.coordinates = lnglat;
				obj.set({ position: lnglat });
				return obj;

			}

			obj.setTranslate = function (lnglat) {

				obj.set({ translate: lnglat });
				return obj;

			}

			obj.setRotation = function (xyz) {

				if (typeof xyz === 'number') xyz = { z: xyz }

				var r = {
					x: utils.radify(xyz.x) || obj.rotation.x,
					y: utils.radify(xyz.y) || obj.rotation.y,
					z: utils.radify(xyz.z) || obj.rotation.z
				}

				obj._setObject({ rotation: [r.x, r.y, r.z] })
			}

			//[jscastro] added method to adjust 3D models to their issues with center position for rotation
			obj.calculateAdjustedPosition = function (lnglat, xyz, inverse) {

				let location = lnglat.slice();

				//we convert the units to Long/Lat/Height
				let newCoords = utils.unprojectFromWorld(obj.modelSize);

				if (inverse) {
					//each model will have different adjustment attributes, we add them for x, y, z
					location[0] -= (xyz.x != 0 ? (newCoords[0] / xyz.x) : 0);
					location[1] -= (xyz.y != 0 ? (newCoords[1] / xyz.y) : 0);
					location[2] -= (xyz.z != 0 ? (newCoords[2] / xyz.z) : 0);
				} else {
					//each model will have different adjustment attributes, we add them for x, y, z
					location[0] += (xyz.x != 0 ? (newCoords[0] / xyz.x) : 0);
					location[1] += (xyz.y != 0 ? (newCoords[1] / xyz.y) : 0);
					location[2] += (xyz.z != 0 ? (newCoords[2] / xyz.z) : 0);

				}
				return location;
			}

			//[jscastro] added method to rotate on objects on an axis instead of centers
			obj.setRotationAxis = function (xyz) {
				if (typeof xyz === 'number') xyz = { z: xyz }

				let bb = obj.modelBox();

				let point = new THREE.Vector3(bb.max.x, bb.max.y, bb.min.z);
				//apply Axis rotation on angle
				if (xyz.x != 0) _applyAxisAngle(obj, point, new THREE.Vector3(0, 0, 1), xyz.x);
				if (xyz.y != 0) _applyAxisAngle(obj, point, new THREE.Vector3(0, 0, 1), xyz.y);
				if (xyz.z != 0) _applyAxisAngle(obj, point, new THREE.Vector3(0, 0, 1), xyz.z);
			}

			//[jscastro] Auxiliar method to rotate an object on an axis
			function _applyAxisAngle(model, point, axis, degrees) {
				let theta = utils.radify(degrees);
				model.position.sub(point); // remove the offset
				model.position.applyAxisAngle(axis, theta); // rotate the POSITION
				model.position.add(point); // re-add the offset
				model.rotateOnAxis(axis, theta)

				tb.map.repaint = true;
			}


			//[jscastro] added property for scaled group inside threeboxObject
			Object.defineProperty(obj, 'scaleGroup', {
				get() {
					return obj.getObjectByName("scaleGroup");
				}
			})

			//[jscastro] added property for boundingBox group helper
			Object.defineProperty(obj, 'boxGroup', {
				get() {
					return obj.getObjectByName("boxGroup");
				}
			})

			//[jscastro] added property for boundingBox helper
			Object.defineProperty(obj, 'boundingBox', {
				get() {
					return obj.getObjectByName("boxModel");
				}
			})

			let _boundingBoxShadow;
			//[jscastro] added property for boundingBox shadow helper
			Object.defineProperty(obj, 'boundingBoxShadow', {
				get() {
					return obj.getObjectByName("boxShadow");
				}
			})

			//[jscastro] added method to create a bounding box and a shadow box
			obj.drawBoundingBox = function () {
				//let's create 2 wireframes, one for the object and one to project on the floor position
				let bb = obj.box3();
				//create the group to return
				let boxGroup = new THREE.Group();
				boxGroup.name = "boxGroup";
				boxGroup.updateMatrixWorld(true);
				let boxModel = new THREE.Box3Helper(bb, Objects.prototype._defaults.colors.yellow);
				boxModel.name = "boxModel";
				boxGroup.add(boxModel);
				boxModel.layers.disable(0); // it makes the object invisible for the raycaster
				//obj.boundingBox = boxModel;

				//it needs to clone, to avoid changing the object by reference
				let bb2 = bb.clone();
				//we make the second box flat and at the floor height level
				bb2.max.z = bb2.min.z;
				let boxShadow = new THREE.Box3Helper(bb2, Objects.prototype._defaults.colors.black);
				boxShadow.name = "boxShadow";

				boxGroup.add(boxShadow);
				boxShadow.layers.disable(0); // it makes the object invisible for the raycaster
				//obj.boundingBoxShadow = boxShadow;

				boxGroup.visible = false; // visibility is managed from the parent
				obj.scaleGroup.add(boxGroup);
				obj.setBoundingBoxShadowFloor();
			}

			//[jscastro] added method to position the shadow box on the floor depending the object height
			obj.setBoundingBoxShadowFloor = function () {
				if (obj.boundingBoxShadow) {
					let h = -obj.modelHeight, r = obj.rotation, o = obj.boundingBoxShadow;
					o.box.max.z = o.box.min.z = h;
					o.rotation.y = r.y;
					o.rotation.x = -r.x;
				}
			}

			//[jscastro] Set the positional and pivotal anchor automatically from string param  
			obj.setAnchor = function (anchor) {
				const b = obj.box3();
				//const size = b.getSize(new THREE.Vector3());
				const c = b.getCenter(new THREE.Vector3());
				obj.none = { x: 0, y: 0, z: 0 };
				obj.center = { x: c.x, y: c.y, z: b.min.z };
				obj.bottom = { x: c.x, y: b.max.y, z: b.min.z };
				obj.bottomLeft = { x: b.max.x, y: b.max.y, z: b.min.z };
				obj.bottomRight = { x: b.min.x, y: b.max.y, z: b.min.z };
				obj.top = { x: c.x, y: b.min.y, z: b.min.z };
				obj.topLeft = { x: b.max.x, y: b.min.y, z: b.min.z };
				obj.topRight = { x: b.min.x, y: b.min.y, z: b.min.z };
				obj.left = { x: b.max.x, y: c.y, z: b.min.z };
				obj.right = { x: b.min.x, y: c.y, z: b.min.z };

				switch (anchor) {
					case 'center':
						obj.anchor = obj.center;
						break;
					case 'top':
						obj.anchor = obj.top;
						break;
					case 'top-left':
						obj.anchor = obj.topLeft;
						break;
					case 'top-right':
						obj.anchor = obj.topRight;
						break;
					case 'left':
						obj.anchor = obj.left;
						break;
					case 'right':
						obj.anchor = obj.right;
						break;
					case 'bottom':
						obj.anchor = obj.bottom;
						break;
					case 'bottom-left':
					default:
						obj.anchor = obj.bottomLeft;
						break;
					case 'bottom-right':
						obj.anchor = obj.bottomRight;
						break;
					case 'auto':
					case 'none':
						obj.anchor = obj.none;
				}

				obj.model.position.set(-obj.anchor.x, -obj.anchor.y, -obj.anchor.z);

			}

			//[jscastro] Set the positional and pivotal anchor based on (x, y, z) size units
			obj.setCenter = function (center) {
				//[jscastro] if the object options have an adjustment to center the 3D Object different to 0
				if (center && (center.x != 0 || center.y != 0 || center.z != 0)) {
					let size = obj.getSize();
					obj.anchor = { x: obj.anchor.x - (size.x * center.x), y: obj.anchor.y - (size.y * center.y), z: obj.anchor.z - (size.z * center.z) };
					obj.model.position.set(-obj.anchor.x, -obj.anchor.y, -obj.anchor.z)
				}
			}

			//[jscastro] added property for simulated label
			Object.defineProperty(obj, 'label', {
				get() { return obj.getObjectByName(labelName); }
			});

			//[jscastro] added property for simulated tooltip
			Object.defineProperty(obj, 'tooltip', {
				get() { return obj.getObjectByName(tooltipName); }
			});

			//[jscastro] added property for help
			Object.defineProperty(obj, 'help', {
				get() { return obj.getObjectByName(helpName); }
			});

			let _hidden = false;
			//[jscastro] added property for explicitely hidden object to avoid zoom layer behavior
			Object.defineProperty(obj, 'hidden', {
				get() { return _hidden; },
				set(value) {
					if (_hidden != value) {
						_hidden = value;
						obj.visibility = !_hidden;
					}
				}
			});

			//[jscastro] added property to redefine visible, including the label and tooltip
			Object.defineProperty(obj, 'visibility', {
				get() { return obj.visible; },
				set(value) {
					let _value = value;
					if (value == 'visible' || value == true) {
						_value = true;
						if (obj.label) obj.label.visible = _value;
					}
					else if (value == 'none' || value == false) {
						_value = false;
						if (obj.label && obj.label.alwaysVisible) obj.label.visible = _value;
						if (obj.tooltip) obj.tooltip.visible = _value;
					}
					else return;
					if (obj.visible != _value) {
						if (obj.hidden && _value) return;

						obj.visible = _value;

						if (obj.model) {
							obj.model.traverse(function (c) {
								if (c.type == "Mesh" || c.type == "SkinnedMesh") {
									if (_value && obj.raycasted) {
										c.layers.enable(0); //this makes the meshes visible for raycast
									} else {
										c.layers.disable(0); //this makes the meshes invisible for raycast
									}
								}
								if (c.type == "LineSegments") {
									c.layers.disableAll();
								}
							});
						}
					}
				}
			});

			//[jscastro] add CSS2 label method 
			obj.addLabel = function (HTMLElement, visible, center, height) {
				if (HTMLElement) {
					//we add it to the first children to get same boxing and position
					//obj.children[0].add(obj.drawLabel(text, height));
					obj.drawLabelHTML(HTMLElement, visible, center, height);
				}
			}

			//[jscastro] remove CSS2 label method 
			obj.removeLabel = function () {
				obj.removeCSS2D(labelName);
			}

			//[jscastro] draw label method can be invoked separately
			obj.drawLabelHTML = function (HTMLElement, visible = false, center = obj.anchor, height = 0.5) {
				let divLabel = root.drawLabelHTML(HTMLElement, Objects.prototype._defaults.label.cssClass);
				let label = obj.addCSS2D(divLabel, labelName, center, height) //label.position.set(((-size.x * 0.5) - obj.model.position.x - center.x + bottomLeft.x), ((-size.y * 0.5) - obj.model.position.y - center.y + bottomLeft.y), size.z * 0.5); //middle-centered
				label.alwaysVisible = visible;
				label.visible = visible;
				return label;
			}

			//[jscastro] add tooltip method 
			obj.addTooltip = function (tooltipText, mapboxStyle, center, custom = true, height = 1) {
				let t = obj.addHelp(tooltipText, tooltipName, mapboxStyle, center, height);
				t.visible = false;
				t.custom = custom;
			}

			//[jscastro] remove CSS2 tooltip method
			obj.removeTooltip = function () {
				obj.removeCSS2D(tooltipName);
			}

			//[jscastro] add tooltip method 
			obj.addHelp = function (helpText, objName = helpName, mapboxStyle = false, center = obj.anchor, height = 0) {
				let divHelp = root.drawTooltip(helpText, mapboxStyle);
				let h = obj.addCSS2D(divHelp, objName, center, height);
				h.visible = true;
				return h;
			}

			//[jscastro] remove CSS2 tooltip method
			obj.removeHelp = function () {
				obj.removeCSS2D(helpName);
			}

			//[jscastro] add CSS2D help method 
			obj.addCSS2D = function (element, objName, center = obj.anchor, height = 1) {
				if (element) {
					const box = obj.box3();
					const size = box.getSize(new THREE.Vector3());
					let bottomLeft = { x: box.max.x, y: box.max.y, z: box.min.z };
					obj.removeCSS2D(objName);
					let c = new CSS2D.CSS2DObject(element);
					c.name = objName;
					c.position.set(((-size.x * 0.5) - obj.model.position.x - center.x + bottomLeft.x), ((-size.y * 0.5) - obj.model.position.y - center.y + bottomLeft.y), size.z * height); 
					c.visible = false; //only visible on mouseover or selected
					obj.scaleGroup.add(c);
					return c;
				}
			}

			//[jscastro] remove CSS2 help method
			obj.removeCSS2D = function (objName) {
				let css2D = obj.getObjectByName(objName);
				if (css2D) {
					css2D.dispose();
					let g = obj.scaleGroup.children;
					g.splice(g.indexOf(css2D), 1);
				}
			}

			//[jscastro] added property for help
			Object.defineProperty(obj, 'shadowPlane', {
				get() { return obj.getObjectByName(shadowPlane); }
			});

			let _castShadow = false;
			//[jscastro] added property for traverse an object to cast a shadow
			Object.defineProperty(obj, 'castShadow', {
				get() { return _castShadow; },
				set(value) {
					if (!obj.model || _castShadow === value) return;

					obj.model.traverse(function (c) {
						if (c.isMesh) c.castShadow = true;
					});
					if (value) {
						// we add the shadow plane automatically 
						const s = obj.modelSize;
						const sz = [s.x, s.y, s.z, obj.modelHeight];
						const pSize = Math.max(...sz) * 10;
						const pGeo = new THREE.PlaneBufferGeometry(pSize, pSize);
						const pMat = new THREE.ShadowMaterial();
						//const pMat = new THREE.MeshStandardMaterial({ color: 0x660000 });
						pMat.opacity = 0.5;
						let p = new THREE.Mesh(pGeo, pMat);
						p.name = shadowPlane;
						p.layers.enable(1); p.layers.disable(0); // it makes the object invisible for the raycaster
						p.receiveShadow = value;
						obj.add(p);
					} else {
						// or we remove it 
						obj.traverse(function (c) {
							if (c.isMesh && c.material instanceof THREE.ShadowMaterial)
								obj.remove(c);
						});

					}
					_castShadow = value;

				}
			})

			//[jscastro] added method to position the shadow box on the floor depending the object height
			obj.setReceiveShadowFloor = function () {
				if (obj.castShadow) {
					let sp = obj.shadowPlane, p = sp.position, r = sp.rotation;
					p.z = -obj.modelHeight;
					r.y = obj.rotation.y;
					r.x = -obj.rotation.x;
					if (obj.userData.units === 'meters') {
						const s = obj.modelSize;
						const sz = [s.x, s.y, s.z, -p.z];
						const ps = Math.max(...sz) * 10;
						const sc = ps / sp.geometry.parameters.width;
						sp.scale.set(sc, sc, sc);
					}
				}
			}

			let _receiveShadow = false;
			//[jscastro] added property for traverse an object to receive a shadow
			Object.defineProperty(obj, 'receiveShadow', {
				get() { return _receiveShadow; },
				set(value) {
					if (!obj.model || _receiveShadow === value) return;
					obj.model.traverse(function (c) {
						if (c.isMesh) c.receiveShadow = true;
					});
					_receiveShadow = value;
				}
			})

			let _wireframe = false;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'wireframe', {
				get() { return _wireframe; },
				set(value) {
					if (!obj.model || _wireframe === value) return;
					obj.model.traverse(function (c) {
						if (c.type == "Mesh" || c.type == "SkinnedMesh") {
							let materials = [];
							if (!Array.isArray(c.material)) {
								materials.push(c.material);
							} else {
								materials = c.material;
							}
							let m = materials[0];
							if (value) {
								c.userData.materials = m;
								c.material = m.clone();
								c.material.wireframe = c.material.transparent = value;
								c.material.opacity = 0.3;
							} else {
								c.material.dispose();
								c.material = c.userData.materials;
								c.userData.materials.dispose();
								c.userData.materials = null;
							}

							if (value) { c.layers.disable(0); c.layers.enable(1); } else { c.layers.disable(1); c.layers.enable(0); }
						}
						if (c.type == "LineSegments") {
							c.layers.disableAll();
						}
					});
					_wireframe = value;
					// Dispatch new event WireFramed
					obj.dispatchEvent({ type: 'Wireframed', detail: obj });
				}
			})

			let _color = null;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'color', {
				get() { return _color; },
				set(value) {
					if (!obj.model || _color === value) return;
					obj.model.traverse(function (c) {
						if (c.type == "Mesh" || c.type == "SkinnedMesh") {
							let materials = [];
							if (!Array.isArray(c.material)) {
								materials.push(c.material);
							} else {
								materials = c.material;
							}
							let m = materials[0];
							if (value) {
								c.userData.materials = m;
								c.material = new THREE.MeshStandardMaterial();
								c.material.color.setHex(value);
							} else {
								c.material.dispose();
								c.material = c.userData.materials;
								c.userData.materials.dispose();
								c.userData.materials = null;
							}

						}
					});
					_color = value;
				}
			})


			let _selected = false;
			//[jscastro] added property for selected state
			Object.defineProperty(obj, 'selected', {
				get() { return _selected; },
				set(value) {
					if (value) {
						if (obj.userData.bbox && !obj.boundingBox) obj.drawBoundingBox();
						if (obj.boxGroup) {
							obj.boundingBox.material = Objects.prototype._defaults.materials.boxSelectedMaterial;
							obj.boundingBox.parent.visible = true;
							obj.boundingBox.layers.enable(1);
							obj.boundingBoxShadow.layers.enable(1);
						}
						if (obj.label && !obj.label.alwaysVisible) obj.label.visible = true;
					}
					else {
						if (obj.boxGroup) {
							obj.remove(obj.boxGroup); //remove the box group
						}
						if (obj.label && !obj.label.alwaysVisible) obj.label.visible = false;
						obj.removeHelp();
					}
					if (obj.tooltip) obj.tooltip.visible = value;
					//only fire the event if value is different
					if (_selected != value) {
						_selected = value;
						// Dispatch new event SelectedChange
						obj.dispatchEvent({ type: 'SelectedChange', detail: obj });
					}
				}
			})

			let _raycasted = true;
			//[jscastro] added property for including/excluding an object from raycast
			Object.defineProperty(obj, 'raycasted', {
				get() { return _raycasted; },
				set(value) {
					if (!obj.model || _raycasted === value) return;
					obj.model.traverse(function (c) {
						if (c.type == "Mesh" || c.type == "SkinnedMesh") {
							if (!value) { c.layers.disable(0); c.layers.enable(1); } else { c.layers.disable(1); c.layers.enable(0); }
						}
					});
					_raycasted = value;
				}
			});

			let _over = false;
			//[jscastro] added property for over state
			Object.defineProperty(obj, 'over', {
				get() { return _over; },
				set(value) {
					if (value) {
						if (!obj.selected) {
							if (obj.userData.bbox && !obj.boundingBox) obj.drawBoundingBox();
							if (obj.userData.tooltip && !obj.tooltip) obj.addTooltip(obj.uuid, true, obj.anchor, false);
							if (obj.boxGroup) {
								obj.boundingBox.material = Objects.prototype._defaults.materials.boxOverMaterial;
								obj.boundingBox.parent.visible = true;
								obj.boundingBox.layers.enable(1);
								obj.boundingBoxShadow.layers.enable(1);
							}
						}
						if (obj.label && !obj.label.alwaysVisible) { obj.label.visible = true; }
						// Dispatch new event ObjectOver
						obj.dispatchEvent({ type: 'ObjectMouseOver', detail: obj });

					}
					else {
						if (!obj.selected) {
							if (obj.boxGroup) {
								obj.remove(obj.boxGroup); //remove the box group
								if (obj.tooltip && !obj.tooltip.custom) obj.removeTooltip();
							}
							if (obj.label && !obj.label.alwaysVisible) { obj.label.visible = false; }
						}
						// Dispatch new event ObjectOver
						obj.dispatchEvent({ type: 'ObjectMouseOut', detail: obj });
					}
					if (obj.tooltip) obj.tooltip.visible = value || obj.selected;
					_over = value;
				}
			})

			//[jscastro] get the object model Box3 in runtime
			obj.box3 = function () {
				//update Matrix and MatrixWorld to avoid issues with transformations not full applied
				obj.updateMatrix();
				obj.updateMatrixWorld(true, true);
				let bounds;
				//clone also the model inside it's the one who keeps the real size
				if (obj.model) {
					//let's clone the object before manipulate it
					let dup = obj.clone(true);
					let model = obj.model.clone();
					//get the size of the model because the object is translated and has boundingBoxShadow
					bounds = new THREE.Box3().setFromObject(model);
					//if the object has parent it's already in the added to world so it's scaled and it could be rotated
					if (obj.parent) {
						//first, we return the object to it's original position of rotation, extract rotation and apply inversed
						let rm = new THREE.Matrix4();
						let rmi = new THREE.Matrix4();
						obj.matrix.extractRotation(rm);
						rmi.copy(rm).invert();
						dup.setRotationFromMatrix(rmi);
						//now the object inside will give us a NAABB Non-Axes Aligned Bounding Box 
						bounds = new THREE.Box3().setFromObject(model);
					}
				}
				return bounds;
			};

			//[jscastro] modelBox
			obj.modelBox = function () {
				return obj.box3();
			}

			obj.getSize = function () {
				return obj.box3().getSize(new THREE.Vector3(0, 0, 0));
			}

			//[jscastro]
			let _modelSize = false;
			//[jscastro] added property for wireframes state
			Object.defineProperty(obj, 'modelSize', {
				get() {
					_modelSize = obj.getSize();
					return _modelSize;
				},
				set(value) {
					if (_modelSize != value) {
						_modelSize = value;
					}
				}
			})


			//[jscastro] added property to get modelHeight
			Object.defineProperty(obj, 'modelHeight', {
				get() {
					let h = obj.coordinates[2] || 0;
					if (obj.userData.units === 'scene') h *= (obj.unitsPerMeter / obj.scale.x);
					return h;
				}
			});

			//[jscastro] added property to calculate the units per meter in a given latitude
			//reduced to 7 decimals to avoid deviations on the size of the same object  
			Object.defineProperty(obj, 'unitsPerMeter', {
				get() { return Number(utils.projectedUnitsPerMeter(obj.coordinates[1]).toFixed(7)); }
			});

			let _fixedZoom = null;
			//[jscastro] added property to have a fixed scale for some objects
			Object.defineProperty(obj, 'fixedZoom', {
				get() { return obj.userData.fixedZoom; },
				set(value) {
					if (obj.userData.fixedZoom === value) return;
					obj.userData.fixedZoom = value;
					obj.userData.units = (value ? 'scene' : 'meters');
				}
			});

			//[jscastro] sets the scale of an object based fixedZoom
			obj.setFixedZoom = function (scale) {
				if (obj.fixedZoom != null) {
					if (!scale) scale = obj.userData.mapScale;
					let s = zoomScale(obj.fixedZoom);
					if (s > scale) {
						let calc = s / scale;
						obj.scale.set(calc, calc, calc);
					} else {
						obj.scale.set(1, 1, 1);
					}
				}
			}

			//[jscastro] sets the scale of an object based in the scale and fixedZoom
			obj.setScale = function (scale) {
				// scale the model so that its units are interpreted as meters at the given latitude
				if (obj.userData.units === 'meters' && !obj.fixedZoom) {
					let s = obj.unitsPerMeter;
					obj.scale.set(s, s, s);
				} else if (obj.fixedZoom) {
					if (scale) obj.userData.mapScale = scale;
					obj.setFixedZoom(obj.userData.mapScale); //apply fixed zoom
				} else obj.scale.set(1, 1, 1);
			} 

			function zoomScale(zoom) { return Math.pow(2, zoom); }

			//[jscastro] sets the scale and shadows position of an object based in the scale
			obj.setObjectScale = function (scale) {
				obj.setScale(scale);
				obj.setBoundingBoxShadowFloor();
				obj.setReceiveShadowFloor();
			} 

		}

		obj.add = function (o) {
			obj.scaleGroup.add(o);
			o.position.z = (obj.coordinates[2] ? -obj.coordinates[2] : 0);
			return o;
		}

		obj.remove = function (o) {
			if (!o) return;
			o.traverse(m => {
				//console.log('dispose geometry!')
				if (m.geometry) m.geometry.dispose();
				if (m.material) {
					if (m.material.isMaterial) {
						cleanMaterial(m.material)
					} else {
						// an array of materials
						for (const material of m.material) cleanMaterial(material)
					}
				}
				if (m.dispose) m.dispose();
			})

			obj.scaleGroup.remove(o);
			tb.map.repaint = true;
		}

		//[jscastro] clone + assigning all the attributes
		obj.duplicate = function (options) {

			let dupe = obj.clone(true);	//clone the whole threebox object
			dupe.getObjectByName("model").animations = obj.animations; //we must set this explicitly before addMethods
			if (dupe.userData.feature) {
				if (options && options.feature) dupe.userData.feature = options.feature;
				dupe.userData.feature.properties.uuid = dupe.uuid;
			}
			root._addMethods(dupe); // add methods

			if (!options || utils.equal(options.scale, obj.userData.scale)) {
				//no options, no changes, just return the same object
				dupe.copyAnchor(obj); // copy anchors
				//[jscastro] we add by default a tooltip that can be overriden later or hide it with threebox `enableTooltips`
				return dupe;
			} else {
				dupe.userData = options;
				dupe.userData.isGeoGroup = true;
				dupe.remove(dupe.boxGroup);
				// [jscastro] rotate and scale the model
				const r = utils.types.rotation(options.rotation, [0, 0, 0]);
				const s = utils.types.scale(options.scale, [1, 1, 1]);
				// [jscastro] reposition to 0,0,0
				dupe.model.position.set(0, 0, 0);
				// rotate and scale
				dupe.model.rotation.set(r[0], r[1], r[2]);
				dupe.model.scale.set(s[0], s[1], s[2]);
				//[jscastro] calculate automatically the pivotal center of the object
				dupe.setAnchor(options.anchor);
				//[jscastro] override the center calculated if the object has adjustments
				dupe.setCenter(options.adjustment);
				return dupe;

			}

		}

		//[jscastro] copy anchor values
		obj.copyAnchor = function (o) {

			obj.anchor = o.anchor;
			obj.none = { x: 0, y: 0, z: 0 };
			obj.center = o.center;
			obj.bottom = o.bottom;
			obj.bottomLeft = o.bottomLeft;
			obj.bottomRight = o.bottomRight;
			obj.top = o.top;
			obj.topLeft = o.topLeft;
			obj.topRight = o.topRight;
			obj.left = o.left;
			obj.right = o.right;

		}

		obj.dispose = function () {

			Objects.prototype.unenroll(obj);

			obj.traverse(o => {
				//don't dispose th object itself as it will be recursive
				if (o.parent && o.parent.name == "world") return;
				if (o.name === "threeboxObject") return;

				//console.log('dispose geometry!')
				if (o.geometry) o.geometry.dispose();

				if (o.material) {
					if (o.material.isMaterial) {
						cleanMaterial(o.material)
					} else {
						// an array of materials
						for (const material of o.material) cleanMaterial(material)
					}
				}
				if (o.dispose) o.dispose();

			})

			obj.children = [];

		}

		const cleanMaterial = material => {
			//console.log('dispose material!')
			material.dispose()

			// dispose textures
			for (const key of Object.keys(material)) {
				const value = material[key]
				if (value && typeof value === 'object' && 'minFilter' in value) {
					//console.log('dispose texture!')
					value.dispose()
				}
			}
			let m = material;
			let md = (m.map || m.alphaMap || m.aoMap || m.bumpMap || m.displacementMap || m.emissiveMap || m.envMap || m.lightMap || m.metalnessMap || m.normalMap || m.roughnessMap)
			if (md) {
				if (m.map) m.map.dispose();
				if (m.alphaMap) m.alphaMap.dispose();
				if (m.aoMap) m.aoMap.dispose();
				if (m.bumpMap) m.bumpMap.dispose();
				if (m.displacementMap) m.displacementMap.dispose();
				if (m.emissiveMap) m.emissiveMap.dispose();
				if (m.envMap) m.envMap.dispose();
				if (m.lightMap) m.lightMap.dispose();
				if (m.metalnessMap) m.metalnessMap.dispose();
				if (m.normalMap) m.normalMap.dispose();
				if (m.roughnessMap) m.roughnessMap.dispose();
			}
		}

		return obj
	},

	_makeGroup: function (obj, options) {
		let projScaleGroup = new THREE.Group();
		projScaleGroup.name = "scaleGroup";
		projScaleGroup.add(obj)

		var geoGroup = new THREE.Group();
		geoGroup.userData = options || {};
		geoGroup.userData.isGeoGroup = true;
		if (geoGroup.userData.feature) {
			geoGroup.userData.feature.properties.uuid = geoGroup.uuid;
		}
		var isArrayOfObjects = projScaleGroup.length;
		if (isArrayOfObjects) for (o of projScaleGroup) geoGroup.add(o)
		else geoGroup.add(projScaleGroup);

		//utils._flipMaterialSides(projScaleGroup);
		geoGroup.name = "threeboxObject";

		return geoGroup
	},

	animationManager: new AnimationManager,

	//[jscastro] add tooltip method 
	drawTooltip : function (tooltipText, mapboxStyle = false) {
		if (tooltipText) {
			let divToolTip;
			if (mapboxStyle) {
				let divContent = document.createElement('div');
				divContent.className = 'mapboxgl-popup-content';
				let strong = document.createElement('strong');
				strong.innerHTML = tooltipText;
				divContent.appendChild(strong);
				let tip = document.createElement('div');
				tip.className = 'mapboxgl-popup-tip';
				let div = document.createElement('div');
				div.className = 'marker mapboxgl-popup-anchor-bottom';
				div.appendChild(tip);
				div.appendChild(divContent);
				divToolTip = document.createElement('div');
				divToolTip.className += 'label3D';
				divToolTip.appendChild(div);
			}
			else {
				divToolTip = document.createElement('span');
				divToolTip.className = this._defaults.tooltip.cssClass;
				divToolTip.innerHTML = tooltipText;
			}
			return divToolTip;
		}
	},

	//[jscastro] draw label method can be invoked separately
	drawLabelHTML: function (HTMLElement, cssClass) {
		let div = document.createElement('div');
		div.className += cssClass;
		// [jscastro] create a div [TODO] analize if must be moved
		if (typeof (HTMLElement) == 'string') {
			div.innerHTML = HTMLElement;
		} else {
			div.innerHTML = HTMLElement.outerHTML;
		}
		return div;
	},

	_defaults: {
		colors: {
			red: new THREE.Color(0xff0000),
			yellow: new THREE.Color(0xffff00),
			green: new THREE.Color(0x00ff00),
			black: new THREE.Color(0x000000)
		},

		materials: {
			boxNormalMaterial: new THREE.LineBasicMaterial({ color: new THREE.Color(0xff0000) }),
			boxOverMaterial: new THREE.LineBasicMaterial({ color: new THREE.Color(0xffff00) }),
			boxSelectedMaterial: new THREE.LineBasicMaterial({ color: new THREE.Color(0x00ff00) })
		},

		line: {
			geometry: null,
			color: 'black',
			width: 1,
			opacity: 1
		},

		label: {
			htmlElement: null,
			cssClass: " label3D",
			alwaysVisible: false,
			topMargin: -0.5
		},

		tooltip: {
			text: '',
			cssClass: 'toolTip text-xs',
			mapboxStyle: false,
			topMargin: 0
		},

		sphere: {
			position: [0, 0, 0],
			radius: 1,
			sides: 20,
			units: 'scene',
			material: 'MeshBasicMaterial',
			anchor: 'bottom-left',
			bbox: true,
			tooltip: true,
			raycasted: true

		},

		tube: {
			geometry: null,
			radius: 1,
			sides: 6,
			units: 'scene',
			material: 'MeshBasicMaterial',
			anchor: 'center',
			bbox: true,
			tooltip: true,
			raycasted: true
		},

		loadObj: {
			type: null,
			obj: null,
			units: 'scene',
			scale: 1,
			rotation: 0,
			defaultAnimation: 0,
			anchor: 'bottom-left',
			bbox: true,
			tooltip: true,
			raycasted: true,
			clone: true
		},

		Object3D: {
			obj: null,
			units: 'scene',
			anchor: 'bottom-left',
			bbox: true,
			tooltip: true, 
			raycasted: true
		},

		extrusion: {
			coordinates: [[[]]],
			geometryOptions: {},
			height: 100,
			materials: null,
			scale: 1,
			rotation: 0,
			units: 'scene',
			anchor: 'center',
			bbox: true,
			tooltip: true,
			raycasted: true

		}
	},

	geometries: {
		line: ['LineString'],
		tube: ['LineString'],
		sphere: ['Point'],
	}
}

module.exports = exports = Objects;
},{"../animation/AnimationManager.js":5,"../three.js":25,"../utils/material.js":27,"../utils/utils.js":29,"./CSS2DRenderer.js":7}],22:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
*/
const utils = require("../utils/utils.js");
const material = require("../utils/material.js");
const Objects = require('./objects.js');
const Object3D = require('./Object3D.js');

function Sphere(opt) {

	opt = utils._validate(opt, Objects.prototype._defaults.sphere);
	let geometry = new THREE.SphereBufferGeometry(opt.radius, opt.sides, opt.sides);
	let mat = material(opt)
	let output = new THREE.Mesh(geometry, mat);
	//[jscastro] we convert it in Object3D to add methods, bounding box, model, tooltip...
	return new Object3D({ obj: output, units: opt.units, anchor: opt.anchor, adjustment: opt.adjustment, bbox: opt.bbox, tooltip: opt.tooltip, raycasted: opt.raycasted });

}


module.exports = exports = Sphere;
},{"../utils/material.js":27,"../utils/utils.js":29,"./Object3D.js":9,"./objects.js":21}],23:[function(require,module,exports){
const utils = require("../utils/utils.js");
const Objects = require('./objects.js');
const CSS2D = require('./CSS2DRenderer.js');
var THREE = require("../three.js");

function Tooltip(obj) {

	obj = utils._validate(obj, Objects.prototype._defaults.tooltip);

	if (obj.text) {

		let divToolTip = Objects.prototype.drawTooltip(obj.text, obj.mapboxStyle);

		let tooltip = new CSS2D.CSS2DObject(divToolTip);
		tooltip.visible = false;
		tooltip.name = "tooltip";
		var userScaleGroup = Objects.prototype._makeGroup(tooltip, obj);
		Objects.prototype._addMethods(userScaleGroup);
		return userScaleGroup;
	}

}

module.exports = exports = Tooltip;
},{"../three.js":25,"../utils/utils.js":29,"./CSS2DRenderer.js":7,"./objects.js":21}],24:[function(require,module,exports){
/**
 * @author peterqliu / https://github.com/peterqliu
 * @author jscastro / https://github.com/jscastro76
*/
const utils = require("../utils/utils.js");
const material = require("../utils/material.js");
const Objects = require('./objects.js');
const THREE = require("../three.js");
const Object3D = require('./Object3D.js');

function tube(opt, world){

	// validate and prep input geometry
	opt = utils._validate(opt, Objects.prototype._defaults.tube);

	let points = []
	opt.geometry.forEach(p => {
		points.push(new THREE.Vector3(p[0], p[1], p[2]));
	})
	const curve = new THREE.CatmullRomCurve3(points);
	let tube = new THREE.TubeGeometry(curve, points.length, opt.radius, opt.sides, false);
	let mat = material(opt);
	let obj = new THREE.Mesh(tube, mat);
	//[jscastro] we convert it in Object3D to add methods, bounding box, model, tooltip...
	return new Object3D({ obj: obj, units: opt.units, anchor: opt.anchor, adjustment: opt.adjustment, bbox: opt.bbox, tooltip: opt.tooltip, raycasted: opt.raycasted });
}

module.exports = exports = tube;


},{"../three.js":25,"../utils/material.js":27,"../utils/utils.js":29,"./Object3D.js":9,"./objects.js":21}],25:[function(require,module,exports){
/**
 * @license
 * Copyright 2010-2021 Three.js Authors
 * SPDX-License-Identifier: MIT
 */

},{}],26:[function(require,module,exports){
const WORLD_SIZE = 1024000; //TILE_SIZE * 2000
const MERCATOR_A = 6378137.0; // 900913 projection property. (Deprecated) Replaced by EARTH_RADIUS
const FOV_ORTHO = 0.1 / 180 * Math.PI; //Mapbox doesn't accept 0 as FOV
const FOV = Math.atan(3 / 4); //from Mapbox https://github.com/mapbox/mapbox-gl-js/blob/main/src/geo/transform.js#L93
const EARTH_RADIUS = 6371008.8; //from Mapbox  https://github.com/mapbox/mapbox-gl-js/blob/0063cbd10a97218fb6a0f64c99bf18609b918f4c/src/geo/lng_lat.js#L11
const EARTH_CIRCUMFERENCE_EQUATOR = 40075017 //from Mapbox https://github.com/mapbox/mapbox-gl-js/blob/0063cbd10a97218fb6a0f64c99bf18609b918f4c/src/geo/lng_lat.js#L117

module.exports = exports = {
    WORLD_SIZE: WORLD_SIZE,
    PROJECTION_WORLD_SIZE: WORLD_SIZE / (EARTH_RADIUS * Math.PI * 2),
    MERCATOR_A: EARTH_RADIUS, 
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
    EARTH_RADIUS: EARTH_RADIUS,
    EARTH_CIRCUMFERENCE: 2 * Math.PI * EARTH_RADIUS, //40075000, // In meters
    EARTH_CIRCUMFERENCE_EQUATOR: EARTH_CIRCUMFERENCE_EQUATOR, 
    FOV_ORTHO: FOV_ORTHO, // closest to 0
    FOV: FOV, // Math.atan(3/4) radians. If this value is changed, FOV_DEGREES must be calculated
    FOV_DEGREES: FOV * 180 / Math.PI, // Math.atan(3/4) in degrees
    TILE_SIZE: 512
}
},{}],27:[function(require,module,exports){
// This module creates a THREE material from the options object provided into the Objects class.
// Users can do this in one of three ways:

// - provide a preset THREE.Material in the `material` parameter
// - specify a `material` string, `color`, and/or `opacity` as modifications of the default material
// - provide none of these parameters, to use the default material

var utils = require("../utils/utils.js");
var THREE = require("../three.js");

var defaults = {
	material: 'MeshBasicMaterial',
	color: 'black',
	opacity: 1
};


function material (options) {

	var output;

	if (options) {

		options = utils._validate(options, defaults);

		// check if user provided material object
		if (options.material && options.material.isMaterial) output = options.material;

		// check if user provided any material parameters. create new material object based on that.
		else if (options.material || options.color || options.opacity){
		    output = new THREE[options.material]({color: options.color, transparent: options.opacity<1});
		}

		// if neither, return default material
		else output = generateDefaultMaterial();

		output.opacity = options.opacity;
		if (options.side) output.side = options.side

	}

	// if no options, return default
	else output = generateDefaultMaterial();

	function generateDefaultMaterial(){
		return new THREE[defaults.material]({color: defaults.color});
	}

	return output
}

module.exports = exports = material;

},{"../three.js":25,"../utils/utils.js":29}],28:[function(require,module,exports){
/*
 (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
 https://github.com/mourner/suncalc
*/

(function () {
    'use strict';

    // shortcuts for easier to read formulas

    var PI = Math.PI,
        sin = Math.sin,
        cos = Math.cos,
        tan = Math.tan,
        asin = Math.asin,
        atan = Math.atan2,
        acos = Math.acos,
        rad = PI / 180;

    // sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


    // date/time constants and conversions

    var dayMs = 1000 * 60 * 60 * 24,
        J1970 = 2440588,
        J2000 = 2451545;

    function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
    function fromJulian(j) { return new Date((j + 0.5 - J1970) * dayMs); }
    function toDays(date) { return toJulian(date) - J2000; }

    // general calculations for position

    var e = rad * 23.4397; // obliquity of the Earth

    function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
    function declination(l, b) { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

    function azimuth(H, phi, dec) { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
    function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

    function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }

    function astroRefraction(h) {
        if (h < 0) // the following formula works for positive altitudes only.
            h = 0; // if h = -0.08901179 a div/0 would occur.

        // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
    }

    // general sun calculations

    function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

    function eclipticLongitude(M) {

        var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
            P = rad * 102.9372; // perihelion of the Earth

        return M + C + P + PI;
    }

    function sunCoords(d) {

        var M = solarMeanAnomaly(d),
            L = eclipticLongitude(M);

        return {
            dec: declination(L, 0),
            ra: rightAscension(L, 0)
        };
    }


    var SunCalc = {};


    // calculates sun position for a given date and latitude/longitude

    SunCalc.getPosition = function (date, lat, lng) {

        var lw = rad * -lng,
            phi = rad * lat,
            d = toDays(date),

            c = sunCoords(d),
            H = siderealTime(d, lw) - c.ra;

        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: altitude(H, phi, c.dec)
        };
    };

    SunCalc.toJulian = function (date) {
        return toJulian(date);
    };

    // sun times configuration (angle, morning name, evening name)

    var times = SunCalc.times = [
        [-0.833, 'sunrise', 'sunset'],
        [-0.3, 'sunriseEnd', 'sunsetStart'],
        [-6, 'dawn', 'dusk'],
        [-12, 'nauticalDawn', 'nauticalDusk'],
        [-18, 'nightEnd', 'night'],
        [6, 'goldenHourEnd', 'goldenHour']
    ];

    // adds a custom time to the times config

    SunCalc.addTime = function (angle, riseName, setName) {
        times.push([angle, riseName, setName]);
    };


    // calculations for sun times

    var J0 = 0.0009;

    function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }

    function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
    function solarTransitJ(ds, M, L) { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }

    function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
    function observerAngle(height) { return -2.076 * Math.sqrt(height) / 60; }

    // returns set time for the given sun altitude
    function getSetJ(h, lw, phi, dec, n, M, L) {

        var w = hourAngle(h, phi, dec),
            a = approxTransit(w, lw, n);
        return solarTransitJ(a, M, L);
    }


    // calculates sun times for a given date, latitude/longitude, and, optionally,
    // the observer height (in meters) relative to the horizon

    SunCalc.getTimes = function (date, lat, lng, height) {

        height = height || 0;

        var lw = rad * -lng,
            phi = rad * lat,

            dh = observerAngle(height),

            d = toDays(date),
            n = julianCycle(d, lw),
            ds = approxTransit(0, lw, n),

            M = solarMeanAnomaly(ds),
            L = eclipticLongitude(M),
            dec = declination(L, 0),

            Jnoon = solarTransitJ(ds, M, L),

            i, len, time, h0, Jset, Jrise;


        var result = {
            solarNoon: fromJulian(Jnoon),
            nadir: fromJulian(Jnoon - 0.5)
        };

        for (i = 0, len = times.length; i < len; i += 1) {
            time = times[i];
            h0 = (time[0] + dh) * rad;

            Jset = getSetJ(h0, lw, phi, dec, n, M, L);
            Jrise = Jnoon - (Jset - Jnoon);

            result[time[1]] = fromJulian(Jrise);
            result[time[2]] = fromJulian(Jset);
        }

        return result;
    };


    // moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

    function moonCoords(d) { // geocentric ecliptic coordinates of the moon

        var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
            M = rad * (134.963 + 13.064993 * d), // mean anomaly
            F = rad * (93.272 + 13.229350 * d),  // mean distance

            l = L + rad * 6.289 * sin(M), // longitude
            b = rad * 5.128 * sin(F),     // latitude
            dt = 385001 - 20905 * cos(M);  // distance to the moon in km

        return {
            ra: rightAscension(l, b),
            dec: declination(l, b),
            dist: dt
        };
    }

    SunCalc.getMoonPosition = function (date, lat, lng) {

        var lw = rad * -lng,
            phi = rad * lat,
            d = toDays(date),

            c = moonCoords(d),
            H = siderealTime(d, lw) - c.ra,
            h = altitude(H, phi, c.dec),
            // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
            pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

        h = h + astroRefraction(h); // altitude correction for refraction

        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: h,
            distance: c.dist,
            parallacticAngle: pa
        };
    };


    // calculations for illumination parameters of the moon,
    // based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
    // Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

    SunCalc.getMoonIllumination = function (date) {

        var d = toDays(date || new Date()),
            s = sunCoords(d),
            m = moonCoords(d),

            sdist = 149598000, // distance from Earth to Sun in km

            phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
            inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
            angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
                cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

        return {
            fraction: (1 + cos(inc)) / 2,
            phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
            angle: angle
        };
    };


    function hoursLater(date, h) {
        return new Date(date.valueOf() + h * dayMs / 24);
    }

    // calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

    SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
        var t = new Date(date);
        if (inUTC) t.setUTCHours(0, 0, 0, 0);
        else t.setHours(0, 0, 0, 0);

        var hc = 0.133 * rad,
            h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
            h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

        // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
        for (var i = 1; i <= 24; i += 2) {
            h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
            h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

            a = (h0 + h2) / 2 - h1;
            b = (h2 - h0) / 2;
            xe = -b / (2 * a);
            ye = (a * xe + b) * xe + h1;
            d = b * b - 4 * a * h1;
            roots = 0;

            if (d >= 0) {
                dx = Math.sqrt(d) / (Math.abs(a) * 2);
                x1 = xe - dx;
                x2 = xe + dx;
                if (Math.abs(x1) <= 1) roots++;
                if (Math.abs(x2) <= 1) roots++;
                if (x1 < -1) x1 = x2;
            }

            if (roots === 1) {
                if (h0 < 0) rise = i + x1;
                else set = i + x1;

            } else if (roots === 2) {
                rise = i + (ye < 0 ? x2 : x1);
                set = i + (ye < 0 ? x1 : x2);
            }

            if (rise && set) break;

            h0 = h2;
        }

        var result = {};

        if (rise) result.rise = hoursLater(t, rise);
        if (set) result.set = hoursLater(t, set);

        if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

        return result;
    };


    //// export as Node module / AMD module / browser variable
    //if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = SunCalc;
    //else if (typeof define === 'function' && define.amd) define(SunCalc);
    //else window.SunCalc = SunCalc;
    module.exports = exports = SunCalc
}());


},{}],29:[function(require,module,exports){
var THREE = require("../three.js");
var Constants = require("./constants.js");
var validate = require("./validate.js");

var utils = {

	prettyPrintMatrix: function (uglymatrix) {
		for (var s = 0; s < 4; s++) {
			var quartet = [uglymatrix[s],
			uglymatrix[s + 4],
			uglymatrix[s + 8],
			uglymatrix[s + 12]];
			console.log(quartet.map(function (num) { return num.toFixed(4) }))
		}
	},

	makePerspectiveMatrix: function (fovy, aspect, near, far) {

		var out = new THREE.Matrix4();
		var f = 1.0 / Math.tan(fovy / 2),
			nf = 1 / (near - far);

		var newMatrix = [
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) * nf, -1,
			0, 0, (2 * far * near) * nf, 0
		]

		out.elements = newMatrix
		return out;
	},

	//[jscastro] new orthographic matrix calculations https://en.wikipedia.org/wiki/Orthographic_projection and validated with https://bit.ly/3rPvB9Y
	makeOrthographicMatrix: function (left, right, top, bottom, near, far) {
		var out = new THREE.Matrix4();

		const w = 1.0 / (right - left);
		const h = 1.0 / (top - bottom);
		const p = 1.0 / (far - near);

		const x = (right + left) * w;
		const y = (top + bottom) * h;
		const z = near * p;

		var newMatrix = [
			2 * w, 0, 0, 0,
			0, 2 * h, 0, 0,
			0, 0, - 1 * p, 0,
			- x, -y, -z, 1
		]

		out.elements = newMatrix
		return out;
	},

	//gimme radians
	radify: function (deg) {

		function convert(degrees) {
			degrees = degrees || 0;
			return Math.PI * 2 * degrees / 360
		}

		if (typeof deg === 'object') {

			//if [x,y,z] array of rotations
			if (deg.length > 0) {
				return deg.map(function (degree) {
					return convert(degree)
				})
			}

			// if {x: y: z:} rotation object
			else {
				return [convert(deg.x), convert(deg.y), convert(deg.z)]
			}
		}

		//if just a number
		else return convert(deg)
	},

	//gimme degrees
	degreeify: function (rad) {
		function convert(radians) {
			radians = radians || 0;
			return radians * 360 / (Math.PI * 2)
		}

		if (typeof rad === 'object') {
			return [convert(rad.x), convert(rad.y), convert(rad.z)]
		}

		else return convert(rad)
	},

	projectToWorld: function (coords) {

		// Spherical mercator forward projection, re-scaling to WORLD_SIZE

		var projected = [
			-Constants.MERCATOR_A * Constants.DEG2RAD * coords[0] * Constants.PROJECTION_WORLD_SIZE,
			-Constants.MERCATOR_A * Math.log(Math.tan((Math.PI * 0.25) + (0.5 * Constants.DEG2RAD * coords[1]))) * Constants.PROJECTION_WORLD_SIZE
		];

		//z dimension, defaulting to 0 if not provided

		if (!coords[2]) projected.push(0)
		else {
			var pixelsPerMeter = this.projectedUnitsPerMeter(coords[1]);
			projected.push(coords[2] * pixelsPerMeter);
		}

		var result = new THREE.Vector3(projected[0], projected[1], projected[2]);

		return result;
	},

	projectedUnitsPerMeter: function (latitude) {
		return Math.abs(Constants.WORLD_SIZE / Math.cos(Constants.DEG2RAD * latitude) / Constants.EARTH_CIRCUMFERENCE);
	},

	_circumferenceAtLatitude: function (latitude) {
		return Constants.EARTH_CIRCUMFERENCE * Math.cos(latitude * Math.PI / 180);
	},

	mercatorZfromAltitude: function (altitude, lat) {
		return altitude / this._circumferenceAtLatitude(lat);
	},

	_scaleVerticesToMeters: function (centerLatLng, vertices) {
		var pixelsPerMeter = this.projectedUnitsPerMeter(centerLatLng[1]);
		var centerProjected = this.projectToWorld(centerLatLng);

		for (var i = 0; i < vertices.length; i++) {
			vertices[i].multiplyScalar(pixelsPerMeter);
		}

		return vertices;
	},

	projectToScreen: function (coords) {
		console.log("WARNING: Projecting to screen coordinates is not yet implemented");
	},

	unprojectFromScreen: function (pixel) {
		console.log("WARNING: unproject is not yet implemented");
	},

	//world units to lnglat
	unprojectFromWorld: function (worldUnits) {

		var unprojected = [
			-worldUnits.x / (Constants.MERCATOR_A * Constants.DEG2RAD * Constants.PROJECTION_WORLD_SIZE),
			2 * (Math.atan(Math.exp(worldUnits.y / (Constants.PROJECTION_WORLD_SIZE * (-Constants.MERCATOR_A)))) - Math.PI / 4) / Constants.DEG2RAD
		];

		var pixelsPerMeter = this.projectedUnitsPerMeter(unprojected[1]);

		//z dimension
		var height = worldUnits.z || 0;
		unprojected.push(height / pixelsPerMeter);

		return unprojected;
	},

	toScreenPosition: function (obj, camera) {
		var vector = new THREE.Vector3();

		var widthHalf = 0.5 * renderer.context.canvas.width;
		var heightHalf = 0.5 * renderer.context.canvas.height;

		obj.updateMatrixWorld();
		vector.setFromMatrixPosition(obj.matrixWorld);
		vector.project(camera);

		vector.x = (vector.x * widthHalf) + widthHalf;
		vector.y = - (vector.y * heightHalf) + heightHalf;

		return {
			x: vector.x,
			y: vector.y
		};

	},

	//get the center point of a feature
	getFeatureCenter: function getFeatureCenter(feature, model, level) {
		let center = [];
		let latitude = 0;
		let longitude = 0;
		let height = 0;
		//deep copy to avoid modifying the original array
		let coordinates = [...feature.geometry.coordinates[0]];
		if (feature.geometry.type === "Point") {
			center = [...coordinates[0]];//deep copy
		}
		else {
			//features in mapbox repeat the first coordinates at the end. We remove it.
			if (feature.geometry.type === "MultiPolygon") coordinates = coordinates[0];
			coordinates.splice(-1, 1);
			coordinates.forEach(function (c) {
				latitude += c[0];
				longitude += c[1];
			});
			center = [latitude / coordinates.length, longitude / coordinates.length];
		}
		height = this.getObjectHeightOnFloor(feature, model, level);

		(center.length < 3 ? center.push(height) : center[2] = height);

		return center;
	},

	getObjectHeightOnFloor: function (feature, obj, level = feature.properties.level || 0) {
		let floorHeightMin = (level * (feature.properties.levelHeight || 0));
		//object height is modelSize.z + base_height or min_height configured for this object
		let base = (feature.properties.base_height || feature.properties.min_height || 0);
		//let height = ((obj && obj.model) ? obj.modelSize.z : (feature.properties.height - base));
		let height = ((obj && obj.model) ? 0 : (feature.properties.height - base));
		let objectHeight = height + base;
		let modelHeightFloor = floorHeightMin + objectHeight;
		return modelHeightFloor;
	},

	_flipMaterialSides: function (obj) {

	},

	// to improve precision, normalize a series of vector3's to their collective center, and move the resultant mesh to that center
	normalizeVertices(vertices) {

		let geometry = new THREE.BufferGeometry();
		let positions = [];

		for (var j = 0; j < vertices.length; j++) {
			let p = vertices[j];
			positions.push(p.x, p.y, p.z);
			positions.push(p.x, p.y, p.z);
		}
		geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
		geometry.computeBoundingSphere();
		var center = geometry.boundingSphere.center;

		var scaled = vertices.map(function (v3) {
			var normalized = v3.sub(center);
			return normalized;
		});

		return { vertices: scaled, position: center }
	},

	//flatten an array of Vector3's into a shallow array of values in x-y-z order, for bufferGeometry
	flattenVectors(vectors) {
		var flattenedArray = [];
		for (let vertex of vectors) {
			flattenedArray.push(vertex.x, vertex.y, vertex.z);
		}
		return flattenedArray
	},

	//convert a line/polygon to Vector3's

	lnglatsToWorld: function (coords) {

		var vector3 = coords.map(
			function (pt) {
				var p = utils.projectToWorld(pt);
				var v3 = new THREE.Vector3(p.x, p.y, p.z);
				return v3
			}
		);

		return vector3
	},

	extend: function (original, addition) {
		for (let key in addition) original[key] = addition[key];
	},

	clone: function (original) {
		var clone = {};
		for (let key in original) clone[key] = original[key];
		return clone;
	},

	clamp: function(n, min, max) {
		return Math.min(max, Math.max(min, n));
	},

	// retrieve object parameters from an options object
	types: {

		rotation: function (r, currentRotation) {

			//[jscastro] rotation default 0
			if (!r) { r = 0; };

			// if number provided, rotate only in Z by that amount
			if (typeof r === 'number') r = { z: r };

			var degrees = this.applyDefault([r.x, r.y, r.z], currentRotation);
			var radians = utils.radify(degrees);
			return radians;

		},

		scale: function (s, currentScale) {
			//[jscastro] scale default 1
			if (!s) { s = 1; };
			if (typeof s === 'number') return s = [s, s, s];
			else return this.applyDefault([s.x, s.y, s.z], currentScale);
		},

		applyDefault: function (array, current) {

			var output = array.map(function (item, index) {
				item = item || current[index];
				return item
			})

			return output
		},

	},

	toDecimal: function (n, d) {
		return Number(n.toFixed(d));
	},

	equal: function (obj1, obj2) {
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) {
			return false;
		}
		if (keys1.length == 0 && keys2.length == 0 && keys1 !== keys2) {
			return false;
		}

		for (const key of keys1) {
			const val1 = obj1[key];
			const val2 = obj2[key];
			const areObjects = this.isObject(val1) && this.isObject(val2);
			if (
				areObjects && !equal(val1, val2) ||
				!areObjects && val1 !== val2
			) {
				return false;
			}
		}

		return true;
	},

	isObject: function (object) {
		return object != null && typeof object === 'object';
	},

	curveToLine: (curve, params) => {
		let { width, color } = params;
		let geometry = new THREE.BufferGeometry().setFromPoints(
			curve.getPoints(100)
		);

		let material = new THREE.LineBasicMaterial({
			color: color,
			linewidth: width,
		});

		let line = new THREE.Line(geometry, material);

		return line;
	},

	curvesToLines: (curves) => {
		var colors = [0xff0000, 0x1eff00, 0x2600ff];
		var lines = curves.map((curve, i) => {
			let params = {
				width: 3,
				color: colors[i] || 'purple',
			};
			let curveline = curveToLine(curve, params);

			return curveline;
		});
		return lines;
	},

	_validate: function (userInputs, defaults) {

		userInputs = userInputs || {};
		var validatedOutput = {};
		utils.extend(validatedOutput, userInputs);

		for (let key of Object.keys(defaults)) {

			if (userInputs[key] === undefined) {
				//make sure required params are present
				if (defaults[key] === null) {
					console.error(key + ' is required')
					return;
				}

				else validatedOutput[key] = defaults[key]

			}

			else validatedOutput[key] = userInputs[key]
		}

		return validatedOutput
	},
	Validator: new validate(),
	exposedMethods: ['projectToWorld', 'projectedUnitsPerMeter', 'extend', 'unprojectFromWorld']
}

module.exports = exports = utils
},{"../three.js":25,"./constants.js":26,"./validate.js":30}],30:[function(require,module,exports){
// Type validator

function Validate(){

};

Validate.prototype = {

    Coords: function(input) {

        if (input.constructor !== Array) {
            console.error("Coords must be an array")
            return
        }

        if (input.length < 2) {
            console.error("Coords length must be at least 2")
            return
        }
    
        for (const member of input) {
            if (member.constructor !== Number) {
                console.error("Coords values must be numbers")
                return
            }
        }

        if (Math.abs(input[1]) > 90) {
            console.error("Latitude must be between -90 and 90")
            return                    
        }

        return input
    },

    Line: function(input) {

        var scope = this;

        if (input.constructor !== Array) {
            console.error("Line must be an array")
            return
        }

        for (const coord of input){
            if (!scope.Coords(coord)) {
                console.error("Each coordinate in a line must be a valid Coords type")
                return                    
            }

        }

        return input
    },

    Rotation: function(input) {

        if (input.constructor === Number) input = {z: input}

        else if (input.constructor === Object) {

            for (const key of Object.keys(input)){

                if (!['x', 'y', 'z'].includes(key)) {
                    console.error('Rotation parameters must be x, y, or z')
                    return                            
                }
                if (input[key].constructor !== Number) {
                    console.error('Individual rotation values must be numbers')
                    return
                }
            }
        }

        else {
            console.error('Rotation must be an object or a number')
            return
        }

        return input
    },

    Scale: function(input) {

        if (input.constructor === Number) {
            input = {x:input, y:input, z: input}
        }
        
        else if (input.constructor === Object) {

            for (const key of Object.keys(input)){

                if (!['x', 'y', 'z'].includes(key)) {
                    console.error('Scale parameters must be x, y, or z')
                    return                            
                }
                if (input[key].constructor !== Number) {
                    console.error('Individual scale values must be numbers')
                    return
                }
            }
        }

        else {
            console.error('Scale must be an object or a number')
            return
        }

        return input
    }

}


module.exports = exports = Validate;
},{}]},{},[1]);