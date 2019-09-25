/*
 This file 'ColorCard' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	/**
	 * 色块
	 * @type {*|undefined}
	 */
	module.exports = FireBird.component("ColorCard", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "色块"
			},
			radius: {
				name: "radius",
				keypath: "options.radius",
				type: "px",
				defaults: 0
			},
			color: {
				name: "color",
				keypath: "options.color",
				defaults: "blue",
				type: "color"
			},
			border: {
				name: "border",
				keypath: "options.border",
				defaults: "none"
			}
		}),
		model: "options",
		template: `
				<div style="
				 width: 100%; 
				 height:100%;
				  background: {{options.color}};
				  border: {{options.border}};
				  border-radius: {{_defaults(options.radius, 0)}}px;
				  "> 
				</div>
			`,
		filters: {
			_defaults: function (val, def) {
				debugger
				return typeof val === "undefined" ? (typeof def === "undefined" ? "" : def) : val;
			}
		}
	});
});