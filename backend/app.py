from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

import mysql.connector as mysql
import os


app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)

load_dotenv()
print("DBHOST from env:", os.getenv("DBHOST"))

def sqlconnect():

    mydb = mysql.connect(
    host=os.getenv("DBHOST"),
    user=os.getenv("DBUSER"),
    password=os.getenv("DBPASS"),
    database=os.getenv("DBNAME")
    )

    return mydb

@app.route("/signup", methods=['POST'])
def signup():
    passAllowed = "abcdefghijklmnopqrstuvwxyz0123456789~`! @#$%^&*()_-+={[}]|\:;\"'<,>.?/"

    data = request.get_json()
    username = data['username'].lower()
    password = data['password']
    password2 = data['firmPassword']

    #Error Checks
    if username == '':
        return jsonify({"message": "Username cant be empty!"})
    elif password != password2:
        return jsonify({"message": "Passwords do not match!"})
    elif password == '':
        return jsonify({"message": "Password cant be empty!"})
    elif len(password) > 50:
        return jsonify({"message": "Password too long! (< 50 char)"})
    for char in username:
        if char == ' ':
            return jsonify({"message": "No spaces allowed in username!"})
    for char in password.lower():
        if char not in passAllowed:
            return jsonify({"message": "No Exotic characters allowed in password!"})

    

    try:    
        try:
            mydb = sqlconnect()
        except:
            return jsonify({"message": "Database connection failed"})
        
        addUserSQL ="""
        INSERT INTO userbase
        (username, hashedPassword)
        VALUES (%s, %s)
        """

        hashedPassword = bcrypt.generate_password_hash(password).decode('utf-8')

        userdata = (username,hashedPassword)
        mydb.cursor.execute(addUserSQL, userdata)

        mydb.commit()
        return jsonify({"message": "Account created successfully!"})
        

    except mysql.Error as err:
        mydb.rollback()

        if err.errno == mysql.errorcode.ER_DUP_ENTRY:
            return jsonify({"message": "Username already exists!"})

    
@app.route("/login", methods=['POST'])
def login():
    
    data = request.get_json()
    username = data['username'].lower()
    password = data['password']

    try:
        try:
            mydb = sqlconnect()
        except:
            return jsonify({"message": "Database connection failed"})
        
        query = "SELECT hashedPassword FROM userbase WHERE username = %s"

        mydb.cursor.execute(query, (username,))
        result = mydb.cursor.fetchone() 

        if result:
            hashedPass = result[0]
        else:
            return jsonify({"message": "Invalid username or password"})
        

        if bcrypt.check_password_hash(hashedPass, password):
            print("Login successful!")
        else:
            print("Invalid username or password.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    pass











#! Runs Server
if __name__ == "__main__":
    app.run(debug=True)