define(['app'], function (app) {
    app.controller('TemperatureCtrl', [
	'$scope',        '$routeParams', '$timeout', '$mdSidenav', '$mdDialog', '$log', '$location',
	function ($scope, $routeParams,   $timeout,   $mdSidenav,   $mdDialog,   $log,   $location) {
            // -------------------------- Page Settings --------------------------

            // Page Properties
            $scope.pageTitle    = 'Temperature';
	    
            // Breadcrumbs
            $scope.breadcrumbs    = {
            };
            // $scope.loaf        = null;

            // Page Navigations
            // $scope.returnUrl    = "/";

            // Page Actions
            // $scope.pageActions    = [{
            //     "label": "Chat",
            //     "icon": "message",
            //     "click": function(action) {
            //     }
            // }, {
            //     "label": "add file",
            //     "icon": "file",
            //     "click": function(action) {
            //     }
            // }, {
            //     "label": "edit",
            //     "icon": "pencil",
            //     "click": function(action) {
            //     }
            // }];

            // -------------------------- page methods ---------------------------

	    $scope.readableTemp = function(temp) {
		return temp.toFixed(1);
	    }
	    
            $scope.refresh    = metaRefresh($scope, {
		"Temperature": '/currentTemperature'
            }, function(data) {
		if( !data['Temperature'] ) {
		    console.log("failed to get data", data);
		    return;
		}
		$scope.temperature    = data['Temperature'];
            });
            $scope.refresh();
	}
    ]);
});
