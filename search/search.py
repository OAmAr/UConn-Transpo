
class Bus:
    def __init__(self, name=None, route=[]):
        self.color = name
        self.stops = route

    def getColor(self):
        return self.color

    def getStops(self):
        return self.stops

    def addStopToEnd(self,stop):
        self.stops.append(stop)

    def getTime(self,current,destination):
        # returns time it will take for this bus to get from current to destination
        pass


red = Bus('red',[1,2])
blue = Bus('blue',[1,4,5])
yellow = Bus('yellow',[3,7])
green = Bus('green',[1,5,8])

routes = {red:red.getStops(), blue:blue.getStops(), yellow:yellow.getStops(), green:green.getStops()}

print(stops[red])

def search(current,destination):
    for i in stops:
        if current in stops[i] and destination in stops[i]:
            # add these busses to potential options
            print(stops[keys] +   ': ' + i.getTime(current,destination))
