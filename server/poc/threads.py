import threading

big_lock = threading.Lock()
big_global_variable = [big_lock, "B-I-G"]

def sayHello():
    print(big_global_variable)
    big_global_variable[0].acquire()
    big_global_variable[1] = "Hella B-I-G"
    big_global_variable[0].release()

helloThread = threading.Thread(target=sayHello)
helloThread.start()
helloThread.join(10)
print(big_global_variable)
