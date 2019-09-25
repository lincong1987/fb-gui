define(function (require, exports, module) {


	module.exports = {
		id: {
			name: "id",
			keypath: "id",
			defaults: "",
			uniq: true
		},
		name: {
			name: "name",
			keypath: "name",
			defaults: ""
		},
		partName: {
			name: "partName",
			keypath: "partName",
			defaults: ""
		},
		top: {
			name: "top",
			keypath: "top",
			type: "px",
			defaults: 0
		},
		left: {
			name: "left",
			keypath: "left",
			type: "px",
			defaults: 0
		},
		height: {
			name: "height",
			keypath: "height",
			type: "px",
			defaults: 100
		},
		width: {
			name: "width",
			keypath: "width",
			type: "px",
			defaults: 100
		},
		backgroundColor: {
			name: "backgroundColor",
			keypath: "backgroundColor",
			type: "color",
			defaults: ""
		}, // zIndex: {
		// 	name: "zIndex",
		// 	keypath: "zIndex",
		// 	defaults: 50
		// },
		scale: {
			name: "scale",
			keypath: "scale",
			defaults: 1
		},
		opacity: {
			name: "opacity",
			keypath: "opacity",
			defaults: 1
		},
		group: {
			name: "group",
			keypath: "group",
			defaults: ""
		},
		hide: {
			name: "hide",
			keypath: "hide",
			defaults: false,
			type: "boolean"
		},
		lock: {
			name: "lock",
			keypath: "lock",
			defaults: false,
			type: "boolean"
		},
		forceUpdate: {
			name: "forceUpdate",
			keypath: "forceUpdate",
			defaults: false,
			type: "boolean"
		},
		boxShadow: {
			name: "boxShadow",
			keypath: "boxShadow",
			defaults: "0px 0px 0px 0px"
		},
		tags: {
			name: "tags",
			keypath: "tags",
			defaults: ""
		},

		tag: {
			name: "tag",
			keypath: "tag",
			defaults: ""
		},

		ptag: {
			name: "ptag",
			keypath: "ptag",
			defaults: ""
		},
		
		dataFilter: {
			name: "dataFilter",
			keypath: "options.dataFilter",
			defaults: "",
			type: "function_string"
		}
	};
})

