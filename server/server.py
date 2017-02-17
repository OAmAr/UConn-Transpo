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
    responseText = res.text
    return parseJSON(responseText) 

def updateStopInfo():
    res = requests.get('http://www.uconnshuttle.com/Services/JSONPRelay.svc/GetRouteStopArrivals?method=jQuery11110746430026515343_1485295223953&TimesPerStopString=2&ApiKey=8882812681&_=1485295223990')
    return parseJSON(res.text)

def updateRoutes():
    res = requests.get('http://www.uconnshuttle.com/Services/JSONPRelay.svc/GetRoutesForMapWithScheduleWithEncodedLine?method=jQuery1111003305817537385458_1487272463428&ApiKey=8882812681&_=1487272463429')
    return parseJSON(res.text)

def rideSystemsLoop():
    def locationLoop():
        while True:
            try:
                tmp = updateLocations()
                shared_data_lock.acquire()
                shared_data['locations'] = tmp
                print(tmp)
                shared_data_lock.release()
            except:
                # failing silently perhaps not best
                print('updateLocationsFailed')
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
            print('otherthingfailed')
        stdscr.refresh()
        sleep(0.5)

#curses.echo()
curses.endwin()
exit()
