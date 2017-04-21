import server
if __name__=='__main__':
    M=server.main()
    #print(Map(shared_data).getDirectionees("Buckley", "Student Union"))
    #print(M.getDirections('South Campus', 'East Campus Southbound'))
    #print(M.getDirections('Student Union', 'Buckley'))
    for i in range(1000):
        M.getDirections('Student Union', 'Buckley')
