from server import shared_data
from Map import Map
#from tda import testData as shared_data
M=Map(shared_data)
if __name__=='__main__':
    #print(Map(shared_data).getDirectionees("Buckley", "Student Union"))
    #print(M.getDirections('South Campus', 'East Campus Southbound'))
    print(M.getDirections('Student Union', 'Student Union'))
