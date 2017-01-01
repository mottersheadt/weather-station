define(['app'], function (app) {
    app.controller('WorkOrderCtrl', [
    '$scope',        '$routeParams', '$timeout', '$mdSidenav', '$mdDialog', '$log', '$location',
    function ($scope, $routeParams,   $timeout,   $mdSidenav,   $mdDialog,   $log,   $location) {
        // -------------------------- Page Settings --------------------------

        // Page Properties
        $scope.pageTitle    = 'Work Order Overview';
        $scope.orderNumber    = $routeParams['orderNumber'];

        // Breadcrumbs
        $scope.breadcrumbs    = {
        "Work Orders": "/#/work_orders",
        };
        $scope.loaf        = $scope.orderNumber;

        // Page Navigations
        $scope.returnUrl    = $scope.breadcrumbs['Work Orders'];

        // Page Actions
        $scope.pageActions    = [{
            "label": "Chat",
            "icon": "message",
            "click": function(action) {
            }
        }, {
            "label": "Add Document",
            "icon": "file",
            "click": function(action) {
                $redirect('/work_orders/'+$scope.orderNumber+'/documents/add');
            }
        }, {
            "label": "Edit",
            "icon": "pencil",
            "click": function(action) {
                $redirect('/work_orders/'+$scope.orderNumber+'/update');
            }
        }];

        // -------------------------- Page Methods ---------------------------

        $scope.refresh    = metaRefresh($scope, {
        "WorkOrder": '/work_orders/'+$scope.orderNumber
        }, function(data) {
        if( !data['WorkOrder'] ) {
            $location.url('/work_orders');
            return;
        }

        console.log(data);
        $scope.work_order    = data['WorkOrder'];
        $scope.documents    = $scope.work_order.documents.items;
        $scope.messages        = $scope.work_order.discussion.messages;
        });
        $scope.refresh();
    }
    ]);
});
