try:
#    from search.Classes.data  import shared_data
    from search.Classes.Stop  import Stop
    from search.Classes.Route import Route
except ImportError:
#    from data import shared_data
    from Stop import Stop
    from Route import Route
#issues:
    #getTime only tells how much time you should spend in bus, not how long you'd have to wait for it to get to you/when it will get
    #issue is its working on routes and not the busses on the routes
#todo:
    #add stops
    #create map from shared_data maybe:
class Map:
    '''Main class, takes shared data and intializes all actors'''
    def __init__(self,data):
        '''Takes data and intializes stops, routes, all buses, and updates locations'''
        self._stops  = dict() #name and Stop
        self._routes = dict() #name and Route
        self._sdata  = data
        self.create(self._sdata)
        self.update()   
        if self._sdata['locations']==[]:
            print("Negatory captain, no buses running now (locations is empty)")
        
    def create(self,data):
        '''Takes data and intializes stops, routes, all buses, and updates locations'''
        for route in self._sdata['routes']:
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
        ''''Given a start and end gives  dict of possible route and time it takes'''
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
        '''Gets time it takes to get from point A to point B on a possible Route'''
        #print("got get time call for", start, end, route)
        started = False
        done    = False
        order   = self._routes[route].orderstops()
        l       = len(order)
        i       = time = j = 0
        #print(l, "length")
        while not done and j<=l*2:
            i = j % l
            #print("index", i)
            stop = self._routes[route].getStops()[order[i]][1]
            #print(order[i]==start)
            #print(end==order[i]==start)
            if order[i] == start:
                #print("started")
                #print(order[i], start)
                started = True
                #print(started)
            #print(started, order[i], end)
            if started and order[i] == end:
                #print("done")
                done    = True
                started = False
            if started:
                #print("adding time")
                #print(stops.keys())
                time+= stop["SecondsToNextStop"]
                time+= stop["SecondsAtStop"]
            j+=1
        if not done:
            print("Did not find a time")
        if time==0:
            print("We got a 0 from get time on", start, end, route)
        #print("time: ",time)
        return time

    def getTimeToStartStop(self,start,route):
        '''Calculates minimum time it takes for a bus on a route to get to a stop from where it currently is'''
        times = [bus.getNextTime()+self.getTime(bus.getLocation(),start,route) for bus in self._routes[route].getBuses()]
        if not times:
            print("Couldn't find a way to get to", start, "on", route)
            return float('inf')
        return min(times)

    def possibleRoutes(self, start,end):
        '''Returns the possible routes that have start and end on them'''
        if not start in self._stops or not end in self._stops:
            raise RuntimeError("start or end not in stops")
            print(start,end,self_stops)
            return
        possible = []
        for route in self._routes:
            if start in self._routes[route].getStops() and end in self._routes[route].getStops():
                possible.append(route)
        return possible

    def update(self):
        '''Update all objects in map'''
        for route in self.getRoutes():
            self.getRoutes()[route].update()
        for stop in self.getStops():
            self.getStops()[stop].update()

    def getStops(self):
        '''Returns stop dictionary (Probably bet used with .keys() since don't need to see the objects'''
        return self._stops

    def getRoutes(self):
        '''Returns stop dictionary (Probably bet used with .keys() since don't need to see the objects'''
        return self._routes
#print(Map(shared_data).getDirections("Buckley", "Student Union"))
