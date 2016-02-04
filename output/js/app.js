(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var React = require('react');

var Application = require('../src/views/Application.react');

React.render(React.createElement(Application, null), document.getElementById('entrypoint'));

},{"../src/views/Application.react":18,"react":"react"}],2:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes += ' ' + arg;
			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}

		return classes.substr(1);
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],3:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._45 = 0;
  this._81 = 0;
  this._65 = null;
  this._54 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._10 = null;
Promise._97 = null;
Promise._61 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._81 === 3) {
    self = self._65;
  }
  if (Promise._10) {
    Promise._10(self);
  }
  if (self._81 === 0) {
    if (self._45 === 0) {
      self._45 = 1;
      self._54 = deferred;
      return;
    }
    if (self._45 === 1) {
      self._45 = 2;
      self._54 = [self._54, deferred];
      return;
    }
    self._54.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._81 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._81 === 1) {
        resolve(deferred.promise, self._65);
      } else {
        reject(deferred.promise, self._65);
      }
      return;
    }
    var ret = tryCallOne(cb, self._65);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._81 = 3;
      self._65 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._81 = 1;
  self._65 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._81 = 2;
  self._65 = newValue;
  if (Promise._97) {
    Promise._97(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._45 === 1) {
    handle(self, self._54);
    self._54 = null;
  }
  if (self._45 === 2) {
    for (var i = 0; i < self._54.length; i++) {
      handle(self, self._54[i]);
    }
    self._54 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":5}],4:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._61);
  p._81 = 1;
  p._65 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._81 === 3) {
            val = val._65;
          }
          if (val._81 === 1) return res(i, val._65);
          if (val._81 === 2) reject(val._65);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":3}],5:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var Dispatcher = require("flux").Dispatcher;
var _dispatcher = new Dispatcher();
var _dispatch = _dispatcher.dispatch;
_dispatcher.dispatch = function(command) {
    console.log(command);
    _dispatch.apply(_dispatcher, arguments);
};

var ApiWebClient = require("../webclients/ApiWebClient");
var Validation = require("../utils/Validation");

var Convention = require("./Convention");

function Command(name) {
    Validation.IsTypeOf(name, 'string');

    var query = { name: name, args: _.rest(arguments) };
    _dispatcher.dispatch(query);

    var method = ApiWebClient[name];
    if(!_.isFunction(method)) return;

    method.apply(ApiWebClient, query.args)
        .then(function(response) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Success(name), response: response }));
        })
        .catch(function(error) {
            _dispatcher.dispatch(_.extend({}, query, { name: Convention.Fails(name), response: {}, error: error }));
        });
}

Command.register = function() {
    return _dispatcher.register.apply(_dispatcher, arguments);
};

Command.waitFor = function() {
    return _dispatcher.waitFor.apply(_dispatcher, arguments);
}

module.exports = Command;

},{"../utils/Validation":17,"../webclients/ApiWebClient":20,"./Convention":8,"flux":"flux","lodash":"lodash"}],7:[function(require,module,exports){
"use strict";

var _ = require("lodash");
var classnames = require("classnames");

var React = require("react");

var Store = require("./Store");

var RouteStore = require("../stores/RouteStore");

var Validation = require("../utils/Validation");

var _empty = _.partial(_.identity, undefined);

function Component(component, stores) {
    Validation.IsTypeOf(component, "object");
    var _component = component;

    Validation.IsArrayOfInstances(stores, Store);
    var _stores = stores;

    this.route = _.bind(RouteStore.get, RouteStore, "route");
    this.css = classnames;

    this._base = function(method, params) {
        return _.get(_component, method, _empty).apply(this, params);
    };

    if (!_.isEmpty(_stores)) {
        _stores = _.union(_stores, [RouteStore]);

        this.getInitialState = function() {
            return this._base("getInitialState") || this.getState();
        };

        this.componentDidMount = function() {
            this._base("componentDidMount");

            _.invoke(_stores, "on", this._onChange);

            this.componentDidUpdate();
        };

        this.componentWillUnmount = function() {
            this._base("componentWillUnmount");

            _.invoke(_stores, "off", this._onChange);
        };

        this.componentDidUpdate = function() {
            this._base("componentDidUpdate", _.toArray(arguments));
        };

        this.getState = function() {
            return this._base("getState", _.toArray(arguments));
        };

        this._onChange = function() {
            if(this.isMounted()) {
                this._base("_onChange");
                this.setState(this.getState());
            }
        };
    } else {
        this.shouldComponentUpdate = function(nextProp, nextState) {
            var result = this._base("shouldComponentUpdate", _.toArray(arguments));
            if (_.isBoolean(result)) return result;

            return !_.isEqual(nextProp, this.props) || !_.isEqual(nextState, this.state);
        };
    }

    //add if not exists;
    _.defaults(this, _component);
}

Component.Create = function() {
    var component = _.last(arguments),
        stores = _.initial(arguments);

    return React.createClass(new Component(component, stores));
}

module.exports = Component;

},{"../stores/RouteStore":14,"../utils/Validation":17,"./Store":10,"classnames":2,"lodash":"lodash","react":"react"}],8:[function(require,module,exports){
"use strict";

var Validation = require("../utils/Validation");

var Convention = {
    Fails: function(name) {
        Validation.IsTypeOf(name, 'string');
        return name + "Fails";
    },
    Success: function(name) {
        Validation.IsTypeOf(name, 'string');
        return name + "Success";
    }
}

module.exports = Convention;

},{"../utils/Validation":17}],9:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var Promise = require('promise/lib/es6-extensions');

var Dispatcher = require("flux").Dispatcher;
var _dispatcher = new Dispatcher();
var _dispatch = _dispatcher.dispatch;
_dispatcher.dispatch = function(command) {
    console.log(command);
    return _dispatch.apply(_dispatcher, arguments);
};

var ViewWebClient = require("../webclients/ViewWebClient");
var Validation = require("../utils/Validation");

var Convention = require("./Convention");

var _inprogress = {};
function Query(name) {
    Validation.IsTypeOf(name, 'string');
    var method = ViewWebClient[name];
    if(!_.isFunction(method)) return;

    var query = { name: name, args: _.rest(arguments) };
    var key = JSON.stringify(query);
    if(_.has(_inprogress, key)) return;
    _inprogress[key] = null;

    _dispatcher.dispatch(query);
    Promise.all(
        method.apply(ViewWebClient, query.args)
            .then(function(response) {
                _dispatcher.dispatch(_.extend({}, query, { name: Convention.Success(name), response: response }));
            })
            .catch(function(error) {
                _dispatcher.dispatch(_.extend({}, query, { name: Convention.Fails(name), response: {}, error: error }));
            })
    ).then(function(xhr, response) {
        delete _inprogress[key];
    });
}

Query.register = function() {
    return _dispatcher.register.apply(_dispatcher, arguments);
};

module.exports = Query;

},{"../utils/Validation":17,"../webclients/ViewWebClient":21,"./Convention":8,"flux":"flux","lodash":"lodash","promise/lib/es6-extensions":4}],10:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var EventEmitter = require("events").EventEmitter;

var Validation = require("../utils/Validation");

var CHANGE_EVENT = "change";

function Store(options) {
    if(_.has(options, 'getHandlers')) {
        Validation.IsTypeOf(options, 'function', ['getHandlers']);
    } else {
        Validation.IsTypeOf(options, 'function', ['globalHandler']);
    }
    _.extend(this, options);

    EventEmitter.call(this);
    this.setMaxListeners(100);

    var _state;

    var _emit = this.emit;
    this.emit = function() {
        _emit(CHANGE_EVENT);
    };

    var _on = this.on;
    this.on = function(callback) {
        _on(CHANGE_EVENT, callback);
    };

    this.off = function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    };

    this.get = function() {
        var path = _.toArray(arguments);
        return _.cloneDeep(path.length ? _.get(_state, path) : _state);
    };

    this.set = function(state) {
        var path = _.initial(arguments);
        var value = _.last(arguments);

        if (_.any(path)) {
            _state = _state || {};
            _.set(_state, path, value);
        } else {
            _state = value;
        }
    }

    this.has = function() {
        var path = _.toArray(arguments);
        return !_.isUndefined(path.length ? _.get(_state, path) : _state);
    };
}

Store.prototype = _.create(EventEmitter.prototype, {
    "constructor": Store
});

module.exports = Store;

},{"../utils/Validation":17,"events":"events","lodash":"lodash"}],11:[function(require,module,exports){
'use strict';

var _ = require('lodash');

var Store = require('./Store');
var Command = require('./Command');
var Query = require('./Query');

function StoreFactory() {
    var _register = function(dispatcher, store) {
        var handlers = store.getHandlers.call(store);

        return dispatcher.register(function(action) {
            if (_.isUndefined(action.name)) throw "invalid action was performed";

            var handler = handlers[action.name] || store.globalHandler;
            if (_.isFunction(handler)) {
                handler.call(store, action);
                store.emit();
            }
        });
    };

    this.Create = function(storeObject) {
        var store = new Store(storeObject);

        store.commandToken = _register(Command, store);
        store.queryToken = _register(Query, store);

        return store;
    }
}

module.exports = new StoreFactory();

},{"./Command":6,"./Query":9,"./Store":10,"lodash":"lodash"}],12:[function(require,module,exports){
"use strict";

var _ = require("lodash");

var Symbols = [
    "CreateUser",
    "SignInUser",

    "GetUserExistenceStatus"
];

module.exports = _.mapKeys(Symbols, _.indentity);

},{"lodash":"lodash"}],13:[function(require,module,exports){
"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var ProcessingStore = StoreFactory.Create({
    getHandlers: function() {
        var _setStart = function(name) {
            return function(action) {
                this.set(name, { running: true });
            };
        };

        var _setSuccess = function(name) {
            return function(action) {
                this.set(name, { running: false, success: true });
            };
        };

        var _setFailer = function(name) {
            return function(action) {
                this.set(name, { running: false, success: false });
            };
        };

        var _handlers = {};
        _handlers[Symbols.GetUserExistenceStatus] = _setStart(Symbols.GetUserExistenceStatus);
        _handlers[Convention.Fails(Symbols.GetUserExistenceStatus)] = _setFailer(Symbols.GetUserExistenceStatus);
        _handlers[Convention.Success(Symbols.GetUserExistenceStatus)] = _setSuccess(Symbols.GetUserExistenceStatus);

        return _handlers;
    }
});

module.exports = ProcessingStore;

},{"../core/Convention":8,"../core/StoreFactory":11,"../core/Symbols":12}],14:[function(require,module,exports){
'use strict';

var StoreFactory = require('../core/StoreFactory');
var Symbols = require('../core/Symbols');

var RouteStore = StoreFactory.Create({
    getHandlers: function () {
        var _set = function(command) {
            this.set('route', command.route);
        };

        var handlers = {};
        handlers[Symbols.ChangeRoute] = _set;

        return handlers;
    }
});

module.exports = RouteStore;

},{"../core/StoreFactory":11,"../core/Symbols":12}],15:[function(require,module,exports){
"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var UserExistsStore = StoreFactory.Create({
    getHandlers: function() {
        var _setStatus = function(action) {
            this.set(action.response.data.username, action.response.data.exists);
        };

        var _resetStatus = function(action) {
            this.set(action.response.data.username, true);
        };

        var _setFailer = function() { };

        var _handlers = {};
        _handlers[Convention.Success(Symbols.GetUserExistenceStatus)] = _setStatus;
        _handlers[Convention.Fails(Symbols.GetUserExistenceStatus)] = _setFailer;
        _handlers[Convention.Success(Symbols.CreateUser)] = _resetStatus;

        return _handlers;
    }
});

module.exports = UserExistsStore;

},{"../core/Convention":8,"../core/StoreFactory":11,"../core/Symbols":12}],16:[function(require,module,exports){
"use strict";

var StoreFactory = require("../core/StoreFactory");
var Symbols = require("../core/Symbols");
var Convention = require("../core/Convention");

var UserTokenStore = StoreFactory.Create({
    getHandlers: function() {
        var _set = function(action) {
            this.set("token", action.response.data.token);
        };

        var _handlers = {};
        _handlers[Convention.Success(Symbols.SignInUser)] = _set;
        _handlers[Convention.Success(Symbols.CreateUser)] = _set;

        return _handlers;
    }
});

module.exports = UserTokenStore;

},{"../core/Convention":8,"../core/StoreFactory":11,"../core/Symbols":12}],17:[function(require,module,exports){
"use strict";

var _ = require("lodash");

function _exists(object, property) {
    if (!_.has(object, property)) {
        throw "Validation: '" + property + "' is not exists";
    }
}

function _getProperty(object, property) {
    if (_.isUndefined(property)) return object;

    _exists(object, property);
    return object[property];
}

function _inRange(value, range) {
    _exists(range, value);
}

function _isMatch(value, pattern) {
    var regexp = new RegExp(pattern);

    if(!regexp.test(value)) {
        throw "Validation: object or its property is not match";
    }
}

function _isVersion(value) {
    _isMatch(value, "^[0-9]+\.[0-9]+\.[0-9]+$");
}

function _isInstanceOf(value, type) {
    if(!(value instanceof type)) {
        throw "Validation: value is not an instance of expected type";
    }
}

function _isTypeOf(value, typeName) {
    if(_.isNaN(value) || typeof value !== typeName) {
        throw "Validation: value has wrong expected type";
    }
}

function _isTypeOfOrEmpty(value, typeName) {
    if(_.isEmpty(value)) return;

    _isTypeOf(value, typeName);
}

function _isArrayOfInstances(value, type) {
    if(!_.isArray(value)) {
        throw "Validation: array value is required to perform array of check";
    }
    _.each(value, _.curry(_isInstanceOf)(_, type));
}

function _isArrayOfType(value, typeName) {
    if(!_.isArray(value)) {
        throw "Validation: array value is required to perform array of check";
    }
    _.each(value, _.curry(_isTypeOf)(_, typeName));
}

function _isFunction(value) {
    if(!_.isFunction(value)) {
        throw "Validation: value is required to be a function";
    }
}

function _isNull(value) {
    if(!_.isNull(value)) {
        throw "Validation: value is required to be a null";
    }
}

function _create(validator) {
    return function() {
        var properties = _.last(arguments);

        if(_.isArray(properties)) {
            var target = _.first(arguments);
            var params = _.rest(_.initial(arguments));
            _.each(properties, function(property) {
                var value = _getProperty(target, property);

                validator.apply(validator, [value].concat(params));
            });
        } else {
            validator.apply(validator, arguments);
        }
    };
}

module.exports = {
    InRange: _create(_inRange),
    IsVersion: _create(_isVersion),
    IsMatch: _create(_isMatch),
    IsInstanceOf: _create(_isInstanceOf),
    IsFunction: _create(_isFunction),
    IsTypeOf: _create(_isTypeOf),
    IsTypeOfOrEmpty: _create(_isTypeOfOrEmpty),
    IsArrayOfInstances: _create(_isArrayOfInstances),
    IsArrayOfType: _create(_isArrayOfType),
    IsNull: _create(_isNull)
};

},{"lodash":"lodash"}],18:[function(require,module,exports){
"use strict";

var React = require("react");

var Component = require("../core/Component");

var UserTokenStore = require("../stores/UserTokenStore");

var SignIn = require("./SignIn.react");

var Application = Component.Create(UserTokenStore, {
    getState: function() {
        return {
            token: UserTokenStore.get("token")
        };
    },

    render: function() {
        return this.state.token ?
            (React.createElement("div", null, "amma some secret page")) :
            (React.createElement(SignIn, null));
    }
});

module.exports = Application;

},{"../core/Component":7,"../stores/UserTokenStore":16,"./SignIn.react":19,"react":"react"}],19:[function(require,module,exports){
"use strict";

var _ = require("lodash");
var React = require("react");

var Command = require("../core/Command");
var Symbols = require("../core/Symbols");
var Query = require("../core/Query");
var Component = require("../core/Component");

var UserExistsStore = require("../stores/UserExistsStore");
var ProcessingStore = require("../stores/ProcessingStore");

var signIn = Component.Create(UserExistsStore, ProcessingStore, {
    getState: function() {
        return {
            exists: UserExistsStore.get(_.get(this.state, 'username')),
            progress: ProcessingStore.get(Symbols.GetUserExistenceStatus)
        };
    },

    componentWillMount: function(argument) {
        this._setStateDebounced = _.debounce(this.setState, 500);
    },

    componentDidUpdate: function(props, state) {
        if (this.state.username && !UserExistsStore.has(this.state.username)) {
            Query(Symbols.GetUserExistenceStatus, this.state.username);
        }

        if (!_.isEqual(_.get(state, "username"), this.state.username) && !this.state.username) {
            this.setState({ exists: null });
        }
    },

    signIn: function() {
        var password = this.refs.password.getDOMNode().value;

        Command(Symbols.SignInUser, this.state.username, password);
    },

    singUp: function() {
        var password = this.refs.password.getDOMNode().value;

        Command(Symbols.CreateUser, this.state.username, password);
    },

    _onUsernameChange: function(ev) {
        this._setStateDebounced({ username: ev.target.value });
    },

    render: function() {
        return (React.createElement("div", null, 
            React.createElement("div", null, 
                "login: ", React.createElement("input", {id: "username", 
                    onChange: this._onUsernameChange, 
                    maxLength: "255", 
                    name: "username", 
                    type: "text"}), 
                React.createElement("div", null, !_.get(this.state, ["progress", "running"]) && _.get(this.state, "exists") && 'already exists! (only "misha" left)'), 
                React.createElement("div", null, _.get(this.state, ["progress", "running"]) && 'in progress...')
            ), 
            React.createElement("div", null, 
                "password: ", React.createElement("input", {id: "password", ref: "password", name: "password", type: "password"})
            ), 
            React.createElement("div", null, 
                React.createElement("button", {onClick: this.signIn}, "Sign In")
            ), 
            React.createElement("div", null, 
                React.createElement("button", {onClick: this.singUp}, "Sing Up")
            )
        ));
    }
});

module.exports = signIn;

},{"../core/Command":6,"../core/Component":7,"../core/Query":9,"../core/Symbols":12,"../stores/ProcessingStore":13,"../stores/UserExistsStore":15,"lodash":"lodash","react":"react"}],20:[function(require,module,exports){
"use strict";

var _ = require('lodash');
var Promise = require('promise/lib/es6-extensions');

// var qwest = require('qwest');
// qwest.setDefaultDataType('json');

var ApiWebClient = {
    CreateUser: function(username, password) {
        return new Promise(function (resolve, reject) {
            _.delay(function() {
                if (_.isEmpty(username) || _.isEmpty(password)) reject("empty name or password! (fake request)");
                else resolve({ data: { username: username, token: "AMMA_TOKEN" } });
            }, 1000);
        });

        // return qwest.post('http://localhost:3000/api/users/create', {
        //     username: username,
        //     password: password
        // });
    },
    SignInUser: function(username, password) {
        return new Promise(function (resolve, reject) {
            _.delay(function() {
                if (_.isEmpty(username) || _.isEmpty(password)) reject("empty name or password! (fake request)");
                else resolve({ data: { username: username, token: "AMMA_TOKEN" } });
            }, 1000);
        });

        // return qwest.post('http://localhost:3000/api/users/login', {
        //     username: username,
        //     password: password
        // });
    }
};

module.exports = ApiWebClient;

},{"lodash":"lodash","promise/lib/es6-extensions":4}],21:[function(require,module,exports){
"use strict";

var _ = require('lodash');
var Promise = require('promise/lib/es6-extensions');
// var qwest = require("qwest");

var ViewWebClient = {
    GetUserExistenceStatus: function(username) {
        return new Promise(function (resolve, reject) {
            _.delay(function() {
                if (_.isEmpty(username)) reject("nothing to check! (fake request)");
                else resolve({ data: { username: username, exists: username !== "misha" } });
            }, 1000);
        });
        // return qwest.get(
        //     _.template("http://localhost:3001/api/user/exists/${username}/")({username: username})
        // );
    }
};

module.exports = ViewWebClient;

},{"lodash":"lodash","promise/lib/es6-extensions":4}]},{},[1]);
