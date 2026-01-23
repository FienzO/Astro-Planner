from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, JWTManager
from dotenv import load_dotenv

from skyfield.api import N, S, E, W, load, wgs84
from skyfield import almanac
from datetime import date, timedelta
import weatherapi
from weatherapi.rest import ApiException

import mysql.connector as sql
import os



app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "wawaSecretWawa"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
CORS(app)


load_dotenv()

@app.route("/profile")
@jwt_required()
def my_profile():
    current_user_identity = get_jwt_identity()
    return jsonify(username=current_user_identity)

@app.route("/apigrab1", methods=['GET'])
def apigrab1():
    ts = load.timescale()
    eph = load('de421.bsp')

    sun = eph['sun']
    moon = eph['moon']
    earth = eph['earth']


    observer = earth + wgs84.latlon(51.484332 * N, -0.284845 * W)

    today = date.today()
    times = [ts.utc(today.year, today.month, today.day, hour) for hour in range(72)]

    altitudes = []

    dayTitles = []
    for i in range(3):
        currDay = today + timedelta(days=i)
        # print(currDay)
        dayTitles.append(currDay.strftime("%a %d")) 

    for i, t in enumerate(times):
        astrometric_sun = observer.at(t).observe(sun)
        astrometric_moon = observer.at(t).observe(moon)
        alt_sun, _, _ = astrometric_sun.apparent().altaz()
        alt_moon, _, _ = astrometric_moon.apparent().altaz()

        dictionary = {"hour": i, "sun_altitude": float(alt_sun.degrees), "moon_altitude": float(alt_moon.degrees)}
        altitudes.append(dictionary)

    sunrise_hours = []
    sunsett_hours = []

    t0 = ts.utc(today.year, today.month, today.day, 0)
    future_date = today + timedelta(days=3) 
    t1 = ts.utc(future_date.year, future_date.month, future_date.day+3, 0)

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

    #! WeatherAPI Grab
     
    configuration = weatherapi.Configuration()
    configuration.api_key['key'] = '9a13d258b2214f048ca122720250308'


    api_instance = weatherapi.APIsApi(weatherapi.ApiClient(configuration))

    q = 'London'  # City, Zip, or Lat/Long
    days = 3      # Number of days (1-14)


    api_response = api_instance.forecast_weather(q, days)

    tempData, windData = []
    hour0 = api_response['forecast']['forecastday'][0]['hour'][0]['time_epoch']
    for i in api_response['forecast']['forecastday']:
        # print(i['date'])
        for hour in i['hour']:
            t_hourData = {"hour":((hour['time_epoch']-hour0)//3600), "temp":hour['temp_c'], "dewpoint":hour['dewpoint_c']}
            tempData.append(t_hourData)

            w_hourData = {"hour":((hour['time_epoch']-hour0)//3600), "wind_kph":hour['wind_kph'], "wind_mph":hour['wind_mph'], "wind_deg":hour['wind_degree'], "wind_dir":hour['wind_dir']]}
            windData.append(w_hourData)

    # print(tempData)

    return jsonify({
        "altData": altitudes,
        "tempData": tempData,
        "windData": windData,
        "titleData": dayTitles
    })






@app.route("/signup", methods=['POST'])
def signup():
    passAllowed = r"abcdefghijklmnopqrstuvwxyz0123456789~`! @#$%^&*()_-+={[}]|\:;\"'<,>.?/"

    data = request.get_json()
    username = data['username'].lower()
    password1 = data['password']
    password2 = data['firmPassword']

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
        
        addUserSQL ="""
        INSERT INTO userbase
        (username, hashedPassword)
        VALUES (%s, %s)
        """

        hashedPassword = bcrypt.generate_password_hash(password1).decode('utf-8')

        userdata = (username,hashedPassword)
        mydb.cursor().execute(addUserSQL, userdata)

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
        return jsonify({"message": "Invalid username"}), 400
    
    if bcrypt.check_password_hash(hashedPass, password):
        token = create_access_token(identity=username)

        return jsonify({"message": "Logged in successfully!", "access_token": token, "user": username}), 200
    
    else:
        return jsonify({"message": "Invalid password"}), 400

    #except:
        #return jsonify({"message": "Database check failed"}), 500

@app.route("/home", methods=['POST'])
def home():
    pass




#! Runs Server
if __name__ == "__main__":
    app.run(debug=True)