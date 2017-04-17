import requests
import json
import threading
import socketserver
from time import sleep
#from udp_responder import BusUDPHandler, BusUDPServer
#from httpsrv import BusHTTPRequestHandler, BusHTTPServer
#from Map import Map

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

def sharedDataUpdaterFactory(updater, key, interval):
    def thisLoop():
        while True:
            try:
                tmp = updater()
                shared_data_lock.acquire()
                shared_data[key] = tmp
                shared_data_lock.release()
                sleep(interval)
            except Exception as e:
                # fail silently bad idea?
                # print(e)
                sleep(3)
    return thisLoop

def rideSystemsLoop():
    locationLoop = sharedDataUpdaterFactory(updateBusLocations, 'locations',
    0.5)
    stopLoop = sharedDataUpdaterFactory(updateStopInfo, 'stops', 20)
    routeLoop = sharedDataUpdaterFactory(updateRoutes, 'routes', 600)
    locationThread = threading.Thread(target=locationLoop)
    stopThread = threading.Thread(target=stopLoop)
    routeThread = threading.Thread(target=routeLoop)
    locationThread.start()
    stopThread.start()
    routeThread.start()

    #def updateMap():
     #   while True:
      #      Map.update()
       #     sleep(20)

if __name__ == '__main__':

    RSLoop = threading.Thread(target=rideSystemsLoop)
    RSLoop.start()
    #UDPPORT = 6269
    #udpsrv = BusUDPServer(("0.0.0.0", UDPPORT), BusUDPHandler, shared_data)
    #UDPThread = threading.Thread(target=udpsrv.serve_forever)
    #UDPThread.start()
    print("BusUDPServer serving at port", UDPPORT)
    HTTPPORT = 8000
    #Handler = BusHTTPRequestHandler
    httpd = BusHTTPServer(("", HTTPPORT), Handler, shared_data)
    print("BusHTTPRequestHandler serving at port", HTTPPORT)
    HTTPThread = threading.Thread(target=httpd.serve_forever)
    HTTPThread.start()

   # updateMapThread = threading.Thread(target=updateMap)
   # updateMapThread.start()

    sleep(4)

    # for line in shared_data['routes']:
    #     print(line['Description'])
    # blue = 0
    # red = 1
    # green = 2
    # yellow = 3
    # orange = 4
    # purple = 5

    def getStops(busNumber):
        l = len(shared_data['routes'][busNumber]['Stops'])
        stops = []
        for i in range(l):
            stops.append(shared_data['routes'][busNumber]['Stops'][i]['Description'])
        return(stops)

    # print(getStops(0))

    def getTime(busNumber,start,end):
        l = len(shared_data['routes'][busNumber]['Stops'])
        time = 0
        startCounting = False

        for stops in range(l*2):
            stops = stops%l
            current = shared_data['routes'][busNumber]['Stops'][stops]
            print
            if current['Description'] == start:
                startCounting = True
            if startCounting and current['Description'] == end:
                return time
            if startCounting:
                time = time + current['SecondsToNextStop']



    # print(shared_data['routes'][0]['Stops'][0]['Description'])
    # print(shared_data['routes'][0]['Stops'][0]['SecondsToNextStop'])
    #
    # print(shared_data['routes'][0]['Stops'][1]['Description'])
    # print(shared_data['routes'][0]['Stops'][1]['SecondsToNextStop'])

    # print(getTime(5,'Clubhouse Apartments','MSB'))
    # for line in shared_data['routes']:
    #     print(line['Description'])


    # the issue is the search is only linear, it needs to be circular

    # for i in range(len(shared_data['routes'][5]['Stops'])):
    #     print(shared_data['routes'][5]['Stops'][i]['Description'])
    # print(shared_data['routes'][0]['Stops'][0]['SecondsToNextStop'])
    # print(shared_data['routes'][0]['Stops'][3]['Description'])
    # print(shared_data['routes'][0]['Stops'][4]['Description'])
    # print(shared_data['routes'][0]['Stops'][5]['Description'])



    #stdscr.refresh()
# sleep(1)
# print(shared_data['routes'][0]['Stops'][0]['SecondsToNextStop'])
# exit()
#curses.echo()
#curses.endwin()
