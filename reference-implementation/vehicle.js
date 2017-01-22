var _useVehicleMarkers = true;
var _restrictRouteOnVehicleClick = false;
function Vehicle() {
    this.VehicleID = 0;
    this.Name = '';
    this.RouteID = 0;
    this.Latitude = 0;
    this.Longitude = 0;
    this.Heading = 0;
    this.Speed = 0;
    this.IsDelayed = false;
    this.IsOnRoute = true;
    this.Visible = true;
    this.VehicleMarker = null;
    this.ColorMarker = null;
    this.DirectionMarker = null;
    this.VehicleNameMarker = null;
    this.VehicleCapacityMarker = null;
    this.OnTimeStatus = null;
    /**
     * Sometimes Google returns a heading that is negative.  This will normalize it
     */
    normaliseHeading = function (heading) {
        while (heading > 360)
            heading -= 360;
        while (heading < 0)
            heading += 360;

        return heading;
    }

    /**
     * Creates an icon (google map marker) with the capacity number represented as an image just under the vehicle
     * @param {string} capacity a string to be created (ex: "12/24")
     */
    this.setVehicleCapacity = function (occupation, capacity) {
        if (this.VehicleMarker != null) {
            this.VehicleMarker.setOccupation(occupation);
            this.VehicleMarker.setCapacity(capacity);
        }
        else {
            capacity = occupation + '%2f' + capacity;
            var iconWidth = 100;
            var iconHeight = _vehicleNameIconHeight;
            var verticalOffset = (_vehicleNameIconHeight / 2) * -1;
            if (_showVehicleNameInIcons) {
                //Move down to accomidate the vehicle name icon
                verticalOffset = (verticalOffset * 2) - 5;
            }
            //Set up Vehicle Capacity Marker
            var nameURL = _baseURL + 'Utilities/GetIcon.aspx?size=100&vehicleCapacity=' + capacity;
            var nameIconSize = new google.maps.Size(iconWidth, iconHeight);
            var nameAnchorPoint = new google.maps.Point(iconWidth / 2, verticalOffset);
            var nameImage = new google.maps.MarkerImage(nameURL, nameIconSize, new google.maps.Point(0, 0), nameAnchorPoint);

            if (this.VehicleCapacityMarker == null) {
                var point = this.ColorMarker.getPosition();
                this.VehicleCapacityMarker = new google.maps.Marker({ map: _map, position: point, icon: nameImage });
                this.VehicleCapacityMarker.setZIndex(_zOrderVehicle);
            }
            else {
                this.VehicleCapacityMarker.setIcon(nameImage);
            }
        }
    };

    //    this.buildDirectionMarker = function() {
    //        var imageURL = _iconNorth;
    //        var point = new google.maps.LatLng(this.Latitude, this.Longitude);
    //        var iconSize = new google.maps.Size(_iconSize, _iconSize);
    //        var directionImage = new google.maps.MarkerImage(imageURL, iconSize, new google.maps.Point(0, 0), new google.maps.Point(_anchorSize, _anchorSize));

    //        var marker = new google.maps.Marker({ map: _map, position: point, icon: directionImage });
    //        marker.setZIndex(_zOrderVehicle);
    //        marker.Vehicle = this;
    //        if (_showVehicleNameInIcons) {
    //            //Set up Name Marker
    //            var nameURL = _baseURL + 'Utilities/GetIcon.aspx?size=0&vehicleName=' + this.Name;
    //            var nameIconSize = new google.maps.Size(_vehicleNameIconWidth, _vehicleNameIconHeight);
    //            var nameAnchorPoint = new google.maps.Point(_vehicleNameIconWidth / 2, (_vehicleNameIconHeight / 2) * -1);
    //            var nameImage = new google.maps.MarkerImage(nameURL, nameIconSize, new google.maps.Point(0, 0), nameAnchorPoint);
    //            this.VehicleNameMarker = new google.maps.Marker({ map: _map, position: point, icon: nameImage });
    //            this.VehicleNameMarker.setZIndex(_zOrderVehicle);
    //        }

    //        _zOrderVehicle += 1;
    //        google.maps.event.addListener(marker, 'click', function() {
    //            this.Vehicle.ShowArrivals(marker);
    //            this.Vehicle.ShowRouteForVehicle();
    //        });
    //        //8-27-2014 BH Per conversation with Justin, remove mouseover
    //        //google.maps.event.addListener(marker, 'mouseover', function() {
    //        //    var routeID = this.Vehicle.RouteID;
    //        //    hoverOverVehicle(routeID);
    //        //});
    //        //google.maps.event.addListener(marker, 'mouseout', function() {
    //        //    var routeID = this.Vehicle.RouteID;
    //        //    hoverOffVehicle(routeID);
    //        //});
    //        this.DirectionMarker = marker;
    //    };
    //    this.buildColorMarker = function() {
    //        var point = new google.maps.LatLng(this.Latitude, this.Longitude);
    //        var iconSize = new google.maps.Size(_iconSize, _iconSize);
    //        var colorImage = new google.maps.MarkerImage(null, iconSize, new google.maps.Point(0, 0), new google.maps.Point(_anchorSize, _anchorSize));
    //        var shadowImage = new google.maps.MarkerImage(_iconShadow, new google.maps.Size(_iconSize * 2, _iconSize * 2), new google.maps.Point(0, 0), new google.maps.Point(_anchorSize, _anchorSize));
    //        var anchorPoint;
    //        var directionImage;
    //        var nameImage;

    //        var marker = new google.maps.Marker({
    //            map: _map,
    //            position: point,
    //            icon: colorImage,
    //            shadow: shadowImage
    //        });
    //        marker.setZIndex(_zOrderVehicle);
    //        marker.Vehicle = this;
    //        _zOrderVehicle += 1;
    //        google.maps.event.addListener(marker, 'click', function() {
    //            this.Vehicle.ShowArrivals(marker);
    //            this.Vehicle.ShowRouteForVehicle();
    //        });
    //        this.ColorMarker = marker;
    //    };
    this.buildVehicleMarker = function () {
        var point = new google.maps.LatLng(this.Latitude, this.Longitude);
        var args = {
            vehicleID: this.VehicleID,
            vehicleName: this.Name, //Test
            animationSeconds: _refreshVehiclesMilliseconds / 1000, //Test
            point: point,
            map: _map,
            //color: '#004080',
            //capacity: 60, //Test
            showOccupation: _showVehicleCapacity,
            showOccupationVerbiage: _showVehicleCapacitiesInRealTime,
            showVehicleEstimates: _showVehicleEstimatesOnVehicleClick,
            showVehiclePopup: _showVehicleNameOnVehicleClick,
            showVehicleName: _showVehicleNameInIcons,
            minSpeed: _mphIndicateStop,
            showStopIcon: _showStopIcon,
            animateVehicles: _animateVehicles,
            lateColor: _lateVehicleHighlightColor,
            earlyColor: _earlyVehicleHighlightColor
        };
        var marker = new VehicleMarker(args);
        marker.Vehicle = this;
        google.maps.event.addListener(marker, 'click', function () {
            if (_showVehicleEstimatesOnVehicleClick) {
                getVehicleEstimates([marker.VehicleID]);
                if (_restrictRouteOnVehicleClick) {
                    var isInfoBoxVisible = false;
                    //this.div_.find('.vehicleInfoBox').toggleClass('hideInfoBox');
                    if (this.Vehicle.VehicleMarker != null)
                        isInfoBoxVisible = this.Vehicle.VehicleMarker.areEstimatesVisible();

                    //if the info box is closed, then close all other info boxes, and select the route
                    if (!isInfoBoxVisible) {
                        this.Vehicle.hideAllVehicleEstimates();
                        this.Vehicle.updateVehicleEstimates(marker, null, marker.ShowOccupation, true);
                        this.Vehicle.ShowRouteForVehicle();
                    } else {
                        //If the info box is open, then close it and uncheck the route
                        this.Vehicle.VehicleMarker.closeEstimates();
                    }
                } else {
                    //getVehicleEstimates([marker.VehicleID]);
                    this.Vehicle.updateVehicleEstimates(marker, null, marker.ShowOccupation, true);
                }
            }
            else if (_showVehicleNameOnVehicleClick)
                this.Vehicle.setVehiclePopup(marker, marker.ShowOccupation, true);

        });
        google.maps.event.addListener(marker, 'mouseover', function () {
            var routeID = this.Vehicle.RouteID;
            hoverOverVehicle(routeID);
        });
        google.maps.event.addListener(marker, 'mouseout', function () {
            var routeID = this.Vehicle.RouteID;
            hoverOffVehicle(routeID);
        });

        this.VehicleMarker = marker;
        //_vehicle1Marker.setColor('#004080');

    };

    this.updateVehicleEstimates = function (marker, estimates, showCapacity, toggleVisibility) {

        //Only do this if we can set Estimates Content
        if (typeof marker.setEstimatesContent === 'function') {
            var vehicleID = this.VehicleID;
            var routeID = this.RouteID;
            //Get the Route
            var matches = _routes.filter(function (n) { return n.RouteID === routeID; });
            var route = (matches.length > 0 ? matches[0] : null);


            //figure out capacity
            if (showCapacity === true) {
                var vehicleCapacity = getVehicleCapacity(this.VehicleID); //get vehicle capacity as promise object.

                $.when(vehicleCapacity).then(function (result) {//when promise resolved
                    //vehicleCapacity = result;
                    marker.Vehicle.setVehicleCapacity(result.CurrentOccupation, result.Capacity);
                });
            }

            //If we are toggling visitiblity, don't replace the loading icon that should be showing
            if (!toggleVisibility) {
                //Get Estimates Popup
                var estimatesHTML = '<table class="arrivals" routeID="' + route.RouteID + '" etaTypeID="' + ETATypes.Estimates + '">' +
                    '<tbody>';
                if (estimates != null) {
                    //loop each stop on this route
                    var countStops = 0;
                    $.each(estimates, function (index, estimate) {
                        if (countStops < 2) { //only get first two - if this become variable, we have to make css adjustments for the top position
                            var div = $('<div/>', {});
                            var tr = $('<tr/>', { routeStopID: estimate.RouteStopID });
                            var tdStop = $('<td/>', { class: 'stop', text: estimate.Description });
                            var tdEstimate = $('<td/>', { class: 'time' });
                            printStopTimeVerbiage(estimate, tdEstimate);
                            tr.append(tdStop);
                            tr.append(tdEstimate);
                            div.append(tr);
                            estimatesHTML += div[0].innerHTML;
                            countStops++;
                        } else {
                            return false; //break loop
                        }
                    });
                }
                estimatesHTML += '</tbody>' +
                    '</table>';
                marker.setEstimatesContent(estimatesHTML);
            } else {
                marker.toggleEstimates();
            }
        }
    }

    //this.setVehicleEstimates = function(marker, showCapacity, toggleVisibility) {
    //    //Only do this if we can set Estimates Content
    //    if (typeof marker.setEstimatesContent === 'function') {
    //        var vehicleID = this.VehicleID;
    //        var routeID = this.RouteID;
    //        //Get the Route
    //        var matches = _routes.filter(function(n) { return n.RouteID == routeID; });
    //        var route = (matches.length > 0 ? matches[0] : null);


    //        //create array of route stop estimates ordered by estimate time
    //        var routeEstimate = null;
    //        var orderedRouteStops = []; //reordered stops on this route
    //        $.each(route.RouteStops, function(index, stop) {
    //            routeEstimate = getVehicleRouteStopEstimate(stop.RouteStopID, vehicleID);
    //            if (routeEstimate != null) {
    //                stop.eta = routeEstimate.SecondsToStop;
    //                orderedRouteStops.push(stop);
    //            }
    //        });
    //        function SortByETA(a, b) {
    //            var aETA = a.eta;
    //            var bETA = b.eta;
    //            return ((aETA < bETA) ? -1 : ((aETA > bETA) ? 1 : 0));
    //        }
    //        orderedRouteStops.sort(SortByETA);
    //        //figure out capacity
    //        if (showCapacity === true) {
    //            vehicleCapacity = getVehicleCapacity(this.VehicleID); //get vehicle capacity as promise object.

    //            $.when(vehicleCapacity).then(function(result) {//when promise resolved
    //                //vehicleCapacity = result;
    //                marker.Vehicle.setVehicleCapacity(result.CurrentOccupation, result.Capacity);
    //            });
    //        }


    //        function createVehicleInfoBox() {
    //            //SETUP HTML
    //            if (orderedRouteStops.length > 0) {
    //                var estimatesHTML = '<table class="arrivals" routeID="' + route.RouteID + '" etaTypeID="' + ETATypes.Estimates + '">' +
    //                                    '<tbody>';
    //                //loop each stop on this route
    //                var countStops = 0;
    //                $.each(orderedRouteStops, function(index, stop) {
    //                    if (countStops < 2) {//only get first two - if this become variable, we have to make css adjustments for the top position
    //                        if (stop.ShowArrivalsOnMap) {
    //                            //Get the text for when the vehicle arrives at this stop.
    //                            var estimate = getVehicleRouteStopEstimateText(stop.RouteStopID, vehicleID);
    //                            if (stop.ShowArrivalsOnMap && estimate.Text !== null) {
    //                                estimatesHTML += '    <tr routeStopID="' + stop.RouteStopID + '">' +
    //                                                    '<td class="stop">' + stop.Description + '</td>' +
    //                                                    '<td class="time" routeStopID="' + stop.RouteStopID + '" vehicleID="' + vehicleID + '" ' + (estimate.IsArriving ? 'highlight' : '') + '>' + estimate.Text + '</td>' +
    //                                                '</tr>';
    //                            }
    //                            countStops++;
    //                        }
    //                    }
    //                    else {
    //                        return false; //break loop
    //                    }
    //                });
    //                estimatesHTML += '</tbody>' +
    //                            '</table>';
    //                marker.setEstimatesContent(estimatesHTML);
    //                if (toggleVisibility)
    //                    marker.toggleEstimates();
    //            } //if there are stops

    //        }
    //        createVehicleInfoBox();
    //    }
    //}
    this.setVehiclePopup = function (marker, showCapacity, toggleVisibility) {
        //Only do this if we can set Estimates Content
        if (typeof marker.setEstimatesContent === 'function') {
            var vehicleID = this.VehicleID;

            //figure out capacity
            if (showCapacity === true) {
                vehicleCapacity = getVehicleCapacity(this.VehicleID); //get vehicle capacity as promise object.

                $.when(vehicleCapacity).then(function (result) {//when promise resolved
                    //vehicleCapacity = result;
                    marker.Vehicle.setVehicleCapacity(result.CurrentOccupation, result.Capacity);
                });
            }


            if (toggleVisibility)
                marker.toggleEstimates();
        }
    }
    /**
     * Displays a google map infobox with vehicle information
     * @param  {object} vehicleInfoBox the InfoBox object to fill
     * @param  {object} theMap the google map
     * @param  {object} theMarker the google map marker object this box belongs to
     * @param  {boolean} showCapacity true/false show the capacity of the bus
     * @param  {array} routesArray array of routes
     */
    //    this.showVehicleInfo = function(VehicleInfoBox,TheMap,TheMarker,showCapacity,routesArray){
    //        var vehicleID = this.VehicleID;
    //        var routeID = this.RouteID;
    //        var vehicleName = this.Name;

    //        var capacityClass = '';
    //        var vehiclePercentageString = '0';

    //        //Get the Route
    //        var matches = _routes.filter(function(n) {return n.RouteID == routeID;});
    //        var route = (matches.length > 0 ? matches[0] : null);


    //        //create array of route stop estimates ordered by estimate time
    //        var routeEstimate = null;
    //        var orderedRouteStops = [];//reordered stops on this route
    //        $.each(route.RouteStops, function(index, stop) {
    //            routeEstimate = getVehicleRouteStopEstimate(stop.RouteStopID, vehicleID);
    //            stop.eta = routeEstimate.SecondsToStop;
    //            orderedRouteStops.push(stop);
    //        });
    //        function SortByETA(a, b){
    //            var aETA = a.eta;
    //            var bETA = b.eta;
    //            return ((aETA < bETA) ? -1 : ((aETA > bETA) ? 1 : 0));
    //        }
    //        orderedRouteStops.sort(SortByETA);



    //        //figure out capacity
    //        if (showCapacity === true) {
    //            vehicleCapacity = getVehicleCapacity(this.VehicleID);//get vehicle capacity as promise object.

    //            $.when(vehicleCapacity).then(function(result){//when promise resolved
    //                vehicleCapacity = result;

    //                if (vehicleCapacity !== null) {
    //                    if (vehicleCapacity.Percentage <= 0.5) {
    //                        capacityClass = 'empty';
    //                    }
    //                    else if (vehicleCapacity.Percentage <= 0.75) {
    //                        capacityClass = 'half';
    //                    }
    //                    else {
    //                        capacityClass = 'full';
    //                    }
    //                    vehiclePercentageString = vehicleCapacity.Percentage * 100;
    //                }
    //            });
    //            
    //        }


    //        if (showCapacity === true) {
    //            $.when(vehicleCapacity).then(function(result){//wait for the promise before creating box.
    //                createVehicleInfoBox();
    //            });
    //        }
    //        else{
    //            createVehicleInfoBox();
    //        }

    //        /**
    //         * Creates the google infobox (this is wrappen in a function because it is called upon conditions set above)
    //         */
    //        function createVehicleInfoBox(){
    //            //SETUP HTML
    //            var infoBoxHTML = '<div class="vehicleInfoBox googleInfoWindow">'+
    //                                '<h3 class="vehicleName" style="border-color:'+route.Color+';">'+vehicleName+'</h3>';
    //            if(showCapacity === true){
    //                infoBoxHTML += '<div class="capacityWrapper" style="border-color:'+route.Color+';">'+
    //                                '<div class="capacity">'+
    //                                    '<div class="meter '+capacityClass+'" title="'+vehicleCapacity.CurrentOccupation + ' of ' + vehicleCapacity.Capacity+'" style="width:'+vehiclePercentageString+'%;"></div>'+//empty/half/full
    //                                '</div>'+
    //                            '</div>';
    //            }
    //            if (orderedRouteStops.length > 0) {
    //                //8-14-2014 Added the class Arrivals to the table, so we can update estimates in real time.
    //                infoBoxHTML += '<div class="estimates">'+
    //                                    '<table class="arrivals" routeID="' + route.RouteID + '" etaTypeID="' + ETATypes.Estimates + '">' +
    //                                        '<tbody>';
    //                //loop each stop on this route
    //                var countStops = 0;
    //                $.each(orderedRouteStops, function(index, stop) {
    //                //for(s = 0; s < 2; s++){//get only the first two stops
    //                    if(countStops < 2){//only get first two - if this become variable, we have to make css adjustments for the top position
    //                        if(stop.ShowArrivalsOnMap){
    //                            //Get the text for when the vehicle arrives at this stop.
    //                            var estimate = getVehicleRouteStopEstimateText(stop.RouteStopID, vehicleID);
    //                            if (stop.ShowArrivalsOnMap && estimate.Text !== null) {
    //                                infoBoxHTML += '    <tr routeStopID="'+stop.RouteStopID+'">'+
    //                                                        '<td class="stop">'+stop.Description+'</td>'+
    //                                                        '<td class="time" routeStopID="'+stop.RouteStopID+'" vehicleID="'+vehicleID+'" '+(estimate.IsArriving ? 'highlight' : '')+'>'+estimate.Text+'</td>'+
    //                                                    '</tr>';
    //                            }
    //                            countStops++;
    //                        }
    //                        
    //                    }
    //                    else{
    //                        return false;//break loop
    //                    }
    //                });
    //                //});
    //                infoBoxHTML +=          '</tbody>'+
    //                                    '</table>'+
    //                                '</div>';
    //            }//if there are stops
    //            infoBoxHTML +=  '</div>';
    //            

    //            VehicleInfoBox.setContent(infoBoxHTML);
    //            VehicleInfoBox.open(TheMap, TheMarker);
    //        }
    //        
    //        //infowindow.open(TheMap,TheMarker);

    //        // var myOptions = {
    //        //     content: infoBoxHTML,
    //        //     disableAutoPan: false,
    //        //     alignBottom: true,
    //        //     maxWidth: 0,
    //        //     pixelOffset: new google.maps.Size(-100, -40),
    //        //     zIndex: null,
    //        //     boxStyle: {},
    //        //     closeBoxURL: 'http://www.google.com/intl/en_us/mapfiles/close.gif',
    //        //     infoBoxClearance: new google.maps.Size(4, 4),
    //        //     visible: true,
    //        //     pane: 'floatPane',
    //        //     enableEventPropagation: false
    //        // };

    //        // var ib = new InfoBox(myOptions);
    //        
    //    };


    //Change the Heading and Speed of a vehicle
    this.changeHeadingAndSpeed = function (vehiclePosition) {
        var icon = this.DirectionMarker.getIcon();
        var oldURL = '';
        if (icon !== null) {
            oldURL = icon.url;
        }

        this.Speed = vehiclePosition.GroundSpeed;
        if (this.Speed > _mphIndicateStop) {
            this.Heading = vehiclePosition.Heading;
        }
        if (this.Speed <= _mphIndicateStop && _showStopIcon) {
            icon.url = _iconStop;
        }
        else if (this.Heading >= 337 || this.Heading < 22) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopNorth;
            }
            else {
                icon.url = _iconNorth;
            }
        }
        else if (this.Heading >= 22 && this.Heading < 67) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopNorthEastIcon;
            }
            else {
                icon.url = _iconNorthEastIcon;
            }
        }
        else if (this.Heading >= 67 && this.Heading < 112) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopEastIcon;
            }
            else {
                icon.url = _iconEastIcon;
            }
        }
        else if (this.Heading >= 112 && this.Heading < 157) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopSouthEastIcon;
            }
            else {
                icon.url = _iconSouthEastIcon;
            }
        }
        else if (this.Heading >= 157 && this.Heading < 202) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopSouthIcon;
            }
            else {
                icon.url = _iconSouthIcon;
            }
        }
        else if (this.Heading >= 202 && this.Heading < 247) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopSouthWestIcon;
            }
            else {
                icon.url = _iconSouthWestIcon;
            }
        }
        else if (this.Heading >= 247 && this.Heading < 292) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopWestIcon;
            }
            else {
                icon.url = _iconWestIcon;
            }
        }
        else if (this.Heading >= 292 && this.Heading < 337) {
            if (this.Speed <= _mphIndicateStop) {
                icon.url = _iconStopNorthWestIcon;
            }
            else {
                icon.url = _iconNorthWestIcon;
            }
        }
        else {
            icon.url = _iconStop;
        }
        //Set to stopped if there is no URL
        if (icon.url === null || icon.url == '' || typeof icon.url === "undefined") {
            icon.url = _iconStop;
        }
        //Only change the icon if the direction or speed has changed
        if (oldURL != icon.url) {
            this.DirectionMarker.setIcon(icon);
        }

    };
    //Change the Route of a Vehicle (change color, move the marker, etc)
    this.changeRoute = function (route) {
        if (this.VehicleMarker != null) {
            this.VehicleMarker.setRoute(route);
            //this.VehicleMarker.setColor(route.Color);
        }
        else {
            var image = this.ColorMarker.getIcon();
            image.url = _baseURL + 'Utilities/GetIcon.aspx?color=' + route.Color.replace('#', '') + '&size=' + _iconSize + '&opacity=' + _transparency;
            this.ColorMarker.setIcon(image);
        }
        this.RouteID = route.RouteID;
    };
    this.moveMarkers = function (point) {
        var existingPosition = this.ColorMarker.getPosition();
        if (existingPosition === null || !point.equals(existingPosition)) {
            this.ColorMarker.setPosition(point);
            if (this.DirectionMarker !== null) {
                this.DirectionMarker.setPosition(point);
            }
            if (this.VehicleNameMarker !== null) {
                this.VehicleNameMarker.setPosition(point);
            }
            if (this.VehicleCapacityMarker !== null) {
                this.VehicleCapacityMarker.setPosition(point);
            }
        }
    };
    this.hideAllVehicleEstimates = function () {
        $('.vehicleInfoBox:not(.hideInfoBox)').addClass('hideInfoBox');
    };
}
Vehicle.prototype.Initialize = function (vehiclePosition, route) {
    this.VehicleID = vehiclePosition.VehicleID;
    _vehicleID = vehiclePosition.VehicleID;
    this.Name = vehiclePosition.Name;
    this.IsDelayed = vehiclePosition.IsDelayed;
    this.IsOnRoute = vehiclePosition.IsOnRoute;
    this.buildVehicleMarker();
    //    if (_useVehicleMarkers) {
    //    }
    //    else {
    //        this.buildColorMarker();
    //        this.buildDirectionMarker();
    //    }
    this.Move(vehiclePosition, route);
};
//Move the whole vehicle (and all it's markers)
Vehicle.prototype.Move = function (vehiclePosition, route) {
    //Set properties that may change
    this.IsDelayed = vehiclePosition.IsDelayed;
    this.IsOnRoute = vehiclePosition.IsOnRoute;

    //Move the marker
    var point = new google.maps.LatLng(vehiclePosition.Latitude, vehiclePosition.Longitude);
    if (this.VehicleMarker != null) {
        this.Speed = vehiclePosition.GroundSpeed;
        this.VehicleMarker.move(point, this.Speed);
    }
    else {
        this.moveMarkers(point);
        //Change the Heading and Speed
        if (vehiclePosition.Heading != this.Heading || vehiclePosition.GroundSpeed != this.Speed) {
            this.changeHeadingAndSpeed(vehiclePosition);
        }
    }
    //Change Route
    if (route.RouteID != this.RouteID) {
        this.changeRoute(route);
    }
};
Vehicle.prototype.Enable = function () {
    this.Visible = true;
    if (this.VehicleMarker != null) {
        this.VehicleMarker.show();
    }
    else {
        this.ColorMarker.setVisible(true);
        this.DirectionMarker.setVisible(true);
        if (this.VehicleNameMarker !== null) {
            this.VehicleNameMarker.setVisible(true);
        }
    }
};
Vehicle.prototype.Disable = function () {
    this.Visible = false;
    if (this.VehicleMarker != null) {
        this.VehicleMarker.hide();
    }
    else {
        this.ColorMarker.setVisible(false);
        this.DirectionMarker.setVisible(false);
        if (this.VehicleNameMarker !== null) {
            this.VehicleNameMarker.setVisible(false);
        }
    }
};
//Vehicle.prototype.ShowArrivals = function(marker) {
//    if (_showVehicleEstimatesOnVehicleClick)
//        this.showVehicleInfo(_vehicleInfoBox, _map, marker, _showVehicleCapacity, _routes);
//    //this.showVehicleInfo();
//};
Vehicle.prototype.ShowRouteForVehicle = function () {
    //Get the Route
    var routeID = this.RouteID;
    if (routeID != null) {
        //Find all Routes that are selected, so we can unselect them
        var activeLis = $('li.route:not([rel=' + routeID + '])>.routeHeader>.active');
        $.each(activeLis, function (index, activeLi) {
            var button = $(activeLi);
            toggleRouteButton(button);
        });
        //Find this route, so we can select it
        var li = $('li.route[rel=' + routeID + ']');
        if (li.length > 0) {
            //Find the Toggle Route Button that isn't active, so we can activate it
            var button = li.find('.toggleRouteBtn:not(.active)');
            toggleRouteButton(button);
        }
    }
};
Vehicle.prototype.HideRouteForVehicle = function () {
    //Get the Route
    var routeID = this.RouteID;
    if (routeID != null) {
        //Find this route, so we can select it
        var li = $('li.route[rel=' + routeID + ']');
        if (li.length > 0) {
            //Find the Toggle Route Button that isn't active, so we can activate it
            var button = li.find('.toggleRouteBtn.active');
            toggleRouteButton(button);
        }
    }
};
Vehicle.prototype.SetOnTimeStatus = function (onTimeStatus) {
    this.OnTimeStatus = onTimeStatus;
    if (this.VehicleMarker != null) {
        this.VehicleMarker.setOnTimeStatus(onTimeStatus);
    }
}

Vehicle.prototype.RemoveFromMap = function () {
    this.VehicleMarker.setMap(null);
}