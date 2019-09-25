/*
 This file 'ArrowLeft' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	/**
	 * ProgressCircle
	 * @type {*|ProgressCircle}
	 */
	module.exports = FireBird.component("ProgressCircle", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "ProgressCircle"
			},
			width: {
				name: "width",
				keypath: "width",
				defaults: 50
			},
			height: {
				name: "height",
				keypath: "height",
				defaults: 50
			},
			barColor: {
				name: "barColor",
				keypath: "options.barColor",
				defaults: "#00D486"
			},
			bgColor: {
				name: "bgColor",
				keypath: "options.bgColor",
				defaults: "#083F80"
			},
			barColor: {
				name: "barColor",
				keypath: "options.barColor",
				defaults: "#00D486"
			},
			duration: {
				name: "duration",
				keypath: "options.duration",
				defaults: 1000
			},
			delay: {
				name: "delay",
				keypath: "options.delay",
				defaults: 200
			},
			timeFunction: {
				name: "timeFunction",
				keypath: "options.timeFunction",
				defaults: "cubic-bezier(0.99, 0.01, 0.22, 0.94)"
			},
			isAnimation: {
				name: "isAnimation",
				keypath: "options.isAnimation",
				type: "boolean",
				defaults: false
			},
			radius: {
				name: "radius",
				keypath: "options.radius",
				defaults: 20
			},
			value: {
				name: "value",
				keypath: "options.value",
				defaults: 0
			},
		}),
		model: "options",
		template: `
			<div style="width:{{width}}px; height:{{width}}px;">
				<svg style="transform: rotate(-90deg)" 
					width="{{width}}" 
					height="{{width}}"
				    xmlns="http://www.w3.org/2000/svg">
				  <circle 
				    r="{{(width - _defaults(options.radius, 20)) / 2}}"
					cy="{{width/2}}"
					cx="{{width/2}}"
					stroke-width="{{_defaults(options.radius, 20)}}"
					stroke="{{_defaults(options.bgColor, '#083F80')}}"
					fill="none"
				  />
				   
				  <circle  
				    ref="bar"
				    r="{{(width - _defaults(options.radius, 20)) / 2}}"
					cy="{{width / 2}}"
					cx="{{width / 2}}"
					stroke="{{_defaults(options.barColor, '#00D486')}}"
					stroke-width="{{_defaults(options.radius, 20)}}"
					stroke-linecap="{{_defaults(options.isRound, false) ? 'round' : 'square'}}"
					stroke-dasharray="{{(width - _defaults(options.radius, 20)) * 3.14}}"
					stroke-dashoffset="{{_defaults(options.isAnimation, false) ? ((width - _defaults(options.radius, 20)) * 3.14) : ((width - _defaults(options.radius, 20)) * 3.14 * (100 - _defaults(options.value, 0)) / 100)}}"
					fill="none"
				  />
				</svg>
			  </div>
			`,
		filters: {
			_defaults: function (val, def) {
				return typeof val === "undefined" ? (typeof def === "undefined" ? "" : def) : val;
			}
		},
		computed: {
			// dashoffset: function () {
			// 	var dashoffset = 0,
			// 		width = this.get("width"),
			// 		options = this.get("options");
			// 	if (options.isAnimation) {
			// 		dashoffset = (width - options.radius) * 3.14;
			// 	}else{
			// 		dashoffset = (width - options.radius) * 3.14 * (100 - options.value) / 100
			// 	}
			// 	console.log("dashoffset", dashoffset)
			// 	return dashoffset;
			// }
		},


		beforeCreate() {
		},
		afterCreate() {
		},
		beforeDestroy() {
		},
		afterMount() {

		}
	});
});