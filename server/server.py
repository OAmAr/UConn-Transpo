# network thread prototype

import requests
import json
import curses
import threading
from time import sleep

shared_data = dict()
shared_data_lock = threading.Lock()

def parseJSON(responseText):
    start = responseText.find('[')
    # range of actual JSON in the response
    return json.loads(responseText[start:(len(responseText) - 2)])

def updateBusLocations():
    res = requests.get('http://www.uconnshuttle.com/Services/JSONPRelay.svc/GetMapVehiclePoints?method=jQuery1111005010178853515934_1485291299254&ApiKey=8882812681&_=1485291299511')
    return parseJSON(res.text)

def updateStopInfo():
    res = requests.get('http://www.uconnshuttle.com/Services/JSONPRelay.svc/GetRouteStopArrivals?method=jQuery11110746430026515343_1485295223953&TimesPerStopString=2&ApiKey=8882812681&_=1485295223990')
    return parseJSON(res.text)

def updateRoutes():
    res = requests.get('http://www.uconnshuttle.com/Services/JSONPRelay.svc/GetRoutesForMapWithScheduleWithEncodedLine?method=jQuery1111003305817537385458_1487272463428&ApiKey=8882812681&_=1487272463429')
    return parseJSON(res.text)

def sharedDataUpdaterFactory(updater, key):
    def thisLoop():
        while True:
            try:
                tmp = updater()
                shared_data_lock.acquire()
                shared_data[key] = tmp
                shared_data_lock.release()
            except:
                #fail silently bad idea?
                pass
        sleep(0.5)

def rideSystemsLoop():
    def locationLoop():
        while True:
            try:
                tmp = updateBusLocations()
                shared_data_lock.acquire()
                shared_data['locations'] = tmp
                shared_data_lock.release()
            except Exception as e:
                # failing silently perhaps not best
                print(e)
            sleep(0.5)
 
    locationThread = threading.Thread(target=locationLoop)
    locationThread.start()

if __name__ == '__main__':
    stdscr = curses.initscr()
    curses.noecho()
    stdscr.clear()

    RSLoop = threading.Thread(target=rideSystemsLoop)
    RSLoop.start()
    for i in range(50):
        stdscr.addstr(0, 0, "VehicleID\tLatitude\tLongitude\n")
        try:
            for bus in shared_data['locations']:
                stdscr.addstr("%d\t\t%f\t%f\n" % (bus['VehicleID'], bus['Latitude'],
                bus['Longitude']))
        except:
            # silent fail okay?
	    pass
        stdscr.refresh()
        sleep(0.5)

#curses.echo()
curses.endwin()
exit()
