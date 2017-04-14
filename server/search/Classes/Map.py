try:
    from search.Classes.data  import shared_data
    from search.Classes.Stop  import Stop
    from search.Classes.Route import Route
except ImportError:
    from data import shared_data
    from Stop import Stop
    from Route import Route
#issues:
    #getTime only tells how much time you should spend in bus, not how long you'd have to wait for it to get to you/when it will get
    #issue is its working on routes and not the busses on the routes
#todo:
    #add stops
    #create map from shared_data maybe:
class Map:
    def __init__(self,data=shared_data):
        self._stops  = dict() #name and Stop
        self._routes = dict() #name and Route
        self._sdata  = data
        if data:
            self.create(self._sdata)
            
    def create(self,data):
        for route in shared_data['routes']:
            self._routes[route['Description']] = Route(route['Description'], self._sdata)
            for stop in self._routes[route['Description']].getStops():
                if stop not in self._stops:
                    curr_route = self._routes[route['Description']]
                    cstop = curr_route.getStops()[stop][1]
                    self._stops[stop] = Stop(cstop['Longitude'],cstop['Latitude'],cstop['Description'], self._sdata)
                #self._stops[stop['Description]']].routes.append(route['Description'])
                
        #for stop in shared_data['stops']:
        #    self._stops[stop['Description']] = Stop(


    def getDirections(self, start, end):
	#given a start and end gives routes that dict of possible route and time it takes
        possible = self.possibleRoutes(start,end)
        times = {route:self.getTime(start,end,route)+self.getTimeToStartStop(start,route) for route in possible}
        return times

    def getTime(self, start,end, route):
        started = False
        done    = False
        l       = len(stops)
        i       = time = 0
        stops   = self._routes[route]["Stops"]
        while not done and i<l*2:
            if stops[i] == start:
                started == True
            elif started and stops[i] == end:
                done    = True
                started = False
            if started:
                time+= stops[i]["TimeToNextStop"]
                time+= stop[i]["TimeAtStop"]
            i+=1
            if i >= l:
                i=0
        return time

    def getTimeToStartStop(self,start,route):
        times = [bus.getNextTime()+self.getTime(bus.getLocation(),start,route) for bus in route.getBuses()]
        return min(times)

    def possibleRoutes(self, start,end):
        if not start in self._stops or not end in self._stops:
            raise RuntimeError("start or end not in stops")
            return
        possible = []
        for route in self._routes:
            if start in self._routes[route].getStops() and end in self._routes[route].getStops():
                possible.append(route)
        return possible

    def update(self):
        for route in self.getRoutes():
            route.update()

    def getStops(self):
        return self._stops

    def getRoutes(self):
        return self._routes

print(Map(shared_data).getRoutes().keys())
