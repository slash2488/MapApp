var angularAppModule = angular.module('AppEmpatica', ['uiGmapgoogle-maps', 'ngWebSocket', 'btford.socket-io']);

angularAppModule.directive('customchart', function () {
        /*  Custom directive used for drawing Google Chart
            Params : 
            @datadownloads: data retrieve by python API , contains data downloads, it's refreshed inside the directive by $watch
            @idchart: id of the div container
            @type: indicate the google chart type (Geocode , table , are , etc..)
        */
        return {
            scope: {},
            controllerAs: 'ctrl',
            bindToController: {
                datadownloads: '=',
                idchart: '=',
                type: '='
            },
            restrict: 'E',
            transclude: true,
            template: '<div id="{{ctrl.idchart.id}}" style="width: 100%; height: 350px;"> </div>',
            controller: [
                '$scope',
                function ($scope) {
                    this.$onInit = function () {
                        console.log('Data --> ' + $scope.ctrl.datadownloads);

                        var drawChart = function (t) {
                            //chartJsonData =
                            return {
                                draw: function () {
                                    var chartJsonData = {}
                                    if (t == 'area')
                                        chartJsonData = dataAreaChart();
                                    if (t == 'region')
                                        chartJsonData = dataRegionsMap();
                                    chartJsonData
                                        .chart
                                        .draw(chartJsonData.data, chartJsonData.options)
                                }
                            }
                        }

                         //Get data and chart to draw an Area chart
                        function dataAreaChart() {
                            var area = [
                                [
                                    'Hour', 'Download'
                                ],
                                [
                                    '00', 0
                                ],
                                [
                                    '01', 0
                                ],
                                [
                                    '02', 0
                                ],
                                [
                                    '03', 0
                                ],
                                [
                                    '04', 0
                                ],
                                [
                                    '05', 0
                                ],
                                [
                                    '06', 0
                                ],
                                [
                                    '07', 0
                                ],
                                [
                                    '08', 0
                                ],
                                [
                                    '09', 0
                                ],
                                [
                                    '10', 0
                                ],
                                [
                                    '11', 0
                                ],
                                [
                                    '12', 0
                                ],
                                [
                                    '13', 0
                                ],
                                [
                                    '14', 0
                                ],
                                [
                                    '15', 0
                                ],
                                [
                                    '16', 0
                                ],
                                [
                                    '17', 0
                                ],
                                [
                                    '18', 0
                                ],
                                [
                                    '19', 0
                                ],
                                [
                                    '20', 0
                                ],
                                [
                                    '21', 0
                                ],
                                [
                                    '22', 0
                                ],
                                ['23', 0]
                            ];
                            _.forEach($scope.ctrl.datadownloads.data, function (value) {
                                area[moment(value.download_at).hour() + 1][1] = area[moment(value.download_at).hour() + 1][1] + 1;
                            });
                            var data = google
                                .visualization
                                .arrayToDataTable(area);

                            var options = {
                                title: 'Downloads overview by Time',
                                width: '1000',
                                hAxis: {
                                    title: 'Hour',
                                    titleTextStyle: {
                                        color: '#333'
                                    }
                                },
                                vAxis: {
                                    minValue: 0
                                }
                            }
                            var chart = new google
                                .visualization
                                .AreaChart(document.getElementById($scope.ctrl.idchart.id));
                            return { data: data, options: options, chart: chart };
                            //chart.draw(data, options);

                        };

                        //Get data and chart to draw a region chart
                        function dataRegionsMap() {
                            var region = {
                                'Country': 'Popularity'
                            };
                            _.forEach($scope.ctrl.datadownloads.data, function (value) {
                                var c = _.find(region, function (val, k) {
                                    return k == value.country;
                                });
                                if (c)
                                    region[value.country] = region[value.country] + 1;
                                else
                                    region[value.country] = 1;
                            }
                            );
                            region = _.transform(region, function (result, value, key) {
                                result.push([
                                    '' + key,
                                    '' + value
                                ]);
                            }, [])
                            console.log('Region ' + region);
                            var data = google
                                .visualization
                                .arrayToDataTable(region);

                            var options = {};
                            var chart = new google
                                .visualization
                                .GeoChart(document.getElementById($scope.ctrl.idchart.id));

                            return { data: data, options: options, chart: chart };
                            //chart.draw(data, options);
                        }

                        google
                            .charts
                            .setOnLoadCallback(drawChart($scope.ctrl.type.t).draw);

                         // Set a watch to redraw charts wnere downloads are update
                        $scope.$watch('ctrl.datadownloads', function (newValue, oldValue) {
                            drawChart($scope.ctrl.type.t).draw();
                        }, true);
                    }
                }
            ]
        };
    })
    .factory('socketService', function (socketFactory, $interval) {
        /*
            Service used for manage the polling between client and server
            Send a message into the server every 20 seconds with the number of downloads in the client
        */
        var socket = socketFactory({
            ioSocket: io.connect('http://localhost:5000/poll')
        });
        socket.forward('error');
        var send_message_data = {};
        var setInterval = function () {
            $interval(function () {
                console.log('SocketIO Emit : ' + send_message_data);
                socket.emit('send_message', { message: send_message_data });
            }, 20000);
        };

        return {
            getSocket: function () {
                return socket
            },
            setInterval: function () {
                return setInterval();
            },
            set_send_message_data: function (data) {
                send_message_data = data;
            }
        };
    })
    .factory('APIService', [
        '$http',
        '$q',
        function ($http, $q) {
            //Generic method to send http request
            var apiCall = function (url, method, headers, params) {
                var deferred = $q.defer();
                $http({ method: method, url: url, headers: headers, params: params }).then(function (result) {
                    console.log(result.data);
                    deferred.resolve(result.data);
                }, function (data) {
                    console.log('Error: ' + data);
                    deferred.reject('Error: ' + data);
                });
                return deferred.promise;
            };

            return {
                refreshAll: function () {
                    return apiCall('http://localhost:5000/downloads', 'GET', {
                        'Content-Type': 'application/json'
                    }, null);
                },
                syncMarker: function (limit) {
                    return apiCall('http://localhost:5000/last_download', 'GET', {
                        'Content-Type': 'application/json'
                    }, { 'limit': limit });
                }
            }
        }
    ])
    .config(function (uiGmapGoogleMapApiProvider) {
        google
            .charts
            .load('current', {
                'packages': ['geochart', ['corechart']
                ],
                'mapsApiKey': 'AIzaSyDt49WErKjs-l953nhJj-tExdhmF5yA64A'
            });
        uiGmapGoogleMapApiProvider.configure({ key: 'AIzaSyDt49WErKjs-l953nhJj-tExdhmF5yA64A', v: '3.20', libraries: 'weather,geometry,visualization' });
    })
    .controller('AppController', [
        '$scope',
        'uiGmapGoogleMapApi',
        '$http',
        'socketService',
        'APIService',
        function ($scope, uiGmapGoogleMapApi, $http, socketService, APIService) {
            $scope.markers = [];
            $scope.markerControl = {};
            $scope.Map = null;
            $scope.dataDownloads = {
                data: []
            };

            //Ued for manage the two tabs Map & Dashboards
            $scope.tab = {
                'map': {
                    class: 'active'
                },
                'stats': {
                    class: ''
                }
            };
            $scope.map = {
                dragging: false,
                center: {
                    latitude: 45,
                    longitude: -73
                },
                zoom: 2
            };

            $scope.setTabActive = function (tab) {
                $scope.tab = _.mapValues($scope.tab, function (value, key) {
                    return key != tab
                        ? {
                            class: ''
                        }
                        : {
                            class: 'active'
                        };
                });
                //$scope.tab[tab].class= 'active';
            }

            socketService
                .getSocket()
                .forward('refreshMap', $scope);
            /*  
                Setup an entry point for Messages from server
                When client send the current status 
            */
            $scope.$on('socket:refreshMap', function (ev, data) {
                console.log(data.refresh);
                 // If server data is less than client data I refresh all map for test purpose 
                if (data.refresh < 0) {
                    APIService
                        .refreshAll()
                        .then(function (result) {
                            $scope.dataDownloads.data = result;
                            console.log('Refresh All marker on the map!');
                            $scope
                                .markerControl
                                .clean();
                            _.forEach(result, function (value) {
                                $scope
                                    .markers
                                    .push({
                                        id: value.latitude + value.longitude,
                                        latitude: value.latitude,
                                        longitude: value.longitude,
                                        title: value.download_at,
                                        events: {
                                            click: function (marker, event, data) {
                                                //alert(moment(value.download_at).format());
                                            },
                                            mouseover: function () { }
                                        }
                                    });
                            });
                            socketService.set_send_message_data($scope.markers.length);;
                        })
                } else if (data.refresh > 0) {
                    // If server data is much than client data I add only the last data downloads
                    APIService
                        .syncMarker(data.refresh)
                        .then(function (result) {
                            console.log('Add Marker!');
                            //$scope.markerControl.clean();

                            _.forEach(result, function (value) {
                                $scope
                                    .dataDownloads
                                    .data
                                    .push(value);
                                $scope
                                    .markers
                                    .push({
                                        id: value.latitude + value.longitude,
                                        latitude: value.latitude,
                                        longitude: value.longitude,
                                        title: value.download_at,
                                        events: {
                                            click: function (marker, event, data) {
                                                alert(moment(value.download_at).format('L'));
                                            },
                                            mouseover: function () { }
                                        }
                                    });
                            });
                            socketService.set_send_message_data($scope.markers.length);
                        })
                }

            });
            /* 
                When the map is ready I read all data from server and I add al markers on the map
                Plus I set the intervall wich I poll the server every 20 second, and i set the length of data downloads
            */
            uiGmapGoogleMapApi.then(function (maps) {
                $scope.Map = maps;
                socketService.set_send_message_data($scope.markers.length);
                socketService.setInterval();
                APIService
                    .refreshAll()
                    .then(function (result) {
                        console.log('Refresh All marker on the map!');
                        $scope.dataDownloads.data = result;
                        //$scope.lastSync =  moment().valueOf();
                        _.forEach(result, function (value) {
                            $scope
                                .markers
                                .push({
                                    id: value.latitude + value.longitude,
                                    latitude: value.latitude,
                                    longitude: value.longitude,
                                    title: value.download_at,
                                    events: {
                                        click: function (marker, event, data) {
                                            alert(moment(value.download_at).format());
                                        },
                                        mouseover: function () { }
                                    }
                                });
                        });
                        socketService.set_send_message_data($scope.markers.length);
                    })

            })
        }
    ]);