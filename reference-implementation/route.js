var _randomizeETATypes = false;
var _useStopMarkers = true;
var _useMultiColorMarkers = true;
var ETATypes = {
    Estimates: 1,
    Schedules: 2,
    SchedulesWithEstimates: 3
};
function Route(route) {
    this.RouteID = route.RouteID;
    this.Description = route.Description;
    this.ETATypeID = route.ETATypeID;
    //This is for testing of different ETA Types
    if (_randomizeETATypes) {
        if (route.RouteID % 3 === 0) {
            this.ETATypeID = ETATypes.Estimates;
        }
        else if (route.RouteID % 3 == 1) {
            this.ETATypeID = ETATypes.Schedules;
        }
        else if (route.RouteID % 3 == 2) {
            this.ETATypeID = ETATypes.SchedulesWithEstimates;
        }
    }
    //this.ETATypeID = ETATypes.SchedulesWithEstimates;
    this.Latitude = route.MapLatitude;
    this.Longitude = route.MapLongitude;
    this.Zoom = route.MapZoom;
    this.Color = (route.MapLineColor === null || route.MapLineColor === '' ? '#00CDCD' : route.MapLineColor);
    this.ShowRouteArrows = route.ShowRouteArrows;
    this.ShowPolygon = route.ShowPolygon;
    this.EncodedPolyline = null;
    if (typeof route.EncodedPolyline != 'undefined' && route.EncodedPolyline != null && route.EncodedPolyline != '')
        this.EncodedPolyline = route.EncodedPolyline;

    this.ShowRouteLines = (route.HideRouteLine ? false : _showRouteLines);
    this.InfoText = route.InfoText;
    this.StopTimesPDFLink = route.StopTimesPDFLink;
    this.IsCheckedOnMap = route.IsCheckedOnMap;
    this.IsCheckLineOnlyOnMap = route.IsCheckLineOnlyOnMap;
    this.Landmarks = [];
    this.RouteStops = [];
    this.LineItem = null;
    this.ArrivalsTable = null;
    this.NoVehiclesOnRouteTable = null;
    this.Visible = false;
    this.ShowOpenByDefault = false;
    this.VehiclesVisible = true;
    this.OnSchedule = false;
    this.InActiveRouteGroup = false;
    if (!_useStopMarkers)
        this.StopsMarkerManager = new MarkerManager(_map, { borderPadding: 50, maxZoom: 20, trackMarkers: true });
    this.StopMarkers = [];
    this.Vehicles = [];

    /**
    * Creates this route's line item for the routes menu.
    * saves to this.LineItem - jQuery parseHTML() object - html is convert to DOM objects and returned
    * @return {null} 
    */
    buildRouteLineItem = function() {
        this.LineItem = null;
        var milliseconds = new Date().getTime();
        var noSubscriptClass = '';

        //set class if no subscript (InfoText)
        if (this.InfoText.length === 0) {
            noSubscriptClass = 'noSubscript';
        }

        var li_html = '<li class="route hidden" id="route' + this.RouteID + '" rel="' + this.RouteID + '">' +
                            '<div class="routeHeader ' + noSubscriptClass + '" rel="' + this.RouteID + '">' +
                                '<span class="toggleRouteBtn" title="Show Route ' + this.Description + ' On Map" rel="' + this.RouteID + '" aria-label="Show Route ' + this.Description + ' On Map" tabindex="-1"><span class="iconColor" style="background-color:' + this.Color + ';"></span></span>' +
                                '<div class="routeTitle">' +
                                    '<h3 class="title">' + this.Description + '</h3>' +
                                    '<p class="routeSubscript">';
        if (this.InfoText.length > 0) {
            li_html += this.InfoText;
        }
        li_html += '</p>' +
                                    '</div>' +
                                '<a class="detailsBtn" href=""><span>Details</span></a>' +
                                '<div class="clearfix"></div>' +
                            '</div>' +
                            '<div class="routeContent" rel="' + this.RouteID + '">';
        li_html += '<div class="arrivalTimes">';
        li_html += this.NoVehiclesOnRouteTable;
        li_html += this.ArrivalsTable;
        li_html += '</div>';
        if (this.StopTimesPDFLink !== null && this.StopTimesPDFLink !== '') {
            li_html += '<div class="moreInfo"><a href="' + this.StopTimesPDFLink + '?dt=' + milliseconds + '">' + _routeMoreInfoVerbiage + '</a></div>';
        }
        li_html += '<div class="clearfix"></div>' +
                            '</div>' +
                        '</li>';

        //Get rid of the ArrivalsTable property after we have used it...
        delete this.ArrivalsTable;
        delete this.NoVehiclesOnRouteTable;

        this.LineItem = $.parseHTML(li_html);
    };

    //This will add Landmarks to the Route Object
    buildRouteLandmarks = function(landmarks) {
        route = this;
        $.each(landmarks, function(index, landmark) {
            var boxText = $('<div/>', {});
            boxText.html('<div class="infoBoxInner"><b>' + landmark.Label + '<\/b><\/div>');
            boxText.css('padding', '0px 0px 8px 8px');
            boxText.css('background', 'url(Images/GoogleMaps/point_bottom_left.png) no-repeat bottom left');
            var myOptions = {
                content: $('<P>').append(boxText.clone()).html(),
                zIndex: null,
                boxStyle: {
                    opacity: 0.75,
                    'class': 'landmark-infobox'
                },
                disableAutoPan: true,
                position: new google.maps.LatLng(landmark.Latitude, landmark.Longitude),
                closeBoxURL: '',
                isHidden: true,
                pixelOffset: new google.maps.Size(0, -30),
                pane: 'floatPane',
                enableEventPropagation: true
            };
            var label = new InfoBox(myOptions);
            label.open(_map);
            route.Landmarks.push(label);
        });
    };
    buildNoVehiclesOnRouteTable = function() {
        if (!this.HasVehiclesOnRoute()) {
            this.NoVehiclesOnRouteTable = '<p class="noVehiclesOnRoute" routeid="' + this.RouteID + '">No Vehicles On Route</p>';
        }
        else {
            this.NoVehiclesOnRouteTable = '';
        }

    };

    /**
    * This will build all of the Stops for a Route Menu
    * Saves to this.ArrivalsTable
    * @param  {array} stops array of stops
    * @param  {int} etaTypeID
    * @param  {obj} etaTypes possible eta types mapped with ID (for easy comparison with etaTypeID)
    * @param  {boolean} fluidRouteTable Config value, true if we want the table to not be restricted to 100% of the side panel
    * @return {null}
    */
    buildRouteStopArrivalsTable = function(stops, etaTypeID, etaTypes, fluidRouteTable) {
        fluidRouteTable = (typeof fluidRouteTable === 'undefined') ? false : fluidRouteTable;

        var route = this;
        var tableStops = []; //array of table stops
        var points = []; //points on the map
        var fluidRouteClass = (fluidRouteTable ? 'fluidRouteTable' : '');
        var encodedPolyline = this.EncodedPolyline;
        if (encodedPolyline != null)
            points = google.maps.geometry.encoding.decodePath(this.EncodedPolyline);

        //create array of stops
        $.each(stops, function(index, stop) {
            //Add Stop to the table if we are okay to show this Stop
            //10-27-14 BH Show stops if we are on the Dispatch Map if their Max Zoom Level is 1
            if (stop.ShowDefaultedOnMap || (typeof _isDispatchMap != 'undefined' && _isDispatchMap && stop.MaxZoomLevel == 1)) {
                tableStops.push({
                    stopID: stop.RouteStopID,
                    description: stop.Description
                });
                if (typeof _isDispatchMap != 'undefined' && _isDispatchMap)
                    _onTimeRouteStopIDs.push(stop.RouteStopID);
            }
            //Get each of the points for the stop
            if (encodedPolyline == null) {
                if (stop.MapPoints.length > 0) {
                    $.each(stop.MapPoints, function(pointIndex, point) {
                        points.push(new google.maps.LatLng(point.Latitude, point.Longitude));
                    });
                }
            }
            //Add to Route object
            var newStop = { RouteID: stop.RouteID,
                RouteStopID: stop.RouteStopID,
                Description: stop.Description,
                AddressID: stop.AddressID,
                TextingKey: stop.TextingKey,
                ShowArrivalsOnMap: stop.ShowEstimatesOnMap,
                Latitude: stop.Latitude,
                Longitude: stop.Longitude,
                Zoom: (stop.MaxZoomLevel === null || stop.MaxZoomLevel <= 0 || stop.MaxZoomLevel > 20 ? 1 : stop.MaxZoomLevel)
            };
            route.RouteStops.push(newStop);
            //Create a Stop Marker
            if (newStop.Latitude !== 0 && newStop.Longitude !== 0) {
                route.StopMarkers.push(buildStopMarker(newStop, route));
            }
        });


        var table_html = '  <table routeID="' + this.RouteID + '" ETATypeID="' + this.ETATypeID + '" class="arrivals ' + fluidRouteClass + '" style="display:none;">';
        if (_arrivalOrder === 'Bus' && etaTypeID === etaTypes.Estimates) {
            table_html += '<thead>' +
                                '<tr class="busNames">' +
                                    '<th class="headLabel"><span>Bus:</span></th>' + //other header columns gets filled in later with buildArrivalsVehicleColumn()
                                '</tr>';
            if (_showVehicleCapacitiesInRealTime)
                table_html += '<tr class="vehicleCapacity">' +
                                    '<th class="headLabel"><span>Capacity:</span></th>' + //other header columns gets filled in later with buildArrivalsVehicleColumn()
                                '</tr>';
            table_html += '</thead>';
        }
        //
        else if (_arrivalOrder == 'Time' && etaTypeID === etaTypes.Estimates && _showArrivalColumnHeaders === true) {
            table_html += '<thead >' +
                '<tr>' +
                '<th><span>' + config.ScheduleColumnDescription + ':</span></th>' +
                buildScheduleHeaderColumns.call(route) +
                '</tr>' +
                '</thead>';
        }
        else if (_showArrivalColumnHeaders == true
            && (etaTypeID === ETATypes.Schedules
                || etaTypeID === ETATypes.SchedulesWithEstimates)) {
            table_html += '<thead >' +
                '<tr>' +
                '<th><span>' + config.ScheduleColumnDescription + ':</span></th>' +
                buildScheduleHeaderColumns.call(route) +
                '</tr>' +
                '</thead>';
        }
        table_html += '<tbody>';

        $.each(tableStops, function(index, tableStop) {//Add stops
            table_html += '<tr routeStopID="' + tableStop.stopID + '">' +
                                        '<td class="stopName" routeStopID="' + tableStop.stopID + '" title="' + tableStop.description + '"><span>' + tableStop.description + '</span></td>';
            table_html += buildScheduleColumns.call(route, tableStop); //builds schedule columns (if any - if we use vehicle columns instead that will be done later in init)
            table_html += '</tr>';
            //'<td class="time">Arriving</td>'+
            //'<td class="time">10 min</td>'+
        });
        table_html += '</tbody>' +
                            '</table>';

        var icons = null;
        if (this.ShowRouteArrows)
            icons = [{ icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                strokeColor: config.RouteArrowStrokeColor,
                strokeOpacity: config.RouteArrowOpacity,
                strokeWeight: config.RouteArrowStrokeWeight,
                fillColor: this.Color,
                fillOpacity: config.RouteArrowOpacity,
                scale: config.RouteArrowScale
            },
                repeat: config.RouteArrowRepeat,
                offset: config.RouteArrowOffset
}];
        var line = new google.maps.Polyline({ map: _map, path: points, strokeColor: this.Color, strokeWeight: _polyLineSize, strokeOpacity: _polyLineOpacity, icons: icons });
        line.setVisible(false);
        this.Line = line;

        if (this.ShowPolygon) {
            //Create a Polygon
            var polygon = new google.maps.Polygon({
                map: _map,
                paths: points,
                strokeColor: this.Color,
                strokeOpacity: _polyLineOpacity,
                strokeWeight: _polyLineSize,
                fillColor: this.Color,
                fillOpacity: _polyLineOpacity / 2
            });
            polygon.setVisible(false);
            this.Polygon = polygon;
        }



        this.ArrivalsTable = table_html;
    };
    buildStopMarker = function(stop, route) {
        var point = new google.maps.LatLng(stop.Latitude, stop.Longitude);
        var marker = null;
        if (_useStopMarkers) {
            var addressID = stop.AddressID;
            var marker = null;
            if (_useMultiColorMarkers) {
                var existingStops = $.grep(_stopMarkers, function(stopMarker, index) { return stopMarker.AddressID === addressID; });
                marker = existingStops.length > 0 ? existingStops[0] : null;
            }
            if (marker) {
                marker.addRoute({ routeID: stop.RouteID, color: route.Color });
            }
            else {
                var args = {
                    addressID: stop.AddressID,
                    routeID: stop.RouteID,
                    maxZoom: stop.Zoom,
                    color: route.Color,
                    stopName: stop.Description,
                    textingKey: stop.TextingKey,
                    showStopName: false,
                    point: point,
                    map: _map
                }; //Test
                marker = new StopMarker(args);
                marker.RouteStop = stop;
                _stopMarkers.push(marker);
                google.maps.event.addListener(marker, 'click', function() {
                    //If this stop should show Arrivals, then register for an Event Handler
                    if (stop.ShowArrivalsOnMap) {
                        showStopArrivals(marker);
                    }
                    marker.showStopName();
                });
            }
        }
        else {
            var image = new google.maps.MarkerImage(_routeStopIcon, new google.maps.Size(_hiddenRouteStopIconSize, _hiddenRouteStopIconSize), new google.maps.Point(0, 0), new google.maps.Point(_hiddenRouteStopIconSize / 2, _hiddenRouteStopIconSize / 2));
            var marker = new google.maps.Marker({ position: point, icon: image, clickable: true });
            marker.setZIndex(_zOrderStop);
            marker.RouteStop = stop;
            //If this stop should show Arrivals, then register for an Event Handler
            if (stop.ShowArrivalsOnMap) {
                google.maps.event.addListener(marker, 'click', function() {
                    showStopArrivals(marker);
                });
            }
        }
        return marker;
    };

    /**
    * Populates the routes and top arrival times for the stop information
    * @param  {object]} marker google maps marker object clicked
    */
    showStopArrivals = function(marker) {

        var routeStop = marker.RouteStop;
        var stopDescription = routeStop.Description + (routeStop.TextingKey !== '' ? ' (' + routeStop.TextingKey + ')' : '');
        var routeStops = [];
        var matches = [];
        //Figure out if we should enable the icon for favorites
        enableInfoPanelStop(routeStop);
        //Get all Stops
        $.each(_routes, function(index, route) {
            var newStops = route.RouteStops.filter(function(n) { return n.ShowArrivalsOnMap === true && (n.RouteStopID == routeStop.RouteStopID || n.AddressID == routeStop.AddressID || (n.TextingKey === routeStop.TextingKey && routeStop.TextingKey.length > 0)); });
            //Add each item to the array
            $.each(newStops, function(index, stop) {
                var newStop = { RouteStopID: stop.RouteStopID,
                    Description: stop.Description,
                    RouteID: route.RouteID,
                    RouteDescription: route.Description,
                    RouteColor: route.Color
                };
                routeStops.push(newStop);
            });
        });


        var contentHTML = '<h2 class="stopRoutesName">' + stopDescription + '</h2>' +
            '<ul class="stopRoutes stopPopupBody">';

        //Add each of the Route Stops
        $.each(routeStops, function(index, stop) {//loop through all stops on all routes
            matches = _routes.filter(function(r) { return r.RouteID == stop.RouteID; }); //get any routes that belong to this stop
            var route = (matches.length > 0 ? matches[0] : null);
            var arrivals = getRouteStopArrivalsForPopup(route, stop.RouteStopID);
            if (arrivals !== null && arrivals.length > 0) {
                var arrivalOne = arrivals[0];
                var arrivalTwo = arrivals[1];

                contentHTML += '<li routeid="' + route.RouteID + '" routestopid="' + stop.RouteStopID + '">' +
                    '<div class="routeIcon"><span class="iconColor" style="background-color:' + stop.RouteColor + ';"></span></div>' +
                    '<div class="routeInfo">' +
                        '<h3 class="routeName">' + stop.RouteDescription + '</h3>' +
                        '<table class="routeItem arrivals test" routeID="' + route.RouteID + '" routeStopID="' + stop.RouteStopID + '">' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td>' + config.ScheduleColumnDescription + ': </td>' + //(_estimateDisplayType == 'Time' ? 'Will Arrive At' : 'Will Arrive In')
                                    '<td class="time ArrivalETA" eta="1" routestopid="' + stop.RouteStopID + '">' + arrivalOne.Text + '</td>' +
                                '</tr>';
                if (!!arrivalTwo) {
                    contentHTML += '<tr>' +
                                    '<td>Then: </td>' + //(_estimateDisplayType == 'Time' ? 'The next bus will arrive at' : 'The next bus will arrive in')
                                    '<td class="time ArrivalETA" eta="2" routestopid="' + stop.RouteStopID + '">' + arrivalTwo.Text + '</td>' +
                                '</tr>';
                }
                else {
                    contentHTML += '<tr style="display:none;">' +
                                    '<td>Then: </td>' + //(_estimateDisplayType == 'Time' ? 'The next bus will arrive at' : 'The next bus will arrive in')
                                    '<td class="time ArrivalETA" eta="2" routestopid="' + stop.RouteStopID + '"></td>' +
                                '</tr>';
                }
                contentHTML += '</tbody>' +
                        '</table>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                '</li>';
            }

        });

        contentHTML += '</ul>';

        //clear the infoPanel to be sure
        clearInfoPanel();

        $('#infoPanel .menuTitle').html('Stop Information');
        $('#infoPanel .menuBody').html(contentHTML);

        $('#infoPanel').addClass('open');
    };

    /**
    * Creates html for each cell for a single stop in the route table FOR SCHEDULES and SCHEDULES WITH ESTIMATES only
    * @param  {object} tableStop the stop for this row
    * @return {string} cells of times
    */
    buildScheduleColumns = function(tableStop) {
        if (this.ETATypeID == ETATypes.Schedules ||
            this.ETATypeID == ETATypes.SchedulesWithEstimates) {

            var columnsHTML = '';
            for (var x = 1; x <= _arrivalTimesToDisplay; x++) {
                if (this.ETATypeID == ETATypes.SchedulesWithEstimates && _showScheduleEstimateColumn) {
                    if (x == 1) {
                        columnsHTML += '<td class="time" arrival="' + x + '" etaTypeID="' + ETATypes.Estimates + '" routeStopID="' + tableStop.stopID + '"></td>';
                        columnsHTML += '<td class="time" arrival="' + x + '" etaTypeID="' + ETATypes.Schedules + '" routeStopID="' + tableStop.stopID + '"></td>';
                    }
                    else {
                        columnsHTML += '<td class="time" arrival="' + x + '" routeStopID="' + tableStop.stopID + '"></td>';
                    }
                }
                else {
                    columnsHTML += '<td class="time" arrival="' + x + '" routeStopID="' + tableStop.stopID + '"></td>';
                }
            }

            return columnsHTML;

        }
        else {
            return '';
        }
    };
    buildScheduleHeaderColumns = function() {
        if (this.ETATypeID == ETATypes.Schedules ||
            this.ETATypeID == ETATypes.SchedulesWithEstimates) {

            var columnsHTML = '';
            for (var x = 1; x <= _arrivalTimesToDisplay; x++) {
                var subscriptArray = ["th", "st", "nd", "rd"];
                var subscriptIndex = [x % 10 > 3 ? 0 : (x % 100 - x % 10 != 10) * x % 10];
                if (_showScheduleEstimateColumn) {
                    if (x == 1) {
                        columnsHTML += '<th arrival="' + x + '" etaTypeID="' + ETATypes.Estimates + '">' + (_showArrivalColumnHeaderLabels ? _scheduleEstimateColumnVerbiage : '') + '</th>';
                        columnsHTML += '<th arrival="' + x + '" etaTypeID="' + ETATypes.Schedules + '">' + (_showArrivalColumnHeaderLabels ? _scheduleColumnVerbiage : '') + '</th>';
                    }
                    else {
                        columnsHTML += '<th arrival="' + x + '">' + (_showArrivalColumnHeaderLabels?(x + subscriptArray[subscriptIndex] + ' ' + _scheduleColumnVerbiage):'') + '</th>';
                    }
                }
                else {
                    
                    if (_showArrivalColumnHeaderLabels && typeof _customArrivalHeaderArray != 'undefined' && _customArrivalHeaderArray.length >= x)
                        columnsHTML += '<th arrival="' + x + '">' + _customArrivalHeaderArray[x-1] + '</th>';
                    else
                        columnsHTML += '<th arrival="' + x + '">' + (_showArrivalColumnHeaderLabels ? (x + subscriptArray[subscriptIndex]) : '') + '</th>';
                }
            }
            return columnsHTML;
        }
        else if (this.ETATypeID === ETATypes.Estimates) {
            var columnsHTML = '';
            for (var x = 1; x <= _arrivalTimesToDisplay; x++) {
                var subscriptArray = ["th", "st", "nd", "rd"];
                var subscriptIndex = [x % 10 > 3 ? 0 : (x % 100 - x % 10 != 10) * x % 10];
                //If we have a custom arrival array, then use it here
                if (_showArrivalColumnHeaderLabels && typeof _customArrivalHeaderArray != 'undefined' && _customArrivalHeaderArray.length >= x)
                    columnsHTML += '<th arrival="' + x + '">' + _customArrivalHeaderArray[x-1] + '</th>';
                else
                    columnsHTML += '<th arrival="' + x + '">' + (_showArrivalColumnHeaderLabels ? (x + subscriptArray[subscriptIndex]) : '') + '</th>';
            }
            return columnsHTML;
        }
        else {
            return '';
        }
    };


    /**
    * Creates columns for vehicles in the routes table
    * @param  {object} vehicle
    */
    buildArrivalsVehicleColumn = function(vehicle) {
        if (this.ETATypeID != ETATypes.Estimates) {
            return true;
        }
        var table = $('table.arrivals[RouteID=' + this.RouteID + ']');
        if (table.length > 0) {
            //Add to the head of the table
            var tableHead = table.find('tr.busNames');
            tableHead.append('<th class="vehicle" vehicleID="' + vehicle.VehicleID + '">' + vehicle.Name + '</th>');
            if (_showVehicleCapacitiesInRealTime) {
                var tableHead = table.find('tr.vehicleCapacity');
                tableHead.append('<th vehicleID="' + vehicle.VehicleID + '"></th>');
            }
            var body = null;
            //Add to the table
            //table.find('thead tr').append(head);
            $.each(table.find('tbody tr'), function(index, row) {
                row = $(row);
                routeStopID = row.attr('routeStopID');
                body = $('<td>', { vehicleID: vehicle.VehicleID, routeStopID: routeStopID });
                body.addClass('time');
                row.append(body);
            });
        }

    };


    /**
    * Creates a single column for estimated time for the given vehicle
    * This adds a vehicle id even though it's blank - should be reassigned with estimate value.
    * @param  {obj} vehicle The vehicle
    * @param  {int} timesToDisplay The number of estimated times to show
    */
    buildArrivalsTimeColumn = function(vehicle, timesToDisplay) {
        if (this.ETATypeID != ETATypes.Estimates) {
            return true;
        }
        var table = $('table.arrivals[RouteID=' + this.RouteID + ']');
        if (table.length > 0) {
            var body = null;
            //Add to the table
            $.each(table.find('tbody tr'), function(index, row) {
                row = $(row);
                var numOfCols = row.children('.time').length;
                if (numOfCols < timesToDisplay) {//if there are fewer columns than the display limit
                    //add the column
                    routeStopID = row.attr('routeStopID');
                    arrivalNumber = numOfCols + 1;
                    body = $('<td>', { vehicleID: vehicle.VehicleID, arrival: arrivalNumber, routeStopID: routeStopID });
                    body.addClass('time');
                    row.append(body);
                }
                else {
                    return false; //exit the loop
                }

            });
        }
    };



    /**
    * Removes any table cell from the route estimates table that belongs to a vehicle
    * @param  {object} vehicle
    */
    removeArrivalsVehicleColumn = function(vehicle) {
        var table = $('table.arrivals[RouteID=' + this.RouteID + ']');
        if (table.length > 0) {
            table.find('th[vehicleID=' + vehicle.VehicleID + ']').remove();
            table.find('td[vehicleID=' + vehicle.VehicleID + ']').remove();
        }

    };
}

Route.prototype.Initialize = function(fullRoute) {

    buildRouteLandmarks.call(this, fullRoute.Landmarks);
    buildRouteStopArrivalsTable.call(this, fullRoute.Stops, this.ETATypeID, ETATypes, _fluidRouteTable);
    buildNoVehiclesOnRouteTable.call(this);
    buildRouteLineItem.call(this);

    if (!_useStopMarkers) {
        this.StopsMarkerManager.Route = this;
        google.maps.event.addListener(this.StopsMarkerManager, 'loaded', function() {
            try {
                //Get a unique list of Zoom Levels from all of the stops;
                var route = this.Route;
                var stopZoomLevels = [];
                var markerManager = this;
                $.each(route.RouteStops, function(index, routeStop) {
                    if ($.inArray(routeStop.Zoom, stopZoomLevels) == -1) {
                        stopZoomLevels.push(routeStop.Zoom);
                    }
                });
                $.each(stopZoomLevels, function(index, zoom) {
                    var markers = $.grep(route.StopMarkers, function(marker) { return marker.RouteStop.Zoom == zoom; });
                    if (markers.length > 0) {
                        markerManager.addMarkers(markers, zoom);
                    }
                });
                this.hide();
                this.refresh();
                //Check if the route is visible, then show all of the stops
                if (route.Visible) {
                    markerManager.show();
                }
                if (!_useStopMarkers)
                    delete route.StopMarkers;
            }
            catch (Error) {
                $('#errorMessage').text('Problem loading stops:' + Error.message);
            }
        });
    }
};

Route.prototype.Enable = function() {
    this.Visible = true;
    if (this.ShowRouteLines) {
        this.Line.setVisible(true);
        if (!!this.Polygon) {
            this.Polygon.setVisible(true);
        }
    }
    //Show Landmark
    try {
        $.each(this.Landmarks, function(index, landmarkLabel) {
            landmarkLabel.show();
        });
    }
    catch (e) {

    }
    //Show Stops
    try {
        if (_useStopMarkers) {
            var routeID = this.RouteID;
            $(this.StopMarkers).each(
                function(index, stopMarker) {
                    stopMarker.showRoute(routeID);
                });
        }
        else {
            this.StopsMarkerManager.show();
        }
    }
    catch (e) {
    }
    //Show Vehicles
    this.EnableVehicles();
};
Route.prototype.Disable = function() {
    this.Visible = false;
    if (this.ShowRouteLines) {
        this.Line.setVisible(false);
        if (!!this.Polygon) {
            this.Polygon.setVisible(false);
        }
    }
    //Hide Landmarks
    try {
        $.each(this.Landmarks, function(index, landmarkLabel) {
            landmarkLabel.hide();
        });
    }
    catch (e) {

    }
    //Hide Stops
    try {
        if (_useStopMarkers) {
            var routeID = this.RouteID;
            $(this.StopMarkers).each(
                function(index, stopMarker) {
                    stopMarker.hideRoute(routeID);
                });
        }
        else {
            this.StopsMarkerManager.hide();
        }
    }
    catch (e) {

    }
    //Hide Vehicles
    this.DisableVehicles();
};
Route.prototype.HasVehiclesOnRoute = function() {
    return this.Vehicles.length > 0;
};

/**
* Adds a single vehicle to the route (also adds a cell to the route estimates table)
* @param {object} vehicle
*/
Route.prototype.AddVehicle = function(vehicle) {
    this.Vehicles.push(vehicle);
    if (this.Visible) {
        vehicle.Enable();
    }
    else {
        vehicle.Disable();
    }
    //Add the Vehicle to the Arrivals table
    if (_arrivalOrder === 'Bus') {
        buildArrivalsVehicleColumn.call(this, vehicle);
    }
    else {//Time
        buildArrivalsTimeColumn.call(this, vehicle, _arrivalTimesToDisplay);
    }

    if (this.Vehicles.length > 0 || this.ETATypeID == ETATypes.Schedules || this.ETATypeID == ETATypes.SchedulesWithEstimates) {
        $('.arrivals[RouteID=' + this.RouteID + ']').show();
        $('.noVehiclesOnRoute[RouteID=' + this.RouteID + ']').hide();
    }
};
/**
* Removes a single vehicle from the vehicles array, also removes the table cells from the route estimates table
* @param {object} vehicle
*/
Route.prototype.RemoveVehicle = function(vehicle) {
    this.Vehicles.splice($.inArray(vehicle, this.Vehicles), 1);
    //Remove the vehicle from the Arrivals table
    removeArrivalsVehicleColumn.call(this, vehicle);
    //If we are showing Schedules, or Schedules with Estimates, then show even when there are no vehicles on route
    if (this.Vehicles.length === 0 && this.ETATypeID == ETATypes.Estimates) {
        $('.arrivals[RouteID=' + this.RouteID + ']').hide();
        $('.noVehiclesOnRoute[RouteID=' + this.RouteID + ']').show();
    }
};
Route.prototype.EnableVehicles = function() {
    this.VehiclesVisible = true;
    $.each(this.Vehicles, function(index, vehicle) {
        vehicle.Enable();
    });
};
Route.prototype.DisableVehicles = function() {
    this.VehiclesVisible = false;
    $.each(this.Vehicles, function(index, vehicle) {
        vehicle.Disable();
    });
};
Route.prototype.RemoveFromMap = function() {
    if (!!this.StopsMarkerManager)
        this.StopsMarkerManager.clearMarkers();
    this.Line.setMap(null);
    if (!!this.Polygon)
        this.Polygon.setMap(null);

    $.each(this.StopMarkers, function(index, stopMarker) {
        stopMarker.setMap(null);
    });
    
    $.each(this.Landmarks, function(index, landmarkLabel) {
        landmarkLabel.setMap(null);
    });
}