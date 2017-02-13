# network thread prototype

import requests
import json
import curses
from time import sleep

stdscr = curses.initscr()

def updateLocations():
    res = requests.get('http://www.uconnshuttle.com/Services/JSONPRelay.svc/GetMapVehiclePoints?method=jQuery1111005010178853515934_1485291299254&ApiKey=8882812681&_=1485291299511')
    responseText = res.text
    start = responseText.find('[')
    # range of actual JSON in the response
    return json.loads(responseText[start:(len(responseText) - 2)])


curses.noecho()
stdscr.clear()

for i in range(50):
    try:
        decoded = updateLocations()
    except:
    	pass
    stdscr.addstr(0, 0, "VehicleID\tLatitude\tLongitude\n")
    for bus in decoded:
        stdscr.addstr("%d\t\t%f\t%f\n" % (bus['VehicleID'], bus['Latitude'],
        bus['Longitude']))
    stdscr.refresh()
    sleep(0.5)

#curses.echo()
curses.endwin()
exit()
