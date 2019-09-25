define(function (require) {

	let {$, dayjs, FireBird, Store, _} = require("fb-core");
	let store = require("./libs/store");
	let dragSpace = require("./libs/drag-space");
	// let SockJS = require("./libs/sock");
	let ace = require("./libs/ace/ace");


	FireBird.filter("dayjs", function (val, format) {
		return dayjs(val).format(format);
	});

	window.$ = $;
	window._ = _;
	window.DEBUG_LEVEL = 2;

	let $window = $(window);
	let $document = $(document);

	require("../common/iconfont.css");
	require("./components/index");
	require("./components/LayerEdit");

	var CONFIG = {};

	//CONFIG.pageUrl = "mock/page_s1.json";
	// CONFIG.layersUrl = "mock/s1.json";


	let app = window.app = new FireBird({
		el: "#app",
		template: require("./editor.hbs"),
		data() {

			return {
				GLOBAL_ERROR: false,
				GLOBAL_ERROR_MESSAGE: "",
				components: _.filter(FireBird.components, (n) => {
					return typeof n.attrs !== "undefined";
				}),
				window: {
					width: $window.width(),
					height: $window.height()
				},
				page: {},
				drag: {
					onover: false,
					top: 0,
					left: 0
				},
				layers: [],
				detail: {
					define: {},
					data: {}
				},
				mutil: [],
				mutilScaleFrom: 1,
				mutilScaleTo: 0.9,
				dialogs: {
					componentsAddPanel: false,
					codePanel: false,
					historyPanel: false
				},
				tmp: {
					group: "",
					codeEditor: {}
				},
				mode: "page",
				component: {
					defaults: {
						scale: 1
					}
				},
				toast: "",
				toastType: "info",
				history: [],
				historyCursor: 0,
				historyMax: 5
			}
		},
		events: {
			"click.textslider": function (e) {
				console.log("click event from Component TextSlider");
				console.log(`Component instance is `, e.target);
				console.log(e.target.get("options.data"));
			},


			onComponentDragStart: function (e, data) {
				this.addHistory("移动图层");
			},
			onComponentDragOver: function (e, data) {
				var me = this;
				var layer = me.copy(me.get("layers." + data.index), true);

				var postion = {
					left: data.left,
					top: data.top
				};

				if (layer.lock == true) {

				} else {
					me.set("layers." + data.index, _.merge({}, layer, postion));
				}

			},
			onMutilDragStart: function (e) {
				this.addHistory("移动多个图层");
			},
			onMutilDragOver: function (e, data) {

				var me = this;
				var currentLayer = me.copy(me.get("layers." + data.index), true);

				var offset = {
					left: data.left - currentLayer.left,
					top: data.top - currentLayer.top
				};
				_.each(this.get("mutil", []), function (index) {
					var layer = me.copy(me.get("layers." + index), true);
					var postion = {
						left: Number(layer.left) + offset.left,
						top: Number(layer.top) + offset.top
					};
					if (layer.lock == true) {
					} else {
						me.set("layers." + index, _.merge({}, layer, postion));
					}

				});
			},
			onResizeDragOver: function () {
				this.addHistory("改变图层大小");
			},
			onResizeDragOver: function (e, data) {
				var me = this;
				var layer = me.copy(me.get("layers." + data.index), true);

				if (layer.lock == true) {
					return;
				}

				if (data.type === "height") {
					layer.height = data.top;
					e.target.$refs.resizeHeightHandle.style.top = "auto";
					e.target.$refs.resizeHeightHandle.style.left = "50%";
				} else if (data.type === "width") {
					layer.width = data.left;
					e.target.$refs.resizeWidthHandle.style.left = "auto";
					e.target.$refs.resizeWidthHandle.style.top = "50%";
				} else {
					layer.height = data.top;
					layer.width = data.left;
					e.target.$refs.resizeWidthHeightHandle.style.right = "0";
					e.target.$refs.resizeWidthHeightHandle.style.bottom = "0";
					e.target.$refs.resizeWidthHeightHandle.style.top = "auto";
					e.target.$refs.resizeWidthHeightHandle.style.left = "auto";
				}

				this.set("layers." + data.index, layer);

				e.stop();
			},
			onResizeDragEnd(e, data) {
				this.nextTick(function () {
					this.showDetail(data.index, e);
				});
			},
		},

		watchers: {
			"layers": function (newValue, oldValue, keypath) {
				this.addHistory("更新图层");
			},
			"page": function (newValue, oldValue, keypath) {
				this.addHistory("更新大屏配置");
			}, // 'layers.*': function (newValue, oldValue, keypath) {
			// 	console.log(keypath + ' is changed', newValue, oldValue)
			// },
			"detail.data": function (val) {

				console.log("detail.data.length", val);

				if (this.get("mode") === "detail" && _.isNumber(val.length)) {
					var me = this;
					setTimeout(function () {
						try {
							me.$refs.layerList.scrollTop = val.length < 6 ? 0 : (val.length - 5) * 37;
						} catch (e) {
						}
					}, 16);
				}


			},
			"page.title": function (val) {
				document.title = "正在编辑 - " + val;
			},


			"history": function (val) {
				//   debugger
			}
		},

		filters: {
			// getGrid: function () {
			// 	var page = this.get("page");
			// 	var grid = [];
			// 	_.each(new Array(Math.round(page.width / page.step) * Math.round(page.height / page.step)), function (i) {
			// 		grid.push(i);
			// 	});
			// 	return grid;
			// }
		},

		computed: {
			// groups: {
			// 	deps: ["layers.*"],
			// 	get: function () {
			// 		return _.uniq(_.map(this.get("layers"), function (o) {
			// 			return typeof o.group !== "undefined" ? o.group : "";
			// 		}));
			// 	}
			// }
		},

		methods: {
			preventDefault(e) {
				return false;
			},

			toast(message, type, time) {
				var me = this;

				clearTimeout(this.toastTimer = (this.toastTimer || 0));

				this.set("toast", message);
				this.set("toastType", type || "info");
				this.toastTimer = setTimeout(function () {
					me.set("toast", "");
				}, time || 5000);
			},

			getMaxZindex() {
				var max = _.maxBy(app.get("layers"), function (o) {
					return o.zIndex;
				});
				return max && max.zIndex || 50;
			},
			addComponent(name) {

				var component = FireBird.components[name];
				var page = this.get("page");
				var win = this.get("window");

				var defaults = {
					options: {}
				};

				_.each(component.attrs, function (prop, name) {
					if (prop.keypath.indexOf("options") != -1) {
						defaults.options[name] = _.defaultTo(prop.defaults, "");
					} else {
						defaults[name] = _.defaultTo(prop.defaults, "");
					}
				});

				// @important 将新添加的图层放到操作视野的中心
				var top = Math.round(this.$refs.editorPanel.scrollTop / page.scale + (win.height - 60 - 50) / 2 / page.scale);
				var left = Math.round(this.$refs.editorPanel.scrollLeft / page.scale + (win.width - 150 - 240) / 2 / page.scale);


				var height = component.height || defaults.height || 100;
				var width = component.width || defaults.width || 100;

				// 定位到正中间
				top = top - (height / 2) - 30;
				left = left - (width / 2) - 30;

				var layer = _.merge({}, defaults, {
					component: name,
					name: component.attrs.name.defaults || name || "",
					height: height,
					width: width,
					top: top,
					left: left,
					scale: this.get("component.defaults.scale", 0.5),
					hide: false,
					group: "", //zIndex: this.getMaxZindex(),
					options: {}
				});

				this.addHistory("新增图层 " + layer.name);

				this.prepend("layers", layer);

				this.toggleComponentsDialog();

				this.toast("add success", "success");

				this.nextTick(function () {
					this.showDetail(0);
				})
			},
			toggleComponentsDialog() {
				this.toggle("dialogs.componentsAddPanel");
			},
			removeLayer(index) {

				this.addHistory("删除图层");

				this.removeAt("layers", index);

				this.toast("删除成功", "success");

				if (index === 0) {
					this.set("mode", "page");
				} else {
					this.showDetail(index - 1);
				}
			},
			insertLayer(index, layer) {

				this.addHistory("插入图层 " + layer.name);
				this.insert("layers", layer, index);
			},
			copyLayer(index) {

				var layer = this.copy(this.get("layers." + index), true);
				this.insertLayer(index, layer);

				this.toast("复制成功", "success");
				this.nextTick(function () {
					this.showDetail(index);
				});
			},
			updateLayer(keypath, name, index, type, event) {


				var detail = this.get("detail.data");
				var component = this.get("detail.define");

				var layer = this.copy(this.get("layers." + index), true);

				this.addHistory("更新图层 " + layer.name);

				var value = event.originalEvent.target.value;

				if (typeof component.attrs[name].uniq !== "undefined" && component.attrs[name].uniq === true) {
					var _uniq = _.find(this.get("layers"), function (n) {
						return n[name] == value;
					});
					if (_uniq && _uniq.length != index) {
						this.toast(value + " 已被 " + _uniq.name + "使用", "error");
						event.originalEvent.target.focus();
						return;
					}
				}


				if (type === "px") {

					value = event.originalEvent.target.value.replace(/[a-z]/g, "");
					var oldValue = layer[name];
					if (keypath.indexOf("options.") != -1) {
						oldValue = layer.options[name] || 0;
					}

					// 上
					if (event.originalEvent.keyCode === 38) {
						if (event.originalEvent.altKey === true) {
							value = _.toInteger(oldValue) - 10;
						} else {
							value = _.toInteger(oldValue) - 1;
						}
					}
					// 下
					if (event.originalEvent.keyCode === 40) {
						if (event.originalEvent.altKey === true) {
							value = _.toInteger(oldValue) + 10;
						} else {
							value = _.toInteger(oldValue) + 1;
						}
					}

					event.originalEvent.target.value = value;
				}

				if (type === "boolean") {
					value = event.originalEvent.target.checked;
				}

				if (type === "select") {
					value = event.originalEvent.target.value;
				}

				if (type === "select_object") {
					value = event.originalEvent.target.value;
				}


				if (type === "function_object") {
					value = (new Function(`return ${event.originalEvent.target.value}`))();
				}

				if (type === "function_string") {
					value = event.originalEvent.target.value;
				}

				if (keypath.indexOf("options.") != -1) {

					var options = {};
					options[name] = value;
					layer.options = _.merge({}, layer.options, options);
					this.set(`layers.${index}`, layer);

				} else {
					layer[name] = value;
					this.set(`layers.${index}`, layer);
				}

			},

			setZIndex(toLevel) {

				var me = this;

				if (this.get("mode") === "mutil" || this.get("mode") === "page") {
					this.toast("未处于组件编辑状态")
					return
				}

				var detail = this.get("detail.data");
				var component = this.get("detail.define");

				if (typeof detail.length === "undefined") {
					this.toast("未处于组件编辑状态")
					return
				}


				var layer = this.copy(this.get("layers." + detail.length), true);
				var index = detail.length;
				var prev = index - 1;
				var next = index + 1;
				var total = this.get("layers").length;
				var last = total - 1;
				var first = 0;

				this.addHistory(({
					top: "置顶",
					bottom: "置底",
					up: "上移",
					down: "下移"
				})[toLevel] + "图层 " + layer.name);

				if (toLevel === "top") {
					this.removeAt("layers", index);
					this.nextTick(function () {
						delete layer.zIndex;
						delete layer.length;
						this.prepend("layers", layer);
						this.nextTick(function () {
							this.showDetail(first);
						});
					});
				}

				if (toLevel === "bottom") {
					this.removeAt("layers", index);
					this.nextTick(function () {
						delete layer.zIndex;
						delete layer.length;
						this.append("layers", layer);
						this.nextTick(function () {
							this.showDetail(last);
						});
					});
				}

				if (toLevel === "up") {
					this.removeAt("layers", index);
					this.nextTick(function () {
						layer.zIndex = prev;
						delete layer.length;
						this.insert("layers", layer, prev);
						this.nextTick(function () {
							this.showDetail(prev);
						});
					});
				}

				if (toLevel === "down") {
					this.removeAt("layers", index);
					this.nextTick(function () {
						layer.zIndex = next;
						delete layer.length;
						this.insert("layers", layer, next);
						this.nextTick(function () {
							this.showDetail(next);
						});
					});
				}

				this.set("mode", "page");

			},


			showDetail(index, e) {

				if (this.get("mode") === "mutil") {
					this.toast("多选模式中", "warn");
					return
				}

				var me = this;
				var detail = _.merge({}, this.copy(this.get("layers." + index), true), {
					length: index
				});
				var componentDefine = FireBird.components[detail.component];
				// this.set("layers." + index, {});
				this.set("detail.define", {});
				this.set("detail.data", {});

				this.setKeyPath("page", {config: false});

				setTimeout(function () {
					me.set("layers." + index, detail);
					me.set("detail.define", componentDefine);
					me.set("detail.data", detail);
				}, 0);


				this.clearMutil();
				this.set("mode", "detail");


			},

			/**
			 * 键盘轻移
			 * 选中一个或多个组件后，按方向键可以向上下左右移动1个像素，如果嫌慢的话，可以按住 alt 键，再按方向键，此时偏移量为10px
			 * @todo 轻移的历史记录有点复杂，待后续处理
			 *
			 * @param e
			 * @returns {boolean}
			 */
			move(e) {

				if (_.indexOf([37, 38, 39, 40], e.keyCode) === -1) {
					return false;
				}

				var me = this;

				var direction = "top";

				if (e.keyCode === 37) {
					direction = "left";
				}
				if (e.keyCode === 38) {
					direction = "top";
				}
				if (e.keyCode === 39) {
					direction = "right";
				}
				if (e.keyCode === 40) {
					direction = "bottom";
				}

				var offset = (e.altKey ? 10 : 1);

				if (this.get("mode") === "detail") {
					var detail = this.copy(this.get("detail.data"), true);

					var layer = me.copy(me.get("layers." + detail.length), true);
					var postion = {};

					if (direction === "top") {
						postion[direction] = _.toNumber(layer[direction]) - offset;
					}
					if (direction === "bottom") {
						postion["top"] = _.toNumber(layer.top) + offset;
					}
					if (direction === "left") {
						postion[direction] = _.toNumber(layer[direction]) - offset;
					}
					if (direction === "right") {
						postion["left"] = _.toNumber(layer.left) + offset;
					}

					var layer = _.merge({}, layer, postion);
					me.set("layers." + detail.length, layer);

				}

				if (this.get("mode") === "mutil") {

					_.each(this.get("mutil", []), function (index) {
						var layer = me.copy(me.get("layers." + index), true);
						var postion = {};

						if (direction === "top") {
							postion[direction] = _.toNumber(layer[direction]) - offset;
						}
						if (direction === "bottom") {
							postion["top"] = _.toNumber(layer.top) + offset;
						}
						if (direction === "left") {
							postion[direction] = _.toNumber(layer[direction]) - offset;
						}
						if (direction === "right") {
							postion["left"] = _.toNumber(layer.left) + offset;
						}

						var layer = _.merge({}, layer, postion);

						me.set("layers." + index, layer);
					});
				}
			},

			/**
			 * 多选
			 * 按住 metaKey (MacOs->commond, Windows->window) 键，再用鼠标点按某个组件会进入多选模式
			 * @param index 组件索引
			 */
			mutilSelect(index) {

				this.set("mutilSelectFastIndex", index + 1);

				if (_.indexOf(this.get("mutil", []), index) != -1) {
					this.remove("mutil", index);
				} else {
					this.append("mutil", index);
				}

				this.nextTick(function () {
					if (this.get("mutil", []).length === 0) {
						this.set("mode", "detail");
					} else {
						this.set("mode", "mutil");
					}
				});
			},

			/**
			 * 多选
			 * 在左侧的图层栏，按住shift键，再点该栏的某个图层，可以快速选择一串图层
			 * @param index
			 * @param event
			 * @returns {boolean}
			 */
			mutilSelectFast(index, event) {

				if (event.originalEvent.shiftKey === false) {
					return false;
				}

				var me = this;
				index = index + 1;
				var lastSelect = this.get("mutilSelectFastIndex", -1);

				if (lastSelect < 0 || lastSelect == index) {
					return;
				}


				_.each(_.range(lastSelect, index), function (n) {
					if (_.indexOf(me.get("mutil", []), n) == -1) {
						me.nextTick(function () {
							me.append("mutil", n);
						});
					}
				});

				this.toast("快速多选" + Math.abs(lastSelect - index) + "个图层");


				// this.nextTick(function () {
				// 	if (this.get("mutil", []).length === 0) {
				// 		this.set("mode", "detail");
				// 	} else {
				// 		this.set("mode", "mutil");
				// 	}
				// });
			},


			clearMutil() {
				this.set("mutil", []);
				this.set("mode", "page");
			},

			mutilValue(event, type) {
				var me = this;

				var value = event.originalEvent.target.value;

				if (type === "hide") {
					value = event.originalEvent.target.checked;
				}

				_.each(this.get("mutil", []), function (index) {
					var layer = me.copy(me.get("layers." + index), true);

					layer[type] = value;

					me.set("layers." + index, layer);
				});


			},

			mutilLock(lock) {
				var me = this;
				var mutil = this.get("mutil", []);
				_.each(mutil, function (index) {
					var layer = me.copy(me.get("layers." + index), true);
					layer.lock = lock;
					me.set("layers." + index, layer);
				});

				this.toast(mutil.length + "个图层" + (lock ? "锁定" : "解锁") + "成功", "success")
			},

			mutilDel() {
				var me = this;
				var mutil = (this.get("mutil", [])).sort(function (a, b) {
					return b - a;
				});

				var indexLast = mutil[mutil.length - 1];

				_.each(mutil, function (index) {
					me.removeAt("layers", index);
				});

				this.set("mutil", []);

				if (indexLast === 0) {
					this.set("mode", "page");
				} else {
					this.showDetail(indexLast - 1);
				}

				this.toast(mutil.length + "个图层删除成功", "success")
			},

			mutilCopy() {
				var me = this;
				var mutil = this.get("mutil", []);
				_.each(mutil, function (index) {
					var layer = me.copy(me.get("layers." + index), true);
					me.insertLayer(index, layer);
				});

				this.toast(mutil.length + "个图层复制成功", "success")
			},

			mutilMove(direction) {

				var me = this;
				_.each(this.get("mutil", []), function (index) {
					var layer = me.copy(me.get("layers." + index), true);
					var postion = {};

					if (direction === "top") {
						postion[direction] = _.toNumber(layer[direction]) - 1;
					}
					if (direction === "bottom") {
						postion["top"] = _.toNumber(layer.top) + 1;
					}
					if (direction === "left") {
						postion[direction] = _.toNumber(layer[direction]) - 1;
					}
					if (direction === "right") {
						postion["left"] = _.toNumber(layer.left) + 1;
					}

					var layer = _.merge({}, layer, postion);

					me.set("layers." + index, layer);
				});


			},
			mutilAlign(type) {

				var me = this;
				var layers = _.map(this.get("mutil", []), function (index) {
					return me.copy(me.get("layers." + index), true);
				});

				var attr = "";
				var value = "";

				if (type === "top") {
					attr = "top";
					var max = _.maxBy(layers, function (o) {
						return o.top;
					});

					value = max && max.top;
				}


				_.each(layers, function (index, layer) {
					layer[attr] = value;
					me.set("layers." + index, layer);
				});


			},

			showMode(mode) {

				this.set("mode", mode || "page");
			},

			showPageConfig() {

				if (this.get("mode") === "mutil") {
					this.toast("请先退出多选模式", "warn");
					return
				}

				this.set("detail.define", {});
				this.set("detail.data", {});
				this.set("mode", "page");
			},

			getLayers() {
				console.log(JSON.stringify(this.get("layers"), null, '\t'));
				var me = this;
				$.ajax('/api/save/layers/' + this.get("page.id"), {
					//  据我测试了多次，payload只能用于POST方式
					method: 'POST', //  数据类型必须为application/x-www-form-urlencoded之外的类型
					contentType: 'application/json;charset=utf-8', //  数据必须转换为字符串
					data: JSON.stringify(this.get("layers")),
					success: function (data) {
						if (data.success === true) {
							me.toast(data.file + " 保存成功！", "success");
						}
					}
				})


			},
			getPage() {
				console.log(JSON.stringify(this.get("page"), null, "\t"));
				var me = this;
				$.ajax('/api/save/page/' + this.get("page.id"), {
					//  据我测试了多次，payload只能用于POST方式
					method: 'POST', //  数据类型必须为application/x-www-form-urlencoded之外的类型
					contentType: 'application/json;charset=utf-8', //  数据必须转换为字符串
					data: JSON.stringify(this.get("page")),
					success: function (data) {
						if (data.success === true) {
							me.toast(data.file + " 保存成功！", "success");
						}
					}
				})

			},

			setScale: function (scale) {
				var page = this.copy(this.get("page"), true);
				if (scale == "auto") {
					page.scale = ($window.width() - 150 - 280 - 40) / this.get("page.width")
				} else {
					page.scale = scale / 100;
				}
				this.set("page", page);
			},
			error(show, message) {
				this.set("GLOBAL_ERROR_MESSAGE", message);
				this.set("GLOBAL_ERROR", show);
			},

			applyGroup(event) {

				var me = this;
				_.each(this.get("mutil", []), function (index) {
					var layer = me.copy(me.get("layers." + index), true);
					layer.group = event.originalEvent.target.value;
					me.set("layers." + index, layer);
				});

			},

			addGroup() {
				var me = this;
				var tmp = me.copy(me.get("tmp"), true);

				_.each(this.get("mutil", []), function (index) {
					var layer = me.copy(me.get("layers." + index), true);
					layer.group = tmp.group;
					me.set("layers." + index, layer);
				});


				tmp.group = "";
				this.nextTick(function () {
					this.set("tmp", tmp);
				});


			},

			initCodeEditor() {

				this.$codeEditor = ace.edit("codeEditor");
				this.$codeEditor.getSession()
				    .setMode("ace/mode/javascript");
				this.$codeEditor.setOptions({
					enableBasicAutocompletion: true,
					enableSnippets: true,
					enableLiveAutocompletion: true
				});

				this.$codeEditor.setFontSize(14);

				this.$codeEditor.setTheme("ace/theme/tomorrow_night_eighties");


			},

			openCodeEditorReadonly(code, keypath, name, index, type, event) {
				if (typeof code !== "string") {
					code = JSON.stringify(code, null, "\t");
				}
				this.openCodeEditor(code, keypath, name, index, type, event);
				this.$codeEditor.setReadOnly(true);
			},

			openCodeEditor(code, keypath, name, index, type, event) {
				var mode = "";
				var me = this;

				if (_.isInteger(index)) {
					code = this.copy(this.get("layers." + index + "." + keypath));
				}

				this.set("tmp", _.merge({}, this.copy(this.get("tmp"), true), {
					codeEditor: {
						code: code,
						keypath: keypath,
						name: name,
						index: index,
						type: type
					}
				}));

				if (!this.$codeEditor) {
					this.initCodeEditor();
				}

				if (typeof code !== "string") {
					code = JSON.stringify(code, null, "\t");
				}

				this.$codeEditor.setReadOnly(false);
				this.$codeEditor.setValue(code || "//请编码\n");
				this.$codeEditor.selection.setSelectionRange({
					start: {
						row: 1,
						column: 4
					},
					end: {
						row: 1,
						column: 4
					}
				});

				this.$codeEditor.commands.addCommand({
					name: 'save',
					bindKey: {
						win: 'Ctrl-S',
						mac: 'Command-S'
					},
					exec: function (editor) {
						me.saveCode();
						return;
					},
					readOnly: false // 如果不需要使用只读模式，这里设置false
				});

				this.$codeEditor.commands.addCommand({
					name: 'save',
					bindKey: {
						win: 'Ctrl-Shift-F',
						mac: 'Command-Shift-F'
					},
					exec: function (editor) {
						me.formatCode();
						return;
					},
					readOnly: false // 如果不需要使用只读模式，这里设置false
				});


				this.setKeyPath("dialogs", {
					codePanel: true
				})

			},

			saveCode() {

				if (this.hasCodeEditorError()) {
					this.toast("你编辑的代码有问题，请修正后保存", "error");
					return;
				}

				var code = this.$codeEditor.getValue();

				console.log(code);

				var id = this.get("page.id");
				var codeEditor = this.get("tmp.codeEditor");
				var mode = "page";
				if (_.isInteger(codeEditor.index)) {
					mode = "layer";
				}

				try {
					window.localStorage.setItem(id + "_" + mode + "_" + codeEditor.keypath, code);
				} catch (t) {
					console.error(t);
					console.log("缓存到本地失败，刷新页面后配置将不被保存，请及时保存")
				}


				if (mode === "page") {
					this.set(codeEditor.keypath, code);
					this.toast("保存成功", "success");
				}
				if (mode === "layer") {
					var index = codeEditor.index;
					var layer = this.copy(this.get("layers." + index), true);
					if (codeEditor.keypath.indexOf("options.") != -1) {

						var options = {};
						options[codeEditor.name] = code;
						layer.options = _.merge({}, layer.options, options);
						this.set(`layers.${index}`, layer);
						this.nextTick(function () {
							this.showDetail(index);
						})

					} else {
						layer[codeEditor.name] = code;
						this.set(`layers.${index}`, layer);
						this.nextTick(function () {
							this.showDetail(index);
						})
					}
					this.toast("保存成功", "success")
				}

				this.nextTick(function () {
					this.cancelCodeEditor();
				})


			},

			formatCode() {
				var beautify = ace.require("ace/ext/beautify");
				beautify.beautify(this.$codeEditor.getSession());
				//var code = this.$codeEditor.getValue();
				//.beautify();
			},

			cancelCodeEditor() {
				this.setKeyPath("dialogs", {
					codePanel: false
				})
			},

			hasCodeEditorError() {
				var annotations = this.$codeEditor.getSession()
				                      .getAnnotations();
				for (var t = 0, o = annotations.length; o > t; ++t) {
					if ("error" === annotations[t].type) {
						return true;
					}
				}
				return false;
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
				let param = this.getParam();

				if (param.id) {
					$.ajax({
						url: "mock/" + param.id + "_page.json",
						dataType: "json",
						success(data) {
							me.set("page", data);
							me.asyncHistory();
							me.loadLayers();

						},
						error(e) {
							me.newPage();
							me.error(true, e);
						}
					});
				} else {

					me.newPage();
				}

				// me.error(false);

			},

			/**
			 * 加载图层
			 */
			loadLayers() {
				let me = this;
				me.error(false);

				$.ajax({
					url: "mock/" + this.get("page.layersUrl") + "_layers.json", // url: "mock/editor.json",
					dataType: "json",
					success(data) {
						me.set("layers", data);
						me.addHistory("打开大屏");
					},
					error(e) {
						me.error(true, e);
					}
				});
			},

			/**
			 * 新建大屏页面
			 */
			newPage() {

				var id = new Date().getTime();

				this.set("page", {
					"width": 1920,
					"height": 1080,
					"scale": 1,
					"step": 5,
					"showGrid": false,
					"background": "color",
					"backgroundValue": "red",
					"themeList": [
						"blue", "red", "yellow"
					],
					"theme": "blue",
					"title": "新建大屏",
					"config": false,
					"layersUrl": id,
					id: id,
					onInit: "//新建大屏 fn(screen, jQuery, lodash, FireBird, dayjs, SockJS)\n\n"
				});

				this.set("layers", []);
			},

			preview() {

				window.open("page.html?id=" + this.get("page.id"));

			},

			mutilScale() {

				this.setGlobalOffset(this.get("mutil", []), this.get("multiScaleFrom", 1), this.get("multiScaleTo", 1));

			},

			setGlobalOffset(ids, fromScale, toScale) {

				var me = this;

				_.each(ids || [], function (index) {
					var layer = me.copy(me.get("layers." + index), true);
					layer.top = Math.round(layer.top / fromScale * toScale);
					layer.left = Math.round(layer.left / fromScale * toScale);
					layer.scale = toScale;
					me.set(`layers.${index}`, layer);
				});
				this.toast("缩放完成", "success");

			},


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
					var layer = _.merge({}, layer, {
						options: options
					});
					me.set("layers." + layers.length, layer);
				}
			},
			getLayerById(id) {
				return _.find(this.copy(this.get("layers", []), true), function (n) {
					return n.id == id;
				});
			},
			getLayersByTag(tag) {
				return _.filter(this.copy(this.get("layers", []), true), function (n) {
					return _.indexOf(_.trim(n.tag).split(","), tag) != -1;
				});
			},
			setOptionsByKeyPath(keyPath, options) {
				let instance = this.get(keyPath);
				if (instance) {
					let settings = this.copy(instance.get("options"), true);
					console.log(`app#setOptionsByKeyPath before`, settings);
					_.merge({}, settings, options);
					console.log(`app#setOptionsByKeyPath after`, settings);
					instance.set("options", settings);
				}
			},
			setOptionsByIndex(index, options) {
				let instance = this.get("layers." + index);
				if (instance) {
					let settings = this.copy(instance.get("options"), true);
					console.log(`app#setOptionsByIndex before`, settings);
					_.merge({}, settings, options);
					console.log(`app#setOptionsByIndex after`, settings);
					instance.set("options", settings);
				}
			},
			setKeyPath(keyPath, options) {
				this.set(keyPath, _.merge({}, this.copy(this.get(keyPath), true), options));
				return this;
			},
			setById(id, key, value) {
				let instance = _.isString(id) ? app.context[id] : id;
				if (instance) {
					if (_.isObject(value) || _.isArray(value)) {
						let settings = this.copy(instance.get(key), true);
						console.log(`app#setById before`, settings);
						_.merge({}, settings, options);
						console.log(`app#setById after`, settings);
						instance.set(key, settings);
					} else {
						instance.set(key, value);
					}

				}
				return this;
			},
			showHistory() {
				this.set("dialogs.codePanel", false);
				this.toggle("dialogs.historyPanel");
			},
			asyncHistory() {
				var page = this.get("page");
				var historyUUID = store.get("historyUUID" + page.id) || [];
				var historySimple = store.get("historySimple" + page.id) || [];
				var historyContent = store.get("historyContent" + page.id) || [];

				if (historySimple.length > 0) {
					this.set("history", historySimple);
				}

			},
			addHistory(name) {
				var me = this;
				var historyCursor = this.get("historyCursor", -1);


				name = name || "未知的操作";
				var uuid = new Date().getTime();

				var simple = {
					time: uuid,
					name: name
				};

				var page = this.get("page");
				var layers = this.get("layers");
				var content = {
					time: uuid,
					name: name,
					layers: JSON.stringify(layers),
					page: JSON.stringify(page)
				};

				var historyUUID = store.get("historyUUID" + page.id) || [];
				var historySimple = store.get("historySimple" + page.id) || [];
				var historyContent = store.get("historyContent" + page.id) || [];

				var historyMax = this.get("historyMax", 50);
				var history = this.get("history", []);

				// 当游标 在历史记录中的时候，需要将游标之后的历史干掉
				// 来自photoshop的图层管理逻辑
				if (historyCursor > 0) {
					debugger
					if (history.length > 0) {
						_.each(_.range(0, historyCursor - 1), function (n) {
							me.removeAt("history", 0);
						});
					}
					// 重置游标
					this.set("historyCursor", -1);

					// 清理缓存
					historyUUID = _.dropRight(historyUUID, historyCursor);
					historySimple = _.dropRight(historySimple, historyCursor);
					historyContent = _.dropRight(historyContent, historyCursor);

				}

				// 为了防止 localStorage 被填满，默认把历史记录最大为50步
				// @see 
				if (historyUUID.length >= historyMax) {

					if (history.length > 0) {
						this.removeAt("history", 0);
					}

					historyUUID = _.dropRight(historyUUID, 1);
					historySimple = _.dropRight(historySimple, 1);
					historyContent = _.dropRight(historyContent, 1);

				}

				this.prepend("history", {
					time: uuid,
					name: name
				});

				historyUUID = _.concat(historyUUID, uuid);
				historySimple = _.concat(historySimple, simple);
				historyContent = _.concat(historyContent, content);

				store.set("historyUUID" + page.id, historyUUID);
				store.set("historySimple" + page.id, historySimple);
				store.set("historyContent" + page.id, historyContent);

			},
			clearHistory() {

				var page = this.get("page");

				store.set("historyUUID" + page.id, []);
				store.set("historySimple" + page.id, []);
				store.set("historyContent" + page.id, []);

				this.set("history", []);
				this.toast("已清空该大屏本地历史记录");
			},

			gotoHistroy(uuid) {

				var page = this.get("page");
				var historyUUID = store.get("historyUUID" + page.id) || [];
				var historySimple = store.get("historySimple" + page.id) || [];
				var historyContent = store.get("historyContent" + page.id) || [];

				// historyCursor
				var historyCursor = _.indexOf(historyUUID, uuid);

				if (historyCursor === -1) {
					this.toast("该历史记录不存在", "error");
					return;
				}

				this.set("historyCursor", historyCursor);

				var history = _.find(historyContent, function (n) {
					return n.time == uuid;
				});

				if (history) {
					this.set("page", JSON.parse(history.page));
					this.set("layers", JSON.parse(history.layers));
					this.toast("大屏 已回到 " + dayjs(history.time).format("YYYY-MM-dd hh:mm:ss") + " 时的状态", "success");
				}

			},

			unDo() {
				this.toast("撤销")
			},
			reDo() {
				this.toast("重做")
			}
		},
		afterMount() {
			var me = this;

			this.loadPage();

			$window.on("resize", function () {
				me.set("window", {
					width: $window.width(),
					height: $window.height()
				});
			});

			$document.on("keyup.move", function (e) {
				me.set("keyCode", 0);
			})

			$document.on("keydown.move", function (e) {

				var $target = $(e.target);

				me.set("keyCode", e.keyCode);


				if (e.keyCode === 32) {

					if (me.get("dialogs.codePanel") === true) {
						return true;
					}
					if ($target.is("input") || $target.is("textarea")) {
						return true;
					}
					return false;
				}

				if (e.metaKey === true) {

					// me.toast(`你按了 ${e.keyCode} - ${e.crltKey}`, "", 500);
					//return false;
					// R
					if (e.keyCode === 82) {
						if (e.shiftKey === true) {
							return true
						} else {
							me.toast("要刷新，请再加按shift")
							return false;
						}
					}


					// if (e.keyCode === 90) {
					// 	if (!$(e.target).is("body")) {
					// 		return false;
					// 	}
					// 	this.unDo();
					// 	return false;
					// }
					//
					// if (e.keyCode === 90) {
					// 	if (!$(e.target).is("body")) {
					// 		return false;
					// 	}
					// 	this.reDo();
					// 	return false;
					// }

					if (e.keyCode === 189 || e.keyCode === 187) {
						var scale = Math.round(me.get("page.scale", 1) * 100);
						var times = 1;
						if (e.shiftKey === true) {
							times = 2;
						}
						scale =
							(e.keyCode === 187 ? ((scale / 10) * times + scale) : (scale - ((scale / 10) * 2))) / 100;
						me.toast(`比例缩放至 ${scale}`, "info", 2000);
						me.set("page.scale", scale);
						return false;
					}


				}


				if ($(e.target).is("input") || $(e.target).is("textarea")) {
					return true;
				} else {
					//e.preventDefault();

					if (me.get("mode") === "mutil" || me.get("mode") === "detail") {
						me.move(e);
						e.preventDefault();
					}
				}

			});

			// var me = this.$refs.editorSpacemove;

			$(this.$refs.editorSpacemove).on(dragSpace.types.start, function (e) {
				let appConfig = me.get("");

				dragSpace.create(me.$refs.editorSpacemove, event, {
					appConfig: appConfig,
					onstart: function (e, left, top, api) {
						api.scrollLeft = me.$refs.editorPanel.scrollLeft;
						api.scrollTop = me.$refs.editorPanel.scrollTop;
					},
					onover: function (e, left, top, api) {
						me.$refs.editorPanel.scrollLeft = api.scrollLeft + (api.startLeft - left);
						me.$refs.editorPanel.scrollTop = api.scrollTop + (api.startTop - top);
					}
				});
			});


			//
			//var onInit = (new Function(`return ${data}`));

			// var sock = new SockJS('https://mydomain.com/my_prefix');
			// sock.onopen = function () {
			// 	console.log('open');
			// 	sock.send('test');
			// };
			//
			// sock.onmessage = function (e) {
			// 	console.log('message', e.data);
			// 	sock.close();
			// };
			//
			// sock.onclose = function () {
			// 	console.log('close');
			// };


		}
	});


});