var _showRoutesBasedOnSchedule = true;
function getStopArrivals() {
    resetRoutesOnSchedule();
    $.ajax({
        url: _baseURL + 'Services/JSONPRelay.svc/GetRouteStopArrivals',
        data: { TimesPerStopString: _scheduledTimesToGet, ApiKey: _apiKey },
        dataType: 'jsonp',
        jsonp: 'method',
        async: true,
        cache: false
    }).done(
        function (data) {
            //layoutRoutes(data);
            $('#labelStatus').text('Laying Out Estimates');
            layoutEstimates(data);

            //Get Estimates for vehicles that have their popup open
            var vehicleIdsForEstimates = [];
            $('.vehicleInfoBox:not(.hideInfoBox):has(.estimates:visible)').each(function () {
                vehicleIdsForEstimates.push($(this).attr('vehicleId'));
            });
            if (vehicleIdsForEstimates != null && vehicleIdsForEstimates.length > 0) {
                $('#labelStatus').text('Getting Vehicle Estimates');
                getVehicleEstimates(vehicleIdsForEstimates);
            }
            $('#labelStatus').text('');

        })
    .fail(
        function (jqXHR, textStatus, errorThrown) {
            $('#errorMessage').text('Problem getting vehicle arrivals:' + errorThrown.message);
        })
    .always(
            function () {
                setTimeout(function () { getStopArrivals(); }, _refreshEstimatesMilliseconds);
            });
}

function getVehicleEstimates(vehicleIds) {
    $.ajax({
        url: _baseURL + 'Services/JSONPRelay.svc/GetVehicleRouteStopEstimates',
        data: { vehicleIdStrings: vehicleIds.join(','), quantity: 2 },
        dataType: 'jsonp',
        jsonp: 'method',
        async: true,
        cache: false
    }).done(
        function (data) {
            $.each(data, function (index, vehicleEstimates) {
                var matches = _vehicles.filter(function (v) { return v.VehicleID === vehicleEstimates.VehicleID; });
                var vehicle = (matches.length > 0 ? matches[0] : null);
                if (vehicle != null) {
                    if (vehicle.VehicleMarker != null) {
                        vehicle.updateVehicleEstimates(vehicle.VehicleMarker, vehicleEstimates.Estimates, null, false);
                    }
                }
            });
        });
}
function getStopArrivalTimes() {
    //This is a new method for getting Arrival Times, where the verbiage is already layed out on the server
    resetRoutesOnSchedule();
    $.ajax({
        url: _baseURL + 'Services/JSONPRelay.svc/GetStopArrivalTimes',
        data: { TimesPerStopString: _scheduledTimesToGet, ApiKey: _apiKey },
        dataType: 'jsonp',
        jsonp: 'method',
        async: true,
        cache: false
    }).done(
        function (data) {
            $('#labelStatus').text('Laying Out Estimates');
            layoutStopArrivalTimes(data);
            //layoutEstimates(data);
            $('#labelStatus').text('');
        })
    .fail(
        function (jqXHR, textStatus, errorThrown) {
            $('#errorMessage').text('Problem getting vehicle arrivals:' + errorThrown.message);
        })
    .always(
            function () {
                setTimeout(function () { getStopArrivalTimes(); }, _refreshEstimatesMilliseconds);
            });
}

function layoutEstimates(data) {
    try {
        _estimates = [];
        if (data !== null) {
            _estimates = data;
        }
        layoutRouteArrivals();
    }
    finally {
        toggleRouteMenuVisibility();
    }
}

/**
* Takes all routes off, then puts them back "onSchedule" if they are still running
*/
function resetRoutesOnSchedule() {
    var localTime = getCurrentTime();
    //Have to add a day to get to the Day Of Week that this passes back
    var currentDayOfWeek = (localTime).getDay() + 1;
    //Set whether the route is on schedule
    for (var x = 0; x < _routes.length; x++) {
        //Set all routes as off schedule
        _routes[x].OnSchedule = false;
        if (_inheritActiveRouteTimesFromSchedules) {
            //Get schedules for this day of week
            var dayOfWeekRoutes = $.grep(_dayOfWeekScheduleRouteTimes, function (obj) { return obj.DayOfWeek === currentDayOfWeek; });
            if (dayOfWeekRoutes.length > 0) {
                dayOfWeekRoutes = dayOfWeekRoutes[0];
                var routes = $.grep(dayOfWeekRoutes.Routes, function (obj) { return obj.RouteID === _routes[x].RouteID; });
                if (routes.length > 0) {
                    var route = routes[0];
                    for (var y = 0; y < route.ActiveTimeSpans.length; y++) {
                        var startSeconds = route.ActiveTimeSpans[y].StartSeconds;
                        var endSeconds = route.ActiveTimeSpans[y].EndSeconds;
                        var startDateTime = new Date(Date.UTC(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), 0, 0, startSeconds));
                        var startUtcDateTime = new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 0, 0, startSeconds));
                        var endDateTime = new Date(Date.UTC(localTime.getFullYear(), localTime.getMonth(), localTime.getDate(), 0, 0, endSeconds));
                        var endUtcDateTime = new Date(Date.UTC(localTime.getUTCFullYear(), localTime.getUTCMonth(), localTime.getUTCDate(), 0, 0, endSeconds));
                        if (localTime >= startDateTime && localTime <= endDateTime) {
                            _routes[x].OnSchedule = true;
                            break;;
                        }
                        if (localTime >= startUtcDateTime && localTime <= endUtcDateTime) {
                            _routes[x].OnSchedule = true;
                            break;;
                        }
                    }
                }
            }
        } else {
            var routeSchedules = $.grep(_routeSchedules, function (a, b) { return a.RouteID === _routes[x].RouteID; });
            if (routeSchedules !== null && routeSchedules.length > 0) {
                $.each(routeSchedules, function (index, routeSchedule) {
                    var startTime = new Date(routeSchedule.StartTimeUTC); //<--ISSUE: The StartTime/EndTime properity isn't a valid date string so JS can't use it to create a Date.
                    var endTime = new Date(routeSchedule.EndTimeUTC);
                    //Make the Start Time and End Time have the current date
                    appendCurrentDate(localTime, startTime);
                    appendCurrentDate(localTime, endTime);
                    //Check that the End Time is after the Start Time
                    if (startTime >= endTime) {
                        endTime.setDate(endTime.getDate() + 1);
                    }
                    if (localTime > startTime && localTime < endTime) {
                        _routes[x].OnSchedule = true;
                        return false;
                    }
                });
            }
        }
        //If we are showing a specific route, then always show it, reguardless of schedule
        if (_specificRoutes.filter(function (n) { return n == _routes[x].RouteID; }).length > 0) {
            _routes[x].OnSchedule = true;
        }
    }
}

/**
* Adds current local date to a datetime object
* @param  {object} localDate local datetime object
* @param  {object} newDate   the datetime object to append the date to
*/
function appendCurrentDate(localDate, newDate) {
    newDate.setMonth(1);
    newDate.setYear(localDate.getFullYear());
    newDate.setMonth(localDate.getMonth());
    newDate.setDate(localDate.getDate());
}


/**
* Lays out all arrival times based on estimates received
*/
function layoutRouteArrivals() {
    var matches = [];
    var cellText = 'N/A';
    var vehicleID = 0;
    var routeID = 0;
    var etaTypeID = 0;
    var routeStopID = 0;
    var route = null;
    //Remove any highlighting for arrivals
    $('.highlight').removeClass('highlight');

    //Changes for Dispatch Map
    if (typeof _isDispatchMap != 'undefined' && _isDispatchMap)
        flagOffScheduleArrivals();

    //Update all of the tables of estimates
    $.each($('table.arrivals'), function (index, table) {
        //Get the Route ID from the table attribute;
        routeID = $(table).attr('routeid'); //was wrapped in eval
        etaTypeID = $(table).attr('etatypeid'); //was wrapped in eval
        matches = _routes.filter(function (r) { return r.RouteID == routeID; });
        var hasClass = $(table).hasClass('test');
        route = (matches.length > 0 ? matches[0] : null);
        //Check whether it should be shown on the map by default
        //If we have to check if the column header is populated, do it here
        if (_showVehicleNameInScheduleHeader && (etaTypeID == ETATypes.Schedules || etaTypeID == ETATypes.SchedulesWithEstimates)) {
            for (var x = 0; x < _arrivalTimesToDisplay; x++) {
                var vehicleFilled = false;
                var estimates = _estimates.filter(function (n) { return n.RouteID == routeID; });
                for (var y = 0; y < estimates.length; y++) {
                    if (estimates[y].ScheduledTimes.length > x) {
                        //Get the Scheduled Time for this column
                        var vehicleId = estimates[y].ScheduledTimes[x].AssignedVehicleId;
                        if (vehicleId > 0) {
                            var vehicles = _vehicles.filter(function (v) { return v.VehicleID == vehicleId; });
                            if (vehicles != null && vehicles.length > 0) {
                                $(table).find('th[arrival="' + (x + 1) + '"]').text(vehicles[0].Name);
                            }
                            break;
                        }
                    }
                }
            }
        }
        //route.ShowOpenByDefault
        //Loop through each Route Stop ID
        $.each($(table).find('tr[routestopid]'), function (index, row) {
            routeStopID = $(row).attr('routestopid'); //was wrapped in eval
            //Empty out all of the cells
            $(row).find('td[vehicleid]').empty();
            $(row).find('td[arrival]').empty();

            //Get the estimates for this route stop
            matches = _estimates.filter(function (n) { return n.RouteID == routeID && n.RouteStopID == routeStopID; });
            var arrival = (matches.length > 0 ? matches[0] : null);
            if (arrival !== null) {

                //Layout Estimates (TIMES BASED ON ESTIMATE)
                if (etaTypeID == ETATypes.Estimates || etaTypeID == 0) {//these need to be "==" for now
                    //Always update columns for bus, because they may click on a bus and want to know when it arrives
                    //Loop through each vehicle cell
                    $.each($(row).find('td[vehicleID]'), function (index, cell) {
                        vehicleID = $(cell).attr('vehicleID');
                        matches = arrival.VehicleEstimates.filter(function (n) { return n.VehicleID == vehicleID; });
                        var estimate = (matches.length > 0 ? matches[0] : null);
                        if (estimate !== null) {
                            //Format the box for the stop arriving
                            if (estimate.OnRoute && estimate.SecondsToStop <= _secondsFromStopToBeArriving) {
                                $(cell).text(_arrivalVerbiage);
                                $(cell).addClass('highlight');
                            }
                            else {
                                cellText = getEstimateText(estimate);
                                $(cell).text(cellText);
                            }
                        }
                        else {
                            $(cell).text('');
                        }
                    });
                    if (_arrivalOrder === 'Time') {// 'Time'
                        //loop through each time cell
                        var orderedVehicleEstimates = arrival.VehicleEstimates; //setup preordered array of estimates
                        orderedVehicleEstimates = orderedVehicleEstimates.sort(sortBySecondsToStop); //sort the array
                        $.each($(row).children('.time'), function (timeIndex, cell) {//for each time cell, insert a corresponding estimate
                            if (!!orderedVehicleEstimates[timeIndex]) {
                                var estimate = orderedVehicleEstimates[timeIndex];
                                //Format the box for the stop arriving
                                if (estimate.OnRoute && estimate.SecondsToStop <= _secondsFromStopToBeArriving) {
                                    $(cell).text(_arrivalVerbiage);
                                    $(cell).addClass('highlight');
                                }
                                else {
                                    cellText = getEstimateText(estimate);
                                    $(cell).text(cellText);
                                }
                                //assign the correct vehicleID
                                $(cell).attr('vehicleid', estimate.VehicleID);
                            }
                        });
                    } //arrivalOrder is Time
                } //times based on estimate



                    //Layout Schedule and schedule with estimates (TIMES BASED ON SCHEDULE AND/OR ESTIMATES -this part automatically sorts by arrival time)
                else if (etaTypeID == ETATypes.Schedules || etaTypeID == ETATypes.SchedulesWithEstimates) {//for now, these NEED to be '=='
                    //Loop through each of the schedules
                    for (var x = 1; x <= _arrivalTimesToDisplay; x++) {
                        var scheduleResults = null;
                        var cell = $(row).find('td[arrival=' + x + ']');
                        if (etaTypeID == ETATypes.SchedulesWithEstimates && _showScheduleEstimateColumn) {
                            if (x == 1) {
                                //Layout Schedule
                                cell = $(row).find('td[arrival=' + x + '][etaTypeID=' + ETATypes.Schedules + ']');
                                scheduleResults = getScheduleText(arrival, x, ETATypes.Schedules);
                                fillArrivalTimeCell(scheduleResults, cell);

                                //4-6-2015 BH Changed to not show Estimates if there is no schedule
                                if (scheduleResults.Text !== '' || (scheduleResults.Text == '' && _showEstimatesWhenNoSchedulePresent)) {
                                    //Layout Estimate
                                    cell = $(row).find('td[arrival=' + x + '][etaTypeID=' + ETATypes.Estimates + ']');
                                    scheduleResults = getScheduleText(arrival, x, ETATypes.Estimates);
                                    fillArrivalTimeCell(scheduleResults, cell, ETATypes.Estimates);
                                }
                            }
                            else {
                                //Layout Schedule
                                cell = $(row).find('td[arrival=' + x + ']');
                                scheduleResults = getScheduleText(arrival, x, ETATypes.Schedules);
                                fillArrivalTimeCell(scheduleResults, cell);
                            }

                        }
                        else {
                            scheduleResults = getScheduleText(arrival, x, etaTypeID);
                            fillArrivalTimeCell(scheduleResults, cell);
                        }
                    }
                }
            } //this stop has estimates
        });
    });
    //Update the Stop Popup if it is open
    var stopPopup = $('.stopPopupBody:visible');
    if (stopPopup.length > 0) {
        //Get each of the Route Items
        $.each(stopPopup.find('.routeItem'), function (index, routeItem) {
            var routeID = $(routeItem).attr('routeID');
            var routeStopID = $(routeItem).attr('routeStopID');
            var matches = _routes.filter(function (r) { return r.RouteID == routeID; });
            var route = (matches.length > 0 ? matches[0] : null);
            var arriveETA1 = $(routeItem).find('.ArrivalETA[eta=1]');
            var arriveETA2 = $(routeItem).find('.ArrivalETA[eta=2]');
            //Get the Stop Times for this Route Stop
            var arrivals = getRouteStopArrivalsForPopup(route, routeStopID);
            if (arrivals !== null && arrivals.length > 0) {
                var arrivalOne = arrivals[0];
                var arrivalTwo = arrivals[1];

                arriveETA1.text(arrivalOne.Text);
                if (arrivalTwo !== null && typeof (arrivalTwo) != 'undefined') {
                    arriveETA2.text(arrivalTwo.Text);
                    arriveETA2.parent().show();
                }
                else {
                    arriveETA2.parent().hide();
                }
            }
        });
    }
    //3-22-2016 BH Changed to use a seperate call to update Vehicle Estimates
    ////Update Vehicle Estimates if visible
    //var vehiclePopups = $('.vehicleInfoBox:visible:not(.hideInfoBox)');
    //if (vehiclePopups.length > 0) {
    //    //Get each of the Vehicles
    //    $.each(vehiclePopups, function (index, vehiclePopup) {
    //        var vehicleID = vehiclePopups.attr('vehicleID');
    //        var matches = _vehicles.filter(function (v) { return v.VehicleID == vehicleID; });
    //        var vehicle = (matches.length > 0 ? matches[0] : null);
    //        if (vehicle != null) {
    //            if (vehicle.VehicleMarker != null) {
    //                vehicle.setVehicleEstimates(vehicle.VehicleMarker, null, false);
    //            }
    //        }

    //    });
    //}
    resizeStopColumns();
}
function fillArrivalTimeCell(scheduleResults, cell, etaTypeID) {
    if (scheduleResults !== null) {
        if (typeof scheduleResults.Title != 'undefined' && scheduleResults.Title != null) {
            $(cell).attr('title', scheduleResults.Title);
        }
        if (scheduleResults.IsArriving) {
            $(cell).text(_arrivalVerbiage);
            $(cell).addClass('highlight');
        }
        else if (scheduleResults.Text != null) {
            // If laying out an Estimate, and we have to color it, then do it here.
            if (etaTypeID == ETATypes.Estimates && _scheduleEstimateColumnTextColor != null && _scheduleEstimateColumnTextColor != '') {
                var span = $('<span>', { text: scheduleResults.Text });
                span.css('color', _scheduleEstimateColumnTextColor);
                if (typeof scheduleResults.VehicleName != 'undefined' && scheduleResults.VehicleName != null)
                    span.attr('title', scheduleResults.VehicleName);
                $(cell).append(span);
            }
            else {
                $(cell).text(scheduleResults.Text);
                if (scheduleResults.EstimateText !== null && !_showScheduleEstimateColumn) {
                    var span = $('<span>', { text: ' -' + scheduleResults.EstimateText });
                    span.css('color', 'Yellow');
                    $(cell).append(span);
                }
            }

        }
    }
}
function getEstimateText(estimate) {
    var results = '';
    //Get the vehicle
    var matches = _vehicles.filter(function (v) { return v.VehicleID == estimate.VehicleID; });
    var vehicle = (matches.length > 0 ? matches[0] : null);
    if (vehicle == null)
        return '';
    if (vehicle.IsDelayed) {
        results = 'Delayed';
    }
    else if (!vehicle.IsOnRoute || !estimate.OnRoute) {
        if (!estimate.OnRoute)
            results = _noVehicleEstimateVerbiage;
        else
            results = 'Off Route';
    }
    else if (estimate.SecondsToStop <= _secondsFromStopToBeArriving) {
        results = _arrivalVerbiage;
    }
    else if (_estimateDisplayType == 'Time') {
        var date = getCurrentTime();
        date.setSeconds(date.getSeconds() + estimate.SecondsToStop);
        results = date.defaultTimeView();
    }
    else {
        var seconds = estimate.SecondsToStop % 60;
        var minutes = (estimate.SecondsToStop - seconds) / 60;
        if (minutes >= 0) {
            minutes = Math.floor(minutes);
        }
        else {// negative
            minutes = Math.ceil(minutes);
        }

        //round minutes up after 30 seconds
        if (seconds >= 30 && minutes > 0 && ((minutes * 60) + seconds) >= _secondsFromStopToBeArriving) {
            minutes = minutes + 1;
        }

        results = minutes + ' min';
    }
    return results;
}

function getScheduleText(arrival, index, etaTypeID) {
    var results = { Text: '', EstimateText: null, IsArriving: false, Title: null };
    var schedule = (arrival.ScheduledTimes.length >= index ? arrival.ScheduledTimes[index - 1] : null);
    var estimate = null;
    var showDeparted = false;
    var useEstimate = true;
    var showArriving = false;
    //Convert to ensure it is a number
    etaTypeID = eval(etaTypeID);
    if (etaTypeID === ETATypes.Estimates) {
        var orderedVehicleEstimates = arrival.VehicleEstimates; //setup preordered array of estimates
        orderedVehicleEstimates = orderedVehicleEstimates.sort(sortBySecondsToStopAndOnRoute); //sort the array
        if (orderedVehicleEstimates.length >= (index)) {
            //If we are returning Estimates, return the first one.
            estimate = orderedVehicleEstimates[(index - 1)];
        }
        schedule = null;
    }
        //9-4-2015 BH If we are to show Estimate when no schedule is present, then do it here.
    else if (etaTypeID === ETATypes.SchedulesWithEstimates && (schedule != null || _showEstimatesWhenNoSchedulePresent)) {
        var orderedEstimates = arrival.VehicleEstimates; //setup preordered array of estimates
        //If we are to restrict estimates to the vehicle assigned on the schedule, then restrict things here
        if (typeof schedule != 'undefined' && schedule != null) {
            if (_restrictEstimatesToVehicleAssignedToSchedule && schedule.AssignedVehicleId > 0) {
                orderedEstimates = orderedEstimates.filter(function (n) {
                    return n.VehicleID === schedule.AssignedVehicleId;
                });
            }
        }
        orderedEstimates = orderedEstimates.sort(sortBySecondsToStopAndOnRoute); //sort the array
        estimate = (orderedEstimates.length >= index ? orderedEstimates[(index - 1)] : (orderedEstimates.length >= 1 ? orderedEstimates[0] : null));
        //Dont use the estimate if there is no schedule, and we aren't on the first column
        if (schedule == null && estimate != null && index > 1)
            estimate = null;
        if (_scheduleWithEstimateShowArrivalVerbiage && index === 1 && estimate != null && estimate.SecondsToStop <= _secondsFromStopToBeArriving) {
            showArriving = true;
        }
    }
    if (schedule !== null) {
        var scheduledTime = null;
        if (_scheduleTimeToDisplay === 'Arrival')
            scheduledTime = Date.fromMSJSON(schedule.ArrivalTimeUTC);
        else
            scheduledTime = Date.fromMSJSON(schedule.DepartureTimeUTC);
        //Output for debugging
        if (estimate !== null) {
            results.Title = 'Sched:' + scheduledTime.defaultTimeView();
            var t = getCurrentTime();
            t.setSeconds(t.getSeconds() + estimate.SecondsToStop);

            //For debugging
            results.Title += '-Est:' + t.defaultTimeView();
            var v = _vehicles.filter(function (v) { return v.VehicleID === estimate.VehicleID; });
            if (v.length > 0)
                results.Title += '-Bus:' + v[0].Name;
        }


        var time = new Date(scheduledTime.getTime());

        if (_minutesFromScheduledTimeToEvaluateEstimatedTime > 0) {
            var minutesFromSchedule = Math.round((time.getTime() - getCurrentTime()) / (1000 * 60));
            useEstimate = minutesFromSchedule <= _minutesFromScheduledTimeToEvaluateEstimatedTime;
        }

        //Put the later of the departure, and Estimate time
        if (useEstimate && estimate !== null && _estimateShowSingleTime) {
            var estimateTime = getCurrentTime();
            estimateTime.setSeconds(estimateTime.getSeconds() + estimate.SecondsToStop);

            var comparisonTime = new Date(time.getTime());
            if (typeof _scheduledMinutesLateBeforeEstimate != 'undefined' && _scheduledMinutesLateBeforeEstimate > 0)
                comparisonTime.setTime(comparisonTime.getTime() + _scheduledMinutesLateBeforeEstimate * 60 * 1000);
            if (estimateTime > comparisonTime) {
                var maxMinutesLate = 0;
                //var minutesLate = Math.round((((estimateTime - time) % 86400000) % 3600000) / 60000);
                var minutesLate = Math.round((estimateTime.getTime() - time.getTime()) / (1000 * 60));
                if (typeof _estimatedMinutesLateBeforeSchedule != 'undefined' && _estimatedMinutesLateBeforeSchedule > 0)
                    maxMinutesLate = _estimatedMinutesLateBeforeSchedule
                if (maxMinutesLate > 0 && minutesLate > maxMinutesLate) {
                    time = time;
                    showDeparted = _showDepartedWhenEstimateIsRolledBackToSchedule;
                }
                else
                    time = estimateTime;
            }
        }
        else if (_showDepartedWhenNoEstimateAndScheduleIsPast) {
            if (time < getCurrentTime())
                showDeparted = true;
        }
        //If we shouldn't allow departed to show if the scheduled time has past, revert it back here
        if (showDeparted && !_allowDepartedWhenScheduleIsInTheFuture) {
            //If the scheduled time is in the future, don't show departed
            if (scheduledTime > getCurrentTime())
                showDeparted = false;
        }
        if (showDeparted) {
            results.Text = 'Departed';
            //1-19-2016 BH Check to see if the Vehicle is delayed
            if (estimate != null) {
                var vs = _vehicles.filter(function (v) { return v.VehicleID === estimate.VehicleID; });
                var v = (vs.length > 0 ? vs[0] : null);
                if (v !== null && v.IsDelayed)
                    results.Text = 'Delayed';
            }
        }
        else {
            if (_scheduleDisplayType === 'Minutes') {
                var secondsToStop = (time - getCurrentTime()) / 1000;
                if (secondsToStop <= _secondsFromStopToBeArriving) {
                    results.Text = _arrivalVerbiage;
                } else {
                    var seconds = secondsToStop % 60;
                    var minutes = (secondsToStop - seconds) / 60;
                    if (minutes >= 0) {
                        minutes = Math.floor(minutes);
                    } else { // negative
                        minutes = Math.ceil(minutes);
                    }

                    //round minutes up after 30 seconds
                    if (seconds >= 30 && minutes > 0 && ((minutes * 60) + seconds) >= _secondsFromStopToBeArriving) {
                        minutes = minutes + 1;
                    }

                    results.Text = minutes + ' min';
                }
            } else {
                //Add the scheduled time
                results.Text = time.defaultTimeView();
            }
        }
        //append the estimate time if we are to show both
        if (estimate !== null && !_estimateShowSingleTime) {
            results.EstimateText = getEstimateText(estimate);
        }
    }
        //Show just the estimate, if there is no schedule
    else if (estimate !== null) {
        //Format the box for the stop arriving
        results.Text = getEstimateText(estimate);
        if (results.Text == _arrivalVerbiage)
            results.IsArriving = true;
        //Get the vehicle name
        if (typeof _isDispatchMap != 'undefined' && _isDispatchMap) {
            var matches = _vehicles.filter(function (v) { return v.VehicleID == estimate.VehicleID; });
            var vehicle = (matches.length > 0 ? matches[0] : null);
            if (vehicle != null) {
                results.VehicleName = vehicle.Name;
            }
        }
    }
    if (showArriving) {
        results.Text = _arrivalVerbiage;
        results.IsArriving = true;
    }
    return results;
}

/**
* Gets the estimate time given a vechicle and a route stop. For a formatted string use getVehicleRouteStopEstimateText()
* @param  {int} routeStopID
* @param  {int} vehicleID 
* @return {string} estimate
*/
function getVehicleRouteStopEstimate(routeStopID, vehicleID) {
    var estimate = null;
    var results = { Text: null, IsArriving: false };
    var matches = _estimates.filter(function (n) {
        return n.RouteStopID == routeStopID;
    });
    var arrival = (matches.length > 0 ? matches[0] : null);
    if (arrival !== null) {
        matches = arrival.VehicleEstimates.filter(function (v) { return v.VehicleID == vehicleID; });
        estimate = (matches.length > 0 ? matches[0] : null);
    }
    return estimate;
}

function getVehicleRouteStopEstimateText(routeStopID, vehicleID) {
    var results = { Text: null, IsArriving: false };
    var matches = _estimates.filter(function (n) {
        return n.RouteStopID == routeStopID;
    });
    var arrival = (matches.length > 0 ? matches[0] : null);
    if (arrival !== null) {
        matches = arrival.VehicleEstimates.filter(function (v) { return v.VehicleID == vehicleID; });
        var estimate = (matches.length > 0 ? matches[0] : null);
        if (estimate !== null) {
            results.Text = getEstimateText(estimate);
            if (estimate.SecondsToStop <= _secondsFromStopToBeArriving) {
                results.IsArriving = true;
            }
        }
    }
    return results;
}

function getRouteStopArrivalsForPopup(route, routeStopID) {
    var results = null;
    var matches = _estimates.filter(function (n) { return n.RouteStopID == routeStopID; });
    var arrival = (matches.length > 0 ? matches[0] : null);
    if (arrival !== null) {
        if (route.ETATypeID == ETATypes.Estimates || route.ETATypeID == 0) {
            $.each(arrival.VehicleEstimates, function (index, estimate) {
                var nextArrival = { Text: '', IsArriving: false };
                if (estimate.SecondsToStop <= _secondsFromStopToBeArriving) {
                    nextArrival.IsArriving = true;
                }
                nextArrival.Text = getEstimateText(estimate);
                if (results === null) {
                    results = [];
                }
                results.push(nextArrival);
            });
        }
        else if (route.ETATypeID == ETATypes.Schedules || route.ETATypeID == ETATypes.SchedulesWithEstimates) {
            for (var x = 1; x <= 2; x++) {
                var scheduleResults = getScheduleText(arrival, x, route.ETATypeID);
                if (scheduleResults !== null) {
                    nextArrival = { Text: scheduleResults.Text, IsArriving: scheduleResults.IsArriving };
                    if (results === null) {
                        results = [];
                    }
                    results.push(nextArrival);
                }
            }
        }
    }
    return results;
}

/**
* Shows the visibility of routes in the list
*/
function toggleRouteMenuVisibility() {
    var showOffRouteRoutes = false; //by default don't show "off-route" (inactive) routes
    if ($('.activeRoutesToggle #routeListAll').hasClass('active')) {//show all routes if the UI marks so.
        showOffRouteRoutes = true;
    }
    //Go through all routes, and set whether they are visible on the drop down
    for (x = 0; x < _routes.length; x++) {
        //console.log(_routes[x]);
        var listItem = $('li#route' + _routes[x].RouteID);
        if (listItem.length > 0) {
            if ((_routes[x].InActiveRouteGroup || !_useRouteGroups)
                && (
                    showOffRouteRoutes
                    || (!_showRoutesBasedOnSchedule && _routes[x].HasVehiclesOnRoute())
                    || (_showRoutesBasedOnSchedule && _routes[x].OnSchedule)
                    )
                ) {
                if (!listItem.is(':visible')) {
                    listItem.removeClass('hidden');
                    if (_checkActiveRoutes) {
                        toggleRouteButton(listItem.find('.toggleRouteBtn')); //turn on the route on the map
                        toggleRouteDetails(listItem.find('.detailsBtn')); //show details for the route
                    }
                }
            }
            else {
                if (listItem.is(':visible') && (_routes[x].Visible === false || _checkActiveRoutes)) {
                    listItem.addClass('hidden');
                    if (_routes[x].Visible) {
                        toggleRouteButton(listItem.find('.toggleRouteBtn')); //turn on the route on the map
                        toggleRouteDetails(listItem.find('.detailsBtn')); //show details for the route
                    }
                }
            }
        }
    }
}

/**
* Adds a fixed width to the the stop name columns in the routes table if there are x number of time table cells
*/
function resizeStopColumns() {
    $('.arrivals tr').each(function (rowIndex, row) {//loop over each row in the routes
        if ($(row).children('.time').length > 4) {//if this row has more than 3 times on it
            $(row).children('.stopName').addClass('fixedWidth');
        }
    });
}
function flagOffScheduleArrivals() {
    //Check if we are tracking Late or Early
    var _trackLate = _highlightLateVehicles || _highlightLateTimes;
    var _trackEarly = _highlightEarlyVehicles || _highlightEarlyTimes;
    var vehicles = [];
    var stops = [];
    //Only process if we are tracking Late or Early
    if (_trackLate || _trackEarly) {
        //Go through all Route Stop ID's that we should look at
        $.each(_onTimeRouteStopIDs, function (i, routeStopID) {
            //Only process where we have Scheduled Times and estimates
            var arrivals = _estimates.filter(function (r) { return r.ScheduledTimes != null && r.ScheduledTimes.length > 0 && r.VehicleEstimates != null && r.VehicleEstimates.length > 0 && r.RouteStopID === routeStopID; });
            $.each(arrivals, function (index, arrival) {

                //Loop through all of the Schedules
                $.each(arrival.ScheduledTimes, function (scheduleIndex, schedule) {

                    if (schedule != null) {
                        var estimateDate = getCurrentTime();
                        var scheduledDate = (_scheduleTimeToDisplay === 'Arrival' ? Date.fromMSJSON(schedule.ArrivalTimeUTC) : Date.fromMSJSON(schedule.DepartureTimeUTC));
                        var vehicleID = 0;
                        var matches = arrival.VehicleEstimates.filter(function (e) { return e.VehicleID === schedule.AssignedVehicleId; });
                        var estimate = null;
                        if (matches.length > 0)
                            estimate = matches[0];
                        else if (schedule.AssignedVehicleId == null || schedule.AssignedVehicleId === 0)
                            estimate = arrival.VehicleEstimates[0];

                        if (estimate != null) {
                            estimateDate.setSeconds(estimateDate.getSeconds() + estimate.SecondsToStop);
                            vehicleID = estimate.VehicleID;
                            var diffMs = (estimateDate - scheduledDate); // milliseconds between now & Christmas
                            var diffMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                            //Check for Late
                            if (_trackLate && diffMinutes > _minutesForLate) {
                                if (_highlightLateVehicles) {
                                    if (vehicles.filter(function (v) { return v.VehicleID === vehicleID; }).length === 0)
                                        vehicles.push({ VehicleID: vehicleID, OnTimeStatus: OnTimeStatuses.Late });
                                }
                                if (_highlightLateTimes)
                                    stops.push({ RouteStopID: arrival.RouteStopID, OnTimeStatus: OnTimeStatuses.Late, Arrival: scheduleIndex + 1 });
                            }
                                //Check for Early
                            else if (_trackEarly && diffMinutes < (Math.abs(_minutesForEarly) * -1)) {
                                if (_highlightEarlyVehicles) {
                                    if (vehicles.filter(function (v) { return v.VehicleID === vehicleID; }).length === 0)
                                        vehicles.push({ VehicleID: vehicleID, OnTimeStatus: OnTimeStatuses.Early });
                                }
                                if (_highlightEarlyTimes)
                                    stops.push({ RouteStopID: arrival.RouteStopID, OnTimeStatus: OnTimeStatuses.Early, Arrival: scheduleIndex + 1 });
                            }
                        }
                    }
                });
            });

        });
    }
    //Go through all vehicles, and see if we need to change their Status
    $.each(_vehicles, function (index, vehicle) {
        if (typeof vehicle.OnTimeStatus === 'undefined' || vehicle.OnTimeStatus == null)
            vehicle.OnTimeStatus = OnTimeStatuses.OnTime;
        var arry = vehicles.filter(function (v) { return v.VehicleID === vehicle.VehicleID; });
        if (arry.length === 0)
            arry = { OnTimeStatus: OnTimeStatuses.OnTime };
        else
            arry = arry[0];
        //Check if the status is different
        if (vehicle.OnTimeStatus != arry.OnTimeStatus) {
            vehicle.SetOnTimeStatus(arry.OnTimeStatus);
        }
    });
    //Remove all the formatting for late/early times
    $.each($('td[routestopID]').filter('[onTimeStatus=' + OnTimeStatuses.Late + '],[onTimeStatus=' + OnTimeStatuses.Early + ']'), function (index, cell) {
        var existingStatus = eval($(cell).attr('onTimeStatus'));
        var arrival = eval($(cell).attr('arrival'));

        var routeStopID = eval($(cell).attr('routeStopID'));
        //Check if this is still Late or Early
        var arry = stops.filter(function (s) { return s.RouteStopID === routeStopID && s.Arrival === arrival; });
        //If not late or early, change to normal
        if (arry.length === 0)
            $(cell).attr('onTimeStatus', OnTimeStatuses.OnTime).css('color', '');
    });
    //Go through all of the stops, and see if we need to set their status
    $.each(stops, function (index, stop) {
        var cell = $('td[routestopID=' + stop.RouteStopID + '][arrival=' + stop.Arrival + ']');
        if (stop.OnTimeStatus === OnTimeStatuses.Early)
            cell.attr('onTimeStatus', OnTimeStatuses.Early).css('color', _earlyTimeHighlightColor);
        else if (stop.OnTimeStatus === OnTimeStatuses.Late)
            cell.attr('onTimeStatus', OnTimeStatuses.Late).css('color', _lateTimeHighlightColor);
    });
}
//This little function will sort and arry of objects by property (SecondsToStop)
function sortBySecondsToStop(a, b) {
    var aETA = a.SecondsToStop;
    var bETA = b.SecondsToStop;
    return ((aETA < bETA) ? -1 : ((aETA > bETA) ? 1 : 0));
}
//This little function will sort and arry of objects by property (SecondsToStop)
function sortBySecondsToStopAndOnRoute(a, b) {
    var aETA = a.SecondsToStop;
    var bETA = b.SecondsToStop;
    if (a.OnRoute != b.OnRoute)
        return (a.OnRoute ? -1 : 1);
    else
        return ((aETA < bETA) ? -1 : ((aETA > bETA) ? 1 : 0));
}





function layoutStopArrivalTimes(data) {
    //Remove any highlighting for arrivals
    $('.highlight').removeClass('highlight');

    //Changes for Dispatch Map
    //if (typeof _isDispatchMap != 'undefined' && _isDispatchMap)
    //    flagOffScheduleArrivals();
    try {
        //Update all of the tables of estimates
        $.each($('table.arrivals'), function (index, table) {
            //Get the Route ID from the table attribute;
            routeId = eval($(table).attr('routeid')); //was wrapped in eval
            etaTypeId = eval($(table).attr('etatypeid')); //was wrapped in eval
            matches = _routes.filter(function (r) { return r.RouteID == routeID; });
            var hasClass = $(table).hasClass('test');
            route = (matches.length > 0 ? matches[0] : null);
            //If we need to populate the Column Headers with the Vehicle Names, then do it here...
            if (_showVehicleNameInScheduleHeader && (etaTypeId === ETATypes.Schedules || etaTypeId === ETATypes.SchedulesWithEstimates)) {
                for (var x = 0; x < _arrivalTimesToDisplay; x++) {
                    var vehicleFilled = false;
                    var estimates = data.filter(function (n) { return n.RouteId === routeId; });
                    for (var y = 0; y < estimates.length; y++) {
                        if (estimates[y].Times.length > x) {
                            //Get the Vehicle assigned to this time
                            var vehicleId = estimates[y].Times[x].VehicleId;
                            if (vehicleId > 0) {
                                var vehicles = _vehicles.filter(function (v) { return v.VehicleID === vehicleId; });
                                if (vehicles != null && vehicles.length > 0) {
                                    $(table).find('th[arrival="' + (x + 1) + '"]').text(vehicles[0].Name);
                                }
                                break;
                            }
                        }
                    }
                }
            }

            //Loop through each Route Stop ID
            $.each($(table).find('tr[routestopid]'), function (index, row) {
                var routeStopId = eval($(row).attr('routestopid')); //was wrapped in eval
                //Empty out all of the cells
                $(row).find('td[vehicleid]').empty();
                $(row).find('td[arrival]').empty();

                //Get the estimates for this route stop
                var matches = data.filter(function (n) { return n.RouteId === routeId && n.RouteStopId === routeStopId; });
                var stopTimes = (matches.length > 0 ? matches[0] : null);
                if (stopTimes !== null) {
                    //Layout by Vehicle
                    $.each($(row).find('td[vehicleID]'), function (index, cell) {
                        var vehicleId = eval($(cell).attr('vehicleID'));
                        var times = stopTimes.Times.filter(function (n) { return n.VehicleId === vehicleId });
                        if (times.length > 0)
                            printStopTimeVerbiage(times[0], cell);
                    });
                    //Layout by Arrival
                    $.each($(row).find('td[arrival]'), function (index, cell) {
                        var arrivalPosition = eval($(cell).attr('arrival'));
                        if (stopTimes.Times != null && stopTimes.Times.length >= arrivalPosition)
                            printStopTimeVerbiage(stopTimes.Times[arrivalPosition - 1], cell);
                    });
                }
            });

        });
    } finally {
        resizeStopColumns();
    }
}

function printStopTimeVerbiage(arrivalTime, cell) {
    //$(cell).text(_arrivalVerbiage);
    //$(cell).addClass('highlight');
    if (arrivalTime != null && arrivalTime.IsArriving)
        $(cell).addClass('highlight');
    //Layout the Text
    if (arrivalTime != null && arrivalTime.Text != null && arrivalTime.Text !== '') {
        $(cell).text(arrivalTime.Text);
        return;
    }
    //Use the date instead
    var date = null;
    if (arrivalTime != null && arrivalTime.Time != null)
        date = Date.fromMSJSON(arrivalTime.Time);
    if (date != null)
        $(cell).text(date.defaultTimeView());
    else
        $(cell).text('');

    if (arrivalTime != null && arrivalTime.EstimateTime != null && arrivalTime.ScheduledTime != null) {
        var estimateTime = Date.fromMSJSON(arrivalTime.EstimateTime);
        var scheduledTime = Date.fromMSJSON(arrivalTime.ScheduledTime);
        $(cell).attr('title', 'Sched:' + scheduledTime.defaultTimeView() + ' -Est:' + estimateTime.defaultTimeView() + ' -VehicleId:' + arrivalTime.VehicleId);
        //Sched: -Est: 
    }

}

function getCurrentTime() {
    if (typeof _isMapPlayback != 'undefined' && _isMapPlayback === true
        && typeof _mapPlaybackDate != 'undefined' && _mapPlaybackDate != null)
        return new Date(_mapPlaybackDate);
    else
        return new Date();
}