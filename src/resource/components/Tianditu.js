/*
	 This file 'Tianditu' is part of Firebird Integrated Solution 1.0

	 Copyright (c) 2019 Lincong

	 Contact:
	 Email: lincong1987@gmail.com

	 QQ: 159257119

	 See Usage at http://www.jplatformx.com/firebird

	 Create date: 2019-07-24 17:32
	 */

define(function (require, exports, module) {


	/**
	 * Tianditu
	 * @type Tianditu
	 *
	 * @example
	 * <Tianditu top="100" left="200" />
	 */
	module.exports = FireBird.component("Tianditu", {
		attrs: FireBird.filters.merge({}, require("./attrs"), {
			name: {
				name: "name",
				keypath: "name",
				defaults: "Tianditu"
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
			}
		}),
		model: "options",
		template: `
				<div style=" width: 100%; height:100%;">
				</div>
			`,


	});
});