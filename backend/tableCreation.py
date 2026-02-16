import os
import mysql.connector as sql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

db = sql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS"),
    database=os.getenv("DB_NAME")
)

cursor = db.cursor()

# ---- USERBASE TABLE ----
cursor.execute("""
CREATE TABLE IF NOT EXISTS userbase (
    id INT(13) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    hashedPassword VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
""")

# ---- LOCATIONS TABLE ----
cursor.execute("""
CREATE TABLE IF NOT EXISTS locations (
    locID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    lat DECIMAL(9,6) NOT NULL,
    lon DECIMAL(9,6) NOT NULL,
    CONSTRAINT fk_locations_user
        FOREIGN KEY (username)
        REFERENCES userbase(username)
        ON DELETE CASCADE
) ENGINE=InnoDB;
""")

# ---- PASSRESET TABLE ----
cursor.execute("""
CREATE TABLE IF NOT EXISTS passreset (
    codeID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    code INT NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    CONSTRAINT fk_passreset_user
        FOREIGN KEY (userID)
        REFERENCES userbase(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
""")

db.commit()
cursor.close()
db.close()

print("Tables userbase, locations and passreset created successfully.")
