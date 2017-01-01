var Py;
requirejs.config({
    baseURL: "js",
    // Configure Module Paths.
    paths: {
	"jquery":		"../jquery/jquery-2.2.0.min",
	"angular":		"../angularjs/1.4.8/angular.min",
	"angular-route":	"../angularjs/1.4.8/angular-route.min",
	"angularAMD":		"../angularjs/angularAMD.min",
	"angular-cookies":	"../angularjs/1.4.8/angular-cookies.min",
	"angular-animate":	"../angularjs/1.4.8/angular-animate.min",
	"angular-aria":		"../angularjs/1.4.8/angular-aria.min",
	"angular-messages":	"../angularjs/1.4.8/angular-messages.min",

	"ng-file-upload":	"../angularjs/file-upload/12.0.1/ng-file-upload.min",

	"angular-material":	"../angularjs/material/1.0.0/angular-material.min",
	"angular-material-icons":"../material-design/icons/0.6.0/angular-material-icons.min",

	"bootstrap":		"../bootstrap/3.3.6/js/bootstrap.min",
	"moment":		"../momentjs/moment",
	
	"Py":			"../pythonify/pythonify",
	"apilib":		"../apilib/whinc-apilib",
	"controllers":		"../controllers",
	"text":			"../bower_components/requirejs-plugins/lib/text",
	"json":			"../bower_components/requirejs-plugins/src/json",
	"/api":			location.origin+"/api"
    },

    // Configure non-module dependencies (mostly angular).
    shim: {
	'angular-route':	["angular"],
	"angularAMD":		["angular"],
	"angular-cookies":	["angular"],
	"angular-animate":	["angular"],
	"angular-aria":		["angular"],
	"angular-messages":	["angular"],
	"ng-file-upload":	["angular"],
	"angular-material":	["angular"],
	"angular-material-icons":["angular-material"],
	"bootstrap":		["jquery"],
	"apilib": {
	    exports: "api",
	    deps: ["jquery"]
	},
	"Py": {
	    init: function(Pythonify) {
		window.Py	= Pythonify;
	    },
	    exports: "Pythonify"
	},	
    },
    deps: ['app']
});

