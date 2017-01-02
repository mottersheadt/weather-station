app.controller('TemperatureCtrl', [
    '$scope', '$location',
    function ($scope, $location) {
	$scope.readableTemp = function(temp) {
	    if(!temp)
		return '...';
	    return temp.toFixed(1);
	}

	$scope.updated	= false;
        $scope.refresh	= metaRefresh($scope, {
	    "Temperature": '/currentTemperature'
        }, function(data) {
	    if( !data['Temperature'] ) {
		console.log("failed to get data", data);
		return;
	    }
	    var new_temp = $.extend( {}, data['Temperature'] );
	    var old_temp = $.extend( {}, $scope.temperature );
	    
	    if (old_temp.celcius !== new_temp.celcius) {
		$scope.updated = true;
		setTimeout(function() {
		    $scope.updated = false;
		    $scope.$apply();
		}, 500);
	    }
	    $scope.temperature    = data['Temperature'];
        });
        $scope.refresh();
	setInterval($scope.refresh, 3000);
    }
]);
