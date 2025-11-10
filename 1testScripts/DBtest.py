import mysql.connector
from flask import Flask
from flask_bcrypt import Bcrypt
# from flask_jwt_extended import JWTManager, create_access_token


#! FLASK STUFF
app = Flask(__name__)
# app.config['JWT_SECRET_KEY'] = "bababoey"

bcrypt = Bcrypt(app)
# jwt = JWTManager(app)


#! SQL CONNECTION
mydb = mysql.connector.connect(
    host = "77.68.120.9",
    user = "26finn",
    password = "aa*r5U225",
    database = "26finn"
)

TABLES = {}
TABLES["userbase"] = (
    "create TABLE `userbase` ("
    "  `id` INT AUTO_INCREMENT PRIMARY KEY,"
    "  `username` VARCHAR(30) NOT NULL,"
    "  `password` VARCHAR(30) NOT NULL"
    ") ENGINE=InnoDB")


cursor = mydb.cursor()

if mydb.is_connected():
    print("Connected to server")
else:
    print("Error connecting to database")
    quit()

def createUserbase():
    try:
        createTable = """
        create TABLE `userbase` (
        `id` INT(13) NOT NULL UNIQUE AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(30) NOT NULL UNIQUE,
        `hashedPassword` VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"""
        
        cursor.execute(createTable)
        print("Userbase table successful, check and see online")
    except: 
        print("Userbase already exists or failed")

def createNewUser(username,password):

    try:    
        addUserSQL ="""
        INSERT INTO userbase
        (username, hashedPassword)
        VALUES (%s, %s)
        """

        hashedPassword = bcrypt.generate_password_hash(password).decode('utf-8')

        userdata = (username,hashedPassword)
        cursor.execute(addUserSQL, userdata)

        newRowID = cursor.lastrowid

        mydb.commit()
        
        print(f"1 record inserted, ID: {newRowID}")

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        mydb.rollback()

def loginUser(username, password):
    try:

        query = "SELECT hashedPassword FROM userbase WHERE username = %s"

        cursor.execute(query, (username,))
        result = cursor.fetchone()

        if result:
            hashedPass = result[0]
        else:
            print("no pass found")
            return

        if bcrypt.check_password_hash(hashedPass, password):
            print("Login successful!")
        else:
            print("Invalid password or password.")

    except mysql.connector.Error as err:
        print(f"Database error: {err}")


#CHECKING PASSWORD CORRECT
# 

createUserbase()

createNewUser(input("Enter Username: "), input("Enter Password: "))
loginUser(input("Enter Username: "), input("Enter Password: "))