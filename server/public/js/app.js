window.Py = Pythonify;
var app = angular.module("WeatherApp", ['ngRoute']);
app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
	    templateUrl: '/views/temperature.html',
	    reloadOnSearch: false
        })
        .otherwise({
            redirectTo: '/'
        });
});

app.run([
    '$rootScope',
    function($scope) {
        $scope.$safeApply    = function(scope) {
            if(!scope)
                scope    = $scope;

            if(!scope.$$phase) {
                scope.$apply();
            }
            return scope;
        }

        function setScope(fn, scope) {
            return function() {
                return fn.apply(scope, arguments);
            };
        }

        window.$safeApply = $scope.$safeApply;
        window.$API       = loadAPI();    // uses $safeApply()
        window.$WS        = wsConnect();    // uses $safeApply()

        $scope.False      = false;
        $scope.True       = true;

        $scope.go         = function(url) {
            $redirect(url);
            $safeApply();
            console.log("going to ", url)
        }
        $scope.goBack     = function() {
            console.log("going back");
            window.history.back();
        }
        $scope.Py         = Pythonify;

        // Make inputs and textareas select text when focused
        $('body').on('keyup', 'input, textarea', function(e) {
            if ((e.keyCode ? e.keyCode : e.which) == 9)
                this.select();
        });
        $('body').on('focus', 'input, textarea', function(e) {
            this.select();
        });
    }
]);

app.filter('orderObjectBy', function() {
    return function(items, field, reverse, type) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });

        function findItem(parent, item) {
            if( typeof item == "string" && item.indexOf('.') ) {
                var list        = item.split('.')
                for(var i in list) {
                    var frag        = list[i];
                    if(typeof parent === "object" && parent !== null)
                        parent        = parent[frag];
                }
                return parent;
            }
            else
                return parent[item];
        }
        filtered.sort(function (a, b) {
            var aTest        = findItem(a, field);
            var bTest        = findItem(b, field);

            switch(type) {
            case "number":
                aTest        = Number(aTest);
                bTest        = Number(bTest);
                break;
            case "date":
                aTest        = new Date(moment(aTest));
                bTest        = new Date(moment(bTest));
                break;
            }

            var v1        = typeof aTest == "string"
                ? aTest.toLowerCase()
                : aTest;

            var v2        = typeof bTest == "string"
                ? bTest.toLowerCase()
                : bTest;
            return (v1 > v2 ? 1 : -1);
        });
        if(reverse)
            filtered.reverse();
        return filtered;
    };
});

app.directive('onEnter', function () {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.onEnter);
                    });
                    event.preventDefault();
                }
            });
        }
    };
});
