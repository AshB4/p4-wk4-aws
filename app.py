from flask import Flask, request, jsonify, render_template
from database import get_db, init_db

app = Flask(__name__, static_folder="static", template_folder="templates")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/drivers", methods=["OPTIONS"])
@app.route("/drivers/<int:id>", methods=["OPTIONS"])
@app.route("/vehicles", methods=["OPTIONS"])
@app.route("/vehicles/<int:id>", methods=["OPTIONS"])
@app.route("/routes", methods=["OPTIONS"])
@app.route("/routes/<int:id>", methods=["OPTIONS"])
@app.route("/packages", methods=["OPTIONS"])
@app.route("/packages/<int:id>", methods=["OPTIONS"])
def options_handler(id=None):
    return ("", 204)

#DRIVER

@app.route("/drivers", methods=["POST"])
def create_driver():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Driver (name, license_type) VALUES (?, ?)",
        (data.get("name"), data.get("license_type")),
    )
    conn.commit()
    driver_id = cursor.lastrowid
    conn.close()
    return jsonify({"driver_id": driver_id}), 201


@app.route("/drivers", methods=["GET"])
def get_drivers():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Driver")
    drivers = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in drivers])


@app.route("/drivers/<int:id>", methods=["PUT"])
def update_driver(id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Driver SET name=?, license_type=? WHERE driver_id=?",
        (data.get("name"), data.get("license_type"), id),
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Driver updated"})


@app.route("/drivers/<int:id>", methods=["DELETE"])
def delete_driver(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Driver WHERE driver_id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Driver deleted"})


#VEHICLE


@app.route("/vehicles", methods=["POST"])
def create_vehicle():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Vehicle (license_plate, model, driver_id) VALUES (?, ?, ?)",
        (data.get("license_plate"), data.get("model"), data.get("driver_id")),
    )
    conn.commit()
    vehicle_id = cursor.lastrowid
    conn.close()
    return jsonify({"vehicle_id": vehicle_id}), 201


@app.route("/vehicles", methods=["GET"])
def get_vehicles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Vehicle")
    vehicles = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in vehicles])


@app.route("/vehicles/<int:id>", methods=["PUT"])
def update_vehicle(id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Vehicle SET license_plate=?, model=?, driver_id=? WHERE vehicle_id=?",
        (data.get("license_plate"), data.get("model"), data.get("driver_id"), id),
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Vehicle updated"})


@app.route("/vehicles/<int:id>", methods=["DELETE"])
def delete_vehicle(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Vehicle WHERE vehicle_id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Vehicle deleted"})


#ROUTES


@app.route("/routes", methods=["POST"])
def create_route():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Routes (date, service_zone, driver_id) VALUES (?, ?, ?)",
        (data.get("date"), data.get("service_zone"), data.get("driver_id")),
    )
    conn.commit()
    route_id = cursor.lastrowid
    conn.close()
    return jsonify({"route_id": route_id}), 201


@app.route("/routes", methods=["GET"])
def get_routes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Routes")
    routes = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in routes])


@app.route("/routes/<int:id>", methods=["PUT"])
def update_route(id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Routes SET date=?, service_zone=?, driver_id=? WHERE routes_id=?",
        (data.get("date"), data.get("service_zone"), data.get("driver_id"), id),
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Route updated"})


@app.route("/routes/<int:id>", methods=["DELETE"])
def delete_route(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Routes WHERE routes_id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Route deleted"})


#PACKAGES


@app.route("/packages", methods=["POST"])
def create_package():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO Packages (description, weight, route_id) VALUES (?, ?, ?)",
        (data.get("description"), data.get("weight"), data.get("route_id")),
    )
    conn.commit()
    package_id = cursor.lastrowid
    conn.close()
    return jsonify({"package_id": package_id}), 201


@app.route("/packages", methods=["GET"])
def get_packages():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Packages")
    packages = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in packages])


@app.route("/packages/<int:id>", methods=["PUT"])
def update_package(id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE Packages SET description=?, weight=?, route_id=? WHERE package_id=?",
        (data.get("description"), data.get("weight"), data.get("route_id"), id),
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Package updated"})


@app.route("/packages/<int:id>", methods=["DELETE"])
def delete_package(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Packages WHERE package_id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Package deleted"})


#RUN APP

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
