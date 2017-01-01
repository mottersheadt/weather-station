app.controller('TemperatureCtrl', [
    '$scope', '$location',
    function ($scope, $location) {
	$scope.readableTemp = function(temp) {
	    if(!temp)
		return null;
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
