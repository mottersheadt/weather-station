define(['angularAMD'], function (angularAMD) {
    angularAMD.controller('MenuCtrl', function ($scope, $timeout, $mdSidenav, $log) {
	$scope.close = function () {
	    $mdSidenav('left').close()
		.then(function () {
		});
	};
    });
});
