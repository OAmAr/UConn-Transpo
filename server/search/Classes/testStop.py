import unittest
try:
    from search.Classes.Stop import Stop
except ImportError:
    from Stop import Stop
print("testing stop")
class testStop(unittest.TestCase):
	
	def testStopLoc(self):
		s = Stop(0,3,"ThisIsNotAName")
		self.assertEqual([0,3], s.getLocation())
	def testStopName(self):
		s = Stop(0,3,"ThisIsNotAName")
		self.assertEqual("ThisIsNotAName", s.getName())
	
	def testStopRoutes(self):
		s = Stop(0,3, "North Garage")
		self.assertEqual(s.getRoutes(), set(["Green", "Silver", "Purple", "Blue", "Yellow"]))
	def testStops2(self):
		s = Stop(0,3, "Silver Falls")
		self.assertEqual(s.getRoutes(), set(["Purple"]))
	def testStopNoRoutes(self):
		s = Stop(0,3, " this is not a name")
		self.assertEqual(s.getRoutes(), set())


if __name__ == "__main__":
	unittest.main()
