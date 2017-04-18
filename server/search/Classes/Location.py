import math
class Location:
    '''Location Class, extended by Stop'''
    def __init__(self, x, y):
        '''Takes x and y longitude and latitude'''
        self._coords = [None,None]
        if x and y:
            self._coords = [int(x),int(y)]
    def getLocation(self):
        '''Returns coordinates'''
        return [self.getX(),self.getY()]
    def setX(self,x):
        '''Sets x coordinate'''
        self._coords[0]=int(x)
    def setY(self,y):
        '''Sets y coordinate'''
        self._coords[1]=int(y)
    def getX(self):
        '''Returns X coordinate'''
        return self._coords[0]
    def getY(self):
        '''Returns y Coordinate'''
        return self._coords[1]
    def resetCoords(self, x, y):
        '''Sets new coordinates'''
        self.setX(int(x))
        self.setY(int(y))
    def distance(self, loc):
        '''Returns float distance between two locations'''
        return float(math.sqrt(((self.getX()-loc.getX())**2)+((self.getY()-loc.getY())**2)))
