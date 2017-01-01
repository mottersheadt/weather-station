var dependencies	= [
    'jquery', 'Py', 'angularAMD', 'custom',
    'angular-route', 'angular-cookies',// 'angular-messages',
    'angular-animate', 'angular-aria', 'bootstrap',
    'ng-file-upload', 'angular-material', 'angular-material-icons',
    'controllers/Menu',
];

define(dependencies, function (jQuery, Py, angularAMD) {
    window.dialog	= {};

    var app = angular.module("WeatherApp", ['ngRoute', 'ngCookies', 'ngAnimate', 'ngAria', 'ngMaterial', 'ngFileUpload']);
    app.config(function($sceProvider, $locationProvider, $routeProvider, $mdThemingProvider) {
        $routeProvider
            .when('/', angularAMD.route({
		templateUrl: '/views/temperature.html',
		// reloadOnSearch: false,
		controller: "TemperatureCtrl",
		controllerUrl: "controllers/Temperature",
            }))
        .otherwise({
            redirectTo: '/'
        });

        $sceProvider.enabled(false);
        $locationProvider.html5Mode(false);

        $mdThemingProvider.definePalette('black', {
            '50': '000000',
            '100': '0F0F0F',
            '200': '101010',
            '300': '1F1F1F',
            '400': '222222',
            '500': '333333',
            '600': '444444',
            '700': '555555',
            '800': '666666',
            '900': '777777',
            'A100': 'FFFFFF',
            'A200': 'EEEEEE',
            'A400': 'DDDDDD',
            'A700': 'CCCCCC',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': ['A100', 'A200', 'A400', 'A700'],
            'contrastLightColors': undefined
        });

        $mdThemingProvider.theme('blue')
        .primaryPalette('red')
        .accentPalette('grey')
        .warnPalette('black');
    });

    return app;
});
