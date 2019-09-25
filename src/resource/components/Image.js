/*
 This file 'Image' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	/**
	 * 图片
	 * @type {*|undefined}
	 */
	module.exports = FireBird.component("Image", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "图片"
			},
			width: {
				name: "width",
				keypath: "width",
				defaults: 100
			},
			height: {
				name: "height",
				keypath: "height",
				defaults: 100
			},
			url: {
				name: "url",
				keypath: "options.url",
				defaults: ""
			},
			alt: {
				name: "alt",
				keypath: "options.alt",
				defaults: ""
			},
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%; ">
				<img src="{{options.url}}" alt="{{options.alt}}"
				 style="width: {{width}}px; height: {{height}}px; ">
				</div>
			`
	});
});