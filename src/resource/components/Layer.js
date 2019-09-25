/*
 This file 'Layer' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	/**
	 * 图层 Wrapper
	 * @type Layer
	 */
	module.exports = FireBird.component("Layer", {
		model: "options",
		template: `
				<div  
					class="layer {{hide ? 'hide' : 'show'}}"
					group="{{group}}" 
					title="{{name}} {{id}}"
					id="{{id}}" 
					width="{{width}}" 
					height="{{height}}" 
					top="{{top}}" 
					left="{{left}}" 
					zIndex="{{zIndex}}"
					length="{{length}}"
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
				</div>
		`,

		computed: {
			// instanceId: function () {
			// 	return this.instanceId;
			// }
		},

		afterMount: function () {

			// let comp = FireBird.components[this.get("component")];
			//
			// if (!comp) {
			// 	console.warn(`没有找到改组件的定义 ${this.get("component")}`);
			// 	return;
			// }
			//
			// if (comp.width && !this.get('width')) {
			// 	this.set('width', comp.width);
			// }
			// if (comp.height && !this.get('height')) {
			// 	this.set('height', comp.height);
			// }
			//
			// // if(comp.scale && !this.get('scale')) {
			// // 	this.set('scale', comp.scale);
			// // }
			//
			// // if (this.get('scale') != 1) {
			// // 	this.set('top', this.get('top') * this.get('scale'));
			// // 	this.set('left', this.get('left') * this.get('scale'));
			// // }
			//
			// // console.log("scale", this.get('scale'))
			//
			// if (comp.name && !this.get('name')) {
			// 	this.set('name', comp.name);
			// }
			//
			// let componentName = this.get("component"), Component = FireBird[componentName];
			// Component.uuid = Component.uuid || 1;
			// this.$root.context = this.$root.context || {};
			// this.instanceId = this.get("id") || componentName + "_" + FireBird[componentName].uuid++;
			// this.$root.context[this.instanceId] = this;
			// this.set("instanceId", this.instanceId);
			//
			//
			// console.log(`Component ${componentName} ${this.get("name")} app.context.%c%c${this.instanceId}%c#afterMount options: `, "", "color:red; font-weight: bold;", "", this.get("options"))


		},
		methods: {
			/**
			 * 设置某个组件的属性
			 * @param id
			 * @param options
			 */
			setOptions(options) {
				let instance = this;
				if (instance) {
					let settings = instance.get("options");
					console.log(`${this.get('name')}#setOptions before`, settings);
					FireBird.filter("defaults")(options, settings);
					console.log(`${this.get('name')}#setOptions after`, settings);
					instance.set("options", options);
				}
			}
		}
	});
});