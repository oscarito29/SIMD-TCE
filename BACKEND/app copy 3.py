from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import jwt
import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Configuración de MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'simd-tce'
app.config['SECRET_KEY'] = 'mi_clave_secreta'

mysql = MySQL(app)

# -------------------- LOGIN --------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Faltan datos'}), 400

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT m.id, m.nombre, m.username, m.password, r.nombre AS rol
        FROM medicos m
        INNER JOIN roles r ON m.rol_id = r.id
        WHERE m.username = %s
    """, (username,))
    result = cur.fetchone()
    cur.close()

    if result:
        id_medico, nombre, username_db, stored_password, rol = result

        if stored_password == password:
            token = jwt.encode({
                'id': id_medico,
                'username': username_db,
                'rol': rol,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }, app.config['SECRET_KEY'], algorithm='HS256')

            return jsonify({'token': token, 'nombre': nombre, 'rol': rol})
        else:
            return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401
    else:
        return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401

# -------------------- ROLES --------------------
@app.route('/api/roles', methods=['GET'])
def get_roles():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, nombre FROM roles")
    roles = cur.fetchall()
    cur.close()
    roles_list = [{'id': r[0], 'nombre': r[1]} for r in roles]
    return jsonify(roles_list)

# -------------------- MÉDICOS --------------------
@app.route('/api/medicos', methods=['GET'])
def get_medicos():
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT m.id, m.nombre, m.username, m.especialidad, r.nombre AS rol_nombre
        FROM medicos m
        INNER JOIN roles r ON m.rol_id = r.id
    """)
    medicos = cur.fetchall()
    cur.close()

    medicos_list = []
    for m in medicos:
        medicos_list.append({
            'id': m[0],
            'nombre': m[1],
            'username': m[2],
            'especialidad': m[3],
            'rol_nombre': m[4]
        })
    return jsonify(medicos_list)

@app.route('/api/medicos/registrar', methods=['POST'])
def registrar_medico():
    data = request.get_json()
    nombre = data.get('nombre')
    username = data.get('username')
    password = data.get('password')  # temporal sin encriptar
    especialidad = data.get('especialidad')
    rol_id = data.get('rol_id')

    if not nombre or not username or not password or not especialidad or not rol_id:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO medicos (nombre, username, password, especialidad, rol_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (nombre, username, password, especialidad, rol_id))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Médico registrado correctamente'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# -------------------- MAIN --------------------
if __name__ == '__main__':
    app.run(debug=True)
