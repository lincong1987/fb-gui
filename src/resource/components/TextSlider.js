/*
 This file 'TextSlider' is part of Firebird Integrated Solution 1.0

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
	 * TextSlider
	 * @type TextSlider
	 */
	module.exports = FireBird.component("TextSlider", {

		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "TextSlider"
			},
			class: {
				name: "class",
				keypath: "options.class",
				defaults: ""
			},
			color: {
				name: "color",
				keypath: "options.color",
				defaults: "#ff0000"
			},
			size: {
				name: "size",
				keypath: "options.size",
				defaults: 12
			},
			max: {
				name: "max",
				keypath: "options.max",
				defaults: 3
			},
			format: {
				name: "format",
				keypath: "options.format",
				type: "function_string",
				defaults: ""
			},
		}),
		model: "options",
		template: `
				
				<div style=" width: 100%; height:100%; " class="text-slider {{options.class}}">
					<ul>
					{{#each (options._value || []):index}}
						{{#if index < options.max}}
						<li 
							style="color: {{options.color}}; font-size: {{options.size}}px"
						    on-click="click.textslider">{{(this)}}</li>
						 {{/if}}
					{{/each}}
					</ul>
				</div>
				
			`,
		computed: {
			"options._value": {
				deps: ["options.value", "options.format", "options.dataFilter"],
				get: function () {
					return this.filterChain(this.get("options.value"));
				}
			}

			// var interval = this.get("options.interval");
			// var max = this.get("options.max");
			// if (max) {
			// }
		},
		filters: {
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
						console.log("TextSilder dataFilter Error", e)
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
							console.log("TextSlider format Error", e)
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