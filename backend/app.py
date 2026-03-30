from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, JWTManager
from dotenv import load_dotenv

from skyfield.api import N, S, E, W, load, wgs84, utc
from skyfield import almanac
from datetime import date, timedelta, datetime, timezone
import weatherapi
from weatherapi.rest import ApiException

import mysql.connector as sql
import os, re
import resend, random, requests




app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "SectetJWT1981"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)


load_dotenv()


@app.route("/locUndo", methods=['POST'])
def locUndo():
    data = request.get_json()
    username = data.get('username')
    stack = data.get('stack', [])

    if not stack or len(stack) == 0:
        return jsonify({"message": "Nothing to undo!"}), 400

    try:
        data = stack.pop() 
        lat = data['lat']
        lon = data['lon']
        try:
            Host=os.getenv("DB_HOST")
            User=os.getenv("DB_USER")
            Password=os.getenv("DB_PASS")
            Database=os.getenv("DB_NAME")

            mydb = sql.connect(
            host=Host,
            user=User,
            password=Password,
            database=Database
            )

        except:
            return jsonify({"message": "Database connection failed"}), 500
        
        cursor = mydb.cursor()
        
        insertSQL = "INSERT INTO locations (username, lat, lon) VALUES (%s, %s, %s)"
        cursor.execute(insertSQL, (username, lat, lon))
        mydb.commit()

        return jsonify({
            "message": "Location Restored!",
            "newStack": stack,
        }), 200

    except Exception as e:
        return jsonify({"message": f"Undo error: {str(e)}"}), 500

@app.route("/geolocate")
def geolocate():
    try:
        response = requests.get('http://ip-api.com/json/')
        data = response.json()
        
        if data['status'] == 'success':
            return {
                "lat": data['lat'],
                "lon": data['lon'],
            }
    except Exception as error:
        print(f"Location error: {error}")
    
    return jsonify({"lat": None, "lon": None})

@app.route("/profile")
@jwt_required()
def my_profile():
    current_user_identity = get_jwt_identity()
    return jsonify(username=current_user_identity)

@app.route("/reset1", methods=['POST'])
def passReset():
    passAllowed = r"abcdefghijklmnopqrstuvwxyz0123456789~`! @#$%^&*()_-+={[}]|\:;\"'<,>.?/"
    EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    userEmail = request.get_json()['email']
    code = request.get_json()['code']
    userPass = request.get_json()['password']
    firmPass = request.get_json()['firmPassword']

    if not re.match(EMAIL_REGEX, userEmail):
        return jsonify({"message": "Invalid email format!"}), 400
    elif userPass != firmPass:
        return jsonify({"message": "Passwords do not match!"}), 400
    elif userPass == '':
        return jsonify({"message": "Password cant be empty!"}), 411
    elif len(userPass) > 50:
        return jsonify({"message": "Password too long! (< 50 char)"}), 413
    for char in userPass.lower():
        if char not in passAllowed:
            return jsonify({"message": "No Exotic characters allowed in password!"}), 400
        
    try:
        Host=os.getenv("DB_HOST")
        User=os.getenv("DB_USER")
        Password=os.getenv("DB_PASS")
        Database=os.getenv("DB_NAME")

        mydb = sql.connect(
        host=Host,
        user=User,
        password=Password,
        database=Database
        )

    except:
        return jsonify({"message": "Database connection failed"}), 500
    
    cursor = mydb.cursor(dictionary=True)
        
    cursor.execute(
    """
    SELECT p.userID, u.username
    FROM passreset p
    JOIN userbase u ON p.userID = u.id
    WHERE p.code = %s
      AND u.email = %s
      AND p.expiresAt > CURRENT_TIMESTAMP
    """,
    (code, userEmail)
    )
    result = cursor.fetchone()
    if not result:
        return jsonify({"message": "Credentials invalid or Expired"}), 400
    
    userID = result['userID']
    hashedPassword = bcrypt.generate_password_hash(userPass).decode('utf-8')

    cursor.execute(
    """
    UPDATE userbase
    SET hashedPassword = %s
    WHERE id = %s
    """,
    (hashedPassword, userID)
    )

    mydb.commit()
    return jsonify({"message": "Password reset successful!"}), 200

@app.route("/reset", methods=['POST'])
def codeCreate():
    EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    userEmail = request.get_json()['email']

    if not re.match(EMAIL_REGEX, userEmail):
        return jsonify({"message": "Invalid email format!"}), 400
    
    try:
        Host=os.getenv("DB_HOST")
        User=os.getenv("DB_USER")
        Password=os.getenv("DB_PASS")
        Database=os.getenv("DB_NAME")

        mydb = sql.connect(
        host=Host,
        user=User,
        password=Password,
        database=Database
        )

    except:
        return jsonify({"message": "Database connection failed"}), 500
    cursor = mydb.cursor(dictionary=True)
    query = "SELECT id, username FROM userbase WHERE email = %s"
    cursor.execute(query, (userEmail,))

    result = cursor.fetchone()
    if result:
        username = result['username']
        id = result['id']
    else:
        #brute force protection
        return jsonify({"message": "Email Sent"}), 200
    

    randCode = random.randint(100000,999999)
    
    resend.api_key = os.getenv("R_API_KEY")

    try:
        email = resend.Emails.send({
        "from": "no-reply@resend.dev",
        "to": userEmail,
        "subject": "Astro-Planner Password reset",
        "html": f"<p>Your password reset code for the account \'{username}\' is:</p><h1>{randCode}</h1>"
        })
    except:
        return jsonify({"message": "Automatic email Error!"}), 500

    cursor.execute(
    """
    INSERT INTO passreset (userID, code, expiresAt)
    VALUES (%s, %s, CURRENT_TIMESTAMP + INTERVAL 5 MINUTE)
    """,
    (id, randCode)
)

    mydb.commit()
    cursor.close()
    mydb.close()

    return jsonify({"message": "Email Sent"}), 200



@app.route("/apigrab2", methods=['GET'])
def apigrab2():
    searchDate = request.args.get('date')
    searchTime = request.args.get('time')

    latitude = float(request.args.get('lat'))
    longitude = float(request.args.get('lon'))

    searchObj = request.args.get('object')

    #convert into usable timescale
    dt = datetime.strptime(f"{searchDate} {searchTime}", "%Y-%m-%d %H:%M")
    dt = dt.replace(tzinfo=None)

    ts = load.timescale()
    ts = ts.utc(dt.year, dt.month, dt.day, dt.hour, dt.minute)

    eph = load('de421.bsp')

    earth = eph['earth']

    planets = {
        "Mercury": eph['mercury'],
        "Venus": eph['venus'],
        "Mars": eph['mars'],
        "Jupiter": eph['jupiter barycenter'],
        "Saturn": eph['saturn barycenter'],
        "Uranus": eph['uranus barycenter'],
        "Neptune": eph['neptune barycenter']
    }

    topos = wgs84.latlon(latitude * N, longitude * W)   
    observer = earth + topos    

    if searchObj == "ISS":
        stations = load.tle_file('https://celestrak.org/NORAD/elements/stations.txt')
        iss = next((s for s in stations if s.name == 'ISS (ZARYA)'), None)

        diff = iss - topos                
        topocentric = diff.at(ts)    

        alt, az, distance = topocentric.altaz()
        objectAu  = round(distance.au, 3)
        objectKm  = round(distance.km, 3)
        objectAlt = round(alt.degrees, 3)
        objectAz  = round(az.degrees, 3)
    else:
        planet = planets[str(searchObj)]
        astrometric = observer.at(ts).observe(planet)
        apparent = astrometric.apparent()

        alt, az, distance = apparent.altaz()
        objectAu  = round(distance.au, 3)
        objectKm  = round(distance.km, 3)
        objectAlt = round(alt.degrees, 3)
        objectAz  = round(az.degrees, 3)

    if objectAlt < 0:
        isVisible = False
    else:
        isVisible = True

    return jsonify({
        "km": objectKm,
        "au": objectAu,
        "alt": objectAlt,
        "az": objectAz,
        "visible": str(isVisible)
    })



@app.route("/apigrab1", methods=['GET'])
def apigrab1():
    latitude = float(request.args.get('lat'))
    longitude = float(request.args.get('lon'))

    #!Skyfield
    ts = load.timescale()
    eph = load('de421.bsp')

    sun = eph['sun']
    moon = eph['moon']
    earth = eph['earth']

    planets = {
        "Mercury": eph['mercury'],
        "Venus": eph['venus'],
        "Mars": eph['mars'],
        "Jupiter": eph['jupiter barycenter'],
        "Saturn": eph['saturn barycenter'],
        "Uranus": eph['uranus barycenter'],
        "Neptune": eph['neptune barycenter']
    }

    topos = wgs84.latlon(latitude * N, longitude * W)   
    observer = earth + topos                            

    #Calculating DataPoints
    STEP_MINUTES = 5
    TOTAL_DAYS = 3

    today = date.today()
    num_points = int((TOTAL_DAYS * 24 * 60) / STEP_MINUTES)

    start_dt = datetime(today.year, today.month, today.day, 0, 0, tzinfo=utc)

    #datetimes every 5 mins
    times_dt = [start_dt + timedelta(minutes=i * STEP_MINUTES) for i in range(num_points)]

    # convert to Skyfield Time
    times = ts.utc(times_dt)


    astro_sun = observer.at(times).observe(sun).apparent()
    sun_alts = astro_sun.altaz()[0].degrees

    astro_moon = observer.at(times).observe(moon).apparent()
    moon_alts = astro_moon.altaz()[0].degrees

    # Altitudes
    planet_alts = {}
    for name, body in planets.items():
        astro = observer.at(times).observe(body).apparent()
        planet_alts[name] = astro.altaz()[0].degrees

    # ISS Altitudes
    stations = load.tle_file('https://celestrak.org/NORAD/elements/stations.txt')
    iss = next((s for s in stations if s.name == 'ISS (ZARYA)'), None)
    if iss is None:
        # backup if iss reads null
        iss_alts = [None] * len(times)
    else:
        diff = iss - topos                
        topocentric = diff.at(times)      # vectorised Location things
        iss_alts = topocentric.altaz()[0].degrees

    # Building Alt and Az data
    altitudes = []
    planetudes = []
    isVisible = []

    for i in range(len(times)):
        altitudes.append({
            "t_minutes": i,
            "sun_altitude": float(sun_alts[i]) if sun_alts[i] is not None else None,
            "moon_altitude": float(moon_alts[i]) if moon_alts[i] is not None else None
        })

        hour_data = {
            "t_minutes": i,
            "Sun": float(sun_alts[i]) if sun_alts[i] is not None else None,
            "ISS": float(iss_alts[i]) if iss_alts[i] is not None else None
        }

        for name in planets.keys():
            val = planet_alts[name][i]
            hour_data[name] = float(val) if val is not None else None

        planetudes.append(hour_data)
        
    for i in range(72):
        hour_data = {
            "Sun": True if sun_alts[i*12] < -10 else False
        }
        for name in planets.keys():

            val = True if planet_alts[name][i*12] > 10 else False
            hour_data[name] = float(val) if val is not None else None

        isVisible.append(hour_data)

    # DayTitles
    dayTitles = []
    for d in range(3):
        currDay = today + timedelta(days=d)
        dayTitles.append(currDay.strftime("%a %d"))

    #!WeatherAPI

    apiKey = os.getenv("W_API_KEY")

    configuration = weatherapi.Configuration()
    configuration.api_key['key'] = apiKey
    api_instance = weatherapi.APIsApi(weatherapi.ApiClient(configuration))
    days = 3
    api_response = api_instance.forecast_weather(f"{latitude},{longitude}", days)

    tempData = []
    windData = []
    cloudData = []
    visData = []

    hour0 = api_response['forecast']['forecastday'][0]['hour'][0]['time_epoch']
    loc = api_response['location']
    location = f"Location: {loc['name']}, {loc['country']}"

    for day in api_response['forecast']['forecastday']:
        for hour in day['hour']:
            h = (hour['time_epoch'] - hour0) // 3600
            tempData.append({"hour": h, "temp": hour['temp_c'], "dewpoint": hour['dewpoint_c']})
            windData.append({"hour": h, "wind_kph": hour['wind_kph'], "wind_mph": hour['wind_mph'], "gust_kph": hour['gust_kph'], "gust_mph": hour['gust_mph']})
            cloudData.append({"hour": h, "cloud": hour['cloud'], "rain": hour['chance_of_rain']})
            visData.append({"hour": h, "humidity": hour['humidity'], "visibility": hour['vis_km']})

    #!Finndex calculation

    finndex = []
    for i in range(72):
        hourlyFinndex = 1
        temp = tempData[i]['temp']
        dew = tempData[i]['dewpoint']
        wind = 1 / (max(15, windData[i]['wind_kph'])/15)
        gust = 1 / (max(20, windData[i]['gust_kph'])/20)
        cloud = 1 - cloudData[i]['cloud']/100
        visibility = visData[i]['visibility'] / 10
        humidity = 1 - (visData[i]['humidity'] / 100)

        dewScore = min(max((temp - dew) / 5, 0), 1.0)

        hourlyFinndex = (
            0.4 * cloud +
            0.20 * visibility +
            0.10 * humidity +
            0.05 * dewScore +
            0.2 * wind +
            0.10 * gust
        )

        hourlyFinndex = round(max(0.0, min(hourlyFinndex, 1.0)), 2)

        

        if not isVisible[i]['Sun']: hourlyFinndex = 0

        finndex.append({'hour':i, 'finndex':hourlyFinndex})

        #Finndex Merge sort
        def mergeSort(toSort):
            if len(toSort) <= 1:
                return toSort

            mid = len(toSort) // 2
            leftHalf = mergeSort(toSort[:mid])
            rightHalf = mergeSort(toSort[mid:])

            sortedOut = []
            i = 0
            j = 0

            while i < len(leftHalf) and j < len(rightHalf):

                if leftHalf[i]['finndex'] >= rightHalf[j]['finndex']:
                    sortedOut.append(leftHalf[i])
                    i += 1
                else:
                    sortedOut.append(rightHalf[j])
                    j += 1

            sortedOut += (leftHalf[i:] + rightHalf[j:])
            
            return sortedOut
        
        ranked = mergeSort(list(finndex))
        podium = ranked[:3]

    return jsonify({
        "altData": altitudes,
        "planetData": planetudes,
        "tempData": tempData,
        "windData": windData,
        "cloudData": cloudData,
        "visData": visData,
        "titleData": dayTitles,
        "finndex": finndex,
        "podium": podium,
        "location": location
    })







@app.route("/signup", methods=['POST'])
def signup():
    passAllowed = r"abcdefghijklmnopqrstuvwxyz0123456789~`! @#$%^&*()_-+={[}]|\:;\"'<,>.?/"
    EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"

    data = request.get_json()
    username = data['username'].lower()
    password1 = data['password']
    password2 = data['firmPassword']
    email = data['email']

    #Error Checks
    if username == '':
        return jsonify({"message": "Username cant be empty!"}), 411
    elif password1 != password2:
        return jsonify({"message": "Passwords do not match!"}), 400
    elif password1 == '':
        return jsonify({"message": "Password cant be empty!"}), 411
    elif len(password1) > 50:
        return jsonify({"message": "Password too long! (< 50 char)"}), 413
    for char in username:
        if char == ' ':
            return jsonify({"message": "No spaces allowed in username!"}), 400
    for char in password1.lower():
        if char not in passAllowed:
            return jsonify({"message": "No Exotic characters allowed in password!"}), 400
        
    if email != '':
        if not re.match(EMAIL_REGEX, email):
            return jsonify({"message": "Invalid email format!"}), 400
    else:
        email = None

    

    try:
        Host=os.getenv("DB_HOST")
        User=os.getenv("DB_USER")
        Password=os.getenv("DB_PASS")
        Database=os.getenv("DB_NAME")

        mydb = sql.connect(
        host=Host,
        user=User,
        password=Password,
        database=Database
        )

    except:
        return jsonify({"message": "Database connection failed"}), 500
    try:
        cursor = mydb.cursor()
        
        addUserSQL ="""
        INSERT INTO userbase
        (username, hashedPassword, email)
        VALUES (%s, %s, %s)
        """

        hashedPassword = bcrypt.generate_password_hash(password1).decode('utf-8')

        userdata = (username,hashedPassword,email)
        cursor.execute(addUserSQL, userdata)

        mydb.commit()
        return jsonify({"message": "Account created successfully!"}), 201
        

    except sql.Error as err:
        mydb.rollback()

        if err.errno == sql.errorcode.ER_DUP_ENTRY:
            return jsonify({"message": "Username already exists!"}), 403
    
@app.route("/login", methods=['POST'])
def login():
    
    data = request.get_json()
    username = data['username'].lower()
    password = data['password']

    try:
        Host=os.getenv("DB_HOST")
        User=os.getenv("DB_USER")
        Password=os.getenv("DB_PASS")
        Database=os.getenv("DB_NAME")

        mydb = sql.connect(
        host=Host,
        user=User,
        password=Password,
        database=Database
        )
    except:
        return jsonify({"message": "Database connection failed"}), 500

    #try:
    query = "SELECT hashedPassword FROM userbase WHERE username = %s"

    cursor = mydb.cursor()
    cursor.execute(query, (username,))
    result = cursor.fetchone() 

    if result:
        hashedPass = result[0]
    else:
        return jsonify({"message": "Invalid username or password"}), 400
    
    if bcrypt.check_password_hash(hashedPass, password):
        token = create_access_token(identity=username)

        return jsonify({"message": "Logged in successfully!", "access_token": token, "user": username}), 200
    
    else:
        return jsonify({"message": "Invalid username or password"}), 400

    #except:
        #return jsonify({"message": "Database check failed"}), 500

@app.route("/locSave", methods=['POST'])
def locSave():
    

    data = request.get_json()
    lat = data['lat']
    lon = data['lon']
    username = data['username']

    #Error Checks
    if lat == '':
        return jsonify({"message": "Latitude Empty"}), 400
    elif lon == '':
        return jsonify({"message": "Longitude Empty"}), 400

    try:
        Host=os.getenv("DB_HOST")
        User=os.getenv("DB_USER")
        Password=os.getenv("DB_PASS")
        Database=os.getenv("DB_NAME")

        mydb = sql.connect(
        host=Host,
        user=User,
        password=Password,
        database=Database
        )

    except:
        return jsonify({"message": "Database connection failed"}), 500
    try:
        cursor = mydb.cursor()
        
        addUserSQL ="""
        INSERT INTO locations
        (username, lat, lon)
        VALUES (%s, %s, %s)
        """


        userdata = (username,lat,lon)
        cursor.execute(addUserSQL, userdata)

        mydb.commit()
        return jsonify({"message": "Location Saved!"}), 201
        

    except sql.Error as err:
        mydb.rollback()
        return jsonify({"message": "Database Write failed"}), 500
        

@app.route("/locDel", methods=['POST'])
def locDel():
    

    data = request.get_json()
    lat = data['lat']
    lon = data['lon']
    username = data['username']

    #Error Checks
    if lat == '':
        return jsonify({"message": "Latitude Empty"}), 400
    elif lon == '':
        return jsonify({"message": "Longitude Empty"}), 400

    try:
        Host=os.getenv("DB_HOST")
        User=os.getenv("DB_USER")
        Password=os.getenv("DB_PASS")
        Database=os.getenv("DB_NAME")

        mydb = sql.connect(
        host=Host,
        user=User,
        password=Password,
        database=Database
        )

    except:
        return jsonify({"message": "Database connection failed"}), 500
    try:
        cursor = mydb.cursor()
        
        addUserSQL ="""
        DELETE FROM locations
        WHERE username = %s
        AND ABS(lat - %s) < 0.00001
        AND ABS(lon - %s) < 0.00001;
        """


        userdata = (username,lat,lon)
        cursor.execute(addUserSQL, userdata)

        mydb.commit()
        return jsonify({"message": "Location Deleted!"}), 201
        

    except sql.Error as err:
        print(err)
        mydb.rollback()
        return jsonify({"message": "Database Write Fail"}), 500

@app.route("/getLocations", methods=['GET'])
def get_locations():
    username = request.args.get('username')
    if not username:
        return jsonify([])

    try:
        mydb = sql.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASS"),
            database=os.getenv("DB_NAME")
        )
        cursor = mydb.cursor(dictionary=True)
        cursor.execute("SELECT locID, lat, lon FROM locations WHERE username=%s", (username,))
        rows = cursor.fetchall()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route("/home", methods=['POST'])
def home():
    pass




#! Runs Server
if __name__ == "__main__":
    app.run(debug=True)