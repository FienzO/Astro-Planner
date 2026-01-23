import weatherapi
from weatherapi.rest import ApiException

configuration = weatherapi.Configuration()
configuration.api_key['key'] = '9a13d258b2214f048ca122720250308'


api_instance = weatherapi.APIsApi(weatherapi.ApiClient(configuration))

q = 'London'  # City, Zip, or Lat/Long
days = 3      # Number of days (1-14)


api_response = api_instance.forecast_weather(q, days)

tempData = []
hour0 = api_response['forecast']['forecastday'][0]['hour'][0]['time_epoch']
for i in api_response['forecast']['forecastday']:
    # print(i['date'])
    for hour in i['hour']:
        hourData = {"hour":((hour['time_epoch']-hour0)//3600), "temp":hour['temp_c'], "dewpoint":hour['dewpoint_c']}
        tempData.append(hourData)

print(tempData)