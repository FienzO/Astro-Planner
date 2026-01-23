startTemp = -10
startDew = -15

thing = []
for i in range(72):
    hourData = {"hour":0+i, "temp":((startTemp+i)-5*(i//10)), "dewpoint":((startDew+i)-5*(i//10))}
    thing.append(hourData)

print(thing)
