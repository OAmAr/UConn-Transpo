import unittest
from Map import Map

class testLoc(unittest.TestCase):
	def testNonrealStop(self):
		m = Map()
		self.assertEquals(myMap.getTime("MSB","Non-real location"),None) # maybe this should raise an error?


	def testBasic(self):
		L = Location(8,7)
		self.assertEqual(L.getLocation(), [8,7])


if __name__ == "__main__":
	unittest.main()
