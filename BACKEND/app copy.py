""" from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import jwt
import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Configuración de la base de datos
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'simd-tce'
mysql = MySQL(app)

# Clave secreta para firmar el JWT
app.config['SECRET_KEY'] = 'mi_clave_secreta'

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    codigo = data.get('codigo')
    password = data.get('password')

    if not codigo or not password:
        return jsonify({'message': 'Faltan datos'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT password, rol_medico, nombre FROM medicos WHERE codigo = %s", (codigo,))
    result = cur.fetchone()
    cur.close()

    if result:
        stored_password, rol, nombre = result

        if stored_password == password:
            token = jwt.encode({
                'codigo': codigo,
                'rol': rol,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }, app.config['SECRET_KEY'], algorithm='HS256')

            return jsonify({
                'token': token,
                # 'codigo': codigo,
                # 'nombre': nombre,
                'rol': rol
            })
        else:
            return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401
    else:
        return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401

if __name__ == '__main__':
    app.run(debug=True)
 """
 
 
from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import jwt
import datetime

from reportes import reportes_bp  # Importa blueprint
from pacientes import pacientes_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'simd-tce'
app.config['SECRET_KEY'] = 'mi_clave_secreta'

mysql = MySQL(app)

app.extensions = getattr(app, 'extensions', {})
app.extensions['mysql'] = mysql

# app.register_blueprint(reportes_bp, pacientes_pb)  # Registra blueprint
# app.register_blueprint(pacientes_bp)

app.register_blueprint(reportes_bp, url_prefix='/api/reportes')
app.register_blueprint(pacientes_bp, url_prefix='/api/pacientes')


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    codigo = data.get('codigo')
    password = data.get('password')

    if not codigo or not password:
        return jsonify({'message': 'Faltan datos'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT password, rol_medico, nombre FROM medicos WHERE codigo = %s", (codigo,))
    result = cur.fetchone()
    cur.close()

    if result:
        stored_password, rol, nombre = result

        if stored_password == password:
            token = jwt.encode({
                'codigo': codigo,
                'rol': rol,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }, app.config['SECRET_KEY'], algorithm='HS256')

            return jsonify({
                'token': token,
                'rol': rol
            })
        else:
            return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401
    else:
        return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401

if __name__ == '__main__':
    app.run(debug=True)
 