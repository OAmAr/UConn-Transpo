Date.prototype.toMSJSON = function() {
    var utcDate = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()));
    var date = '/Date(' + utcDate.getTime() + ')/'; //CHANGED LINE
    return date;
};
Date.prototype.defaultView = function(includeTime) {
    var amPm = 'AM';
    var dd = this.getDate();
    if (dd < 10){ dd = '0' + dd; }
    var mm = this.getMonth() + 1;
    if (mm < 10){ mm = '0' + mm; }
    var yyyy = this.getFullYear();
    var hour = this.getHours();
    if (hour > 11) {
        amPm = 'PM';
        if (hour > 12){
            hour = hour - 12;
        }
    }
    if (hour < 10){ hour = '0' + hour; }
    var minute = this.getMinutes();
    if (minute < 10){ minute = '0' + minute; }
    //    var second = this.getSeconds();
    //    if (second < 10) second = '0' + second;
    if (includeTime === true){
    //        return String(mm + "\/" + dd + "\/" + yyyy + " " + hour + ":" + minute + ":" + second + " " + amPm);
        return String(mm + '\/' + dd + '\/' + yyyy + ' ' + hour + ':' + minute + ' ' + amPm);
    }
    else{
        return String(mm + '\/' + dd + '\/' + yyyy);
    }

};
Date.prototype.defaultTimeView = function() {
    var amPm = 'AM';
    var hour = this.getHours();
    if (hour > 11) {
        amPm = 'PM';
        if (hour > 12){
            hour = hour - 12;
        }
    }
    else if (hour === 0){
        hour = 12;
    }
    //    if (hour < 10) hour = '0' + hour;
    var minute = this.getMinutes();
    if (minute < 10){ minute = '0' + minute; }
    //    return String(hour + ":" + minute + " " + amPm);
    return String(hour + ':' + minute + ' ' + amPm);
};

//Return a date that is the same as a min value in .NET
Date.toMSJSONMinValue = function() {
    //1/1/0001
    var date = '/Date(-62135571600000-0700)/'; //CHANGED LINE
    return date;
};
Date.fromMSJSON = function(data) {
    //    if (data == null || data == '')
    //        return null;
    //    var pattern = /Date\(([^)]+)\)/;
    //    var results = pattern.exec(data);
    //    if (results.length != 2) {
    //        if (!throwOnInvalidInput) {
    //            return s;
    //        }
    //        throw new Error(s + " is not .net json date.");
    //    }
    //    var value = new Date(parseFloat(results[1]));
    //    if (value.getFullYear() <= 10)
    //        value = null;
    //    return value;



    var res = data.match(/\/Date\(((?:[+-])?\d+)(?:([+-])(\d\d)(\d\d))?\)\//);
    var time;
    if (res === null) {
        throw new Error(data + ' is not .net json date.');
    }
    //handle null values
    else if (res[1] == '-62135571600000') {
        time = parseInt(res[1],0);
    }
    else {
        time = parseInt(res[1], 10);
        if (res[2] && res[3] && res[4]) {
            var dir = res[2] == '+' ? -1 : 1,
                    h = parseInt(res[3], 10),
                    m = parseInt(res[4], 10);
            time += dir * (h * 60 + m) * 60000;
        }
    }
    var value = new Date(time);
    if (value.getFullYear() <= 10){
        value = null;
    }
    return value;
};
function numericWithDecimalKeypress(e) {
    //if the letter is not digit then display error and don't type anything
    if (e.which != 8 && e.which != 45 && e.which !== 0 && e.which != 46 && (e.which < 48 || e.which > 57)){
        return false;
    }
}
function feetBetweenPoints(a, b) {
    var earthRadiusInFeet = 5280 * 3961;
    lat1 = deg2rad(a.lat);
    lon1 = deg2rad(a.lng);
    lat2 = deg2rad(b.lat);
    lon2 = deg2rad(b.lng);
    // find the differences between the coordinates
    dlat = lat2 - lat1;
    dlon = lon2 - lon1;

    // here's the heavy lifting
    a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
    return c * earthRadiusInFeet; // great circle distance in miles
}
function bearingBetweenPoints(a, b) {
    var lat1 = a.lat;
    var lng1 = a.lng;
    var lat2 = b.lat;
    var lng2 = b.lng;
    var dLon = (lng2 - lng1);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    var brng = this._toDeg(Math.atan2(y, x));
    return 360 - ((brng + 360) % 360);
}
function deg2rad(deg) {
	rad = deg * Math.PI/180; // radians = degrees * pi/180
	return rad;
}
function round(x) {
	return Math.round( x * 1000) / 1000;
}

function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
    }
}
function supportsLocalStorage() {
    var mod = 'modernizr';
    try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
    } catch (e) {
        return false;
    }
}
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return str.length > 0 && this.substring(0, str.length) === str;
    }
}
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(str) {
        return str.length > 0 && this.substring(this.length - str.length, this.length) === str;
    }
}

var LocalStorageManager = new function() {
    function isAvailable() {
        return (typeof (localStorage) != 'undefined');
    }
    /**
    * Creates new cookie or removes cookie with negative expiration
    * @param key The key or identifier for the store
    * @param value Contents of the store
    * @param exp Expiration - creation defaults to 30 days
    */
    function createCookie(key, value, exp) {
        var date = new Date();
        date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
        document.cookie = key + "=" + value + expires + "; path=/";
    }
    /**
    * Returns contents of cookie
    * @param key The key or identifier for the store
    */
    function readCookie(key) {
        var nameEQ = key + "=";
        var ca = document.cookie.split(';');
        for (var i = 0, max = ca.length; i < max; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    function deleteCookie(key) {
        var expires = "; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        document.cookie = key + "=a" + expires + "; path=/";
    }
    //    var mcache = [];

    return {
        set: function(k, v) {
            //            mcache[k] = v;
            var value = JSON.stringify(v);
            if (!isAvailable()) {
                createCookie(k, value, 90);
            }
            else {
                try {
                    localStorage.setItem(k, value);
                } catch (e) {
                    // out of memory
                }
            }
        },
        get: function(k) {
            //            if (mcache[k]) return mcache[k];
            var o = null;
            if (!isAvailable()) {
                o = readCookie(k);
            }
            else {
                o = localStorage.getItem(k)
            }
            if (o) return JSON.parse(o);
            return null;
        },
        remove: function(k) {
            if (!isAvailable()) return false;
            return localStorage.removeItem(k);
        },
        clear: function(k) {
            if (!isAvailable()) return deleteCookie(k);
            localStorage.clear()
        }
    }
}
function ISODurationToSeconds(str) {
    // Only gross syntax check is performed here
    // Months calculated by approximation based on average number
    // of days over 4 years (365*4+1), not counting the extra day
    // every 1000 years. If a reference date was available,
    // the calculation could be more precise, but becomes complex,
    // since the exact result depends on where the reference date
    // falls within the period (e.g. beginning, end or ???)
    // 1 year ~ (365*4+1)/4*60*60*24*100 = 3155760000 centiseconds
    // 1 month ~ (365*4+1)/48*60*60*24*100 = 262980000 centiseconds
    // 1 day = 8640000 centiseconds
    // 1 hour = 360000 centiseconds
    // 1 minute = 6000 centiseconds
    var aV = new Array(0, 0, 0, 0, 0, 0);
    var bErr = false;
    var bTFound = false;
    if (str.indexOf("P") !== 0) bErr = true;
    if (!bErr) {
        var aT = new Array("Y", "M", "D", "H", "M", "S");
        var p = 0;
        var i = 0;
        str = str.substr(1); //get past the P
        for (i = 0 ; i < aT.length; i++) {
            if (str.indexOf("T") === 0) {
                str = str.substr(1);
                i = Math.max(i, 3);
                bTFound = true;
            }
            p = str.indexOf(aT[i]);
            //alert("Checking for " + aT[i] + "\nstr = " + str);
            if (p > -1) {
                // Is this a M before or after T? Month or Minute?
                if ((i === 1) && (str.indexOf("T") > -1) && (str.indexOf("T") < p)) continue;
                if (aT[i] === "S") {
                    aV[i] = parseFloat(str.substr(0, p));
                }
                else {
                    aV[i] = parseInt(str.substr(0, p));
                }
                if (isNaN(aV[i])) {
                    bErr = true;
                    break;
                }
                else if ((i > 2) && (!bTFound)) {
                    bErr = true;
                    break;
                }
                str = str.substr(p + 1);
            }
        }
        if ((!bErr) && (str.length !== 0)) bErr = true;
        //alert(aV.toString())
    }
    if (bErr) {
        //alert("Bad format: " + str)
        return 0
    }
    return aV[0] * 31557600 + aV[1] * 2629800
        + aV[2] * 86400 + aV[3] * 3600 + aV[4] * 60
        + Math.round(aV[5]);
}