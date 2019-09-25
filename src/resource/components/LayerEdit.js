/*
 This file 'LayerEdit' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	var drag = require("../libs/drag");
	var dragMutil = require("../libs/drag-mutil");
	var dragResize = require("../libs/drag-resize");
	var {_} = require("fb-core");

	/**
	 * 图层 Wrapper   active="{{css({active: this.index === detail.data.length})}}"
	 * @type LayerEdit
	 */
	module.exports = FireBird.component("LayerEdit", {
		model: "options",
		template: `
				<div ref="layer"
				    on-contextmenu="preventDefault($event)"
					on-click="showDetail(length, $event)"
					length="{{length}}"
					class="layer {{hide ? 'hide' : 'show'}}  {{active ? 'active' : ''}} {{groupActive ? 'group-active' : ''}} a {{(indexOf(mutil, length) != -1) ? 'mutil-active' : ''}}"
					group="{{group}}" 
					title="{{name}}"
					id="{{id}}" 
					width="{{width}}" 
					height="{{height}}" 
					top="{{top}}" 
					left="{{left}}" 
					scale="{{scale}}"
					model="options"
					style="width: {{width}}px; 
							height: {{height}}px; 
							top: {{top}}px; 
							left: {{left}}px; 
							z-index: {{zIndex}};
							opacity: {{opacity}};
							background-color: {{backgroundColor}};
							box-shadow: {{boxShadow}};
							transform: scale({{scale}});
							transform-origin: 0 0;"
					>
					<$component 
						model="options" 
						{{...this}}
						/>
						<div class="px" 
							on-mousedown="preventDefault($event)"
							on-click="preventDefault($event)"
						>
						<div>
							<span>{{left}},{{top}} {{width}},{{height}}</span>
						</div>
						</div>
						<div class="menu" ref="menuHandle">
						    <ul>
						        <li><a href="javascript:;" on-click="setZIndex($event, 'up')">上移</a></li>
						        <li><a href="javascript:;" on-click="setZIndex($event, 'down')">下移</a></li>
						        <li><a href="javascript:;" on-click="setZIndex($event, 'top')">置顶</a></li>
						        <li><a href="javascript:;" on-click="setZIndex($event, 'bottom')">置底</a></li>
						        <li></li>
						        <li><a href="javascript:;" on-click="copyLayer($event)">复制</a></li>
						        <li><a href="javascript:;" on-click="removeLayer($event)">删除</a></li>
							</ul>
						</div>
						<div class="active"></div>
						<div class="group"></div>
						<div class="mutil" ref="mutilHandle"></div>
						<div class="drag-handle" ref="dragHandle" ></div>
						<div class="resize-width"  ref="resizeWidthHandle"></div>
						<div class="resize-height" ref="resizeHeightHandle"></div>
						<div class="resize-width-height" ref="resizeWidthHeightHandle"></div>
				</div>
		`,

		computed: {},

		methods: {

			preventDefault(e) {
				return false;
			},

			setZIndex(e, type) {
				this.$root.setZIndex(type);
				return false;
			},

			copyLayer(e) {
				this.$root.copyLayer(this.get("length"));
				return false;
			},

			removeLayer(e) {
				this.$root.removeLayer(this.get("length"));
				return false;
			},

			showDetail(index, e) {

				if (e.originalEvent.button === 2) {
					return false;
				}

				e && e.stop();
				// e.originalEvent.target === this.$refs.dragHandle
				// ||
				if (e.originalEvent.target === this.$refs.mutilHandle || e.originalEvent.target === this.$refs.resizeWidthHandle || e.originalEvent.target === this.$refs.resizeHeightHandle || e.originalEvent.target === this.$refs.resizeWidthHeightHandle) {
					return;
				}

				if (e.originalEvent.metaKey === true) {
					this.$root.mutilSelect(index);
				} else {
					this.$root.showDetail(index);
					// this.$root.mutilSelect(index);
				}
				// this.$root.showDetail(index);
			},

			setOptions(options) {
				let instance = this;
				if (instance) {
					let settings = instance.get("options");
					console.log(`${this.get('name')}#setOptions before`, settings);
					FireBird.filter("defaults")(options, settings);
					console.log(`${this.get('name')}#setOptions after`, settings);
					instance.set("options", options);
				}
			},
			setAttribute(key, value) {
				return this.set(key, value);
			},
			hide() {
				this.set("")
			}
		},

		afterMount: function () {

			let me = this;
			let comp = FireBird.components[this.get("component")];

			if (!comp) {
				console.warn(`没有找到改组件的定义 ${this.get("component")}`);
				return;
			}

			if (comp.attrs.width && _.isUndefined(this.get('width'))) {
				this.set('width', comp.attrs.width.defaults);
				this.$root.set("layers." + this.get("length") + ".width", comp.attrs.width.defaults);
			}
			if (comp.attrs.height && _.isUndefined(this.get('height'))) {
				this.set('height', comp.attrs.height.defaults);
				this.$root.set("layers." + this.get("length") + ".height", comp.attrs.height.defaults);
			}
			if (comp.attrs.scale && _.isUndefined(this.get('scale'))) {
				this.set('scale', comp.attrs.scale.defaults);
				this.$root.set("layers." + this.get("length") + ".scale", comp.attrs.scale.defaults);
			}
			// if (comp.attrs.scale && _.isUndefined(this.get('scale'))) {
			// 	this.set('scale', comp.attrs.scale.defaults);
			// 	this.$root.set("layers." + this.get("length") + ".scale", comp.attrs.scale.defaults);
			// }
			// if (comp.scale && !this.get('scale')) {
			// 	this.set('scale', comp.scale);
			// }

			// if (this.get('scale') != 1) {
			// 	this.set('top', this.get('top') * this.get('scale'));
			// 	this.set('left', this.get('left') * this.get('scale'));
			// }

			// console.log("scale", this.get('scale'))

			// this.set("$class", comp);
			this.ccc = comp;

			if (comp.attrs.name && _.isUndefined(this.get('name'))) {
				this.set('name', comp.attrs.name.defaults);
				// this.$root.set("layers." + this.get("length") + ".scale", comp.attrs.scale.defaults);
			}
			// if (comp.name && !this.get('name')) {
			// 	this.set('name', comp.name);
			// }

			// let componentName = this.get("component"), Component = FireBird[componentName];
			// Component.uuid = Component.uuid || 1;
			// this.$root.context = this.$root.context || {};
			// this.instanceId = this.get("id") || componentName + "_" + FireBird[componentName].uuid++;
			// this.$root.context[this.instanceId] = this;
			// this.set("instanceId", this.instanceId);

			// console.log(`Component ${componentName} ${this.get("name")} app.context.%c%c${this.instanceId}%c#afterMount options: `, "", "color:red; font-weight: bold;", "", this.get("options"))

			let layer = this.$refs.layer;
			let $editorPanel = $(".editor-panel");
			let $menuHandle = $(me.$refs.menuHandle)


			$(this.$refs.dragHandle)
				.on(drag.types.start, function (event) {

					let scale = me.$root.get("page.scale");

					console.log(`event.button ${event.button}`)

					if (event.button === 2) {

						var mouseStartLeft = Math.round(((event.clientX - 180 - $editorPanel.scrollLeft()) / scale) - me.get("left"));
						var mouseStartTop = Math.round(((event.clientY - 90 - $editorPanel.scrollTop()) / scale) - me.get("top"));

						console.log(event.clientX, event.clientY)
						console.log(mouseStartLeft, mouseStartTop)

						$menuHandle.css({
							left: mouseStartLeft,
							top: mouseStartTop
						});

						return false;
					}
					//
					//
					// if (event.button !== 1) {
					// 	return false;
					// }

					if (!window.zIndex) {
						window.zIndex = 10000;
					}

				//	me.$root.setById(me.instanceId, "zIndex", window.zIndex++)


					drag.create(layer, event, {
						appConfig: me.$root.get(""),
						scroll: {
							left: $editorPanel.scrollLeft(),
							top: $editorPanel.scrollTop()
						},
						offset: {
							left: 150 + 15,
							top: 60 + 15
						},
						onstart: function (e, left, top) {
							me.fire("onComponentDragStart", {
								event: e, //component: me,
								index: me.get("length"),
								left: left,
								top: top
							});
						},
						onover: function (e, left, top) {
							if (isNaN(left) || isNaN(top)) {
								return;
							}
							me.fire("onComponentDragOver", {
								event: e, //component: me,
								index: me.get("length"),
								left: left,
								top: top
							});
						},
						onend: function (e, left, top) {
							me.fire("onComponentDragEnd", {
								event: e,
								component: me,
								left: left,
								top: top
							});
						}
					});
				});

			$(this.$refs.mutilHandle)
				.on(dragMutil.types.start, function (event) {

					if (!window.zIndex) {
						window.zIndex = 1000
					}

					me.$root.setById(me.instanceId, "zIndex", window.zIndex++)

					let appConfig = me.$root.get("");

					dragMutil.create(layer, event, {
						appConfig: appConfig,
						scroll: {
							left: $editorPanel.scrollLeft(),
							top: $editorPanel.scrollTop()
						},
						offset: {
							left: 150 + 15,
							top: 60 + 15
						},
						onstart: function (e, left, top, api) {
						},
						onover: function (e, left, top, api) {
							me.fire("onMutilDragOver", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								api: api
							});
						},
						onend: function (e, left, top, api) {
							me.fire("onMutilDragEnd", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								api: api
							});
						}
					});

				});

			$(this.$refs.resizeHeightHandle)
				.on(dragResize.types.start, function (event) {

					if (!window.zIndex) {
						window.zIndex = 1000
					}

					me.$root.setById(me.instanceId, "zIndex", window.zIndex++)

					let appConfig = me.$root.get("");

					drag.create(me.$refs.resizeHeightHandle, event, {
						appConfig: appConfig,
						scroll: {
							left: $editorPanel.scrollLeft(),
							top: $editorPanel.scrollTop()
						},
						offset: {
							left: 150 + 15,
							top: 60 + 15
						},
						onstart: function (e, left, top, api) {
						},
						onover: function (e, left, top, api) {
							me.fire("onResizeDragOver", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								type: "height",
								api: api
							});
						},
						onend: function (e, left, top, api) {
							me.fire("onResizeDragEnd", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								type: "height",
								api: api
							});
						}
					});
				});

			$(this.$refs.resizeWidthHandle)
				.on(drag.types.start, function (event) {

					if (!window.zIndex) {
						window.zIndex = 1000
					}

					me.$root.setById(me.instanceId, "zIndex", window.zIndex++)

					let appConfig = me.$root.get("");

					drag.create(me.$refs.resizeWidthHandle, event, {
						appConfig: appConfig,
						scroll: {
							left: $editorPanel.scrollLeft(),
							top: $editorPanel.scrollTop()
						},
						offset: {
							left: 150 + 15,
							top: 60 + 15
						},
						onstart: function (e, left, top) {
						},
						onover: function (e, left, top, api) {
							me.fire("onResizeDragOver", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								type: "width",
								api: api
							});
						},
						onend: function (e, left, top, api) {
							me.fire("onResizeDragEnd", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								type: "width",
								api: api
							});
						}
					});
				});

			$(this.$refs.resizeWidthHeightHandle)
				.on(drag.types.start, function (event) {

					if (!window.zIndex) {
						window.zIndex = 1000
					}

					me.$root.setById(me.instanceId, "zIndex", window.zIndex++)

					let appConfig = me.$root.get("");

					drag.create(me.$refs.resizeWidthHeightHandle, event, {
						appConfig: appConfig,
						scroll: {
							left: $editorPanel.scrollLeft(),
							top: $editorPanel.scrollTop()
						},
						offset: {
							left: 150 + 15,
							top: 60 + 15
						},
						onstart: function (e, left, top) {
						},
						onover: function (e, left, top, api) {
							me.fire("onResizeDragOver", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								api: api
							});
						},
						onend: function (e, left, top, api) {
							me.fire("onResizeDragEnd", {
								event: e,
								index: me.get("length"),
								left: left,
								top: top,
								api: api
							});
						}
					});
				});

		}
	});
});