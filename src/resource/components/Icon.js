/*
 This file 'Icon' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	//require("../../common/iconfont.css");

	/**
	 * Icon 图标
	 * @type Icon
	 */
	module.exports = FireBird.component("Icon", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "Icon 图标"
			},
			value: {
				name: "value",
				keypath: "options.value",
				defaults: ""
			},
			color: {
				name: "color",
				keypath: "options.color",
				defaults: "#52FFFD"
			},
			size: {
				name: "size",
				keypath: "options.size",
				defaults: "12"
			}
		}),
		model: "options",
		template: `
				<div style="width: 100%; height:100%; ">
					<span class="icon iconfont {{options.value}}" 
						style="color: {{options.color}}; font-size: {{options.size}}px"></span>
				</div>
			`
	});
});