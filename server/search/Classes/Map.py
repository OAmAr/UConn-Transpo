import operator
try:
    from search.Classes.Stop  import Stop
    from search.Classes.Route import Route
    from search.Classes.Location import Location
except ImportError:
    from Location import Location
    from Stop import Stop
    from Route import Route
class Map:
    """Main class, takes shared data and intializes all actors"""
    def __init__(self,data):
        """Takes data and intializes stops, routes, all buses, and updates locations"""
        self._stops  = dict() #name and Stop
        self._routes = dict() #name and Route
        self._sdata  = data
        self.create(self._sdata)
        self.update()   
        if self._sdata['locations']==[]:
            print("Negatory captain, no buses running now (locations is empty)")
        
    def create(self,data):
        """Takes data and intializes stops, routes, all buses, and updates locations"""
        for route in self._sdata['routes']:
            self._routes[route['Description']] = Route(route['Description'], self._sdata)
            for stop in self._routes[route['Description']].getStops():
                if stop not in self._stops:
                    curr_route = self._routes[route['Description']]
                    cstop = curr_route.getStops()[stop][1]
                    self._stops[stop] = Stop(cstop['Longitude'],cstop['Latitude'],cstop['Description'], self._sdata)
    def getDirectionsLoc(self, s_loc, e_loc):
        """Takes two [x,y] coords, finds the closeset stops to each location and then the fastest way to get between those sets of stops
            return is of form:
            {(([start,distance from startloc][end,distancefrom endloc]):{route:time}}
        """ 
        stopstoconsider=2
        Loc1 = Location(s_loc[0],s_loc[1])
        Loc2 = Location(e_loc[0],e_loc[1])
        stops1 = []
        stops2 = []
        ret    = {}
        for stop in self.getStops():
            stops1.append((stop,self.getStops()[stop].distance(Loc1)))
            stops2.append((stop,self.getStops()[stop].distance(Loc2)))
        stops1=sorted(stops1, key=operator.itemgetter(1))
        stops2=sorted(stops2, key=operator.itemgetter(1))
        for start in stops1[:stopstoconsider]: 
            for end in stops2[:stopstoconsider]: 
                ret[(start,end)] = self.getDirections(start[0],end[0])
        return ret
    def getDirections(self, start, end):
        """'Given a start and end gives  dict of possible route and time it takes"""
        possible = self.possibleRoutes(start,end)
       # try:
        times = {route:self.getTime(start,end,route)+self.getTimeToStartStop(start,route) for route in possible} #might need to break this up for try
       # except TypeError:
       #     print("If getting no error check the try except in getdirections in map")
       #     if self.getTime(start,end,possible[0]) == None:
       #         print("No possible route")
       #         return -1
       #     if self.getTimeToStartStop(start,possible[0]) == None:
       #         print("No bus running")
       #         return -1
        return times

    def getTime(self, start,end, route):
        """Gets time it takes to get from point A to point B on a possible Route"""
        started = False
        done    = False
        order   = self._routes[route].orderstops()
        l       = len(order)
        i       = time = j = 0
        while not done and j<=l*2:
            i = j % l
            stop = self._routes[route].getStops()[order[i]][1]
            if order[i] == start:
                started = True
            if started and order[i] == end:
                done    = True
                started = False
            if started:
                time+= stop["SecondsToNextStop"]
                time+= stop["SecondsAtStop"]
            j+=1
        if not done:
            print("Did not find a time")
        if not done and time==0:
            print("We got a 0 from get time on", start, end, route, "(thats ok if there is not a did not find a time msg before this")
        return time

    def getTimeToStartStop(self,start,route):
        """Calculates minimum time it takes for a bus on a route to get to a stop from where it currently is"""
        times = [bus.getNextTime()+self.getTime(bus.getLocation(),start,route) for bus in self._routes[route].getBuses()]
        if not times:
            print("Couldn't find a way to get to", start, "on", route)
            return float('inf')
        return min(times)

    def possibleRoutes(self, start,end):
        """Returns the possible routes that have start and end on them"""
        if not start in self._stops or not end in self._stops:
            print(start,end)
            raise RuntimeError("start or end not in stops")
            return
        possible = []
        for route in self._routes:
            if start in self._routes[route].getStops() and end in self._routes[route].getStops():
                possible.append(route)
        return possible

    def update(self):
        """Update all objects in map"""
        for route in self.getRoutes():
            self.getRoutes()[route].update()
        for stop in self.getStops():
            self.getStops()[stop].update()

    def getStops(self):
        """Returns stop dictionary (Probably bet used with .keys() since don't need to see the objects"""
        return self._stops

    def getRoutes(self):
        """Returns stop dictionary (Probably bet used with .keys() since don't need to see the objects"""
        return self._routes
