angular.module('bagCtrl', [])
    
    .controller('mainCtrl', function($scope, $rootScope, $window, $location, $log, $document) {

        $rootScope.$on("$locationChangeStart", function(event, next, current) { 
            if ( next.substring(next.indexOf('#/')+2, next.length) === "") {
                $('#sticky-header').removeClass('header-small').addClass('header-large');
            }
            else {
                $('#sticky-header').removeClass('header-large').addClass('header-small');
            }
            $(window).scrollTop(0); // need this to force position to top of page rather than where user had scrolled on previous page
        });

        $scope.mailLink = function() {
            $window.location = "mailto:bagsintrees@mail.com?subject=Bags In Trees Are Everywhere!";
        }

    })
    .controller('mapCtrl', function($scope, $http, $q, $cookies, $window, bags) {
        var infowindowContent = '<div id="content"><div id="bodyContent"><img src="&imageurl&" width="150" height="150" ng-click="openDetail()"><br/>&caption&<br/>&user&</div></div>';
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });
        var markerTimeout;

        // obtain user's location or use default
        function establishLocation() {
            var deferred = $q.defer();
            if ($cookies && $cookies.userGeoLoc) {
                $scope.userGeoLoc = JSON.parse($cookies.userGeoLoc);
                deferred.resolve();
            }
            else {
                if (1===2 && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        setGeoLoc(position.coords.latitude, position.coords.longitude, 12);
                        deferred.resolve();
                        $cookies.userGeoLoc = JSON.stringify($scope.userGeoLoc);
                    });
                }
                else { //geolocation IS NOT available
                    setGeoLoc(42.3581, -71.0636, 14);
                    deferred.resolve();
                }
            }
            return deferred.promise;
        }

        function setGeoLoc(lat, lon, zoom) {
            $scope.userGeoLoc = {lat: lat, lon: lon, zoom: zoom};
        }
        
        buildMarker = function(data) {
            var marker = new google.maps.Marker({position: new google.maps.LatLng(data.latitude, data.longitude),
                                                    thumb: data.thumbnail_url,
                                                    user: data.user,
                                                    caption: data.caption,
                                                    id: data.id
            });
            // google.maps.event.addListener(marker, 'mouseover', function() {
            //     clearTimeout(markerTimeout);
            //     infowindow.content = infowindowContent.replace('&imageurl&', this.thumb)
            //                                           .replace('&user&', this.user)
            //                                           .replace('&caption&', this.caption);
            //     infowindow.open($scope.globalMap, this);
            // });
            google.maps.event.addListener(marker, 'click', function() {
                $scope.showMapDetail(this.id)
            });
            return marker
        }

        $scope.getAllBags = function() {
            bags.getAll(function(data) {
                $scope.bags = data;
                var markers = []
                for (var i = 0; i < data.length; i++) {
                    var marker = buildMarker(data[i]);
                    google.maps.event.addListener(marker, 'mouseout', function() {
                        markerTimeout = setTimeout(function () {infowindow.close();}, 200);
                    })
                    markers.push(marker);
                }
                var mc = new MarkerClusterer($scope.globalMap, markers);
            });
        }

        $scope.toggleMapDetail = function() {
            $('.map-detail').toggle();
        }

        $scope.showMapDetail = function(id) {
            $('.map-detail').show();
            console.log(id);
            bags.getOne(id, function(data) {
                $scope.mapDetail = data[0];
            });

        }

        $scope.showMap = function() {
            if(!$scope.globalMap) { // dont reload the map if we've already got it
                establishLocation() // get user location
                .then(function() {
                    $scope.globalMap = new google.maps.Map(document.getElementById("map-canvas"),
                        {   center: new google.maps.LatLng($scope.userGeoLoc.lat, $scope.userGeoLoc.lon),
                            zoom: $scope.userGeoLoc.zoom
                        });

                    // set user location marker
                    new google.maps.Marker({position: new google.maps.LatLng($scope.userGeoLoc.lat, $scope.userGeoLoc.lon), 
                                            map: $scope.globalMap,
                                            icon: "http://maps.google.com/mapfiles/arrow.png",
                                            animation: google.maps.Animation.DROP
                                            });
                    
                    $scope.getAllBags();
                });
            }
        }

        $scope.showMap();
    });