from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, get_jwt_identity
from dotenv import load_dotenv

import mysql.connector as sql
import os



app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)


load_dotenv()

@app.route("/profile")
@jwt_required() # <-- This is the lock on the door
def my_profile():
    current_user_identity = get_jwt_identity() # <-- Read the passcard
    # Here you could look up the user in the database if needed
    # For now, just sending back the username is fine.
    return jsonify(username=current_user_identity)



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
        return jsonify({"message": "Logged in successfully!"}), 200
    else:
        return jsonify({"message": "Invalid password"}), 400

    #except:
        #return jsonify({"message": "Database check failed"}), 500
    
    pass











#! Runs Server
if __name__ == "__main__":
    app.run(debug=True)