/* Routes */
var _routes = [];
var _routeSchedules;
var _dayOfWeekScheduleRouteTimes;

function getRoutes() {
    var dfd = new jQuery.Deferred();
    //Clear out our Routes div
    $('#routes').empty();
    $.ajax({
        //url: _baseURL + 'Services/JSONPRelay.svc/GetRoutesForMapWithSchedule',
        url: _baseURL + 'Services/JSONPRelay.svc/GetRoutesForMapWithScheduleWithEncodedLine',
        data: { ApiKey: _apiKey },
        dataType: 'jsonp',
        jsonp: 'method',
        async: false,
        cache: false
    }).done(
        function(routesData) {
            var routeScheduleUrl = _baseURL + 'Services/JSONPRelay.svc/GetRouteScheduleTimes';
            if (_inheritActiveRouteTimesFromSchedules)
                routeScheduleUrl = _baseURL + 'Services/JSONPRelay.svc/GetScheduleRouteActiveTimeSpans';
            $.ajax({
                url: routeScheduleUrl,
                dataType: 'jsonp',
                jsonp: 'method',
                async: false,
                cache: false
            }).done(
                function(routeSchedulesData) {

                    processRouteSchedule(routeSchedulesData);

                    var routesToEnable = layoutRoutes(routesData);
                    //Set the active, inactive routes
                    resetRoutesOnSchedule();
                    toggleRouteMenuVisibility();
                    if (typeof layoutDispatchRoutes === 'function')
                        layoutDispatchRoutes();

                    if (typeof routesToEnable != 'undefined' && routesToEnable != null) {

                        //Get the routes that are supposed to be selected
                        $.each(routesToEnable, function (index, myRoute) {
                            var routeBtn = myRoute.routeLineItem.find('.toggleRouteBtn');
                            var detailBtn = myRoute.routeLineItem.find('.detailsBtn');
                            var routeId = eval(routeBtn.attr('rel'));

                            var cnt = _routes.filter(function (n) { return n.RouteID === routeId && n.OnSchedule }).length;
                            if (cnt > 0) {
                                toggleRouteButton(routeBtn); //turn on the route on the map
                                if (myRoute.showDetails)
                                    toggleRouteDetails(detailBtn); //show details for the route
                            }
                        });
                    }
                    if (_useRouteGroups) {
                        $.ajax({
                            url: _baseURL + 'Services/JSONPRelay.svc/GetRouteGroupsWithRoutes',
                            dataType: 'jsonp',
                            jsonp: 'method',
                            async: false,
                            cache: false
                        }).done(
                            function (routeGroups) {
                                _routeGroups = routeGroups;
                                var list = $('#routeGroups');
                                list.empty();
                                list.append(new Option('Select Service Type', 0));
                                $.each(_routeGroups, function (index, routeGroup) {
                                    list.append(new Option(routeGroup.Description, routeGroup.RouteGroupId));
                                });

                                //Resolve our promise
                                dfd.resolve();
                            })
                        .fail(
                            function (jqXHR, textStatus, errorThrown) {
                                dfd.reject('error');
                                setLoadingStatus('Problem getting route schedules:' + errorThrown.message);
                            }
                        );

                    } else {
                        //Resolve our promise
                        dfd.resolve();
                    }
                }
            )
            .fail(
                function(jqXHR, textStatus, errorThrown) {
                    dfd.reject('error');
                    setLoadingStatus('Problem getting route schedules:' + errorThrown.message);
                }
            );
        }
    )
    .fail(
        function(jqXHR, textStatus, errorThrown) {
            dfd.reject('error');
            setLoadingStatus('Problem getting routes:' + errorThrown.message);
            $('#errorMessage').text('Problem getting routes:' + errorThrown.message);
        }
    );

    return dfd.promise();
}
function processRouteSchedule(routeSchedulesData) {
    if (_inheritActiveRouteTimesFromSchedules) {
        _dayOfWeekScheduleRouteTimes = [{ DayOfWeek: 1, Routes: [] },
                                        { DayOfWeek: 2, Routes: [] },
                                        { DayOfWeek: 3, Routes: [] },
                                        { DayOfWeek: 4, Routes: [] },
                                        { DayOfWeek: 5, Routes: [] },
                                        { DayOfWeek: 6, Routes: [] },
                                        { DayOfWeek: 7, Routes: [] }];
        if (routeSchedulesData != null) {
            for (var a = 0; a < routeSchedulesData.length; a++) {
                var schedule = routeSchedulesData[a];
                for (var b = 0; b < schedule.Routes.length; b++) {
                    var route = schedule.Routes[b];
                    for (var c = 0; c < schedule.DaysOfWeek.length; c++) {
                        var dayOfWeek = schedule.DaysOfWeek[c];
                        //Get the schedule for this day of week
                        var dayOfWeekRoutes = $.grep(_dayOfWeekScheduleRouteTimes, function (obj) { return obj.DayOfWeek === dayOfWeek; });
                        if (dayOfWeekRoutes.length > 0) {
                            dayOfWeekRoutes = dayOfWeekRoutes[0];
                            //Get the routes out
                            var existingRoutes = $.grep(dayOfWeekRoutes.Routes, function (obj) { return obj.RouteID === route.RouteId; });
                            var existingRoute = null;
                            if (existingRoutes.length === 0) {
                                existingRoute = { RouteID: route.RouteId, ActiveTimeSpans: [] };
                                dayOfWeekRoutes.Routes.push(existingRoute);
                            } else
                                existingRoute = existingRoutes[0];
                            if (existingRoute != null) {
                                for (var d = 0; d < route.ActiveTimeSpans.length; d++) {
                                    var startSeconds = ISODurationToSeconds(route.ActiveTimeSpans[d].StartTime);
                                    var endSeconds = ISODurationToSeconds(route.ActiveTimeSpans[d].EndTime);
                                    if (startSeconds > endSeconds) {
                                        endSeconds = endSeconds + 86400;
                                    }
                                    //Adjust for the Buffer we would like;
                                    startSeconds -= _activeRouteTimeBufferMinutes * 60;
                                    endSeconds += _activeRouteTimeBufferMinutes * 60;

                                    var existingTimeSpans = $.grep(existingRoute.ActiveTimeSpans, function (obj) { return obj.StartSeconds === startSeconds && obj.EndSeconds === endSeconds; });
                                    if (existingTimeSpans.length === 0) {
                                        existingRoute.ActiveTimeSpans.push({ StartSeconds: startSeconds, EndSeconds: endSeconds });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        $.each(routeSchedulesData, function (index, routeSchedule) {
            routeSchedule.StartTimeUTC = routeSchedule.StartTimeUTC.replace(/\//g, '-');
            routeSchedule.EndTimeUTC = routeSchedule.EndTimeUTC.replace(/\//g, '-');
        });
        _routeSchedules = routeSchedulesData;
    }
}
/**
* Layout routes on the main route menu
* @param  {array} routes array of route objects
*/
function layoutRoutes(routes) {
    var ul = $('<ul/>', {});
    var routesDOM = $('#routes');
    var routesToEnable = [];
    //Clear the Div
    routesDOM.empty();
    //Clear the Routes array
    _routes = [];

    //Layout the Instructions
    //buildInstructions(ul);

    //Add each of the routes
    $.each(routes, function(index, obj) {
        //If we are restricting routes, then only show routes in our list
        if (_restrictRoute && _specificRoutes != null && _specificRoutes.length > 0) {
            if (_specificRoutes.filter(function (n) { return n == obj.RouteID; }).length === 0)
                obj.IsVisibleOnMap = false;
            else
                obj.IsVisibleOnMap = true;
        }
        if (obj.IsVisibleOnMap) {
            var route = new Route(obj);
            route.Initialize(obj);

            //Add the Line Item
            routesDOM.append(route.LineItem);
            //Show the arrivals even if there are no vehicles, for Schedules and Schedules with Estimates
            if (route.ETATypeID == ETATypes.Schedules || route.ETATypeID == ETATypes.SchedulesWithEstimates) {
                $('.arrivals[RouteID=' + route.RouteID + ']').show();
                $('.noVehiclesOnRoute[RouteID=' + route.RouteID + ']').hide();
            }

            var routeLineItemObj = $('#' + route.LineItem[0].id); //this happens after routesDOM.append - it has to be part of the DOM first

            //Check if the route should be selected
            //1-6-2014 BH Changed to only check it if we aren't showing specific routes
            if (route.IsCheckedOnMap && _specificRoutes.length == 0) {
                routesToEnable.push({ routeLineItem: routeLineItemObj, showDetails: true });
            }
            else if (_specificRoutes.filter(function (n) { return n == route.RouteID; }).length > 0) {
                routesToEnable.push({ routeLineItem: routeLineItemObj, showDetails: true });
            }
            else if (typeof (route.IsCheckLineOnlyOnMap) != 'undefined' && route.IsCheckLineOnlyOnMap) {
                routesToEnable.push({ routeLineItem: routeLineItemObj, showDetails: false });
            }


            //Destroy objects that aren't needed any more
            delete route.EstimatesTable;
            delete route.LineItem;
            delete route.InfoText;
            delete route.StopTimesPDFLink;
            delete route.IsCheckedOnMap;
            delete route.IsCheckLineOnlyOnMap;

            _routes.push(route);
        }
    });

    return routesToEnable;
}


function buildInstructions(ul) {//obselete - unused
    var li = $('<li/>', {});
    li.addClass('instructions');
    li.html('Click a route to view arrival times<br />Click \'i\' to view additional information');
    ul.append(li);
}

/**
* Turns all route lines off and on
*/
function toggleShowAllRouteLines(showAllRoutesBtn) {
    if (showAllRoutesBtn.hasClass('active')) {//DEACTIVATE ALL
        //we want to remove all routes, so first activate all routes to make sure they'll all then deactivate
        $('#routes .route .toggleRouteBtn').addClass('active');
        $('#routes .route .toggleRouteBtn').trigger('click');
        showAllRoutesBtn.removeClass('active');
    }
    else {//ACTIVATE ALL
        //we want to activet all routes, so first, deactivate all
        $('#routes .route .toggleRouteBtn').removeClass('active');
        $('#routes .route:visible .toggleRouteBtn').trigger('click');
        showAllRoutesBtn.addClass('active');
    }
}