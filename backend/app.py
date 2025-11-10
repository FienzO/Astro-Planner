from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv

import mysql.connector as mysql
import os


app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)

#! App Test
@app.route("/")
def index():
    return "Test Test 123"

@app.route("/signup", methods=['POST'])
def signup():
    passAllowed = "abcdefghijklmnopqrstuvwxyz0123456789~`! @#$%^&*()_-+={[}]|\:;\"'<,>.?/"

    data = request.get_json()
    username = data['username'].lower()
    password = data['password']
    password2 = data['firmPassword']

    #Error Checks
    if username == '':
        return jsonify({"message": "Username cant be empty!"}), 4000
    elif password != password2:
        return jsonify({"message": "Passwords do not match!"}), 4001
    elif password == '':
        return jsonify({"message": "Password cant be empty!"}), 4002
    elif len(password) > 50:
        return jsonify({"message": "Password too long! (< 50 char)"}), 4003
    elif len(password) > 50:
        return jsonify({"message": "Password too long! (< 50 char)"}), 4004
    for char in username:
        if char == ' ':
            return jsonify({"message": "No spaces allowed in username!"}), 4005
    for char in password.lower():
        if char not in passAllowed:
            return jsonify({"message": "No Exotic characters allowed in password!"}), 4006
        
    load_dotenv()

    mydb = mysql.connect(
    host=os.getenv("DBHOST"),
    user=os.getenv("DBUSER"),
    password=os.getenv("DBPASS"),
    database=os.getenv("DBNAME")
    )

    cursor = mydb.cursor()

    try:    
        addUserSQL ="""
        INSERT INTO userbase
        (username, hashedPassword)
        VALUES (%s, %s)
        """

        hashedPassword = bcrypt.generate_password_hash(password).decode('utf-8')

        userdata = (username,hashedPassword)
        cursor.execute(addUserSQL, userdata)

        mydb.commit()
        return jsonify({"message": "Account created successfully!"}), 201
        

    except mysql.Error as err:
        mydb.rollback()

        if err.errno == mysql.errorcode.ER_DUP_ENTRY:
            # This specific error is for a duplicate entry
            return jsonify({"message": "Username already exists!"}), 1068

    












#! Runs Server
if __name__ == "__main__":
    app.run(debug=True)