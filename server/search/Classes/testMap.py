import unittest
try:
    from Map import Map
except ImportError:
    from search.Classes.Map import Map

class testLoc(unittest.TestCase):
    def testNonrealStop(self):
        myMap = Map()
        print("Off the island")
        print("sry")
        print("omar knows his spaces")

    	# self.assertEquals(myMap.getTime("MSB","Non-real location"),None) # maybe this should raise an error?


    def testBasic(self):
        pass
    	# L = Location(8,7)
    	# self.assertEqual(L.getLocation(), [8,7])


if __name__ == "__main__":
    unittest.main()
