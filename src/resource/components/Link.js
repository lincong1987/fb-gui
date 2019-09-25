/*
 This file 'Link' is part of Firebird Integrated Solution 1.0

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
	 * Link
	 * @type Link
	 */
	module.exports = FireBird.component("Link", {
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
				defaults: "Link"
			},
			color: {
				name: "color",
				keypath: "options.color",
				defaults: "#fff"
			},
			align: {
				name: "align",
				keypath: "options.align",
				defaults: ""
			},
			'letter-spacing': {
				name: 'letter-spacing',
				keypath: "options.letter-spacing",
				defaults: "12"
			},
			weight: {
				name: "weight",
				keypath: "options.weight",
				defaults: ""
			},
			size: {
				name: "size",
				keypath: "options.size",
				defaults: "12"
			},
			href: {
				name: "href",
				keypath: "options.href",
				defaults: ""
			},

			value: {
				name: "value",
				keypath: "options.value",
				defaults: "value"
			},
			format: {
				name: "format",
				keypath: "options.format",
				type: "function_string",
				defaults: ""
			}
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%; ">
					<a style="color: {{options.color}}; 
								text-align: {{options.align}}; 
								letter-spacing:  {{options['letter-spacing']}};
								font-family: {{options.family}}; 
								font-weight: {{options.weight}}; 
								font-size: {{options.size}}px;"
						href="{{defaultTo(options.href, 'javascript:;')}}"
					>{{options._value}}</a>
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