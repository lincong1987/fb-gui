/*
 This file 'ProgressBar' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:
        Email: lincong1987@gmail.com

        QQ: 159257119

 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	let {_} = require("fb-core");

	/**
	 * ProgressBar
	 * @type {*|undefined}
	 */
	module.exports = FireBird.component("ProgressBar", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "ProgressBar"
			},
			height: {
				name: "height",
				keypath: "height",
				defaults: 10
			},
			bgColor: {
				name: "bgColor",
				keypath: "options.bgColor",
				defaults: "rgba(8,63,128,1)"
			},
			barColor: {
				name: "barColor",
				keypath: "options.barColor",
				defaults: "linear-gradient(90deg,rgba(54,127,199,1) 0%,rgba(31,232,203,1) 100%)"
			},
			value: {
				name: "value",
				keypath: "options.value",
				defaults: 0
			}
		}),
		model: "options",
		template: `
				<div style="
				width:{{width}}px;
				height:{{height}}px;
				background:{{_defaults(options.bgColor, 'rgba(8,63,128,1)')}};
				border-radius:{{radius}}px;">
					<div style="
					width:{{_precent(options.value)}};
					height:{{height}}px;
					background:{{_defaults(options.barColor, 'linear-gradient(90deg,rgba(54,127,199,1) 0%,rgba(31,232,203,1) 100%)')}}; 
					border-radius:{{radius}}px;"
					></div>
				</div>
				
			`,
		computed: {
			radius: function () {
				return this.get("height") / 2 || 6;
			}
		},
		filters: {
			_defaults: function (val, def) {
				return typeof val === "undefined" ? (typeof def === "undefined" ? "" : def) : val;
			},
			_precent: function (val) {

				if (typeof val === "undefined") {
					val = 0;
				}

				if (val - 0 > 100) {
					val = 100;
				}
				if (val - 0 < 0) {
					val = 0;
				}
				return (val + "").toString().indexOf("%") != -1 ? val : val + "%";
			}
		}
	});
});