/*
 This file 'resize' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 13:25
 */

define(function (require, exports, module) {

	let {$} = require("fb-core"),
		timer,
		x = 1920,
		y = 1080,
		$win = $(window),
		$body = $("body"),
		$app = $('#app');

	// "use strict";
	var setWidth = function (_x) {
		var ratio = $win.width() / x;
		$body.css({
			transform: 'scale(' + ratio + ')',
			transformOrigin: 'center top',
		});
	};

	var setScale = function (_x, _y) {

		if(typeof _x !== "undefined") {
			x = _x;
		}
		if(typeof _y !== "undefined"){
			y = _y;
		}

		var scale = ($win.width() / x);// * 0.89;
		// if ($win.height() < y) {
		// 	scale = 1;
		// }
		$app.css({
			
			"transform": "scale(" + scale + ", " + scale + ")",
			width: x,
			height: y,
			transformOrigin: 'top left'
			//zoom: (scale*100)+"%"
			// left: "50%",
			// top: "50%",
			// marginTop: -(y / 2),
			// marginRight: 0,
			// marginBottom: 0,
			// marginLeft: -(x / 2)
			/* 水平居中 */
			// textAlign: "center"
		});
	};


	$win.on("resize.setScale", function () {
		clearTimeout(timer);
		timer = setTimeout(function () {
			setScale();
			//setWidth();
		}, 1000);
	});

	// setWidth();
	

	module.exports = {
		setScale: setScale,
		setWidth: setWidth
	};
});