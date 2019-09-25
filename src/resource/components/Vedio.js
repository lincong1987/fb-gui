/*
 This file 'Vedio' is part of Firebird Integrated Solution 1.0

 Copyright (c) 2019 Lincong

 Contact:  
        Email: lincong1987@gmail.com

        QQ: 159257119
 
 See Usage at http://www.jplatformx.com/firebird

 Create date: 2019-07-24 17:32
 */

define(function (require, exports, module) {

	/**
	 * Vedio
	 * @type Vedio
	 */
	module.exports = FireBird.component("Vedio", {
		name: {
			name: "name",
			keypath: "name",
			defaults: "Vedio"
		},
		model: "options",
		propTypes: {
			options: {}
		},
		template: `
				
				<div style=" width: 100%; height:100%; ">
				<span style="color: {{options.color}}; font-size: {{options.size}}px;">{{options.value}}</span>
				</div>
				
				
			`
	});
});