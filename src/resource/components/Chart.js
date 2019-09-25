/*
 This file 'Chart' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	var echarts = require("../libs/echarts");


	/**
	 * Chart
	 */
	module.exports = FireBird.component("Chart", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "Chart"
			},
			width: {
				name: "width",
				keypath: "width",
				defaults: 320
			},
			height: {
				name: "height",
				keypath: "height",
				defaults: 160
			},
			init: {
				name: "init",
				keypath: "options.init",
				type: "function_string",
				defaults: `//请将此块区域的内容交由专业人士编辑\n// 请在此处编辑代码， 需要返回Chart的配置\n// 此函数的描述为 fn(lastOption, thisChart, thisComponent)\noption = {\n\txAxis: {\n\t\ttype: 'category',\n\t\tdata: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']\n\t},\n\tyAxis: {\n\t\ttype: 'value'\n\t},\n\tseries: [{\n\t\tdata: [820, 932, 901, 934, 1290, 1330, 1320],\n\t\ttype: 'line'\n\t}]\n\n};\n\nreturn option;\n`
			},
			update: {
				name: "update",
				keypath: "options.update",
				type: "function_string",
				defaults: `//请将此块区域的内容交由专业人士编辑\n// 请在此处编辑代码， 需要返回Chart的配置\n// 此函数的描述为 fn(data, lastOption, thisChart, thisComponent)\noption = {\n\txAxis: {\n\t\ttype: 'category',\n\t\tdata: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']\n\t},\n\tyAxis: {\n\t\ttype: 'value'\n\t},\n\tseries: [{\n\t\tdata: [820, 932, 901, 934, 1290, 1330, 1320],\n\t\ttype: 'line'\n\t}]\n\n};\n\nreturn option;\n`
			},
			data: {
				name: "data",
				keypath: "options.data",
				type: "json_string",
				defaults: []
			},
			theme: {
				name: "theme",
				keypath: "options.theme",
				type: "select_object",
				defaults: "default",
				optional: {
					default: [
						'#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a',
						'#6e7074', '#546570', '#c4ccd3'
					],
					light: [
						'#37A2DA', '#32C5E9', '#67E0E3', '#9FE6B8', '#FFDB5C', '#ff9f7f', '#fb7293', '#E062AE',
						'#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'
					],
					dark: [
						'#dd6b66', '#759aa0', '#e69d87', '#8dc1a9', '#ea7e53', '#eedd78', '#73a373', '#73b9bc',
						'#7289ab', '#91ca8c', '#f49f42'
					]
				}
			},
			autoSize: {
				name: "autoSize",
				keypath: "options.autoSize",
				type: "boolean",
				defaults: true
			}
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%; " ref="chart"></div>
			`,

		computed: {

			"options.option": function () {
				return this.$chart.getOption() || {};
			}
		},

		watchers: {
			"width": function () {
				(this.get("options.autoSize") === true) && this.$chart && this.$chart.resize();
			},
			"height": function () {
				(this.get("options.autoSize") === true) && this.$chart && this.$chart.resize();
			},
			"options.theme": function (val) {
				this.setTheme(val);
			},

			"options.init": function (val) {
				this.setInit(val);
			},

			"options.update": function (val) {
				this.setUpdate(val);
			},

			"options.data": {
				watcher: function (val, old, keypath) {
					//if(keypath === "options.data") {
						//console.log("options.data changed", val, old)
						this.setData(val);
					//}

				},
				sync: true,
				immediate: true
			}
		},

		methods: {
			setTheme(theme) {
				this.dispose();
				this.$chart = null;
				this.init(theme);
				this.setInit(this.get("options.init"), true);
			},

			setInit(functionString) {
				try {
					var option = (new Function(functionString)).apply(this, []);
					if (option) {
						this.$chart.setOption(option);
					}
				} catch (e) {
					console.log("表格渲染有误， 请检查", e)
				}

			},
			setData(data) {

				var functionString = this.copy(this.get("options.update"), true);
				try {
					var option = (new Function("data", functionString)).apply(this, [
						data || []
					]);
					if (option) {
						this.$chart && this.$chart.setOption(option);
					}
				} catch (e) {
					console.log("表格渲染有误[setOption]， 请检查", e)
				}

			},

			setUpdate(functionString) {
				var data = this.copy(this.get("options.data", []), true);
				try {
					var option = (new Function("data", functionString)).apply(this, [
						data
					]);
					if (option) {
						this.$chart.setOption(option);
					}
				} catch (e) {
					console.log("表格渲染有误[setUpdate]， 请检查", e)
				}
			},

			init(theme) {
				if (echarts && echarts.init) {
					if (!this.$chart) {
						// this.$chart = echarts.init(this.$refs.chart, FireBird.components.Chart.attrs.theme.optional[theme || this.get("options.theme", "default")]);
						this.$chart = echarts.init(this.$refs.chart, theme || this.get("options.theme", "default"));
					}
				}
			},
			dispose() {
				this.$chart.dispose();
			}
		},

		afterMount() {
			this.init();
			if (this.get("options.init")) {
				this.setInit(this.get("options.init"), true);
			}

		}
	});
});