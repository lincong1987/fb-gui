/*
 This file 'Text' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	var {_, $, FireBird, dayjs} = require("fb-core");

	/**
	 * 文本
	 * @type Text
	 */
	module.exports = FireBird.component("Text", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			height: {
				name: "height",
				keypath: "height",
				type: "px",
				defaults: 20
			},
			name: {
				name: "name",
				keypath: "name",
				defaults: "文本"
			},
			align: {
				name: "align",
				keypath: "options.align",
				type: "select",
				defaults: "left",
				optional: ["left", "center", "right"]
			},
			color: {
				name: "color",
				keypath: "options.color",
				defaults: "#52FFFD",
				type: "color"
			},
			family: {
				name: "family",
				keypath: "options.family",
				defaults: ""
			},
			weight: {
				name: "weight",
				keypath: "options.weight",
				type: "select",
				defaults: "normal",
				optional: ["normal", "bold", "bolder", "lighter", "100", "200", "300", "500", "600", "800", "900"]
			},
			style: {
				name: "style",
				keypath: "options.style",
				type: "select",
				defaults: "normal",
				optional: ["normal", "italic", "oblique"]
			}, // display: {
			// 	name: "display",
			// 	keypath: "options.display",
			// 	defaults: ""
			// },
			value: {
				name: "value",
				keypath: "options.value",
				defaults: "文本"
			},
			format: {
				name: "format",
				keypath: "options.format",
				type: "function_string",
				defaults: ""
			},
			'letter-spacing': {
				name: 'letter-spacing',
				keypath: "options.letter-spacing",
				defaults: "12"
			},
			size: {
				name: "size",
				keypath: "options.size",
				defaults: "18"
			}
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%; ">
					<span style="
					width: 100%; height:100%;
					color: {{options.color}}; 
					font-size: {{options.size}}px;
					text-align: {{options.align}}; 
					letter-spacing:  {{options['letter-spacing']}};
					font-family: {{options.family}};
					font-style: {{options.style}}; 
					font-weight: {{options.weight}}; 
					vertical-align: text-top;
					display: {{options.display}};
					font-size: {{options.size}}px;">{{options._value}}</span>
				</div>
			`,
		computed: {
			"options.display": function () {
				return typeof this.get("options.align") === "undefined" ? "" : "inline-block";
			},
			"options._value": {
				deps: ["options.value", "options.format", "options.dataFilter"],
				get: function () {
					return this.filterChain(this.get("options.value"));
				}
			}
		},
		watchers: {
			// "options.value": function (val) {
			// 	return val;
			// }
		},
		methods: {
			filterChain: function (val) {

				val = this.dataFilter(val);
				val = this.stringFormat(val);

				return val;

			},

			dataFilter: function (val) {
				var dataFilter = _.trim(this.get("options.dataFilter", ""));

				if (dataFilter != "") {
					try {
						val = (new Function("value", "lodash", "FireBird", "dayjs", dataFilter)).apply(this, [
							val, _, FireBird, dayjs
						]);
					} catch (e) {
						console.log("Text dataFilter Error", e)
					}
				}

				return val;
			},


			stringFormat: function (val) {

				var format = _.trim(this.get("options.format", ""));

				if (format != "") {

					if (format.indexOf("return ") != -1) {
						try {
							val = (new Function("value", "lodash", "FireBird", "dayjs", format)).apply(this, [
								val, _, FireBird, dayjs
							]);
						} catch (e) {
							console.log("Text format Error", e)
						}
					} else {
						val = format.replace(/\{0\}/g, val);
					}

				}

				return val;

			}
		}
	});
});