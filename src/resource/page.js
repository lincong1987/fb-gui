define(function (require) {

	let {$, dayjs, FireBird, Store, _} = require("fb-core");
	let SockJS = require("./libs/sock");
	let ReconnectingWebSocket = require("./libs/reconnecting-websocket");

	window.$ = $;
	window._ = _;
	window.dayjs = dayjs;
	window.DEBUG_LEVEL = 5;

	let $window = $(window);
	let $document = $(document);

	require("../common/iconfont.css");

	// require("./resize").setScale();

	// 加载全部组件
	require("./components/index");

	let app = window.app = new FireBird({
		el: "#app",
		template: require("./page.hbs"),
		data() {
			return {
				GLOBAL_ERROR: false,
				GLOBAL_ERROR_MESSAGE: "",
				window: {
					width: $window.width(),
					height: $window.height()
				},
				page: {},
				layers: []
			}
		},
		afterMount() {
			var me = this;


			this.$tasks = [];
			var _pendding = false;
			me._set = function (keypath, value) {
				me.$tasks.push(function () {
					me.set(keypath, _.isFunction(value) ? (value.apply(me, [])) : value);
				});
			}

			var run = function () {
				var length = me.$tasks.length;
				//console.log("tasks:", length)
				if (_pendding === false && length > 0) {
					me.$tasks[0]();
					_pendding = false;
					me.$tasks = _.drop(me.$tasks, 1);

				}

				setTimeout(function () {
					run();
				}, me.$tasks.length > 100 ? 32 : 100);
			};

			run();


			me.loadPage();
			$window.on("resize", function () {
				me.set("window", {
					width: $window.width(),
					height: $window.height()
				});
			});
		},
		events: {
			"click.textslider": function (e) {
				console.log("click event from Component TextSlider");
				console.log(`Component instance is `, e.target);
				console.log(e.target.get("options.data"));
			}
		},

		watchers: {

			"page.onInit": function (val) {
				try {
					(new Function("screen", "jQuery", "lodash", "FireBird", "dayjs", "SockJS", "ReconnectingWebSocket", `${val}`)).apply(this, [
						this, $, _, FireBird, dayjs, SockJS, ReconnectingWebSocket
					]);
				} catch (e) {
					console.log(e)
				}
			},
			"page.title": function (val) {
				document.title = val;
			}
		},

		methods: {


			/**
			 * 设置某个组件的属性
			 * @param id
			 * @param options
			 */
			setOptionsById(id, options) {
				var me = this;

				var layers = me.copy(me.get("layers", []), true);

				var layer = _.find(layers, function (n) {
					return n.id == id;
				});

				if (layer) {
					me._set("layers." + layer.length, function () {
						return _.merge({}, me.copy(me.get("layers." + layer.length, {}), true), {
							options: options
						})
					});
				}
			},

			setOptionsByTag(tag, options) {
				var me = this;
				var layers = _.filter(me.copy(me.get("layers", []), true), function (n) {
					var _tags = _.trim(n.tag).split(",");
					return _.indexOf(_tags, tag) != -1;
				});

				_.each(layers || [], function (layer, index) {
					me._set("layers." + layer.length, function () {
						return _.merge({}, me.copy(me.get("layers." + layer.length, {}), true), {
							options: options
						})
					});
				});
			},
			/**
			 *
			 * @param id
			 * @return layer
			 */
			getLayerById(id) {
				return _.find(this.copy(this.get("layers", []), true), function (n) {
					return n.id == id;
				});
			},
			/**
			 *
			 * @param tag
			 * @returns {Array}
			 */
			getLayersByTag(tag) {
				return _.filter(this.copy(this.get("layers", []), true), function (n) {
					return _.indexOf(_.trim(n.tag).split(","), tag) != -1;
				});
			},

			error(show, message) {
				this.set("GLOBAL_ERROR_MESSAGE", message);
				this.set("GLOBAL_ERROR", show);
			},
			/**
			 * 显示隐藏 某组数据
			 * @param name
			 * @param show {Boolean} true/false
			 */
			showGroup: function (name, show) {

				let layers = this.copy(this.get("layers"));
				_.each(layers, function (layer) {
					if (layer.group === name) {
						layer.hide = !show;
					}
				});

				this.set("layers", layers);

			},

			getParam() {
				var url = location.search; //获取url中"?"符后的字串
				var theRequest = new Object();
				if (url.indexOf("?") != -1) {
					var str = url.substr(1);
					strs = str.split("&");
					console.log(strs)
					for (var i = 0; i < strs.length; i++) {
						theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
					}
				}
				return theRequest;
			},


			loadPage() {
				let me = this;
				me.error(false);

				let param = this.getParam();

				if (param.id) {
					$.ajax({
						url: "mock/" + param.id + "_page.json",
						dataType: "json",
						success(data) {
							me.loadLayers(data);
						},
						error(e) {
							me.error(true, "page 数据不存在");
						}
					});
				} else {
					me.error(true, "id 不存在");
				}


			},

			loadLayers(page) {
				let me = this;
				me.error(false);
				$.ajax({
					url: "mock/" + page.layersUrl + "_layers.json",
					dataType: "json",
					success(data) {

						_.each(data, function (n, i) {
							if (typeof n.length != "undefined") {
								delete n.length;
							}
							n.length = i;
							return n;
						});


						me.set("page", page);
						me.set("layers", data);

						//	app.showGroup("bottom_charts", true);
					},
					error(e) {
						me.error(true, "图层数据没有找到");
					}
				});
			},
			getInstanceById: function (id) {
				return _.find(this.$children, function (n) {
					return n.get("id") == id;
				});
			}
		}
	});


});