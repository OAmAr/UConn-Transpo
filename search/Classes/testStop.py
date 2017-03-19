import unittest
from Stop import Stop

class testStop(unittest.TestClass):
	
	def testStopLoc(self):
		s = Stop(0,3,"ThisIsNotAName")
		self.assertEqual([0,3], s.getLocation())
	def testStopName(self):
		s = Stop(0,3,"ThisIsNotAName")
		self.assertEqual("ThisIsNotAName", s.getName())
	
	def testStopRoutes(self):
		s = Stop(0,3, "This is a Name")
		self.assertEqual(s.getRoutes(), set(["Some", "colors"]))

	def testStopNoRoutes(self):
		s = stop(0,3 " this is not a name")
		self.assertEqual(s.getRoutes(), set())


if __name__ == "__main__":
	unittest.main()
