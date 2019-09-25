define(function (require, exports, module) {
	var {$} = require('fb-core');

	var $window = $(window);
	var $document = $(document);
	var isTouch = 'createTouch' in document;
	var html = document.documentElement;
	var isIE6 = !('minWidth' in html.style);
	var isLosecapture = !isIE6 && 'onlosecapture' in html;
	var isSetCapture = 'setCapture' in html;

	var types = {
		start: isTouch ? 'touchstart' : 'mousedown',
		over: isTouch ? 'touchmove' : 'mousemove',
		end: isTouch ? 'touchend' : 'mouseup'
	};


	(function () {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame =
				window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}
		if (!window.requestAnimationFrame) {
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}
		if (!window.cancelAnimationFrame) {
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	}());


	var getEvent = isTouch ? function (event) {
		if (!event.touches) {
			event = event.originalEvent.touches.item(0);
		}
		return event;
	} : function (event) {
		return event;
	};


	var DragEvent = function () {
		this.start = $.proxy(this.start, this);
		this.over = $.proxy(this.over, this);
		this.end = $.proxy(this.end, this);
		this.onstart = this.onover = this.onend = $.noop;
	};

	DragEvent.types = types;

	var over_timer;

	DragEvent.prototype = {

		start: function (event) {
			event = this.startFix(event);

			$document
				.on(types.over, this.over)
				.on(types.end, this.end);

			this.onstart(event);
			return false;
		},

		over: function (event) {
			var me = this;
			window.cancelAnimationFrame(over_timer);
			over_timer = window.requestAnimationFrame(function () {
				event = me.overFix(event);
				me.onover(event);
			});
			return false;
		},

		end: function (event) {
			event = this.endFix(event);

			$document
				.off(types.over, this.over)
				.off(types.end, this.end);

			this.onend(event);
			return false;
		},

		startFix: function (event) {
			event = getEvent(event);

			this.target = $(event.target);
			this.selectstart = function () {
				return false;
			};

			$document
				.on('selectstart', this.selectstart)
				.on('dblclick', this.end);

			if (isLosecapture) {
				this.target.on('losecapture', this.end);
			} else {
				$window.on('blur', this.end);
			}

			if (isSetCapture) {
				this.target[0].setCapture();
			}

			return event;
		},

		overFix: function (event) {
			event = getEvent(event);
			return event;
		},

		endFix: function (event) {
			event = getEvent(event);

			$document
				.off('selectstart', this.selectstart)
				.off('dblclick', this.end);

			if (isLosecapture) {
				this.target.off('losecapture', this.end);
			} else {
				$window.off('blur', this.end);
			}

			if (isSetCapture) {
				this.target[0].releaseCapture();
			}

			return event;
		}

	};


	/**
	 * 启动拖拽
	 * @param   {HTMLElement}   被拖拽的元素
	 * @param   {Event} 触发拖拽的事件对象。可选，若无则监听 elem 的按下事件启动
	 */
	DragEvent.create = function (elem, event, options) {
		var $elem = $(elem);
		var dragEvent = new DragEvent();
		var startType = DragEvent.types.start;
		var noop = function () {
		};
		var classNameStart = elem.className
		                         .replace(/^\s|\s.*/g, '') + '-drag-mutil-start';
		var classNameOver = elem.className
		                        .replace(/^\s|\s.*/g, '') + '-drag-mutil-over';
		var classNameEnd = elem.className
		                       .replace(/^\s|\s.*/g, '') + '-drag-mutil-end';

		var options = options || {};
		var onstart = options.onstart || noop;
		var onover = options.onover || noop;
		var onend = options.onend || noop;

		var api = {
			appConfig: options.appConfig,
			offset: options.offset,
			scroll: options.scroll,
			onstart: onstart,
			onover: onover,
			onend: onend,
			off: function () {
				$elem.off(startType, dragEvent.start);
			}
		};
		console.clear();
		console.log(`
		
				on mutil start》》》
				
				`);

		dragEvent.onstart = function (event) {
			var scale = api.appConfig.page.scale;

			// 起始 event 基准坐标
			var position = $elem.position();

			// 换算成 100%
			var left = Math.round(position.left / scale);
			var top = Math.round(position.top / scale);

			this.elementStartLeft = left;
			this.elementStartTop = top;

			// 鼠标的相对坐标 = (鼠标的物理坐标 - 相对偏移量) / 缩放比
			this.mouseStartLeft = Math.round((event.clientX - api.offset.left + api.scroll.left) / scale);
			this.mouseStartTop = Math.round((event.clientY - api.offset.top + api.scroll.top) / scale);

			this.elementToMouseOffsetLeft = this.mouseStartLeft - this.elementStartLeft;
			this.elementToMouseOffsetTop = this.mouseStartTop - this.elementStartTop;

			this.mouseMoveLeft = this.elementStartLeft;
			this.mouseMoveTop = this.elementStartTop;

			$elem.removeClass([classNameOver, classNameEnd].join(" "));
			$elem.addClass(classNameStart);

			api.onstart.call(elem, event, left, top, this);
		};


		dragEvent.onover = function (event) {
			var scale = api.appConfig.page.scale;

			var left = Math.round((event.clientX - api.offset.left + api.scroll.left) / scale);
			var top = Math.round((event.clientY - api.offset.top + api.scroll.top) / scale);

			//var style = $elem[0].style;

			// 步进 GRID CELL
			left = Math.round(left - this.elementToMouseOffsetLeft);
			left =
				left === 0 ? 0 : ((left % api.appConfig.page.step) === 0 ? left : (Math.round(left / api.appConfig.page.step) * api.appConfig.page.step));

			top = Math.round(top - this.elementToMouseOffsetTop);
			top =
				top === 0 ? 0 : ((top % api.appConfig.page.step) === 0 ? top : (Math.round(top / api.appConfig.page.step) * api.appConfig.page.step));


			this.mouseMoveLeft = left;
			this.mouseMoveTop = top;

			// style.left = (left) + 'px';
			// style.top = (top) + 'px';

			// $elem.data()

			$elem.removeClass([classNameStart, classNameEnd].join(" "));
			$elem.addClass(classNameOver);

			api.onover.call(elem, event, left, top, this);
		};


		dragEvent.onend = function (event) {

			var left = this.mouseMoveLeft; //Math.round(position.left / scale);
			var top = this.mouseMoveTop; // Math.round(position.top / scale);

			$elem.removeClass([classNameStart, classNameOver].join(" "));
			$elem.addClass(classNameEnd);
			api.onend.call(elem, event, left, top, this);
		};


		dragEvent.off = function () {
			$elem.off(startType, dragEvent.start);
		};


		if (event) {
			dragEvent.start(event);
		} else {
			$elem.on(startType, dragEvent.start);
		}

		return api;
	};

	module.exports = DragEvent;
});