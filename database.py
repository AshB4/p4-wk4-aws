import sqlite3


def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Driver (
        driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        license_type TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Vehicle (
        vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_plate TEXT,
        model TEXT,
        driver_id INTEGER UNIQUE,
        FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Routes (
        routes_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        service_zone TEXT,
        driver_id INTEGER,
        FOREIGN KEY (driver_id) REFERENCES Driver(driver_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Packages (
        package_id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        weight REAL,
        route_id INTEGER,
        FOREIGN KEY (route_id) REFERENCES Routes(routes_id)
    );
    """)

    conn.commit()
    conn.close()


#database.py
#handles database logic
#no Flask routes
#no @app.route