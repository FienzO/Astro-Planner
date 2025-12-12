from skyfield.api import N, S, E, W, load, wgs84
from skyfield import almanac
import datetime, numpy


ts = load.timescale()
eph = load('de421.bsp')

sun = eph['sun']
moon = eph['moon']
earth = eph['earth']


observer = earth + wgs84.latlon(51.484332 * N, -0.284845 * W)

today = datetime.date.today()
times = [ts.utc(today.year, today.month, today.day, hour) for hour in range(72)]

altitudes = []

for i, t in enumerate(times):
    astrometric_sun = observer.at(t).observe(sun)
    astrometric_moon = observer.at(t).observe(moon)
    alt_sun, _, _ = astrometric_sun.apparent().altaz()
    alt_moon, _, _ = astrometric_moon.apparent().altaz()

    dictionary = {"hour": i, "sun_altitude": float(alt_sun.degrees), "moon_altitude": float(alt_moon.degrees)}
    altitudes.append(dictionary)

# for i in altitudes:
#     print(i)

sunrise_hours = []
sunsett_hours = []

t0 = ts.utc(today.year, today.month, today.day, 0)
t1 = ts.utc(today.year, today.month, today.day+3, 0)

rise, _ = almanac.find_risings(observer, sun, t0, t1)
sett, _ = almanac.find_settings(observer, sun, t0, t1)

for t in rise:
    dt_object = t.utc_datetime()
    rounded_hour = dt_object.hour
    
    if dt_object.minute >= 30:
        rounded_hour = (dt_object.hour + 1) % 24
    sunrise_hours.append({"hour": rounded_hour})

for t in sett:
    dt_object = t.utc_datetime()
    rounded_hour = dt_object.hour
    
    if dt_object.minute >= 30:
        rounded_hour = (dt_object.hour + 1) % 24
    sunsett_hours.append({"hour": rounded_hour})


