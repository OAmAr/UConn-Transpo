//Private Variables
var _estimates = [];
var _map;
var _findMeMarker;
var _mapType;
var _showRouteLines;
var _showTrafficOverlay;
var _showVehicleNameInIcons;
var _vehicleNameIconHeight;
var _vehicleNameIconWidth;
var _startLatitude;
var _startLongitude;
var _startZoom;
var _anchorSize;
var _iconSize;
var _iconShadow;
var _showStopIcon;
var _iconStop;
var _iconNorth;
var _iconStopNorth;
var _iconNorthEastIcon;
var _iconStopNorthEastIcon;
var _iconEastIcon;
var _iconStopEastIcon;
var _iconSouthEastIcon;
var _iconStopSouthEastIcon;
var _iconSouthIcon;
var _iconStopSouthIcon;
var _iconSouthWestIcon;
var _iconStopSouthWestIcon;
var _iconWestIcon;
var _iconStopWestIcon;
var _iconNorthWestIcon;
var _iconStopNorthWestIcon;
var _landmarkTransparency;
var _logoContainerBackgroundColor;
var _mphIndicateStop;
var _polyLineSize;
var _polyLineOpacity;
var _refreshEstimatesMilliseconds;
var _arrivalTimesToDisplay = 2;
var _arrivalOrder = 'Time';//Time|Bus
var _estimatesType = 'Estimates';
var _estimateDisplayType = 'Minutes';
var _scheduleDisplayType = 'Time';
var _estimateShowSingleTime = true;
var _scheduledTimesToGet = 2;
var _animateVehicles = false;
var _refreshVehiclesMilliseconds;
var _routeSelectorHeight;
var _transparency;
var _zOrderVehicle;
var _routeStopIcon;
var _zOrderStop;
var _zOrderLandmark;
var _specificRoutes = [];
var _secondsFromStopToBeArriving = 0;
var _hiddenRouteStopIconSize = 10;
var _hiddenVehicleInfoWindowHeight = 400;
var _hiddenVehicleInfoWindowWidth = 400;
var _baseURL;
var _showVehicleCapacity = false;
var _showVehicleEstimatesOnVehicleClick = true;
var _showVehicleNameOnVehicleClick = false;
var _showEstimatesWhenNoSchedulePresent = true;
var _fluidRouteTable = false;
var _arrivalBodyFixedFontSize = null;
var _showArrivalColumnHeaders = false;
var _showArrivalColumnHeaderLabels = true;

var _noVehicleEstimateVerbiage = 'Off Route';
var _showScheduleEstimateColumn = false;
var _scheduleEstimateColumnVerbiage = 'Est';
var _scheduleEstimateColumnTextColor = 'Yellow';
var _scheduleColumnVerbiage = 'Sched';
var _scheduleTimeToDisplay = 'Departure';
var _showVehicleNameInScheduleHeader = false;
var _scheduleWithEstimateShowArrivalVerbiage = false;

var _minutesFromScheduledTimeToEvaluateEstimatedTime = 0;
var _scheduledMinutesLateBeforeEstimate = 0;
var _estimatedMinutesLateBeforeSchedule = 0;
var _showDepartedWhenEstimateIsRolledBackToSchedule = false;
var _showDepartedWhenNoEstimateAndScheduleIsPast = false;
var _allowDepartedWhenScheduleIsInTheFuture = true; //Do we allow it to say departed, even when the scheduled time is in the future?

var _arrivalVerbiage = 'Arriving';

var _routeMoreInfoVerbiage = "More Route Info";

var _rotateVehiclesForHeading = true;

var _apiKey;

var _useRouteGroups = false;
var _routeGroups = [];

//Dispatch Map Settings
var _minutesForLate=5;
var _highlightLateVehicles = true;
var _lateVehicleHighlightColor = '#FF0000';
var _highlightLateTimes = true;
var _lateTimeHighlightColor = '#FF0000';
var _minutesForEarly=5;
var _highlightEarlyVehicles = true;
var _earlyVehicleHighlightColor = '#10F420';
var _highlightEarlyTimes = true;
var _earlyTimeHighlightColor = '#10F420';
var _showDelay = true;
var _showRouteSubscriptEdit = true;
var _onTimeRouteStopIDs = [];
var _showVehicleCapacitiesInRealTime = false;
var _checkActiveRoutes = false;
var _inheritActiveRouteTimesFromSchedules = false;
var _activeRouteTimeBufferMinutes = 15;
var _passwordProtectMainMap = false;
var _rideAdminClientID = 0;
var _sessionDurationMinutes = 0;

var _restrictEstimatesToVehicleAssignedToSchedule = false;
var _isMapPlayback = false;

var _calculateVerbiageClientSide = true;

var _restrictVehicleIds = [];
var _blockID = '';
var _restrictRoute = false;

var _showBlockIdAsVehicleName = false;