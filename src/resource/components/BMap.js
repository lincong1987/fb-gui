/*
	 This file 'BMap' is part of Firebird Integrated Solution 1.0

	 Copyright (c) 2019 Lincong

	 Contact:
	 Email: lincong1987@gmail.com

	 QQ: 159257119

	 See Usage at http://www.jplatformx.com/firebird

	 Create date: 2019-07-24 17:32
	 */

define(function (require, exports, module) {


	/**
	 * BMap
	 * @type BMap
	 *
	 * @example
	 * <BMap top="100" left="200" />
	 */
	module.exports = FireBird.component("BMap", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "BMap"
			},
			width: {
				name: "width",
				keypath: "width",
				defaults: 800
			},
			height: {
				name: "height",
				keypath: "height",
				defaults: 600
			},
			center: {
				name: "center",
				keypath: "options.center",
				defaults: "116.404, 39.915"
			},
			zoom: {
				name: "zoom",
				keypath: "options.zoom",
				defaults: 16,
				type: "select",
				optional: _.range(1, 23)
			},
			enableScrollWheelZoom: {
				name: "enableScrollWheelZoom",
				keypath: "options.enableScrollWheelZoom",
				defaults: true,
				type: "boolean"
			},
			currentCity: {
				name: "currentCity",
				keypath: "options.currentCity",
				defaults: "",
			},
			styleId: {
				name: "styleId",
				keypath: "options.styleId",
				defaults: "20ff4a857a417e367deb0b565f75fcdd",
			}
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%;">
					<div id="{{uuid}}" style=" width: 100%; height:100%;overflow: hidden;margin:0;"></div>
				</div>
			`,

		watchers: {
			"options.zoom": function (val) {

				val = _.toInteger(val);
				if (val <= 0) {
					val = 1;
				}
				if (val > 22) {
					val = 22;
				}

				this.$map.setZoom(_.toInteger(val));
			}  ,
			"options.zoom": function (val) {

				val = _.toInteger(val);
				if (val <= 0) {
					val = 1;
				}
				if (val > 22) {
					val = 22;
				}

				this.$map.setZoom(_.toInteger(val));
			},
			"options.currentCity": function (val) {

				this.$map.setCurrentCity(val);
			},
			"options.styleId": function (val) {
				this.$map.setMapStyleV2({
					styleId: this.get(val)
				});
			}
		},

		afterMount: function () {
			var uuid = "bmap_" + new Date().getTime();
			this.set("uuid", uuid);

			this.nextTick(function () {

				var $map = this.$map = new BMap.Map(uuid);

				var center = this.get("options.center").split(",");
				
				$map.centerAndZoom(new BMap.Point(_.toNumber(center[0]), _.toNumber(center[1])), this.get("options.zoom"));


				// $map.addControl(new BMap.MapTypeControl({
				// 	mapTypes: [
				// 		BMAP_NORMAL_MAP, BMAP_HYBRID_MAP
				// 	]
				// }));
				//
				
				if (this.get("options.currentCity") != "") {
					$map.setCurrentCity(this.get("options.currentCity"));
				}

				if (this.get("options.styleId") != "") {
					$map.setMapStyleV2({
						styleId: this.get("options.styleId")
					});
				}


				// map.setMapStyleV2({
				// 	styleId: '20ff4a857a417e367deb0b565f75fcdd'
				// });

				//$map.enableScrollWheelZoom(this.get("options.enableScrollWheelZoom"));     //开启鼠标滚轮缩放
			})


		}


	});
});