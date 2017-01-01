
define(['config', "Py", "moment", "angularAMD"], function (app, Py, moment, angularAMD) {
    window.dialog    = {};
    app.run([
        '$rootScope', '$timeout', '$mdSidenav', '$mdDialog', '$mdToast', '$log', '$location', '$anchorScroll', '$cookies', 'Upload',
        function($scope, $timeout, $mdSidenav, $mdDialog, $mdToast, $log, $location, $anchorScroll, $cookies, Upload) {
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

            window.moment     = moment;
            window.Py         = Py;
            window.$safeApply = $scope.$safeApply;
            window.$API       = loadAPI();    // uses $safeApply()
            window.$WS        = wsConnect();    // uses $safeApply()
            window.$urlParams = setScope($location.search, $location);
            window.$redirect  = setScope($location.url, $location);

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
            $scope.Py         = Py;
            $scope.menuList    = function() {
                return $scope.adminMenu;
            };
            // Setup Menu right away.
            $scope.menuList();


            dialog.alertError    = function(err) {
                console.error('alertError', err);
                return $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title(err.error || err.name)
                    .textContent(err.message || err.text)
                    .ariaLabel('error message')
                    .ok('Got it!')
                );
            }
            dialog.message    = function(title, message) {
                console.log('Message dialog', title, message);
                return $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title(title)
                    .textContent(message)
                    .ariaLabel('message')
                    .ok('Got it!')
                );
            }

            // Global notification function using mdToast
            $scope.notify = function(text) {
                var toast = $mdToast.simple()
                .textContent(text)
                .action('OK')
                .highlightAction(false)
                .position('top right');
                $mdToast.show(toast).then(function(response) {
                    if ( response == 'ok' );
                });
            };
            window.$notify        = $scope.notify;

            $scope.logout        = function() {
                $API('users/logout').then(function(d) {
                    $scope.getUser().then(function(user) {
                        $redirect('/login');
                        $safeApply();
                    });
                }, function(err) {
                    $redirect('/login');
                });
            };

            var links = {
                "spacer": {
                    "spacer": true
                },
                "workOrders": {
                    "icon": "build",
                    "text": "Work Orders",
                    "href": "work_orders"
                }
            };

            $scope.adminMenu      = [
                links.workOrders,
            ];

            var breadcrumbs        = {};
            $scope.buildBreadcrumbs    = function() {
                var args        = Array.prototype.slice.call(arguments);
                for (var i in breadcrumbs)
                delete breadcrumbs[i];
                var segs        = $location.url().slice(1).split('/').slice(0,-1);
                for (var i in segs) {
                    var seg        = segs[i];
                    var p        = breadcrumbMap[seg];
                    if (p === undefined) {
                        if (Py(seg).isdigit() && args.length) {
                            // console.log(seg, Py(seg).isdigit(), args[0]);
                            p    = args.shift();
                        }
                        else
                        continue;
                    }
                    breadcrumbs[p[0]] = p[1];
                    var last    = p[0];
                }
                return breadcrumbs;
            }

            function buildToggler(navID) {
                return function() {
                    $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                    });
                }
            }
            $scope.toggleLeft    = buildToggler('left');
            $scope.closeNav    = function() {
                $mdSidenav('left').close();
            }

            // Make inputs and textareas select text when focused
            $('body').on('keyup', 'input, textarea', function(e) {
                if ((e.keyCode ? e.keyCode : e.which) == 9)
                this.select();
            });
            $('body').on('focus', 'input, textarea', function(e) {
                this.select();
            });

            $scope.timeSince    = function(d) {
                var a    = moment(d);
                var b    = moment();
                if (isNaN(a) || isNaN(b))
                return d;
                var ttypes    = ['second','minute','hour','day','week','month','year'];
                var t    = 'year';
                var n    = b.diff(a, t);
                var s    = n + ' ' + t + (n !== 1 ? 's' : '' ) + ' ago';
                for (var i=1; i<ttypes.length; i++) {
                    var t    = ttypes[i-1];
                    var nt    = ttypes[i];
                    if (a.diff(b, nt) === 0) {
                        n    = b.diff(a, t);
                        s    = n + ' ' + t + (n !== 1 ? 's' : '' ) + ' ago';
                        break;
                    }
                }
                return s;
            }
            $scope.timeLeft    = function(d) {
                var a    = moment(d);
                var b    = moment();
                if (a === NaN || b === NaN)
                return false;
                var ttypes    = ['second','minute','hour','day','week','month','year'];
                var t    = 'year';
                var n    = a.diff(b, t);
                var s    = n + ' ' + t + (n !== 1 ? 's' : '' ) + ' left';
                for (var i=1; i<ttypes.length; i++) {
                    var t    = ttypes[i-1];
                    var nt    = ttypes[i];
                    if (a.diff(b, nt) === 0) {
                        n    = a.diff(b, t);
                        s    = n + ' ' + t + (n !== 1 ? 's' : '' ) + ' left';
                        break;
                    }
                }
                return s;
            }

            window.newDate = function(d) {
                var d = d === undefined
                ? 'No Date'
                : moment(d).utc().format('LL');
                return d;
            }
            $scope.date    = newDate;

            $scope.scrollTo = {
                top: scrollToTop,
                bottom: scrollToBottom,
                left: scrollToLeft,
                right: scrollToRight,
            }

            // -- Autocomplete
            $scope.queryList    = function(query, list, exclude) {
                query        = Py(query).lower();
                list        = list || [];
                exclude        = (exclude || []).map(function(str) {return Py(str).lower();});
                var filtered    = list.filter(function(str) {
                    var str    = Py(str).lower();
                    return str.indexOf(query) !== -1 && exclude.indexOf(str) === -1;
                });
                return filtered;
            }
            // Autocomplete --


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

    app.filter('filterObject', function() {
        return function(items, search, compare) {
            var filtered    = [];
            for (var i in items) {
                var check    = compare(items[i], search);
                if (check)
                filtered.push(items[i]);
            }
            return filtered;
        };
    });

    app.directive('pageHeader', ['$rootScope', function($rootScope) {
        return {
            restrict: "E",
            scope: {
                title: '@title',
                loaf: '@loaf',
                breadcrumbs: '=breadcrumbs',
                helpCenter: '=helpCenter',
            },
            templateUrl: "/views/page-header.html",
            link: function(scope, elm, attrs, ctrl) {
                scope.toggleLeft  = $rootScope.toggleLeft;
                scope.toggleRight = $rootScope.toggleRight;
            }
        };
    }]);
    app.directive('mainContent', function() {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                actions: '=actions',
                returnUrl: '=returnurl',
                hideBtns: '=hideBtns',
                backBtn: '=backbtn',
                noPadding: '=noPadding',
            },
            templateUrl: "/views/content-left.html",
            link: function(scope, elm, attrs, ctrl) {
                $(elm).addClass('page-content-wrapper layout-column flex');
            }
        };
    });
    app.directive('warning', function() {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                actions: '=actions',
            },
            templateUrl: "/views/alert-warning.html"
        };
    });
    app.directive('iconButton', function() {
        return {
            restrict: "E",
            templateUrl: "/views/icon-btn.html",
            scope: {
                icon: '@icon',
                hoverIcon: '@hoverIcon',
            },
            link: function($scope, elm, attrs, ctrl) {
                $scope.hover      = false;
                $scope.classObj   = function() {
                    var obj       = {};
                    obj["mdi-"+$scope.icon]       = !$scope.hover;
                    obj["mdi-"+$scope.hoverIcon]  = $scope.hover;
                    return obj;
                }
            }
        };
    });

    app.directive('attributeEditor', ['$mdDialog', function($mdDialog) {
        return {
            restrict: "E",
            scope: {
                model: '=whModel'
            },
            templateUrl: "/views/templates/attribute-editor.html",
            link: function($scope, elm, attrs, ctrl) {
                $scope.$watch('model', function() {
                    $scope.attributes   = [{key:'',value:''}];
                    for(var k in $scope.model) {
                        $scope.attributes.push({key:k,value:$scope.model[k]});
                    }
                    console.log("attributes", $scope.attributes, $scope.model)
                })
                $scope.removeAttr    = function(index) {
                    $scope.attributes.splice(index, 1);
                    $scope.sync();
                }

                $scope.sync    = function(tabindex) {
                    var keys        = $scope.attributes.map(function(obj) { return obj.key; });
                    var list        = Py(keys);
                    if (list.count('') === 0) {
                        $scope.attributes.push({key:'',value:''});
                    } else if (list.count('') > 1) {
                        for (var i=1; i < list.count(''); i++) {
                            $scope.attributes.splice(list.index(''), 1);
                        }

                        var $el    = angular.element('[tabindex='+(tabindex+2)+']');
                        console.log($el);
                        $el.focus();
                    }

                    for (var i in $scope.model) {
                        delete $scope.model[i];
                    }
                    var keys        = $scope.attributes.map(function(obj) { return obj.key; });
                    var list        = Py(keys);
                    for (var i in $scope.attributes) {
                        var attr    = $scope.attributes[i];
                        attr.error    = {};
                        if (list.count(attr.key) > 1) {
                            var x                = keys.indexOf(attr.key);
                            var duplicateAttr            = $scope.attributes[x];
                            duplicateAttr.error.overwritten    = true;
                        }
                        if (['', null, undefined].indexOf(attr.key) === -1)
                        $scope.model[attr.key]    = attr.value;
                    }
                }
            }
        };
    }]);

    app.directive('presetPropertyEditor', [function() {
        return {
            restrict: "E",
            scope: {
                form: '=form',
                data: '=data',
                changedMessage: '=changedMessage',
            },
            templateUrl: "/views/preset-property-editor.html",
            link: function($scope, elm, attrs, ctrl) {
                $scope.markChange = function() {
                    $scope.changedMessage = $$scope.changedMessage;
                    $scope.changed        = true;
                }
                $scope.len = function(obj) {
                    if (!obj)
                    return 0;
                    return obj.length ? obj.length : Object.keys(obj).length;
                }
                $scope.focus = function(name) {
                    var $input            = angular.element('[name="'+name+'"]');
                    $input.focus();
                }
            }
        };
    }]);
    app.directive('whTemplate', ['$http', '$compile', function($http, $compile) {
        return {
            restrict: "E",
            scope: {
                src: '@src',
                data: '=data',
            },
            link: function($scope, elm, attrs, ctrl) {
                if (typeof $scope.data !== 'object' || $scope.data === null)
                $scope.data   = {};
                $http.get($scope.src).then(function(resp) {
                    compiled = $compile(resp.data)($scope);
                    console.log(compiled);
                    elm.append( compiled );
                });
            }
        };
    }]);
    app.directive('editForm', ['$http', '$compile', '$parse', function($http, $compile, $parse) {
        return {
            restrict: "E",
            scope: {
                src: '@src',
                data: '=data',
                url: '@saveUrl',
                post: '=postProcessor',
                success: '@success',
            },
            link: function($scope, elm, attrs, ctrl) {
                if (typeof $scope.data !== 'object' || $scope.data === null)
                $scope.data   = {};

                var buttons = [
                    '<md-input-container class="md-block">',
                    '    <md-progress-linear md-mode="indeterminate"',
                    '                     ng-show="saving"></md-progress-linear>',
                    '    <div layout="row">',
                    '     <md-button',
                    '          ng-disabled="updateDetails.$invalid"',
                    '          ng-click="saveData($event, data)"',
                    '          class="md-raised md-primary">Save</md-button>',
                    '     <span flex></span>',
                    // '  <md-button',
                    // '       ng-hide="project.archived"',
                    // '       ng-click="archiveProject()"',
                    // '       class="md-warn">Archive</md-button>',
                    // '  <md-button',
                    // '       ng-show="project.archived"',
                    // '       ng-click="unarchiveProject()"',
                    // '       class="md-primary">Unarchive</md-button>',
                    '   </div>',
                    '</md-input-container>'
                ];
                var btnHTML = buttons.join('\n');

                $http.get($scope.src).then(function(resp) {
                    elm.html( $compile(resp.data+btnHTML)($scope) );
                });

                $scope.querySearch        = function(query) {
                    console.log(query, $scope.$parent.querySearch);
                }

                $scope.saveData   = function($event, data) {
                    var $event    = eventAnimation($event);
                    $event.disable();
                    $scope.saving = true;

                    var payload   = Py(data).copy();

                    function save(data) {
                        $WS.get($scope.url, data).then(function(d, r) {
                            $scope.project        = d;
                            // $notify('Successfully saved project details for '+payload.name);
                            $event.stop();
                            $scope.saving                 = false;
                            $scope.$parent.$response      = d;
                            $parse(attrs.success)($scope.$parent);
                        });
                    }

                    console.log(payload);
                    if (typeof $scope.post === 'function')
                    $scope.post(data, function() {
                        save(data);
                    });
                    else
                    save(data);
                }
            }
        };
    }]);

    app.directive('fullHeightIframe', [function() {
        return {
            link: function(scope, elm, attrs, ctrl) {
                var $elm    = $(elm);
                var resizing    = false;
                var no_mobile    = $elm.attr('full-height-iframe') === "nomobile"
                function resize() {
                    if(no_mobile && $('html').width() < 600)
                    return;

                    resizing    = true;
                    var parent    = $elm.parents('md-content');
                    var height    = parent.height();
                    $elm.attr("height", height);
                    resizing    = false;
                }
                resize();
                window.addEventListener("resize", resize);
            }
        }
    }]);

    app.directive('timeline', [function() {
        return {
            restrict: "AE",
            scope: {
                items: '=items',
            },
            templateUrl: "/views/templates/timeline.html",
            link: function($scope, elm, attrs, ctrl) {
                var $elm = $(elm);
                var $listItems = $elm.find('li')
                // check if an element is in viewport
                // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
                function isElementInViewport(el) {
                    var rect        = el.getBoundingClientRect();
                    return (
                        rect.top   >= 0 &&
                        rect.left  >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                    );
                }
                $scope.firstDate = null;

                $scope.months = [];
                var count     = 0;
                while (count < 12) {
                    $scope.months.push(moment().month(count++).format("MMMM"));
                }

                $scope.monthsList = [
                    {
                        month: "September, 2015",
                        items: []
                    }
                ]

                function callbackFunc() {
                    for (var i = 0; i < $listItems.length; i++) {
                        if (isElementInViewport($listItems[i])) {
                            $listItems[i].classList.add("in-view");
                        }
                    }
                }

                $scope.date = newDate;
                $scope.$watch('items', function() {
                    console.log("items updated")
                    var Items = Py($scope.items||{}).values();
                    console.log("unsorted items", Items);
                    Items.sort(function(a,b) {
                        var dateA = new Date(moment(a.date));
                        var dateB = new Date(moment(b.date));
                        if( dateA > dateB ) {
                            return 1;
                        } else if (dateB > dateA) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    $scope.sortedItems = Items;
                    if(Items.length) {
                        var firstItem    = Items[Items.length-1];
                        var lastItem     = Items[0];
                        var firstMonth   = getMonth(firstItem.date);
                        var lastMonth    = getMonth(lastItem.date);
                        function getMonth(dt) {
                            return moment(dt).format("MMMM YYYY");
                        }
                        function monthsListDiff(from, to) {
                            var monthNames   = [ "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December" ];
                            var obj      = {};
                            var datFrom  = new Date('1 ' + from);
                            var datTo    = new Date('1 ' + to);
                            var fromYear = datFrom.getFullYear();
                            var toYear   = datTo.getFullYear();
                            var diffYear = (12 * (toYear - fromYear)) + datTo.getMonth();
                            for (var i   = datFrom.getMonth(); i <= diffYear; i++) {
                                var key  = (monthNames[i%12] + " " + Math.floor(fromYear+(i/12)));
                                obj[key] = {
                                    month: key,
                                    dates:[]
                                };
                            }
                            return obj;
                        }

                        var monthsList = monthsListDiff(lastMonth, firstMonth);
                        console.log("monthsList", monthsList);
                        for(var i=0; i<Items.length; i++) {
                            var item = Items[i];
                            var monthKey = getMonth(item.date);
                            monthsList[monthKey].dates.push(item);
                        }
                        $scope.monthsList = monthsList;

                    }

                    callbackFunc()
                });

                $elm.scroll(callbackFunc)
                // listen for events
                window.addEventListener("load", callbackFunc);
                window.addEventListener("resize", callbackFunc);
                window.addEventListener("scroll", callbackFunc);
            }
        }
    }]);

    app.directive('previewMedia', ['$http', '$compile', function($http, $compile) {
        return {
            restrict: "E",
            scope: {
                src: '=src',
            },
            templateUrl: "/views/templates/preview-media.html",
            link: function($scope, elm, attrs, ctrl) {
                $scope.previewUrl = function() {
                    return "/ViewerJS/#" + $scope.src.url;
                }
            }
        };
    }]);

    app.directive('matches', function() {
        return {
            restrict: "A",
            scope: {
                matches: '=matches',
            },
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$validators.matches = function(modelValue, viewValue) {
                    return modelValue === scope.matches;
                };
            }
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

    app.factory("MetaRefresh", function() {
        console.log("called metarefresh factory");
        var refreshing       = false;
        return function(fetchList, next) {
            console.log("meta refreshing", fetchList);
            refreshing       = true;
            var keys         = Py(fetchList).keys();
            var urls         = Py(fetchList).values();
            var promises     = urls.map(function(apiUrl) {
                return API(apiUrl);
            });
            return Promise.all(promises).then(function(all) {
                var data     = {};
                var resps    = {};
                for (var i in keys) {
                    var k    = keys[i];
                    resps[k] = all[i];
                    data[k]  = all[i].data;
                }
                typeof next === 'function' && next(data, resps);
                refreshing   = false;
                return Promise.resolve(all);
            });
        };
    })

    app.directive('mdTable', function () {
        return {
            restrict: 'E',
            scope: {
                headers: '=',
                content: '=',
                sortable: '=',
                filters: '=',
                customClass: '=customClass',
                thumbs:'=',
                count: '='
            },
            controller: function ($scope,$filter,$window) {
                var orderBy = $filter('orderBy');
                $scope.tablePage = 0;
                $scope.nbOfPages = function () {
                    return Math.ceil($scope.content.length / $scope.count);
                },
                $scope.handleSort = function (field) {
                    if ($scope.sortable.indexOf(field) > -1) { return true; } else { return false; }
                };
                $scope.order = function(predicate, reverse) {
                    $scope.content = orderBy($scope.content, predicate, reverse);
                    $scope.predicate = predicate;
                };
                $scope.order($scope.sortable[0],false);
                $scope.getNumber = function (num) {
                    return new Array(num);
                };
                $scope.goToPage = function (page) {
                    $scope.tablePage = page;
                };
            },
            template: angular.element(document.querySelector('#md-table-template')).html()
        }
    });

    // UNCOMMENT BELOW TO BE ABLE TO RESIZE COLUMNS OF THE TABLE

    // app.directive('mdColresize', function ($timeout) {
    //     return {
    //         restrict: 'A',
    //         link: function (scope, element, attrs) {
    //         scope.$evalAsync(function () {
    //             $timeout(function(){ $(element).colResizable({
    //             liveDrag: true,
    //             fixed: true

    //             });},100);
    //         });
    //         }
    //     }
    // });

    app.filter('startFrom',function (){
        return function (input,start) {
            start = +start;
            return input.slice(start);
        }
    });

    return angularAMD.bootstrap(app);
})
