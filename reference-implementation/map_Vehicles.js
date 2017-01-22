/* Vehicles */
var _vehicles = [];
function getVehiclePositions() {
    $.ajax({
        url: _baseURL + 'Services/JSONPRelay.svc/GetMapVehiclePoints',
        data: { ApiKey: _apiKey },
        dataType: 'jsonp',
        jsonp: 'method',
        async: true,
        cache: false
    }).done(
        function(data) {
            //layoutRoutes(data);
            try {
                $('#labelStatus').text('Laying Out Vehicles');
                layoutVehicles(data);
            }
            finally {
                $('#labelStatus').text('');
            }
        })
    .fail(
        function(jqXHR, textStatus, errorThrown) {
            $('#errorMessage').text('Problem getting vehicle positions:' + errorThrown.message);
        })
    .always(
            function() {
                setTimeout(function () { getVehiclePositions(); }, _refreshVehiclesMilliseconds);
            }
        );
}

function layoutVehicles(vehicles) {
    var newVehiclesAdded = false;

    var vehiclesToRemove = [];
    //If we are restricting vehicles, then pull them out of the feed here
    if (_restrictVehicleIds != null && _restrictVehicleIds.length > 0) {
        for (var x; x = _restrictVehicleIds.length - 1; x--) {
            //Check if the vehicle is in the restricted list
            if (_restrictVehicleIds.filter(function (n) { return n == vehicle.VehicleID; }).length === 0) {
                vehicles.splice(x, 1);
            }
        }
    }
    //Find the old Vehicles that aren't in the current dataset, or have a Route ID of 0 in the current dataset
    $.each(_vehicles, function(index, vehicle) {
        if ($.grep(vehicles, function(currentVehicle) {
            return currentVehicle.VehicleID == vehicle.VehicleID
                                                        && currentVehicle.RouteID > 0;
        }).length === 0) {
            vehiclesToRemove.push(vehicle);
        }
        //Check if the vheicle has changed routes to a route that isn't on our list.
        if (vehicle.RouteID>0 && $.grep(vehicles, function(currentVehicle) {
                                                        return currentVehicle.VehicleID == vehicle.VehicleID
                                                        && currentVehicle.RouteID > 0
                                                        && currentVehicle.RouteID != vehicle.RouteID
                                                        && $.grep(_routes, function(route) { return route.RouteID === currentVehicle.RouteID; }).length === 0;
                                                    }).length !== 0) {
            //Add it to the list of vehicles to remove
            vehiclesToRemove.push(vehicle);
        }
    });
    
    //Remove all vehicle markers that aren't in the current dataset
    $.each(vehiclesToRemove, function(index, vehicle) {
        if (vehicle.RouteID>0){
            removeVehicle(vehicle);
        }
    });
    //Loop through all of the vehicles
    $.each(vehicles, function(index, vehiclePosition) {
        //Get existing vehicle
        var matches = _vehicles.filter(function(vehicle) { return vehicle.VehicleID == vehiclePosition.VehicleID; });
        var vehicle = (matches.length > 0 ? matches[0] : null);
        //Get existing route
        matches = _routes.filter(function(route) { return route.RouteID == vehiclePosition.RouteID; });
        var route = (matches.length > 0 ? matches[0] : null);
        if (route !== null) {
            if (vehicle === null) {
                newVehiclesAdded = true;
                vehicle = new Vehicle();
                vehicle.Initialize(vehiclePosition, route);
                //Add vehicle to the route
                route.AddVehicle(vehicle);
                _vehicles.push(vehicle);
            }
            else {
                if (vehicle.RouteID != vehiclePosition.RouteID) {
                    var showVehicle = route.Visible;
                    //If the route isn't vehicle, see if any routes are selected
                    if (!showVehicle) {
                        showVehicle = _routes.filter(function(route) { return route.Visible == true; }).length == 0;
                    }
                    //Get the old Route
                    matches = _routes.filter(function(route) { return route.RouteID == vehicle.RouteID; });
                    var oldRoute = (matches.length > 0 ? matches[0] : null);
                    if (oldRoute !== null) {
                        oldRoute.RemoveVehicle(vehicle);
                    }
                    else {
                        newVehiclesAdded = true;
                    }
                    //Add vehicle to the new route
                    route.AddVehicle(vehicle);
                    //Check if vehicle should be shown
                    if (showVehicle && !vehicle.Visible)
                        vehicle.Enable();
                }
                vehicle.Move(vehiclePosition, route);
            }

        }
    });
    //If we added a new vehicle, then we need to check if we should display it
    if (newVehiclesAdded) {
        var visibleRoutes = $.grep(_routes, function(route, index) { return route.Visible === true; });
        if (visibleRoutes.length === 0) {
            //If there are no routes visible, then show all of the vehicles on all routes
            $.each(_routes, function(index, route) {
                route.EnableVehicles();
            });
        }
    }

}
function removeVehicle(vehicle) {
    //Get the old Route that the vehicle is on
    var matches = _routes.filter(function(r) { return r.RouteID == vehicle.RouteID; });
    var route = (matches.length > 0 ? matches[0] : null);
    if (route !== null) {
        route.RemoveVehicle(vehicle);
        vehicle.RouteID = 0;
        vehicle.Disable();
    }
}




/**
 * Gets the capacities of the given vehicle
 * @param  {int} vehicleID 
 * @return {object} dfd.promise the deferred promise - an object with results
 */
function getVehicleCapacity(vehicleID) {
    var dfd = new jQuery.Deferred();//deferred object
    $.ajax({
        url: _baseURL + 'Services/JSONPRelay.svc/GetVehicleCapacity?VehicleID=' + vehicleID,
        dataType: 'jsonp',
        jsonp: 'method',
        async: false,
        cache: false,
        success: function(data) {
            dfd.resolve( data );
            //return results;
        },
        error: function(request, status, error) {
            dfd.reject( 'error' );
            //return results;
        }
    });
    return dfd.promise();
}

/**
 * Gets vehicle capacities
 * @return {[type]} [description]
 */
function getVehicleCapacities() {
    $.ajax({
        url: _baseURL + 'Services/JSONPRelay.svc/GetVehicleCapacities',
        dataType: 'jsonp',//jsonp
        jsonp: 'method',
        async: true,
        cache: false
    })
    .done(function(data) {
        try {
            //Clear out existing rows
            $('.vehicleCapacity th[vehicleID]').empty();
            //Do something here with the Vehicle Capacities
            $.each(data, function(index, vehicleCapacity) {
                var vehicleID = vehicleCapacity.VehicleID;
                $('.vehicleCapacity th[vehicleID=' + vehicleID + ']').empty();
                $('.vehicleCapacity th[vehicleID=' + vehicleID + ']').text(vehicleCapacity.CurrentOccupation + '/' + vehicleCapacity.Capacity);

                var matches = $(_vehicles).filter(function() { return this.VehicleID == vehicleCapacity.VehicleID; });
                var vehicle = (matches.length > 0 ? matches[0] : null);
                if (vehicle != null) {
                    vehicle.setVehicleCapacity(vehicleCapacity.CurrentOccupation, vehicleCapacity.Capacity);
                }

            });
        }
        finally {
            setTimeout('getVehicleCapacities()', _refreshVehicleCapacitiesMilliseconds);
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        try {
            $('#errorMessage').text('Problem getting vehicle capacities:' + errorThrown.message);
        }
        finally {
            setTimeout('getVehicleCapacities()', _refreshVehicleCapacitiesMilliseconds);
        }
    });
}
