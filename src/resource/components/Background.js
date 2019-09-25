/*
 This file 'Background' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {      

	/**
	 * 背景图片
	 * @type {*|undefined}
	 */
	module.exports = FireBird.component("Background", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "背景图片"
			},
			url: {
				name: "url",
				keypath: "options.url",
				defaults: ""
			},
			position: {
				name: "position",
				keypath: "options.position",
				defaults: "0 0"
			},
			repeat: {
				name: "repeat",
				keypath: "options.repeat",
				defaults: "no-repeat"
			}
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%; background: url({{options.url}}) {{options.position}} {{options.repeat}};">
				</div>
			`
	});
});