/*
 This file 'Iframe' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	/**
	 * Iframe
	 * @type {*|undefined}
	 */
	module.exports = FireBird.component("Iframe", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "Iframe"
			},
			width: {
				name: "width",
				keypath: "width",
				defaults: 500
			},
			height: {
				name: "height",
				keypath: "height",
				defaults: 300
			},
			url: {
				name: "url",
				keypath: "options.url",
				defaults: ""
			},
			frameborder: {
				name: "frameborder",
				keypath: "options.frameborder",
				type: "select",
				defaults: "0",
				optional:["0", "1"]
			},
			scrolling: {
				name: "scrolling",
				keypath: "options.scrolling",
				type: "select",
				defaults: "yes",
				optional:["yes", "no", "auto"]
			},
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%; ">
				<iframe src="{{options.url}}" 
				frameborder="{{options.frameborder}}"
				scrolling="{{options.scrolling}}"
				 style="width: {{width}}px; height: {{height}}px; ">
				 <p>你的浏览器不支持 iframes.</p>
				</iframe>
				</div>
			`
	});
});