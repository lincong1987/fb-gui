/*
 This file 'Date' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	let {dayjs} = require("fb-core");


	/**
	 * 日期
	 * @type {*|undefined}
	 */
	module.exports = FireBird.component("Date", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "日期"
			},
			height: {
				name: "height",
				keypath: "height",
				type: "px",
				defaults: 25
			},
			width: {
				name: "width",
				keypath: "width",
				type: "px",
				defaults: 200
			},
			format: {
				name: "format",
				keypath: "options.format",
				defaults: "YYYY-MM-DD HH:mm:ss"
			},
			color: {
				name: "color",
				keypath: "options.color",
				defaults: "#52FFFD",
				type: "color"
			},
			size: {
				name: "size",
				keypath: "options.size",
				defaults: "18"
			},
			value: {
				name: "value",
				keypath: "options.value",
				defaults: ""
			},
			source: {
				name: "source",
				keypath: "options.source",
				type: "select",
				defaults: "now",
				optional: ["now", "value", "timestamp"]
			},
			autoUpdate: {
				name: "autoUpdate",
				keypath: "options.autoUpdate",
				type: "boolean",
				defaults: true
			}
		}),
		model: "options", // propTypes: {
		template: `
				<div style=" width: 100%; height:100%; " rel="Date Component">
					<span style="color: {{options.color}}; font-size: {{options.size}}px;">{{options.value}}</span>
				</div>
			`,

		watchers: {
			"options.autoUpdate": function (val) {
				val === true ? this.start() : this.stop();
			},
			"options.format": function (val) {
				this.stop();
				this.nextTick(function () {
					this.start();
				});
			},
			// "options._value": {
			// 	deps: ["options.value", "options.format", "options.dataFilter"],
			// 	get: function () {
			// 		return this.filterChain(this.get("options.value"));
			// 	}
			// }
		},

		methods: {

			filterChain: function (val) {
				return val;
			},

			start: function () {
				var me = this;
				var format = this.get("options.format", "");
				var value = this.get("options.value", "");
				var source = this.get("options.source", "now");
				var timestamp = this.get("options.timestamp", "");

				this._timer = setInterval(function () {
					var now = new Date().getTime();
					if (source === "now") {
						value = now;
					} else {
						value = now;
					}
					me.set("options.value", dayjs(value).format(format));
				}, 500);
			},
			stop: function () {
				clearInterval(this._timer);
			}
		},

		afterMount: function () {
			let me = this;
			this._timer = 0;
			if (me.get("options.autoUpdate") === true) {
				this.start();
			}

		}
	});
});