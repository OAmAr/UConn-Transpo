var configPromise,
config;
var localStorageClient = 'RideSystems.Mobile.Client';
var localStorageLoginDate = 'RideSystems.Mobile.LoginDate';
var localStorageLoginClientId = 'RideSystems.Mobile.LoginClientId';
//load the configuration data
configPromise = getConfig();

//LOADER
var everythingLoaded = null;

$(function() {//on document load - obviously not used.. delete soon?
    setLoadingStatus('Waiting');
    everythingLoaded = setInterval(loadEverything, 10);
    setupClientFavorites(null);
    //Setup the JoyRide Guide
    setupJoyride();
}); //end doc load

function loadEverything() {
    if (/loaded|complete/.test(document.readyState)) {
        clearInterval(everythingLoaded); //stop the loading loop
        $('.loadingScreen').addClass('Stop Loading Loop');
        setLoadingStatus('Initializing');
        $('.loadingScreen').addClass('active');
        $('#selectClientScreen').removeClass('active');
        $('body').on('click', '#submitPassword', function (event) {
            validatePassword();
        });
        //Check if we should remove all hyperlinks, and if so, do it here
        if (typeof (hideLinks) !== 'undefined') {
            //$("body").find('a').each(function () {
            //    $(this).attr('href', '#');
            //});
            $('body').on('click', 'a', function (e) {
                e.preventDefault();
            });
        }

        $('body').on('click', '#contact_us', function (event) {
            //Hide any existing uservoice
            UserVoice.push(['hide']);
            //Set User Voice Custom Fields
            UserVoice.push(['set', 'ticket_custom_fields', { 'Client ID': _rideAdminClientID, 'Client URL': window.location.href }]);
            //Show User Voice
            UserVoice.push(['show', {
                target: '#contact_us',
                mode: 'contact'
            }]);
        });

        $('.loadingScreen').addClass('Get Configuration');
        //load the configuration data
        $.when(configPromise).then(function(result) {//assign config after promise resolved
            $('.loadingScreen').addClass('Initialize Configuration');
            config = result;
            config.BaseURL = baseURL; //get baseURL from dynamic template (index file)
            config.RouteID = routeID; //get routeID from dynamic template (index file)
            //Look for Overrides
            if (typeof (overrideShowTwitter) != 'undefined')
                config.TwitterVisible = overrideShowTwitter;
            if (typeof (overrideShowMainMenu) != 'undefined')
                config.ShowMainMenuOnLoad = overrideShowMainMenu;
            if (typeof (overrideShowRouteMenu) != 'undefined')
                config.ShowRouteMenuOnLoad = overrideShowRouteMenu;
            if (typeof (overrideLatitude) != 'undefined')
                config.StartLatitude = overrideLatitude;
            if (typeof (overrideLongitude) != 'undefined')
                config.StartLongitude = overrideLongitude;
            if (typeof (overrideZoom) != 'undefined')
                config.StartZoom = overrideZoom;
            if (typeof (overrideHeaderTitle) != 'undefined')
                config.SiteTitle = overrideHeaderTitle;
            if (typeof (overrideShowHeader) != 'undefined' && !overrideShowHeader)
                $('.mainHeader ').hide();

            //config.EnableFindMe = true;
            //config.EnableFavorites = true;
            //If we are on the dispatch map, override a few settings
            if (typeof _isDispatchMap != 'undefined' && _isDispatchMap) {
                config.ShowArrivalColumnHeaders = true;
                config.ShowScheduleEstimateColumn = true;
                config.FluidRouteTable = false;
                config.ShowVehicleNameInIcons = config.DispatchMap.ShowVehicleNameInIcons;
                config.ShowVehicleCapacity = config.DispatchMap.ShowVehicleCapacity;
            }
            //for testing - override config values here:
            // config.ArrivalOrder = 'Time';
            // config.ArrivalTimesToDisplay = 2;
            // config.IconStop = 'images/markers/stopped.png';
            // config.IconNorth = 'images/markers/n6.png';
            // config.IconNorthEastIcon = 'images/markers/ne6.png';
            // config.IconEastIcon = 'images/markers/e6.png';
            // config.IconSouthEastIcon = 'images/markers/se6.png';
            // config.IconSouthIcon = 'images/markers/s6.png';
            // config.IconSouthWestIcon = 'images/markers/sw6.png';
            // config.IconWestIcon = 'images/markers/w6.png';
            // config.IconNorthWestIcon = 'images/markers/nw6.png';
            // config.FluidRouteTable = true;
            if (typeof(setupTwitterFeed) === 'function')
                setupTwitterFeed(config);
            //If we have AutomaticRefreshSeconds, then put a metadata tag to refresh the page
            if (typeof config.AutomaticRefreshSeconds != 'undefined' && config.AutomaticRefreshSeconds > 0)
                Ridesystems_refresh = window.setTimeout(function() { window.location.href = window.location.href }, config.AutomaticRefreshSeconds * 1000);

            initializeApp(); //start the app.

            setTimeout(function() {
                initializeMapTemplate(largeScreenBreakpoint, config); // this is the function that gets called when everything is loaded
                //Move where we get the Route Stop Arrivals to here
                if (!_isMapPlayback)
                    //Check if we should use the old way of showing estimates, or the new way where we calculate on the server and pass it back to the client
                    if (_calculateVerbiageClientSide)
                        getStopArrivals();
                    else
                        getStopArrivalTimes();
            }, 100);
        });
    }
}

function initializeApp(){
    setLoadingStatus('Setup Analytics');
    setupPrivateMapVariables(config); //config loaded from config.js
    if (typeof (setupGoogleAnalytics) !== 'undefined')
        setupGoogleAnalytics(config.GoogleAnalyticsKey);
    setLoadingStatus('Setup Map');
    //Setup google map
    setupMap();
    //Get Map Overlays
    getMapOverlays();

    //use Route Groups
    if (_useRouteGroups) {
        $('.routeGroupsList').show();
        $('#routeGroups').change(function(event) {
            //De-select all selected routes
            $('#routes .route .toggleRouteBtn.active').trigger('click');
            var routeGroupId = eval($('#routeGroups').val());
            var matches = _routeGroups.filter(function (n) { return n.RouteGroupId === routeGroupId; });
            var routeGroup = (matches.length > 0 ? matches[0] : null);
            $.each(_routes, function (index, route) {
                if (routeGroup != null) {
                    if ($.inArray(route.RouteID, routeGroup.RouteIds) >= 0)
                        route.InActiveRouteGroup = true;
                    else
                        route.InActiveRouteGroup = false;
                }
                else
                    //Make the Route active if we dont have a Route Group (i.e. show all)
                    route.InActiveRouteGroup = false;
            });
            //Go ahead and run the code that will show/hide routes, pause a tenth of a second to make sure that everything has flushed out of the system
            setTimeout(function () {
                toggleRouteMenuVisibility();
            }, 100);
        });
    }

    //Get Routes
    setLoadingStatus('Get Routes');
    var routesPromise = getRoutes();
    $.when(routesPromise).then(function(){//the stuff here depends upon the routes, so wait for promise.
        setLoadingStatus('Initialize Routes');
        //Get Vehicle Points
        if (!_isMapPlayback)
            getVehiclePositions();
        //show vehicle capacities with marker
        if (_showVehicleCapacitiesInRealTime){
            getVehicleCapacities();
        }
        //Get Arrivals -> 11-25-2014 BH Moved above
        //getStopArrivals();
    });


    setHtmlNoTouch(is_touch_device());
    

    //listen to the route buttons
    $('#routes').on('click', '.toggleRouteBtn', function(event) {
        event.preventDefault();
        //8-27-2014 BH Because they can mouse off while clicking (and we won't see it), just hover off route here
        var routeID = $(this).attr('rel');
        if (routeID != null)
            hoverOffVehicle(routeID);
        toggleRouteButton($(this));
    });
    if (!is_touch_device()) {
        $('#routes').on('mouseenter', '.toggleRouteBtn', function(event) {
            var routeID = $(this).attr('rel');
            if (routeID != null)
                hoverOverVehicle(routeID);
        });
        $('#routes').on('mouseleave', '.toggleRouteBtn', function(event) {
            var routeID = $(this).attr('rel');
            if (routeID != null)
                hoverOffVehicle(routeID);
        });
    }
    $('#showAllRoutesBtn').click(function(event) {
        event.preventDefault();
        toggleShowAllRouteLines($(this));
    });

    //listen to active/all routes button
    $('.activeRoutesToggle .btn').click(function(event){
        event.preventDefault();
        toggleActiveAllRoutes($(this));
    });

    //listen to find me button
    if(config.EnableFindMe){
        $('#findMeBtn').click(function(event){
            event.preventDefault();
            getLocation(function(position){
                            if (typeof(_findMeMarker) ==='undefined' || _findMeMarker===null)
                                _findMeMarker = new google.maps.Marker({
                                      position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                                      map: _map
                                  });
                            else
                                _findMeMarker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                            _map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                        });
        });
    }

    //listen to favorites button
    if(config.EnableFavorites){
        setLoadingStatus('Initialize Favorites');
        setupFavorites();
    }
    //listen to the infoPanel close button
    $('#infoPanel .closeBtn').click(function(event){
        event.preventDefault();
        clearInfoPanel();
    });
    
    //listen to the favoritesPanel close button
    $('#favoritesPanel .closeBtn').click(function(event){
        event.preventDefault();
        clearFavoritesPanel();
    });
    //Enable Map Security
    if (_passwordProtectMainMap && _rideAdminClientID > 0 && $('#passwordScreen').length>0)
        enableMapSecurity(_rideAdminClientID);
    $('#dialog-iframeScreen').dialog({
        modal: true,
        autoOpen: false,
        width: $(window).width(),
        height: $(window).height()
    });

    //Listen for IFrame Click Events
    $('body').on('click', '.iframeLink', function(event) {
        event.preventDefault();
        //Get the URL for the IFrame
        var url = $(this).attr('href');
        //var top = ($(window).height() - $('#iframeScreen').height()) / 4;
        //var left = ($(window).width() - $('#iframeScreen').width()) / 2;
        //$('#iframeScreen').css({ top: top + 'px' });
        //$('#iframeScreen').css({ left: left + 'px' });
        ////Set the URL for the IFrame
        //$('#iframeScreen iframe').attr('src', url);
        $('#dialog-iframeScreen iframe').attr('src', url);
        //Open the IFrame
        //$('#iframeScreen').addClass('active');
        $('#dialog-iframeScreen').dialog('open');


        //var top = ($(window).height() - $('#iframeScreen').height()) / 4;
        //var left = ($(window).width() - $('#iframeScreen').width()) / 2;
        //$('#iframeScreen').css({ top: top + 'px' });
        //$('#iframeScreen').css({ left: left + 'px' });
        ////Set the URL for the IFrame
        //$('#iframeScreen iframe').attr('src', url);
        ////Open the IFrame
        //$('#iframeScreen').addClass('active');
    });
    ////listen to the iframe screen close button
    //$('body').on('click', '#iframeScreen .closeBtn', function(event) {
    //    event.preventDefault();
    //    $('#iframeScreen').css({ top: 'auto' });
    //    $('#iframeScreen').css({ left: 'auto' });
    //    $('#iframeScreen').removeClass('active');
    //});
    //Append style if needed
    if (_arrivalBodyFixedFontSize != null && _arrivalBodyFixedFontSize != '')
        $("<style type='text/css'> .arrivals tbody{ font-size:" + _arrivalBodyFixedFontSize + ";} </style>").appendTo("head");

}




/**
 * Service call to get config values
 * @return {object} config deferred promise
 */
function getConfig(){
    var dfd = new jQuery.Deferred();
	$.ajax({
        url: baseURL + 'Services/JSONPRelay.svc/GetMapConfig',
        dataType: 'jsonp',
        jsonp: 'method',
        cache: false
    }).done(
        function(data) {
            dfd.resolve( data );
        }
    )
    .fail(
        function(jqXHR, textStatus, errorThrown) {
            setLoadingStatus('Problem getting config:' + errorThrown.message);
            $('#errorMessage').text('Problem getting config:' + errorThrown.message);
            dfd.reject( 'error' );
        }
    );
    return dfd.promise();
}


/**
 * Store all variables - takes from hidden input values
 */
function setupPrivateMapVariables(config) {

	_baseURL = config.BaseURL;

    _mapType = config.MapType;
    _showRouteLines = config.ShowRouteLines;
    _showTrafficOverlay = config.ShowTrafficOverlay;

    _showVehicleNameInIcons = config.ShowVehicleNameInIcons;
    _vehicleNameIconHeight = config.VehicleNameIconHeight;
    _vehicleNameIconWidth = config.VehicleNameIconWidth;

    _startLatitude = config.StartLatitude;
    _startLongitude = config.StartLongitude;
    _startZoom = config.StartZoom;

    _anchorSize = config.AnchorSize;
    _iconSize = config.IconSize;
    //_iconShadow = config.iconShadow;
    _showStopIcon = config.ShowStopIcon;
    _iconStop = config.IconStop;
    _iconNorth = config.IconNorth;
    _iconStopNorth = config.IconStopNorth;
    _iconNorthEastIcon = config.IconNorthEastIcon;
    _iconStopNorthEastIcon = config.IconStopNorthEastIcon;
    _iconEastIcon = config.IconEastIcon;
    _iconStopEastIcon = config.IconStopEastIcon;
    _iconSouthEastIcon = config.IconSouthEastIcon;
    _iconStopSouthEastIcon = config.IconStopSouthEastIcon;
    _iconSouthIcon = config.IconSouthIcon;
    _iconStopSouthIcon = config.IconStopSouthIcon;
    _iconSouthWestIcon = config.IconSouthWestIcon;
    _iconStopSouthWestIcon = config.IconStopSouthWestIcon;
    _iconWestIcon = config.IconWestIcon;
    _iconStopWestIcon = config.IconStopWestIcon;
    _iconNorthWestIcon = config.IconNorthWestIcon;
    _iconStopNorthWestIcon = config.IconStopNorthWestIcon;
    _landmarkTransparency = config.LandmarkTransparency;
    _logoContainerBackgroundColor = config.LogoContainerBackgroundColor;
    _mphIndicateStop = config.MphIndicateStop;
    _polyLineSize = config.PolyLineSize;
    _polyLineOpacity = config.PolyLineOpacity;
    _refreshEstimatesMilliseconds = config.RefreshEstimatesMilliseconds;
    _estimatesType = config.EstimatesType;
    _estimateDisplayType = config.EstimateDisplayType;
    if (typeof (config.ScheduleDisplayType) !== 'undefined' && config.ScheduleDisplayType != null && config.ScheduleDisplayType !== '')
        _scheduleDisplayType = config.ScheduleDisplayType;
    _arrivalTimesToDisplay = config.ArrivalTimesToDisplay;
    _arrivalOrder = config.ArrivalOrder;
    _estimateShowSingleTime = config.EstimateShowSingleTime;
    _scheduledTimesToGet = config.ScheduledTimesToGet;
    _scheduledTimesToDisplay = config.ScheduledTimesToDisplay;
    _animateVehicles = config.AnimateVehicles;
    _refreshVehiclesMilliseconds = config.RefreshVehiclesMilliseconds;
    _routeSelectorHeight = config.RouteSelectorHeight;
    _transparency = config.Transparency;
    _zOrderVehicle = config.ZOrderVehicle;

    _routeStopIcon = _baseURL + config.RouteStopIcon;
    _zOrderStop = config.ZOrderStop;
    _zOrderLandmark = config.ZOrderLandmark;

    _hiddenRouteStopIconSize = config.RouteStopIconSize;
    _hiddenVehicleInfoWindowHeight = config.VehicleInfoWindowHeight;
    _hiddenVehicleInfoWindowWidth = config.VehicleInfoWindowWidth;

    var hiddenRouteID = config.RouteID;
    if (hiddenRouteID === 0 || hiddenRouteID === null || hiddenRouteID === ''){
        _specificRoutes = [];
    }
    else{
        _specificRoutes = hiddenRouteID.toString().split(',');
    }

    _secondsFromStopToBeArriving = config.SecondsFromStopToBeArriving;

    _showVehicleCapacity = config.ShowVehicleCapacity;
    _showVehicleCapacitiesInRealTime = config.ShowVehicleCapacity;
    _refreshVehicleCapacitiesMilliseconds = config.RefreshVehicleCapacitiesMilliseconds;

    _showVehicleEstimatesOnVehicleClick = config.ShowVehicleEstimatesOnVehicleClick;

    _showVehicleNameOnVehicleClick = config.ShowVehicleNameOnVehicleClick;
    if (typeof _showVehicleNameOnVehicleClick === 'undefined' || _showVehicleNameOnVehicleClick == null)
        _showVehicleNameOnVehicleClick = false;

    _showEstimatesWhenNoSchedulePresent = config.ShowEstimatesWhenNoSchedulePresent;
    if (typeof _showEstimatesWhenNoSchedulePresent === 'undefined' || _showEstimatesWhenNoSchedulePresent == null)
        _showEstimatesWhenNoSchedulePresent = true;
    

//    _vehicleInfoBox = null; //the infobox that appears when clicking a vehicle icon
    _fluidRouteTable = config.FluidRouteTable;
    _arrivalBodyFixedFontSize = config.ArrivalBodyFixedFontSize;
    //Ensure we have a value
    if (typeof (_arrivalBodyFixedFontSize) === 'undefined' || _arrivalBodyFixedFontSize === '')
        _arrivalBodyFixedFontSize = null;

    _showArrivalColumnHeaders = config.ShowArrivalColumnHeaders;
    if (typeof config.ShowArrivalColumnHeaderLabels !== 'undefined' && config.ShowArrivalColumnHeaderLabels != null)
        _showArrivalColumnHeaderLabels = config.ShowArrivalColumnHeaderLabels;
    
    _noVehicleEstimateVerbiage = config.NoVehicleEstimateVerbiage; //What to show when we don't have estimates
    _showScheduleEstimateColumn = config.ShowScheduleEstimateColumn; //Do we have a column for estimates when showing schedules?
    _scheduleEstimateColumnVerbiage = config.ScheduleEstimateColumnVerbiage; //What verbiage do we use for a column header for Estimates when showing Schedules?
    _scheduleEstimateColumnTextColor = config.ScheduleEstimateColumnTextColor;
    _scheduleColumnVerbiage = config.ScheduleColumnVerbiage; //What verbiage do we use for a column header for Schedules when showing Schedules?
    _scheduleTimeToDisplay = config.ScheduleTimeToDisplay; //Do we show Arrival or Departure time
    if (config.ShowVehicleNameInScheduleHeader)
        _showVehicleNameInScheduleHeader = config.ShowVehicleNameInScheduleHeader;

    if (config.ScheduleWithEstimateShowArrivalVerbiage)
        _scheduleWithEstimateShowArrivalVerbiage = config.ScheduleWithEstimateShowArrivalVerbiage;
    
    if (typeof config.MinutesFromScheduledTimeToEvaluateEstimatedTime !== 'undefined' && config.MinutesFromScheduledTimeToEvaluateEstimatedTime > 0)
        _minutesFromScheduledTimeToEvaluateEstimatedTime = config.MinutesFromScheduledTimeToEvaluateEstimatedTime;
    else
        _minutesFromScheduledTimeToEvaluateEstimatedTime = 0;
    _scheduledMinutesLateBeforeEstimate = config.ScheduledMinutesLateBeforeEstimate;
    _estimatedMinutesLateBeforeSchedule = config.EstimatedMinutesLateBeforeSchedule;
    if (typeof config.ShowDepartedWhenEstimateIsRolledBackToSchedule !== 'undefined')
        _showDepartedWhenEstimateIsRolledBackToSchedule = config.ShowDepartedWhenEstimateIsRolledBackToSchedule;
    if (typeof config.ShowDepartedWhenNoEstimateAndScheduleIsPast !== 'undefined')
        _showDepartedWhenNoEstimateAndScheduleIsPast = config.ShowDepartedWhenNoEstimateAndScheduleIsPast;
    //Do we allow it to say departed, even when the scheduled time is in the future?
    if (typeof config.AllowDepartedWhenScheduleIsInTheFuture !== 'undefined')
        _allowDepartedWhenScheduleIsInTheFuture = config.AllowDepartedWhenScheduleIsInTheFuture;

    _arrivalVerbiage = config.ArrivalVerbiage;
    _routeMoreInfoVerbiage = config.RouteMoreInfoVerbiage;

    _apiKey = config.ApiKey;

    if (typeof config.UseRouteGroups !== 'undefined')
        _useRouteGroups = config.UseRouteGroups;

    _checkActiveRoutes = config.CheckActiveRoutes;
    if (_specificRoutes != null && _specificRoutes.length > 0)
        _checkActiveRoutes = false;
    _inheritActiveRouteTimesFromSchedules = config.InheritActiveRouteTimesFromSchedules;
    if (typeof (_inheritActiveRouteTimesFromSchedules) === 'undefined')
        _inheritActiveRouteTimesFromSchedules = false;
    _activeRouteTimeBufferMinutes = config._activeRouteTimeBufferMinutes;
    if (typeof (_activeRouteTimeBufferMinutes) === 'undefined')
        _activeRouteTimeBufferMinutes = '15';
    _activeRouteTimeBufferMinutes = eval(_activeRouteTimeBufferMinutes);

    _passwordProtectMainMap = config.PasswordProtectMainMap;
    _rideAdminClientID = config.RideAdminClientID;
    
    if (typeof config.RestrictEstimatesToVehicleAssignedToSchedule !== 'undefined')
        _restrictEstimatesToVehicleAssignedToSchedule = config.RestrictEstimatesToVehicleAssignedToSchedule;

    if (typeof(config.DispatchMap) != 'undefined') {
        _minutesForLate = config.DispatchMap.MinutesForLate;
        _highlightLateVehicles = config.DispatchMap.HighlightLateVehicles;
        _lateVehicleHighlightColor = config.DispatchMap.LateVehicleHighlightColor;
        _highlightLateTimes = config.DispatchMap.HighlightLateTimes;
        _lateTimeHighlightColor = config.DispatchMap.LateTimeHighlightColor;
        _minutesForEarly = config.DispatchMap.MinutesForEarly;
        _highlightEarlyVehicles = config.DispatchMap.HighlightEarlyVehicles;
        _earlyVehicleHighlightColor = config.DispatchMap.EarlyVehicleHighlightColor;
        _highlightEarlyTimes = config.DispatchMap.HighlightEarlyTimes;
        _earlyTimeHighlightColor = config.DispatchMap.EarlyTimeHighlightColor;
        _showDelay = config.DispatchMap.ShowDelay;
        _showRouteSubscriptEdit = config.DispatchMap.ShowRouteSubscriptEdit;
    }
    if (typeof restrictVehicleIds != 'undefined')
        _restrictVehicleIds = restrictVehicleIds;
    if (typeof blockID != 'undefined')
        _blockID = blockID;
    if (typeof restrictRoute != 'undefined')
        _restrictRoute = restrictRoute;
    if (typeof showBlockIdAsVehicleName != 'undefined')
        _showBlockIdAsVehicleName = showBlockIdAsVehicleName;
}

/**
 * Setup the google map
 */
function setupMap() {
    var mapType = google.maps.MapTypeId.ROADMAP;
    if (_mapType === 'G_SATELLITE_MAP'){
        mapType = google.maps.MapTypeId.SATELLITE;
    }
    else if (_mapType === 'G_HYBRID_MAP'){
        mapType = google.maps.MapTypeId.HYBRID;
    }
    else if (_mapType === 'G_TERRAIN_MAP') {
        mapType = google.maps.MapTypeId.TERRAIN;
    }
    //Map Styles
    //http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
    var styles = null;
    try {
        styles = eval((config.MapStyles === 'undefined' || config.MapStyles == '' ? null : config.MapStyles));
    }
    catch (e) {
        styles = null;
    }
//    var styles = [{
//                    featureType: "poi",
//                    stylers: [
//                        { visibility: 'off' }
//                    ]
//        }];
//    var styles = [{
//            featureType: "poi.park",
//            stylers: [
//                        { visibility: 'off' }
//                    ]
//        },{
//            featureType: "poi.park",
//            stylers: [
//                            { visibility: 'off' }
//                        ]
//        }];
                
    var myOptions = {
        zoom: _startZoom,
        center: new google.maps.LatLng(_startLatitude, _startLongitude),
        mapTypeId: mapType,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        panControl: false,
        scaleControl: false,
        styles: styles
    };
    if (_map == null) {
        
        _map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
        //Add Traffic Layer -- 7-28-2015 BH Added
        if (_showTrafficOverlay) {
            setupTrafficOverlay();
            //var trafficLayer = new google.maps.TrafficLayer();
            //trafficLayer.setMap(_map);
        }
    }
    else {
        //Remove all of the vehicles from the map
        if (_vehicles != null && _vehicles.length > 0) {
            for (var x = 0; x < _vehicles.length; x++) {
                _vehicles[x].RemoveFromMap();
            }
            _vehicles = [];
        }
        //Remove all of the Routes from the map
        if (_routes != null && _routes.length > 0) {
            for (var x = 0; x < _routes.length; x++) {
                _routes[x].RemoveFromMap();
            }
            _routes = [];
        }
        _map.setOptions(myOptions);
    }
    
//    _vehicleInfoBox = createVehicleInfoBox();    
    setLiveMapSize();
}

function setupTrafficOverlay() {
    var controlDiv = document.createElement('DIV');
    $(controlDiv).addClass('gmap-control-container')
                 .addClass('gmnoprint');

    var controlUI = document.createElement('DIV');
    $(controlUI).addClass('gmap-control');
    $(controlUI).text('Traffic');
    $(controlDiv).append(controlUI);

    //var legend = '<ul>'
    //           + '<li><span style="background-color: #30ac3e">&nbsp;&nbsp;</span><span style="color: #30ac3e"> &gt; 80 km per hour</span></li>'
    //           + '<li><span style="background-color: #ffcf00">&nbsp;&nbsp;</span><span style="color: #ffcf00"> 40 - 80 km per hour</span></li>'
    //           + '<li><span style="background-color: #ff0000">&nbsp;&nbsp;</span><span style="color: #ff0000"> &lt; 40 km per hour</span></li>'
    //           + '<li><span style="background-color: #c0c0c0">&nbsp;&nbsp;</span><span style="color: #c0c0c0"> No data available</span></li>'
    //           + '</ul>';

    //var controlLegend = document.createElement('DIV');
    //$(controlLegend).addClass('gmap-control-legend');
    //$(controlLegend).html(legend);
    //$(controlLegend).hide();
    //$(controlDiv).append(controlLegend);

    //// Set hover toggle event
    //$(controlUI)
    //    .mouseenter(function () {
    //        $(controlLegend).show();
    //    })
    //    .mouseleave(function () {
    //        $(controlLegend).hide();
    //    });

    var trafficLayer = new google.maps.TrafficLayer();

    google.maps.event.addDomListener(controlUI, 'click', function () {
        if (typeof trafficLayer.getMap() == 'undefined' || trafficLayer.getMap() === null) {
            $(controlUI).addClass('gmap-control-active');
            trafficLayer.setMap(_map);
        } else {
            trafficLayer.setMap(null);
            $(controlUI).removeClass('gmap-control-active');
        }
    });

    _map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
}

/**
 * Creates an empty infobox that is filled when a vehicle is clicked
 * @return {object} InfoBox object
 */
//function createVehicleInfoBox(){
//    var infowindow = new google.maps.InfoWindow();
//    return infowindow;
//    //using infoBox plugin
//    // var myOptions = {
//    //     content: '',
//    //     disableAutoPan: false,
//    //     alignBottom: true,
//    //     maxWidth: 0,
//    //     pixelOffset: new google.maps.Size(-100, -40),
//    //     zIndex: null,
//    //     boxStyle: {},
//    //     closeBoxURL: 'http://www.google.com/intl/en_us/mapfiles/close.gif',
//    //     infoBoxClearance: new google.maps.Size(4, 4),
//    //     visible: true,
//    //     pane: 'floatPane',
//    //     enableEventPropagation: false
//    // };
//    // return new InfoBox(myOptions);
//    
//}

/**
 * Toggles the route on the map and changes the route toggle button class (active)
 * @param  {obj} routeBtn jquery dom object - the button clicked
 */
function toggleRoute(routeID, isActive) {
    var route = null;
    
    //set the route object
    for (x = 0; x < _routes.length; x++) {
        if (_routes[x].RouteID == routeID) {
            route = _routes[x];
        }
        //If the route is showing vehicles, but is not visible, hide it
        if (_routes[x].VehiclesVisible === true && _routes[x].Visible === false){
            _routes[x].Disable();
        }

    }

    //this is where you'd call scripts to show routes
    if (isActive) {//turn off the route
		if (route !== null){
			route.Disable();
		}
    }
    else{//turn on the route
		if (route !== null) {
			route.Enable();
		}
    }

    var biggestRoute = null;
    //Check if any routes are disabled
    //Get all selected routes
    var visibleRoutes = $.grep(_routes, function(route, index) { return route.Visible === true; });
    if (visibleRoutes.length > 0) {
        var sortedVisibleRoutes = visibleRoutes.sort(function(a, b) {
			return a.Zoom - b.Zoom;
        }).reverse();
        biggestRoute = sortedVisibleRoutes[0];

        //Position the map to the selected route
        if (biggestRoute !== null && biggestRoute.Zoom > 0 && biggestRoute.Latitude !== 0 && biggestRoute.Longitude !== 0) {
            var latitude = biggestRoute.Latitude;
            var longitude = biggestRoute.Longitude;
            var zoom = biggestRoute.Zoom;

            if (typeof (overrideLatitude) != 'undefined')
                latitude = overrideLatitude;
            if (typeof (overrideLongitude) != 'undefined')
                longitude = overrideLongitude;
            if (typeof (overrideZoom) != 'undefined')
                zoom = overrideZoom;

            _map.setCenter(new google.maps.LatLng(latitude, longitude));
            _map.setZoom(zoom);
        }
    }
    else {
        //Changed to show all vehicles if no routes are checked, rather than looping then disabling
        $.each(_routes, function(index, route) {
            route.EnableVehicles();
        });
    }
}
function toggleRouteButton(routeBtn, beingActivatedOnLoad) {
    if (routeBtn.hasClass('showAllRoutes')) {
        routeBtn.toggleClass('active');
        toggleRouteMenuVisibility();
    }
    else {
        var routeID = routeBtn.attr('rel');
        var isActive = routeBtn.hasClass('active');

        //If we are activating on load, and it is already active, don't do anything, just get out
        if (beingActivatedOnLoad && isActive)
            return;
        //this is where you'd call scripts to show routes
        if (isActive) //turn off the route
            routeBtn.removeClass('active');
        else //turn on the route
            routeBtn.addClass('active');

        //1/12/15 BH Changed so that we set the route color outside of enabling the route, so that it will have a little better performance with feedback to the user
        setTimeout(function() {
            toggleRoute(routeID, isActive);
        }, 10);
    }
}

/**
 * Switches the routes list to show all or active routes
 * @param  {object} button the jquery object representing the toggle button clicked
 */
function toggleActiveAllRoutes(button){
    var btnID = button.attr('id');

    //reset state of all buttons in the group
    button.closest('.activeRoutesToggle').find('.btn').removeClass('active');
    //activate current button
    button.addClass('active');

    toggleRouteMenuVisibility();
}

/**
 * Clear the contents of the infoPanel
 */
function clearInfoPanel(){
    $('#infoPanel .menuTitle').empty();
    $('#infoPanel .menuBody').empty();
    $('#infoPanel .menuFooter').empty();
}
/**
 * Clear the contents of the favoritesPanel
 */
function clearFavoritesPanel(){
    //$('#favoritesPanel .menuTitle').empty();
    $('#favoritesPanel .menuBody .stopFavorites').empty();
    $('#favoritesPanel .menuFooter').empty();
    //$('#favoritesPanel .stopFavorites').empty();
}

/**
 * Hides a vehicle marker infobox
 * @param  {obj} myInfobox jquery DOM object
 */
function hideInfoBox(myInfobox){
    myInfobox.addClass('hideInfoBox');
}

/**
 * Removes the no-touch class from the html tag if this is a touch device. "no-touch" is on the html by default
 * @param {Boolean} isTouchDevice [description]
 */
function setHtmlNoTouch(isTouchDevice){
    if(isTouchDevice){
        $('html').removeClass('no-touch');
    }
}


function hoverOverVehicle(routeID) {
    var routesSelected = $('.toggleRouteBtn.active').length;
    if (routesSelected == 0) {
        //Changed to show all vehicles if no routes are checked, rather than looping then disabling
        $.each(_routes, function(index, route) {
            route.DisableVehicles();
        });
    }
    else {
        //Hide routes that are showing
        $.each($('.toggleRouteBtn.active'), function(index, routeTag) {
            var myRouteID = $(routeTag).attr('rel');
            var matches = _routes.filter(function(n) { return n.RouteID == myRouteID; });
            var route = (matches.length > 0 ? matches[0] : null);
            if (route != null)
                route.Disable();
        });
    }
    //Show this route
    var matches = _routes.filter(function(n) { return n.RouteID == routeID; });
    var route = (matches.length > 0 ? matches[0] : null);
    if (route != null)
        route.Enable();
}
function hoverOffVehicle(routeID) {
    var routesSelected = $('.toggleRouteBtn.active').length;
    var matches = _routes.filter(function(n) { return n.RouteID == routeID; });
    var route = (matches.length > 0 ? matches[0] : null);
    if (route != null)
        route.Disable();

    if (routesSelected == 0) {
        //Changed to show all vehicles if no routes are checked, rather than looping then disabling
        $.each(_routes, function(index, route) {
            route.EnableVehicles();
        });
    }
    else {
        //Show all routes that are selected
        $.each($('.toggleRouteBtn.active'), function(index, routeTag) {
            var myRouteID = $(routeTag).attr('rel');
            var matches = _routes.filter(function(n) { return n.RouteID == myRouteID; });
            var route = (matches.length > 0 ? matches[0] : null);
            if (route != null)
                route.Enable();
        });
    }

}
function is_touch_device() {
    return (('ontouchstart' in window)
			  || (navigator.MaxTouchPoints > 0)
			  || (navigator.msMaxTouchPoints > 0));
}


function enableMapSecurity(clientId) {
    $('#passwordScreen').removeClass('active');
    $.ajax({
        url: 'http://www.admin.ridesystems.net/api/Clients/GetClient',
        type: 'GET',
        data: { clientID: clientId },
        dataType: 'jsonp',
        async: true,
        cache: false
    })
    .done(function(results) {
        //Check if this client requires a password
        if (results.IsPasswordProtected) {
            var daysToKeepLoggedIn = results.DaysToKeepLoggedIn === undefined ? 0 : eval(results.DaysToKeepLoggedIn);
            //Figure out the last time the logged in
            var loginDate = LocalStorageManager.get(localStorageLoginDate);
            var loginClientId = LocalStorageManager.get(localStorageLoginClientId);
            if (loginDate != null && loginClientId == clientId && daysToKeepLoggedIn > 0) {
                var now = new Date();
                var expirationDate = new Date(loginDate);
                expirationDate.setDate(expirationDate.getDate() + daysToKeepLoggedIn);
                //If the expiration date is in the future, then don't prompt them to login
                if (expirationDate > now)
                    return;
            }        
            $('#passwordError').text('');
            $('#passwordScreen').addClass('active');
            //Set timeout for when the password expires
            if (results.SessionDurationMinutes > 0)
                _sessionDurationMinutes = results.SessionDurationMinutes;
            else
                _sessionDurationMinutes = 0;
        }
    });
}
function validatePassword() {
    //Get the password type
    var password = $('#password').val();
    $.ajax({
        url: 'http://www.admin.ridesystems.net/api/Clients/ValidateClientPassword',
        type: 'GET',
        data: { clientID: _rideAdminClientID, password: password },
        dataType: 'jsonp',
        async: true,
        cache: false
    })
    .done(function(results) {
        //Check if this client requires a password
        if (results) {
            $('#passwordScreen').removeClass('active');
            //Remove focus from the Login button, so we can hide the keyboard
//            $("#submitPassword").blur();
//            $(".liveMapWrapper").width('100%');
//            $(".liveMapWrapper").height($(window).height() - $('.mainHeaderWrapper').height());
            //Store the date we last logged in
            LocalStorageManager.set(localStorageLoginDate, new Date());
            LocalStorageManager.set(localStorageLoginClientId, _rideAdminClientID);

            if (_sessionDurationMinutes > 0) {
                setTimeout(function() {
                    $('#passwordScreen').addClass('active');
                }, 1000 * 60 * _sessionDurationMinutes);
            }
        }
        else {
            $('#passwordError').text('Invalid Password');
        }
    });
}
function setLoadingStatus(status) {
    $("#status").text(status);
}

function setupJoyride() {
    try {
        //Start the tour when they click on the button
        $('.tour').click(function () {
            //Close the previous guide
            $('#joyRideTipContent').joyride('destroy');
            $('#joyRideTipContent').joyride({
                autoStart: true,
                pauseAfter: [0, 4],
                preStepCallback: function (index, tip) {
                    //If we are on the first step, moving on, then show
                    if (index == 0) {
                        //Colapse the side menus
                        toggleMenu('infoPanel', 'close', largeScreenBreakpoint);
                        toggleMenu('routesMenu', 'close', largeScreenBreakpoint);
                        toggleMenu('mainMenu', 'close', largeScreenBreakpoint);
                        //Toggle all routes
                        $('#showAllRoutesBtn').addClass('active');
                        //toggleShowAllRouteLines($('#showAllRoutesBtn'));
                        $('.activeRoutesToggle .btn').trigger('click');
                    }
                        //Click the first route
                    else if (index == 3) {
                        $('.toggleRouteBtn').filter(':first').trigger('click');
                    }
                        //Click the first Estimates button
                    else if (index == 4) {
                        $('.detailsBtn').filter(':first').trigger('click');
                    }
                    else if (index == 6) {
                        //Colapse the side menus
                        toggleMenu('infoPanel', 'close', largeScreenBreakpoint);
                        toggleMenu('routesMenu', 'close', largeScreenBreakpoint);
                        toggleMenu('mainMenu', 'close', largeScreenBreakpoint);
                    }
                },
                postStepCallback: function (index, tip) {
                    //If we are on the first step, moving on, then show
                    if (index == 0) {
                        if ($(this).joyride('paused')) {
                            toggleMenu('routesMenu', 'open', largeScreenBreakpoint);
                            $('.activeRoutesToggle #routeListActive').removeClass('active');
                            $('.activeRoutesToggle #routeListAll').addClass('active');
                            toggleRouteMenuVisibility();
                            setTimeout(function () {
                                $(this).joyride('resume');
                            }, 200);
                        }
                    }
                        //We are showing the stop information, so pick a stop to show, and show it
                    else if (index == 4) {
                        if ($(this).joyride('paused')) {
                            //When showing Favorites, close the Routes menu
                            toggleMenu('routesMenu', 'close', largeScreenBreakpoint);
                            //Get the route ID
                            var routeId = eval($('.toggleRouteBtn').filter(':first').attr('rel'));
                            //Get the routes
                            var routes = _routes.filter(function (route) { return route.RouteID === routeId; });
                            var route = (routes === null || routes.length == 0) ? null : routes[0];
                            if (route != null) {
                                var markers = route.StopMarkers.filter(function (marker) { return marker.RouteStop.ShowArrivalsOnMap === true; });
                                var marker = (markers === null || markers.length === 0) ? null : markers[0];
                                if (marker != null) {
                                    //Click the marker to show the stop
                                    new google.maps.event.trigger(marker, 'click');
                                }
                            }
                            setTimeout(function () {
                                $(this).joyride('resume');
                            }, 300);
                        }
                    }
                        //At the very end, open the routes menu
                    else if (index == 6) {
                        toggleMenu('routesMenu', 'open', largeScreenBreakpoint);
                    }
                },
                modal: true,
                expose: true
            });
        });
    }
    catch (e) {
        alert('error on setupJoyRide:' + e);
    }
}