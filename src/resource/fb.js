/*
 This file 'fb' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2015 Lincong

 Contact:
 Email: lincong1987@gmail.com

 QQ: 159257119

 See Usage at http://www.jplatformx.com/firebird

 Create date: 2015-01-23 16:27
 */

// koala 编译器 兼容代码
var _d_e_f_i_n_e_ = "define(function(){})";

(function (global, undefined) {

	var log = function (e) {
		global.console && global.console.log && global.console.log("[FB_bootloader] Log: ", e);
	};

	if (global.fb) {
		return;
	}

	var fb = global.seajs = global.fb = {
		// The current version of Sea.js being used
		version: "2.2.3"
	};

	log("version: " + fb.version);

	var data = fb.data = {};


	/**
	 * util-lang.js - The minimal language enhancement
	 */

	function isType(type) {
		return function (obj) {
			return {}.toString.call(obj) == "[object " + type + "]"
		}
	}

	var isObject = isType("Object")
	var isString = isType("String")
	var isArray = Array.isArray || isType("Array")
	var isFunction = isType("Function")
	var isUndefined = isType("Undefined")

	var _cid = 0

	function cid() {
		return _cid++
	}

	/**
	 * util-events.js - The minimal events support
	 */

	var events = data.events = {}

// Bind event
	fb.on = function (name, callback) {
		var list = events[name] || (events[name] = [])
		list.push(callback)
		return fb
	}

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
	fb.off = function (name, callback) {
		// Remove *all* events
		if (!(name || callback)) {
			events = data.events = {}
			return fb
		}

		var list = events[name]
		if (list) {
			if (callback) {
				for (var i = list.length - 1; i >= 0; i--) {
					if (list[i] === callback) {
						list.splice(i, 1)
					}
				}
			}
			else {
				delete events[name]
			}
		}

		return fb
	}

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
	var emit = fb.emit = function (name, data) {
		var list = events[name], fn

		if (list) {
			// Copy callback lists to prevent modification
			list = list.slice()

			// Execute event callbacks
			while ((fn = list.shift())) {
				fn(data)
			}
		}

		return fb
	}


	/**
	 * util-path.js - The utilities for operating path such as id, uri
	 */

	var DIRNAME_RE = /[^?#]*\//

	var DOT_RE = /\/\.\//g
	var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//
	var DOUBLE_SLASH_RE = /([^:/])\/\//g

// Extract the directory portion of a path
// dirname("a/b/c.js?t=123#xx/zz") ==> "a/b/"
// ref: http://jsperf.com/regex-vs-split/2
	function dirname(path) {
		return path.match(DIRNAME_RE)[0]
	}

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
	function realpath(path) {
		// /a/b/./c/./d ==> /a/b/c/d
		path = path.replace(DOT_RE, "/")

		// a/b/c/../../d  ==>  a/b/../d  ==>  a/d
		while (path.match(DOUBLE_DOT_RE)) {
			path = path.replace(DOUBLE_DOT_RE, "/")
		}

		// a//b/c  ==>  a/b/c
		path = path.replace(DOUBLE_SLASH_RE, "$1/")

		return path
	}

// Normalize an id
// normalize("path/to/a") ==> "path/to/a.js"
// NOTICE: substring is faster than negative slice and RegExp
	function normalize(path) {
		var last = path.length - 1
		var lastC = path.charAt(last)

		// If the uri ends with `#`, just return it without '#'
		if (lastC === "#") {
			return path.substring(0, last)
		}

		return (path.substring(last - 2) === ".js" ||
			path.indexOf("?") > 0 ||
			path.substring(last - 3) === ".css" ||
			lastC === "/") ? path : path + ".js"
	}


	var PATHS_RE = /^([^/:]+)(\/.+)$/
	var VARS_RE = /{([^{]+)}/g

	function parseAlias(id) {
		var alias = data.alias
		return alias && isString(alias[id]) ? alias[id] : id
	}

	function parsePaths(id) {
		var paths = data.paths
		var m

		if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
			id = paths[m[1]] + m[2]
		}

		return id
	}

	function parseVars(id) {
		var vars = data.vars

		if (vars && id.indexOf("{") > -1) {
			id = id.replace(VARS_RE, function (m, key) {
				return isString(vars[key]) ? vars[key] : m
			})
		}

		return id
	}

	function parseMap(uri) {
		var map = data.map
		var ret = uri

		if (map) {
			for (var i = 0, len = map.length; i < len; i++) {
				var rule = map[i]

				ret = isFunction(rule) ?
					(rule(uri) || uri) :
					uri.replace(rule[0], rule[1])

				// Only apply the first matched rule
				if (ret !== uri) break
			}
		}

		return ret
	}


	var ABSOLUTE_RE = /^\/\/.|:\//
	var ROOT_DIR_RE = /^.*?\/\/.*?\//

	function addBase(id, refUri) {
		var ret
		var first = id.charAt(0)

		// Absolute
		if (ABSOLUTE_RE.test(id)) {
			ret = id
		}
		// Relative
		else if (first === ".") {
			ret = realpath((refUri ? dirname(refUri) : data.cwd) + id)
		}
		// Root
		else if (first === "/") {
			var m = data.cwd.match(ROOT_DIR_RE)
			ret = m ? m[0] + id.substring(1) : id
		}
		// Top-level
		else {
			ret = data.base + id
		}

		// Add default protocol when uri begins with "//"
		if (ret.indexOf("//") === 0) {
			ret = location.protocol + ret
		}

		return ret
	}

	function id2Uri(id, refUri) {
		if (!id) return ""

		id = parseAlias(id)
		id = parsePaths(id)
		id = parseVars(id)
		id = normalize(id)

		var uri = addBase(id, refUri)
		uri = parseMap(uri)

		return uri
	}


	var doc = document
	var cwd = dirname(doc.URL)
	var scripts = doc.scripts

// Recommend to add `fbnode` id for the `fb.js` script element
	var loaderScript = doc.getElementById("fbnode") ||
		scripts[scripts.length - 1]

// When `fb.js` is inline, set loaderDir to current working directory
	var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd)

	function getScriptAbsoluteSrc(node) {
		return node.hasAttribute ? // non-IE6/7
			node.src :
			// see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
			node.getAttribute("src", 4)
	}


// For Developers
	fb.resolve = id2Uri


	/**
	 * util-request.js - The utilities for requesting script and style files
	 * ref: tests/research/load-js-css/test.html
	 */

	var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement
	var baseElement = head.getElementsByTagName("base")[0]

	var IS_CSS_RE = /\.css(?:\?|$)/i
	var currentlyAddingScript
	var interactiveScript

// `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
// ref:
//  - https://bugs.webkit.org/show_activity.cgi?id=38995
//  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
//  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
	var isOldWebKit = +navigator.userAgent
		.replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536


	function request(url, callback, charset, crossorigin) {
		var isCSS = IS_CSS_RE.test(url)
		var node = doc.createElement(isCSS ? "link" : "script")

		if (charset) {
			node.charset = charset
		}

		// crossorigin default value is `false`.
		if (!isUndefined(crossorigin)) {
			node.setAttribute("crossorigin", crossorigin)
		}


		addOnload(node, callback, isCSS, url)

		if (isCSS) {
			node.rel = "stylesheet"
			node.href = url
		}
		else {
			node.async = true
			node.src = url
		}

		// For some cache cases in IE 6-8, the script executes IMMEDIATELY after
		// the end of the insert execution, so use `currentlyAddingScript` to
		// hold current node, for deriving url in `define` call
		currentlyAddingScript = node

		// ref: #185 & http://dev.jquery.com/ticket/2709
		baseElement ?
			head.insertBefore(node, baseElement) :
			head.appendChild(node)

		currentlyAddingScript = null
	}

	function addOnload(node, callback, isCSS, url) {
		var supportOnload = "onload" in node

		// for Old WebKit and Old Firefox
		if (isCSS && (isOldWebKit || !supportOnload)) {
			setTimeout(function () {
				pollCss(node, callback)
			}, 1) // Begin after node insertion
			return
		}

		if (supportOnload) {
			node.onload = onload
			node.onerror = function () {
				emit("error", {uri: url, node: node})
				onload()
			}
		}
		else {
			node.onreadystatechange = function () {
				if (/loaded|complete/.test(node.readyState)) {
					onload()
				}
			}
		}

		function onload() {
			// Ensure only run once and handle memory leak in IE
			node.onload = node.onerror = node.onreadystatechange = null

			// Remove the script to reduce memory leak
			if (!isCSS && !data.debug) {
				head.removeChild(node)
			}

			// Dereference the node
			node = null

			callback()
		}
	}

	function pollCss(node, callback) {
		var sheet = node.sheet
		var isLoaded

		// for WebKit < 536
		if (isOldWebKit) {
			if (sheet) {
				isLoaded = true
			}
		}
		// for Firefox < 9.0
		else if (sheet) {
			try {
				if (sheet.cssRules) {
					isLoaded = true
				}
			} catch (ex) {
				// The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
				// to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
				// in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
				if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
					isLoaded = true
				}
			}
		}

		setTimeout(function () {
			if (isLoaded) {
				// Place callback here to give time for style rendering
				callback()
			}
			else {
				pollCss(node, callback)
			}
		}, 20)
	}

	function getCurrentScript() {
		if (currentlyAddingScript) {
			return currentlyAddingScript
		}

		// For IE6-9 browsers, the script onload event may not fire right
		// after the script is evaluated. Kris Zyp found that it
		// could query the script nodes and the one that is in "interactive"
		// mode indicates the current script
		// ref: http://goo.gl/JHfFW
		if (interactiveScript && interactiveScript.readyState === "interactive") {
			return interactiveScript
		}

		var scripts = head.getElementsByTagName("script")

		for (var i = scripts.length - 1; i >= 0; i--) {
			var script = scripts[i]
			if (script.readyState === "interactive") {
				interactiveScript = script
				return interactiveScript
			}
		}
	}


// For Developers
	fb.request = request

	/**
	 * util-deps.js - The parser for dependencies
	 * ref: tests/research/parse-dependencies/test.html
	 */

	var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
	var SLASH_RE = /\\\\/g

	function parseDependencies(code) {
		var ret = []

		code.replace(SLASH_RE, "")
			.replace(REQUIRE_RE, function (m, m1, m2) {
				if (m2) {
					ret.push(m2)
				}
			})

		return ret
	}


	/**
	 * module.js - The core of module loader
	 */

	var cachedMods = fb.cache = {}
	var anonymousMeta

	var fetchingList = {}
	var fetchedList = {}
	var callbackList = {}

	var STATUS = Module.STATUS = {
		// 1 - The `module.uri` is being fetched
		FETCHING: 1,
		// 2 - The meta data has been saved to cachedMods
		SAVED: 2,
		// 3 - The `module.dependencies` are being loaded
		LOADING: 3,
		// 4 - The module are ready to execute
		LOADED: 4,
		// 5 - The module is being executed
		EXECUTING: 5,
		// 6 - The `module.exports` is available
		EXECUTED: 6
	}


	function Module(uri, deps) {
		this.uri = uri
		this.dependencies = deps || []
		this.exports = null
		this.status = 0

		// Who depends on me
		this._waitings = {}

		// The number of unloaded dependencies
		this._remain = 0
	}

// Resolve module.dependencies
	Module.prototype.resolve = function () {
		var mod = this
		var ids = mod.dependencies
		var uris = []

		for (var i = 0, len = ids.length; i < len; i++) {
			uris[i] = Module.resolve(ids[i], mod.uri)
		}
		return uris
	}

// Load module.dependencies and fire onload when all done
	Module.prototype.load = function () {
		var mod = this

		// If the module is being loaded, just wait it onload call
		if (mod.status >= STATUS.LOADING) {
			return
		}

		mod.status = STATUS.LOADING

		// Emit `load` event for plugins such as combo plugin
		var uris = mod.resolve()
		emit("load", uris)

		var len = mod._remain = uris.length
		var m

		// Initialize modules and register waitings
		for (var i = 0; i < len; i++) {
			m = Module.get(uris[i])

			if (m.status < STATUS.LOADED) {
				// Maybe duplicate: When module has dupliate dependency, it should be it's count, not 1
				m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1
			}
			else {
				mod._remain--
			}
		}

		if (mod._remain === 0) {
			mod.onload()
			return
		}

		// Begin parallel loading
		var requestCache = {}

		for (i = 0; i < len; i++) {
			m = cachedMods[uris[i]]

			if (m.status < STATUS.FETCHING) {
				m.fetch(requestCache)
			}
			else if (m.status === STATUS.SAVED) {
				m.load()
			}
		}

		// Send all requests at last to avoid cache bug in IE6-9. Issues#808
		for (var requestUri in requestCache) {
			if (requestCache.hasOwnProperty(requestUri)) {
				requestCache[requestUri]()
			}
		}
	}

// Call this method when module is loaded
	Module.prototype.onload = function () {
		var mod = this
		mod.status = STATUS.LOADED

		if (mod.callback) {
			mod.callback()
		}

		// Notify waiting modules to fire onload
		var waitings = mod._waitings
		var uri, m

		for (uri in waitings) {
			if (waitings.hasOwnProperty(uri)) {
				m = cachedMods[uri]
				m._remain -= waitings[uri]
				if (m._remain === 0) {
					m.onload()
				}
			}
		}

		// Reduce memory taken
		delete mod._waitings
		delete mod._remain
	}

// Fetch a module
	Module.prototype.fetch = function (requestCache) {
		var mod = this
		var uri = mod.uri

		mod.status = STATUS.FETCHING

		// Emit `fetch` event for plugins such as combo plugin
		var emitData = {uri: uri}
		emit("fetch", emitData)
		var requestUri = emitData.requestUri || uri

		// Empty uri or a non-CMD module
		if (!requestUri || fetchedList[requestUri]) {
			mod.load()
			return
		}

		if (fetchingList[requestUri]) {
			callbackList[requestUri].push(mod)
			return
		}

		fetchingList[requestUri] = true
		callbackList[requestUri] = [mod]

		// Emit `request` event for plugins such as text plugin
		emit("request", emitData = {
			uri: uri,
			requestUri: requestUri,
			onRequest: onRequest,
			charset: isFunction(data.charset) ? data.charset(requestUri) : data.charset,
			crossorigin: isFunction(data.crossorigin) ? data.crossorigin(requestUri) : data.crossorigin
		})

		if (!emitData.requested) {
			requestCache ?
				requestCache[emitData.requestUri] = sendRequest :
				sendRequest()
		}

		function sendRequest() {
			fb.request(emitData.requestUri, emitData.onRequest, emitData.charset, emitData.crossorigin)
		}

		function onRequest() {
			delete fetchingList[requestUri]
			fetchedList[requestUri] = true

			// Save meta data of anonymous module
			if (anonymousMeta) {
				Module.save(uri, anonymousMeta)
				anonymousMeta = null
			}

			// Call callbacks
			var m, mods = callbackList[requestUri]
			delete callbackList[requestUri]
			while ((m = mods.shift())) m.load()
		}
	}

// Execute a module
	Module.prototype.exec = function () {
		var mod = this

		// When module is executed, DO NOT execute it again. When module
		// is being executed, just return `module.exports` too, for avoiding
		// circularly calling
		if (mod.status >= STATUS.EXECUTING) {
			return mod.exports
		}

		mod.status = STATUS.EXECUTING

		// Create require
		var uri = mod.uri

		function require(id) {
			return Module.get(require.resolve(id)).exec()
		}

		require.resolve = function (id) {
			return Module.resolve(id, uri)
		}

		require.async = function (ids, callback) {
			Module.use(ids, callback, uri + "_async_" + cid())
			return require
		}

		// Exec factory
		var factory = mod.factory

		var exports = isFunction(factory) ?
			factory(require, mod.exports = {}, mod) :
			factory

		if (exports === undefined) {
			exports = mod.exports
		}

		// Reduce memory leak
		delete mod.factory

		mod.exports = exports
		mod.status = STATUS.EXECUTED

		// Emit `exec` event
		emit("exec", mod)

		return exports
	}

// Resolve id to uri
	Module.resolve = function (id, refUri) {
		// Emit `resolve` event for plugins such as text plugin
		var emitData = {id: id, refUri: refUri}
		emit("resolve", emitData)

		return emitData.uri || fb.resolve(emitData.id, refUri)
	}

// Define a module
	Module.define = function (id, deps, factory) {
		var argsLen = arguments.length

		// define(factory)
		if (argsLen === 1) {
			factory = id
			id = undefined
		}
		else if (argsLen === 2) {
			factory = deps

			// define(deps, factory)
			if (isArray(id)) {
				deps = id
				id = undefined
			}
			// define(id, factory)
			else {
				deps = undefined
			}
		}

		// Parse dependencies according to the module factory code
		if (!isArray(deps) && isFunction(factory)) {
			deps = parseDependencies(factory.toString())
		}

		var meta = {
			id: id,
			uri: Module.resolve(id),
			deps: deps,
			factory: factory
		}

		// Try to derive uri in IE6-9 for anonymous modules
		if (!meta.uri && doc.attachEvent) {
			var script = getCurrentScript()

			if (script) {
				meta.uri = script.src
			}

			// NOTE: If the id-deriving methods above is failed, then falls back
			// to use onload event to get the uri
		}

		// Emit `define` event, used in nocache plugin, fb node version etc
		emit("define", meta)

		meta.uri ? Module.save(meta.uri, meta) :
			// Save information for "saving" work in the script onload event
			anonymousMeta = meta
	}

// Save meta data to cachedMods
	Module.save = function (uri, meta) {
		var mod = Module.get(uri)

		// Do NOT override already saved modules
		if (mod.status < STATUS.SAVED) {
			mod.id = meta.id || uri
			mod.dependencies = meta.deps || []
			mod.factory = meta.factory
			mod.status = STATUS.SAVED
		}
	}

// Get an existed module or create a new one
	Module.get = function (uri, deps) {
		return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
	}

// Use function is equal to load a anonymous module
	Module.use = function (ids, callback, uri) {
		var mod = Module.get(uri, isArray(ids) ? ids : [ids])

		mod.callback = function () {
			var exports = []
			var uris = mod.resolve()

			for (var i = 0, len = uris.length; i < len; i++) {
				exports[i] = cachedMods[uris[i]].exec()
			}

			if (callback) {
				try {
					callback.apply(global, exports)
				} catch (e) {
					if (window.console) {
						console.error && console.error("Firebird Module Exec Error, Stack:\n", e.stack);
					}
				}

			}

			delete mod.callback
		}

		mod.load()
	}

// Load preload modules before all other modules
	Module.preload = function (callback) {

		var preloadMods = data.preload
		var len = preloadMods.length

		if (len) {

			log("preloadMods: " + preloadMods)

			Module.use(preloadMods, function () {
				// Remove the loaded preload modules
				preloadMods.splice(0, len)

				// Allow preload modules to add new preload modules
				Module.preload(callback)
			}, data.cwd + "_preload_" + cid())
		}
		else {
			callback()
		}
	}


// Public API

	fb.use = function (ids, callback) {
		Module.preload(function () {
			Module.use(ids, callback, data.cwd + "_use_" + cid())
		})
		return fb
	}

	Module.define.cmd = {}
	global.define = Module.define


// For Developers

	fb.Module = Module
	data.fetchedList = fetchedList
	data.cid = cid

	fb.require = function (id) {
		var mod = Module.get(Module.resolve(id))
		if (mod.status < STATUS.EXECUTING) {
			mod.onload()
			mod.exec()
		}
		return mod.exports
	}


	/**
	 * config.js - The configuration for the loader
	 */

	var BASE_RE = /^(.+?\/)(\?\?)?(fb\/)+/

	// fb 兼容配置
	loaderDir = loaderDir.replace(/\/resource/, "");

// The root path to use for id2uri parsing
// If loaderUri is `http://test.com/libs/fb/[??][fb/1.2.3/]fb.js`, the
// baseUri should be `http://test.com/libs/`
	data.base = (loaderDir.match(BASE_RE) || ["", loaderDir])[1]

// The loader directory
	data.dir = loaderDir

// The current working directory
	data.cwd = cwd

// The charset for requesting files
	data.charset = "utf-8"

// The CORS options, Do't set CORS on default.
//data.crossorigin = undefined

// Modules that are needed to load before all other modules
	data.preload = (function () {
		var plugins = []

		// Convert `fb-xxx` to `fb-xxx=1`
		// NOTE: use `fb-xxx=1` flag in uri or cookie to preload `fb-xxx`
		var str = location.search.replace(/(fb-\w+)(&|$)/g, "$1=1$2")

		// Add cookie string
		str += " " + doc.cookie

		// Exclude fb-xxx=0
		str.replace(/(fb-\w+)=1/g, function (m, name) {
			plugins.push(name)
		})

		return plugins
	})()

// data.alias - An object containing shorthands of module id
// data.paths - An object containing path shorthands in module id
// data.vars - The {xxx} variables in module id
// data.map - An array containing rules to map module uri
// data.debug - Debug mode. The default value is false

	fb.config = function (configData) {

		for (var key in configData) {
			var curr = configData[key]
			var prev = data[key]

			// Merge object config such as alias, vars
			if (prev && isObject(prev)) {
				for (var k in curr) {
					prev[k] = curr[k]
				}
			}
			else {
				// Concat array config such as map, preload
				if (isArray(prev)) {
					curr = prev.concat(curr)
				}
				// Make sure that `data.base` is an absolute path
				else if (key === "base") {
					// Make sure end with "/"
					if (curr.slice(-1) !== "/") {
						curr += "/"
					}
					curr = addBase(curr)
				}

				// Set config
				data[key] = curr
			}
		}

		emit("config", configData)

		window.fb = fb;

		return fb
	}

})(this);


// contextPath 配置
(function (fb) {
	fb.contextPath = "/";
	fb.setContextPath = function (path) {
		fb.contextPath = path;
	};
	fb.getContextPath = function () {
		return fb.contextPath;
	};
})(window.fb);

/**
 * Add shim config for configuring the dependencies and exports for
 * older, traditional "browser globals" scripts that do not use define ()
 * to declare the dependencies and set a module value.
 */
(function (fb, global) {

	// fb.config({
	// alias: {
	//   "jquery": {
	//     src: "lib/jquery.js",
	//     exports: "jQuery" or function
	//   },
	//   "jquery.easing": {
	//     src: "lib/jquery.easing.js",
	//     deps: ["jquery"]
	//   }
	// })

	fb.on("config", onConfig);
	onConfig(fb.config.data);

	function onConfig(data) {
		if (!data)
			return
		var alias = data.alias;

		for (var id in alias) {
			(function (item) {
				if (typeof item === "string") {
					return;
				}

				// Set dependencies
				item.src && item.deps && define(item.src, item.deps);

				// Define the proxy cmd module
				define(id, item.src ? [fb.resolve(item.src)] : item.deps || [],
					function () {
						var exports = item.exports;
						return typeof exports === "function" ? exports() :
							typeof exports === "string" ? global[exports] :
								exports
					})
			})(alias[id]);
		}
	}

	// define(fb.dir + "plugin-shim", [], {})

})(fb, typeof global === "undefined" ? this : global);

/**
 * The Sea.js plugin for loading text resources such as template, json etc
 */

(function () {
	var global = window;
	var plugins = {};
	var uriCache = {};

	function register(o) {
		plugins[o.name] = o;
	}

// normal text
	register({
		name: "text",

		ext: [".tpl", ".html", ".jsp", ".php", ".text", ".txt", ".hbs"],

		exec: function (uri, content) {
			globalEval('define ("' + uri + '#", [], "' + jsEscape(content) + '")')
		}
	});

// json
	register({
		name: "json",
		ext: [".json"],
		exec: function (uri, content) {
			globalEval('define ("' + uri + '#", [], ' + content + ')')
		}
	});

// for handlebars template
// 	register({
// 		name: "handlebars",
//
// 		ext: [".handlebars", ".hbs"],
//
// 		exec: function (uri, content) {
// 			var code = [
// 				'define ("' + uri + '#", ["handlebars"], function(require, exports, module) {',
// 				'  var source = "' + jsEscape(content) + '"',
// 				'  var Handlebars = require("handlebars")',
// 				'  module.exports = function(data, options) {',
// 				'    options || (options = {})',
// 				'    options.helpers || (options.helpers = {})',
// 				'    for (var key in Handlebars.helpers) {',
// 				'      options.helpers[key] = options.helpers[key] || Handlebars.helpers[key]',
// 				'    }',
// 				'    return Handlebars.compile(source)(data, options)',
// 				'  }',
// 				'})'
// 			].join('\n');
//
// 			globalEval(code)
// 		}
// 	});

// for aui.tmpl template
	register({
		name: "render",

		ext: [".render"],

		exec: function (uri, content) {
			var code = [
				'define ("' + uri + '#", ["template"], function(require, exports, module) {',
				'  var source = "' + jsEscape(content) + '"',
				'  var template = require("template");',
				'  return template(source);',
				'})'
			].join('\n');

			globalEval(code)
		}
	});

// for aui.tmpl 3.0 template
	register({
		name: "tmpl",
		ext: [".tmpl"],
		exec: function (uri, content) {
			var code = [
				'define ("' + uri + '#", ["tmpl"], function(require, exports, module) {',
				'  var source = "' + jsEscape(content) + '"',
				'  var tmpl = require("tmpl");',
				'  var fn = function(data, options){',
				'    options || (options = {})',
				'    return tmpl.compile(source, options)(data);',
				'  };',
				'  fn.source = source;',
				'  fn.filename = "' + uri + '#";',
				'  fn.compile = tmpl.compile(source, {filename: "' + uri + '#"});',
				'  module.exports = fn;',
				'})'
			].join('\n');

			globalEval(code)
		}
	});
//render

// for less
	register({
		name: "less",
		ext: [".less"],
		exec: function (uri, content) {
//		var code = [
//				'define ("' + uri + '#", ["jquery"], function(require, exports, module) {',
//				'  var source = "' + jsEscape(content) + '"',
//			'  var less = require("_pluginPath_/less/less");',
//			'  module.exports = function(data, options){',
//			'    options || (options = {})',
//			'    return tmpl.compile(source, options)(data);',
//			'  }',
//			'})'
//		].join('\n')
//
//		globalEval(code)
			alert("no Less compiler");
		}
	});
//render

// for less
	register({
		name: "swf",
		ext: [".swf"],
		exec: function (uri, content) {
//		var code = [
//				'define ("' + uri + '#", ["jquery"], function(require, exports, module) {',
//				'  var source = "' + jsEscape(content) + '"',
//			'  var less = require("_pluginPath_/less/less");',
//			'  module.exports = function(data, options){',
//			'    options || (options = {})',
//			'    return tmpl.compile(source, options)(data);',
//			'  }',
//			'})'
//		].join('\n')
//
//		globalEval(code)
//		alert("no Less compiler");
		}
	});
//render

// use app
	fb.app = function (classname, callback) {
		fb.use("_appPath_/" + classname.replace(/\./g, "/"), callback);
	};

	fb.on("resolve", function (data) {
		var id = data.id;
		if (!id) return "";

		var pluginName;
		var m;

		// text!path/to/some.xx
		if ((m = id.match(/^(\w+)!(.+)$/)) && isPlugin(m[1])) {
			pluginName = m[1];
			id = m[2];
		}
		// http://path/to/a.tpl
		// http://path/to/c.json?v2
		else if ((m = id.match(/[^?]+(\.\w+)(?:\?|#|$)/))) {
			pluginName = getPluginName(m[1]);
		}

		if (pluginName && id.indexOf("#") === -1) {
			id += "#";
		}

		var uri = fb.resolve(id, data.refUri);

		if (pluginName) {
			uriCache[uri] = pluginName;
		}

		data.uri = uri;
	});

	fb.on("request", function (data) {
		var name = uriCache[data.uri];

		if (name) {
			xhr(data.requestUri, function (content) {
				plugins[name].exec(data.uri, content);
				data.onRequest();
			});

			data.requested = true;
		}
	});

// Helpers

	function isPlugin(name) {
		return name && plugins.hasOwnProperty(name);
	}

	function getPluginName(ext) {
		for (var k in plugins) {
			if (isPlugin(k)) {
				var exts = "," + plugins[k].ext.join(",") + ",";
				if (exts.indexOf("," + ext + ",") > -1) {
					return k;
				}
			}
		}
	}

	function xhr(url, callback) {
		var r = global.ActiveXObject ?
			new global.ActiveXObject("Microsoft.XMLHTTP") :
			new global.XMLHttpRequest();

		r.open("GET", url, true);

		r.onreadystatechange = function () {
			if (r.readyState === 4) {
				// Support local file
				if (r.status > 399 && r.status < 600) {
					throw new Error("[FirebirdLoader] 无法加载: " + url + ", 状态 = " + r.status);
				} else {
					callback(r.responseText);
				}
			}
		};

		return r.send(null);
	}

	function globalEval(content) {
		if (content && /\S/.test(content)) {
			(global.execScript || function (content) {
				(global.eval || eval).call(global, content)
			})(content);
		}
	}

	function jsEscape(content) {
		return content.replace(/(["\\])/g, "\\$1")
			.replace(/[\f]/g, "\\f")
			.replace(/[\b]/g, "\\b")
			.replace(/[\n]/g, "\\n")
			.replace(/[\t]/g, "\\t")
			.replace(/[\r]/g, "\\r")
			.replace(/[\u2028]/g, "\\u2028")
			.replace(/[\u2029]/g, "\\u2029")
	}

	function pure(uri) {
		// Remove timestamp etc
		return uri.replace(/\?.*$/, "");
	}
})(this);

/*!
 * 查找可追溯的最远的祖先
 */
(function (thisWindow) {

	// p>t>w _top is p1
	// t>p>t>w 忽略
	// t>t>p>p>w _top is p1
	// t>w _top is w
	// w _top is w


	// 假定win处于多层结构(3+), 类似 t>p>p(...+)>w
	// 		1 判断 parent 是否能访问
	// 		2 如果 parent 能访问但parent非同域
	// 		3
	// 假定win处于多层结构,且递归parent后,全部同域
	//		1
	// 假定win处于二层结构
	// 		1 parent 同域则 _top = parent
	// 		2 parent 非同域 _top = win

	var log = function (e) {
		thisWindow.console && thisWindow.console.log && thisWindow.console.log("[FB_ENV_CHECK] Log: ", e);
	};

	var getLocation = function (win) {
		var _location = "";
		try {
			_location = win.location.protocol + win.location.host;
		} catch (e) {
			log("getLocation Error: \n" + e.name);
		}
		return _location;
	};

	/**
	 * 比较地址
	 * @param win1
	 * @param win2
	 * @returns {boolean}
	 */
	var compareLocation = function (win1, win2) {
		var l1 = getLocation(win1), l2 = getLocation(win2);
		log("compareLocation\n" + l1 + "\n" + l2);
		return l1 === l2;
	};

	var parentIndex = 0;

	var getParent = function (_win) {
		parentIndex++;
		var _p = null;
		try {
			// if (_win.parent && _win.parent.fb && _win.parent.document.getElementsByTagName("html")) {
			if (_win.parent && _win.parent.fb) {
				_p = _win.parent;
				log("getParent info: this window's parent index [" + parentIndex + "] have fb env!");
			} else {
				log("getParent warn: this window's parent index [" + parentIndex + "] has no fb env!");
			}
		} catch (e) {
			log("getParent error: this window's parent index [" + parentIndex + "] cannot access!");
		}
		return _p;
	};

	var findSuper = function (_win) {
		var _t = _win, _parent = getParent(_win);
		if (_parent == top) {
			return _parent;
		}
		// 1 判断 parent 是否能访问
		if (_parent) {
			//2 如果 parent 能访问但parent非同域
			if (compareLocation(_win, _parent)) {
				_t = findSuper(_parent);
			} else {
				return _t;
			}
			// } else if (_parent === top) {
			// 	_t = _parent;
		} else {
			return _t;
		}
		return _t;
	};

	var getTop = function (_win) {
		// 假定win处于单层结构
		// 		1 win 即 top 则 _top = win
		if (_win === top && compareLocation(_win, top)) {
			log("win处于单层结构\n1 win 即 top 则 _top = win");
			return _win;
		} else {
			log("try findSuper");
			return findSuper(_win);
		}
	};

	// 默认情况
	thisWindow._top = thisWindow;
	// log("默认情况 thisWindow._top = thisWindow");

	try {
		log("try getTop>>>");
		thisWindow._top = getTop(thisWindow);
	} catch (e) {
		log(e);
	}

	// if (!(thisWindow._top && thisWindow._top.fb && thisWindow._top.fb.require)) {
	// 	var src = fb.data.base + "/resource/fb.min.js";
	//
	// 	if (thisWindow._top.jQuery || thisWindow._top.$) {
	// 		thisWindow._top.jQuery.getScript(src, function () {
	// 			//injector
	// 		});
	// 	} else {
	// 		var script = document.createElement('script');
	// 		script.onload = function () {
	// 			alert('callBack');
	// 		};
	// 		script.src = src;
	// 		top.document.getElementsByTagName('head')[0].appendChild(script);
	// 	}
	//
	// 	//function isImplementedOnload(script) {
	// 	//	script = script || document.createElement('script');
	// 	//	if ('onload' in script) return true;
	// 	//	script.setAttribute('onload', '');
	// 	//	return typeof script.onload == 'function';//fftrueiefalse.
	// 	//}
	// }


	// var canAccess = false;

	// 1.IE 下协议域名一致便能访问
	// top
	// 		parent
	//				me

	// if(!canAccess){}


	// 可访问标识
	// var accessable = false;
	//
	// win._top = window;
	//
	// // 20160627 更新, 检测协议\域名\端口匹配
	//
	// var getLocation = function (win) {
	// 	var loca = "";
	// 	try {
	// 		loca = win.location.protocol + win.location.host;
	// 	} catch (e) {
	// 	}
	// 	return loca;
	// };
	// var getSuper = function (win) {
	// 	if (win == null) {
	// 		return;
	// 	}
	// 	var target = win;
	// 	try {
	// 		if (win.parent.Array.prototype && getLocation(top) == getLocation(win.parent)) {
	// 			// 如果能访问父窗口及父窗口的
	// 			target = getSuper(win.parent);
	// 		} else {
	//
	// 		}
	// 	} catch (e) {
	// 		win.console && win.console.log && win.console.log("[FB_ENV_CHECK] getSuper Error!", e);
	// 	}
	//
	// 	return target;
	// };
	//
	// if (getLocation(top) != getLocation(win)) {
	// 	return win;
	// }
	// if (top === win && getLocation(top) == getLocation(win)) {
	// 	return win;
	// }


	//win._parent = window;

	// 需要处理的情况
	//
	// 1、如果存在可访问的top
	//		那_top、_parent 皆为 top
	// 2、如果top不可访问
	// 		2.1、如果当前win有同域的parent
	//			那_top、_parent 皆为 getSuper(win)
	// 		2.2、如果当前win没有同域的parent
	//			那_top、_parent 皆为 win

	// try {
	// 	// top
	// 	// 可访问
	// 	if (top.Array.prototype && (win.location.protocol + win.location.hostname + win.location.port) != toplocation) {
	// 		//win._top = win.top;
	//
	// 		// 检测FB环境,在可以访问TOP的情况(一个SERVER下部署两个项目)下,如果祖先不是FB项目,则配置FB DATA缓存策略(注射FB环境),注:此方案存在侵入性
	// 		//if (!(top && top.fb && top.fb.require)) {
	// 		//	var src = fb.data.base + "/resource/fb.min.js";
	// 		//
	// 		//	if (top.jQuery || top.$) {
	// 		//		top.jQuery.getScript(src, function () {
	// 		//			//injector
	// 		//		});
	// 		//	} else {
	// 		//
	// 		//	}
	// 		//
	// 		//	var script = document.createElement('script');
	// 		//	script.onload = function () {
	// 		//		alert('callBack');
	// 		//	};
	// 		//	script.src = src;
	// 		//	top.document.getElementsByTagName('head')[0].appendChild(script);
	// 		//
	// 		//	//function isImplementedOnload(script) {
	// 		//	//	script = script || document.createElement('script');
	// 		//	//	if ('onload' in script) return true;
	// 		//	//	script.setAttribute('onload', '');
	// 		//	//	return typeof script.onload == 'function';//fftrueiefalse.
	// 		//	//}
	// 		//
	// 		//}
	//
	// 		// accessable = true;
	// 	} else {
	// 		// top
	// 		// 不可访问
	// 		//win._top = getSuper(win);
	// 	}
	// } catch (e) {
	// 	win.console && win.console.log && win.console.log("findAncestor error!", e);
	// }

	// win._top = accessable === true ? win.top : getSuper(win);


})(window);

/*!
 *  Copyright (c) 2014 Lincong All rights reserved.
 *  This software is the confidential and proprietary information of Lincong.
 *  You shall not disclose such Confidential
 *  Information and shall use it only in accordance with the terms of the license
 *  agreement you entered into with Lincong.
 *   Mail: Lincong <lincong1987@gmail.com>
 *     QQ: 159257119
 *  Phone: 15925711961
 *  This File Created On 2013-10-21 17:51:14.
 *  Document   : config
 *  Encoding   : UTF-8
 *  $Revision: 74 $
 *  $Id: config.js 74 2014-05-30 01:57:54Z lc $
 */
!(function () {

	// 开发模式
	fb.devMode = false;
	// 资源时间戳
	fb._timeStamp = new Date().getTime();
	// 发布版本
	fb._projectVersion = "app_fb_20160629";

	fb.dev = function (status) {
		status = typeof status === "undefined" ? true : status;
		fb.devMode = status;
		fb.data.map = status === true ?
			[
				//[ /^(.*\.(?:css|js|html))(.*)$/i, '$1?' + fb._timeStamp ]
			] :
			[
				[/^resource\/(.*)/i, 'build/$1'],
				[/^(.*)\.css$/i, '$1.min.css?' + fb._projectVersion],
				[/^(.*)\.js$/i, '$1.min.js?' + fb._projectVersion],
				[/^(.*)\.html$/i, '$1.html?' + fb._projectVersion]
			];
	};

	var search = location.search.replace(/^\?/, "").split("&"),
		parameter = {};
	try {
		search = _top.location.search.replace(/^\?/, "").split("&");
	} catch (e) {
	}
	for (var i = 0; i < search.length; i++) {
		var param = search[i].split("=");
		if (param[0]) {
			parameter[param[0]] = null;
		}
		if (param[1]) {
			param[1] = param[1] == "true" ? true : param[1];
			param[1] = param[1] == "false" ? false : param[1];
			parameter[param[0]] = param[1];
		}
	}

	if (parameter.devMode) {
		// fb.devMode = parameter.devMode;
		fb.dev(parameter.devMode);
	}
	if (parameter.devTimeStamp) {
		fb._timeStamp = parameter.devTimeStamp;
	}
	if (parameter.projectVersion) {
		fb._projectVersion = parameter.projectVersion;
	}
	if (parameter.contextPath) {
		fb.setContextPath(parameter.contextPath);
	}

	var lazySettingStack = [], intval, lazySetting = function (key, value) {

		if (typeof(firebird) === "undefined") {
			intval = window.setInterval(function () {
				lazySettingStack.push({
					key: key,
					value: value
				});
			}, 16);
		} else {
			window.clearInterval(intval);
			for (var i = 0; i < lazySettingStack.length; i++) {
				firebird.data.set(lazySettingStack[i]["key"], lazySettingStack[i]["value"]);
			}
		}

	};

	fb.cookie = fb.cookie || {};
	fb.cookie._isValidKey = function (key) {
		return (new RegExp("^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24")).test(key);
	};
	fb.cookie.setRaw = function (key, value, options) {
		if (!fb.cookie._isValidKey(key)) {
			return;
		}

		options = options || {};
		// 计算cookie过期时间
		var expires = options.expires;
		if ('number' === typeof options.expires) {
			expires = new Date();
			expires.setTime(expires.getTime() + options.expires);
		}

		document.cookie =
			key + "=" + value
			+ (options.path ? "; path=" + options.path : "")
			+ (expires ? "; expires=" + expires.toGMTString() : "")
			+ (options.domain ? "; domain=" + options.domain : "")
			+ (options.secure ? "; secure" : '');
	};
	fb.cookie.set = function (key, value, options) {
		fb.cookie.setRaw(key, encodeURIComponent(value), options);
	};
	fb.cookie.getRaw = function (key) {
		if (fb.cookie._isValidKey(key)) {
			var reg = new RegExp("(^| )" + key + "=([^;]*)(;|\x24)"),
				result = reg.exec(document.cookie);
			if (result) {
				return result[2] || null;
			}
		}
		return null;
	};
	fb.cookie.get = function (key) {
		var value = fb.cookie.getRaw(key);
		if ('string' === typeof value) {
			value = decodeURIComponent(value);
			return value;
		}
		return null;
	};
	fb.cookie.remove = function (key, options) {
		options = options || {};
		options.expires = new Date(0);
		fb.cookie.setRaw(key, '', options);
	};

	fb.setLocale = function (locale, callback) {
		var nowlocale = fb.cookie.get("locale") || "zh-cn";
		if (nowlocale !== locale) {
			fb.cookie.set("_jpx.locale", locale);
			callback && callback(locale);
		}
	};

	fb.getLocale = function () {
		if (!fb.cookie.get("_jpx.locale")) {
			fb.cookie.set("_jpx.locale", "zh-cn");
		}
		return fb.cookie.get("_jpx.locale");
	};

	if (fb.devMode === true) {
		if (window.console && window.console.log) {
			window.console.log("进入开发模式，当前的开发配置：", parameter);
		}
	}

	// alert(Function.prototype.bind ? '' : 'es5-safe')

	var preload = [];

	Function.prototype.bind ? '' : preload.push('es5-safe')
	this.JSON ? '' : preload.push('json2')

	// preload.push("jquery");
	// preload.push("firebird");


	fb.config({
		vars: {
			"locale": fb.getLocale()
		},
		base: process.cwd(),
		paths: {

			// 以下为
			_fbBoot_: "src/resource/fb-boot",
			_fbCore_: "src/resource/fb-core",
			_fbLib_: "src/resource/fb-lib",

			_fbChart_: "src/resource/fb-chart",
			_fbEditor_: "src/resource/fb-editor",
			_fbForm_: "src/resource/fb-form",
			_fbOffice_: "src/resource/fb-office",
			_fbGrid_: "src/resource/fb-grid",
			_fbSelecter_: "src/resource/fb-selecter",
			_fbUploader_: "src/resource/fb-uploader",
			_fbClassic_: "src/resource/fb-classic",
			_fbDesktop_: "src/resource/fb-desktop",
			_fbWeb_: "src/resource/fb-web",
			_fbDemo_: "src/resource/fb-demo",
			_fbGis_: "src/resource/fb-gis",
			_fbVue_: "src/resource/fb-vue",
			_fbYox_: "src/resource/fb-yox",
			_fbFB_: "node_modules/fb-core",
			_fbScreen_: "src/resource/fb-screen",

			_fbPrint_: "src/resource/fb-print",
			_fbPlayer_: "src/resource/fb-player",
			_fbCode_: "src/resource/fb-code",

			_appPath_: "src/resource/app",
			_resourcePath_: "src/resource",

			_fbApp_: "src/resource/app"
		},
		plugins: ['text'],
		debug: fb.devMode === true ? true : false,
		charset: 'utf-8',
		map: fb.devMode === true ?
			[
				//[ /^(.*\.(?:css|js|html))(.*)$/i, '$1?' + fb._timeStamp ]
			] :
			[
				[/^resource\/(.*)/i, 'build/$1'],
				[/^(.*)\.css$/i, '$1.min.css?' + fb._projectVersion],
				[/^(.*)\.js$/i, '$1.min.js?' + fb._projectVersion],
				[/^(.*)\.html$/i, '$1.html?' + fb._projectVersion],
				[/^(.*)\.tmpl$/i, '$1.tmpl?' + fb._projectVersion],
				[/^(.*)\.tpl$/i, '$1.tpl?' + fb._projectVersion],
				[/^(.*)\.jsp$/i, '$1.jsp']
			],
		preload: preload,
		alias: {

			"FbChecker": "_fbLib_/js/modernizr/modernizr.js",

			'es5-safe': '_fbLib_/js/es5/es5-safe.js',
			'json2': '_fbLib_/js/json2/json2.js',
			"lodash" : "_fbLib_/js/lodash/lodash.js",
			"jquery": "_fbLib_/js/jquery/jquery.js",
			"jquery.mobile": "_fbLib_/js/jquery/jquery-2.1.4.js",
			"Vue": "_fbVue_/js/vue.js",
			"Yox": "_fbYox_/js/yox.js",
			"fb-core": "_fbFB_/dist/fb-core.js",
			"San": "_fbLib_/js/san/san.js",
			"dom2image": "_fbUploader_/dom2image/dom2image.js",
			"Promise": "_fbLib_/js/es6/Promise.js",

			"firebird": "_fbLib_/js/firebird/firebird-1.0.3.js",
			"firebird.mobile": "_fbLib_/js/firebird/firebird.mobile-1.0.4.js",

			"avalon": "_fbLib_/js/avalon/avalon.js",
			"avalon2": "_fbLib_/js/avalon/avalon2.js",
			"mvvm": "_fbLib_/js/mvvm/avalon.js",

			"tmpl": "_fbCore_/js/aui/template.js",
			"tmpl-native": "_fbCore_/js/aui/template-native.js",
			"handlebars": "_fbCore_/js/handlebars/handlebars-v1.3.0.js",

			"dialog": "_fbCore_/js/dialog/src/dialog-plus.js",
			"jquery.ui": "_fbCore_/js/jquery.ui/js/jquery-ui-fb-1.9.2.js",

			"autoHeader": "_fbGrid_/autoheader/jquery.autoHeader.all.js",
			"TreeUtil": "_fbGrid_/utils/TreeUtil.js",

			"Firebird": '_fbBoot_/js/Class.js',
			"Firebird.App": "_fbBoot_/js/App.js",
			"Firebird.Controller": '_fbBoot_/js/Controller.js',
			"Firebird.Model": '_fbBoot_/js/Model.js',
			"Firebird.ui.Component": "_fbBoot_/js/Component.js",
			"Firebird.ui.DatePicker": "_fbForm_/js/DatePicker.js",
			"Firebird.ui.DatePicker2": "_fbForm_/js/DatePicker2.js",
			"Firebird.ui.Dialog": "_fbCore_/js/Dialog.js",

			"Firebird.ui.AutoForm": "_fbForm_/js/AutoForm.js",
			"Firebird.ui.Button": "_fbForm_/js/Button.js",
			"Firebird.ui.MenuButton": "_fbForm_/js/MenuButton.js",
			"Firebird.ui.SpinField": "_fbForm_/js/SpinField.js",
			"Firebird.ui.TextField": "_fbForm_/js/TextField.js",
			"Firebird.ui.TextArea": "_fbForm_/js/TextArea.js",
			"Firebird.ui.NumberField": "_fbForm_/js/NumberField.js",
			"Firebird.ui.CheckGroup": "_fbForm_/js/CheckGroup.js",
			"Firebird.ui.Slider": "_fbForm_/js/Slider.js",
			"Firebird.ui.DoubleSlider": "_fbForm_/js/DoubleSlider.js",

			"Firebird.ui.Office": "_fbOffice_/js/Office.js",

			"Firebird.ui.Formatter": "_fbForm_/js/Formatter.js",
			"Firebird.ui.FormHelper": "_fbForm_/js/FormHelper.js",
			"Firebird.ui.FormValidator": "_fbForm_/js/FormValidator.js",

			"Firebird.ui.Tabbar": "_fbForm_/js/Tabbar.js",

			"Firebird.ui.Selecter": "_fbSelecter_/js/Selecter.js",
			"Firebird.ui.MultiSelecter": "_fbSelecter_/js/MultiSelecter.js",
			"Firebird.ui.TreeSelecter": "_fbSelecter_/js/TreeSelecter.js",
			"Firebird.ui.SingleSelecter": "_fbSelecter_/js/SingleSelecter.js",
			"Firebird.ui.CommonSelecter": "_fbSelecter_/js/CommonSelecter.js",
			"Firebird.ui.SuggestSelecter": "_fbSelecter_/js/SuggestSelecter.js",
			"Firebird.ui.SuggestSingleSelecter": "_fbSelecter_/js/SuggestSingleSelecter.js",
			"Firebird.ui.DialogSelecter": "_fbSelecter_/js/DialogSelecter.js",

			"Firebird.ui.Chart": "_fbChart_/js/Chart.js",
			"Firebird.ui.Chart3D": "_fbChart_/js/Chart3D.js",
			"Firebird.ui.ChartExport": "_fbChart_/js/ChartExport.js",
			"Firebird.ui.ChartPlus": "_fbChart_/js/ChartPlus.js",

			"Firebird.ui.Grid": "_fbGrid_/js/Grid.js",
			"Firebird.ui.TreeGrid": "_fbGrid_/js/TreeGrid.js",

			"Firebird.ui.GroupSelecter": "_fbSelecter_/js/GroupSelecter.js",

			"Firebird.ui.Editor": "_fbEditor_/js/Editor.js",

			"Firebird.ui.Tips": "_fbUtils_/js/Tips.js",
			"Firebird.ui.Tree": "_fbSelecter_/js/Tree.js",
			"Firebird.ui.TreeDialog": "_componentPath_/ui/TreeDialog.js",

			"Firebird.ui.Uploader": "_fbUploader_/js/Uploader.js",
			"Firebird.ui.Attachment": "_fbUploader_/js/Attachment.js",
			"Firebird.ui.FileUploader": "_fbUploader_/js/FileUploader.js",
			"Firebird.ui.ImageUploader": "_fbUploader_/js/ImageUploader.js",
			"Firebird.ui.H5Uploader": "_fbUploader_/js/H5Uploader.js",

			"Firebird.filter.AjaxFilter": "_fbBoot_/js/AjaxFilter.js",
			"Firebird.ajax.Get": "_fbBoot_/js/Get.js",
			"Firebird.ajax.Post": "_fbBoot_/js/Post.js",
			"Firebird.ajax.Proxy": "_fbBoot_/js/Proxy.js",
			"Firebird.data.Conditions": "_fbBoot_/js/Conditions.js",
			"Firebird.data.Store": "_fbBoot_/js/Store.js",
			"Firebird.data.Switcher": "_fbBoot_/js/Switcher.js",
			"Firebird.lang.ArrayList": "_fbBoot_/js/ArrayList.js",
			"Firebird.lang.Boolean": "_fbBoot_/js/Boolean.js",
			"Firebird.lang.Exception": "_fbBoot_/js/Exception.js",
			"Firebird.lang.AjaxException": "_fbBoot_/js/AjaxException.js",
			"Firebird.lang.File": "_fbBoot_/js/File.js",
			"Firebird.lang.HashMap": "_fbBoot_/js/HashMap.js",
			"Firebird.lang.Uuid": "_fbBoot_/js/Uuid.js",

			"printer": "_fbPrint_/js/printer.js",
			"fb.player": "_fbPlayer_/jwplayer/jwplayer.js",

			"Firebird.ui.EChart": "_fbChart_/js/EChart.js",
			"Firebird.ui.EChartSimple": "_fbChart_/js/EChartSimple.js",
			"Firebird.ui.EChartDataTools": "_fbChart_/js/EChartDataTools.js",
			"Firebird.ui.EChartCommon": "_fbChart_/js/EChartCommon.js",
			"Firebird.ui.EChartBmap": "_fbChart_/js/EChartBmap.js",

			"Firebird.ui.MiniGisPoint": "_fbGis_/js/MiniGisPoint",
			"Firebird.ui.MiniGisManager": "_fbGis_/js/MiniGisManager",

			"base64": "_fbCore_/js/base64/base64",

			"testTmpl": "_appPath_/test/test.tmpl"
		}
	});

	window.exports = window.exports || {};

	//if (fb.devMode == true
	//	&& ((navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE6.0")
	//	|| (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE7.0"))) {
	//	//<script type="text/javascript" src="https://getfirebug.com/firebug-lite.js"></script>
	//	var script = document.createElement('script');
	//	script.type = 'text/javascript';
	//	script.onerror = function () {
	//	};
	//	script.charset = "utf-8";
	//	script.src = "https://getfirebug.com/firebug-lite.js";
	//	(document.getElementsByTagName('head')[0]).appendChild(script);
	//}

})();
