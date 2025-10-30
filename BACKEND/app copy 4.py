from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
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
from werkzeug.security import check_password_hash
import jwt
import datetime

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Faltan datos'}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT m.id, m.nombre, m.username, m.password, r.nombre AS rol, m.estado
            FROM medicos m
            INNER JOIN roles r ON m.rol_id = r.id
            WHERE m.username = %s
        """, (username,))
        result = cur.fetchone()

        if result:
            id_medico, nombre, username_db, stored_password, rol, estado = result

            # 🔹 Validar si el usuario está activo
            if estado != 'Activo':
                return jsonify({'message': 'Usuario inactivo. Contacte con el administrador.'}), 403

            # 🔐 Verificar la contraseña encriptada
            if check_password_hash(stored_password, password):
                token = jwt.encode({
                    'id': id_medico,
                    'username': username_db,
                    'rol': rol,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
                }, app.config['SECRET_KEY'], algorithm='HS256')

                cur.execute("""
                    INSERT INTO bitacora (usuario, accion, descripcion)
                    VALUES (%s, %s, %s)
                """, (username_db, 'login', f'Inicio de Sesión'))
                mysql.connection.commit()
                cur.close()

                return jsonify({
                    'token': token,
                    'nombre': nombre,
                    'rol': rol,
                    'username': username,
                }), 200
            else:
                return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401
        else:
            return jsonify({'message': 'Contraseña o Usuario incorrecto'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500

#--------------------------LOGOUT-----------------------------

@app.route('/api/bitacora/registrar', methods=['POST'])
def registrar_bitacora():
    data = request.get_json()
    username = data.get('username')
    accion = data.get('accion')
    descripcion = "Cierre de Sesión"
    
    

    if not username or not accion:
        return jsonify({"message": "Faltan datos"}), 400

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO bitacora (usuario, accion, descripcion) VALUES (%s, %s, %s)",
        (username, accion, descripcion)
    )
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Acción registrada en bitácora"})

    
    #------------------------- FN PARA OBTENER EL USERNAME-----------------------
def obtener_usuario_desde_token():
    auth_header = request.headers.get('Authorization')  # Espera "Bearer <token>"
    if not auth_header:
        return None, None  # siempre devuelve dos valores
    try:
        token = auth_header.split(" ")[1]
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        # Devuelve exactamente dos valores
        return data.get('id'), data.get('username')
    except Exception as e:
        print("Error token:", e)
        return None, None



# -------------------- ROLES --------------------

@app.route('/api/roles', methods=['GET', 'POST'])
def roles():
    if request.method == "GET":
        cur = mysql.connection.cursor()
        cur.execute("SELECT id, nombre, descripcion FROM roles ORDER BY id ASC")
        roles = cur.fetchall()
        cur.close()
        return jsonify([{'id': r[0], 'nombre': r[1], 'descripcion': r[2]} for r in roles])
    
    elif request.method == "POST":
        data = request.get_json()
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')

        if not nombre:
            return jsonify({"error": "El campo 'nombre' es obligatorio"}), 400

        # Obtener username desde token
        username_logeado = None
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
                decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                username_logeado = decoded.get('username')
            except Exception as e:
                print("Error al decodificar token:", e)

        try:
            cur = mysql.connection.cursor()
            # Insertar rol
            cur.execute("INSERT INTO roles (nombre, descripcion) VALUES (%s, %s)", (nombre, descripcion))
            mysql.connection.commit()

            # Insertar en bitácora solo si tenemos username
            if username_logeado:
                cur.execute("""
                    INSERT INTO bitacora (usuario, accion, descripcion)
                    VALUES (%s, %s, %s)
                """, (username_logeado, 'crear_rol', f'Usuario {username_logeado} creó el rol "{nombre}"'))
                mysql.connection.commit()
            else:
                print("No se pudo registrar en bitácora: username no disponible")

            cur.close()
            return jsonify({"message": "Rol creado con éxito"}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500





# -------------------- MÉDICOS --------------------

@app.route('/api/medicos', methods=['GET'])
@app.route('/api/medicos/', methods=['GET'])
def get_medicos():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT m.id, m.nombre, m.username, m.especialidad, r.nombre AS rol_nombre, r.id as rol_id,
                   m.dni, m.correo, m.telefono, m.direccion, m.colegiado, m.horario, m.estado
            FROM medicos m
            INNER JOIN roles r ON m.rol_id = r.id
            ORDER BY m.id ASC
        """)
        medicos = cur.fetchall()
        cur.close()

        # Crear una lista con los resultados formateados
        medicos_list = []
        for m in medicos:
            medicos_list.append({
                'id': m[0],
                'nombre': m[1],
                'username': m[2],
                'especialidad': m[3],
                'rol_nombre': m[4],
                'rol_id': m[5],
                'dni': m[6],
                'correo': m[7],
                'telefono': m[8],
                'direccion': m[9],
                'colegiado': m[10],
                'horario': m[11],
                'estado': m[12]
                
            })

        return jsonify(medicos_list)

    except Exception as e:
        # Captura cualquier error que ocurra durante la consulta o procesamiento
        return jsonify({'error': str(e)}), 500




@app.route('/api/medicos/registrar', methods=['POST'])
def registrar_medico():
    data = request.get_json()

    # Campos del médico
    nombre = data.get('nombre')
    username = data.get('username')
    password = data.get('password')
    especialidad = data.get('especialidad')
    rol_id = data.get('rol_id')
    dni = data.get('dni')
    correo = data.get('correo')
    telefono = data.get('telefono')
    direccion = data.get('direccion')
    colegiado = data.get('colegiado')
    horario = data.get('horario')
    estado = data.get('estado')

    # Validar obligatorios
    if not nombre or not username or not password or not especialidad or not rol_id:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    try:
        # 🔐 Encriptar contraseña
        hashed_password = generate_password_hash(password)
        cur = mysql.connection.cursor()

        # Insertar médico
        cur.execute("""
            INSERT INTO medicos 
            (nombre, username, password, especialidad, rol_id, dni, correo, telefono, direccion, colegiado, horario, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (nombre, username, hashed_password, especialidad, rol_id, dni, correo, telefono, direccion, colegiado, horario, estado))
        mysql.connection.commit()

        # 🔑 Obtener usuario que registra desde el token
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # 'Bearer <token>'
                decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                usuario = decoded.get('id')
                username_logeado = decoded.get('username')

                # Insertar en bitácora
                cur.execute("""
                    INSERT INTO bitacora (usuario, accion, descripcion)
                    VALUES (%s, %s, %s)
                """, (username_logeado, 'registrar_medico', f'Usuario {username_logeado} registró al médico "{username}"'))
                mysql.connection.commit()
            except Exception as e:
                print("Error insertando bitácora:", e)

        cur.close()
        return jsonify({'message': 'Médico registrado correctamente'}), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 500


    
    
    


@app.route('/api/medicos/<int:id>', methods=['GET'])
def get_medico(id):
    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT m.id, m.nombre, m.username, m.password, m.especialidad, m.dni, m.correo, 
               m.telefono, m.direccion, m.colegiado, m.horario, m.estado, r.id AS rol_id, r.nombre AS rol_nombre
        FROM medicos m
        INNER JOIN roles r ON m.rol_id = r.id
        WHERE m.id = %s
    """, (id,))
    medico = cur.fetchone()
    cur.close()

    if medico:
        medico_dict = {
            'id': medico[0],
            'nombre': medico[1],
            'username': medico[2],
            'password': medico[3],  # Devolver la contraseña tal cual
            'especialidad': medico[4],
            'dni': medico[5],
            'correo': medico[6],
            'telefono': medico[7],
            'direccion': medico[8],
            'colegiado': medico[9],
            'horario': medico[10],
            'estado': medico[11],
            'rol_id': medico[12],
            'rol_nombre': medico[13]
        }
        return jsonify(medico_dict)
    else:
        return jsonify({'message': 'Médico no encontrado'}), 404
    
    
@app.route('/api/medicos/estado/<int:id>', methods=['PUT'])
def cambiar_estado_medico(id):
    data = request.get_json()
    nuevo_estado = data.get('estado')  # 'Activo' o 'Inactivo'

    # Obtener username de quien realiza la acción desde el token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'No autorizado'}), 401

    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        usuario_logueado = decoded.get('username')  # Usuario que realiza el cambio
    except Exception as e:
        return jsonify({'message': 'Token inválido'}), 401

    try:
        cur = mysql.connection.cursor()
        # Obtener username del médico que se va a cambiar
        cur.execute("SELECT username FROM medicos WHERE id=%s", (id,))
        result = cur.fetchone()
        if not result:
            return jsonify({'message': 'Médico no encontrado'}), 404
        username_modificado = result[0]

        # Actualizar estado
        cur.execute("UPDATE medicos SET estado=%s WHERE id=%s", (nuevo_estado, id))

        # Guardar en bitácora
        cur.execute("""
            INSERT INTO bitacora (usuario, accion, descripcion)
            VALUES (%s, %s, %s)
        """, (
            usuario_logueado,
            'cambio_estado',
            f'Usuario {usuario_logueado} cambió el estado de {username_modificado} a {nuevo_estado}'
        ))

        mysql.connection.commit()
        cur.close()

        return jsonify({'message': f'Usuario {username_modificado} ahora está {nuevo_estado}'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500



    

@app.route('/api/medicos/editar/<int:id>', methods=['PUT'])
def editar_medico(id):
    data = request.get_json()
    print(f"Datos recibidos para editar el médico con ID {id}: {data}")

    nombre = data.get('nombre')
    username = data.get('username')
    password = data.get('password')  # puede venir vacío si no se quiere cambiar
    especialidad = data.get('especialidad')
    rol_id = data.get('rol_id')
    dni = data.get('dni')
    correo = data.get('correo')
    telefono = data.get('telefono')
    direccion = data.get('direccion')
    colegiado = data.get('colegiado')
    horario = data.get('horario')
    estado = data.get('estado')

    if not nombre or not username or not especialidad or not rol_id:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    try:
        cur = mysql.connection.cursor()

        # Obtener usuario que hace la edición desde token
        auth_header = request.headers.get('Authorization')
        username_logeado = None
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # 'Bearer <token>'
                decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
                username_logeado = decoded.get('username')
            except Exception as e_token:
                print("Error al decodificar token:", e_token)

        # Actualizar médico
        if password:
            hashed_password = generate_password_hash(password)
            cur.execute("""
                UPDATE medicos
                SET nombre = %s, username = %s, password = %s, especialidad = %s, rol_id = %s,
                    dni = %s, correo = %s, telefono = %s, direccion = %s, colegiado = %s,
                    horario = %s, estado = %s
                WHERE id = %s
            """, (nombre, username, hashed_password, especialidad, rol_id, dni, correo, telefono,
                  direccion, colegiado, horario, estado, id))
        else:
            cur.execute("""
                UPDATE medicos
                SET nombre = %s, username = %s, especialidad = %s, rol_id = %s,
                    dni = %s, correo = %s, telefono = %s, direccion = %s, colegiado = %s,
                    horario = %s, estado = %s
                WHERE id = %s
            """, (nombre, username, especialidad, rol_id, dni, correo, telefono,
                  direccion, colegiado, horario, estado, id))

        mysql.connection.commit()

        # Insertar en bitácora
        if username_logeado:
            try:
                cur.execute("""
                    INSERT INTO bitacora (usuario, accion, descripcion)
                    VALUES (%s, %s, %s)
                """, (username_logeado, 'editar_medico', f'Usuario {username_logeado} editó al médico "{username}"'))
                mysql.connection.commit()
            except Exception as e_bitacora:
                print("Error al registrar en bitácora:", e_bitacora)

        cur.close()
        return jsonify({'message': 'Médico actualizado correctamente'}), 200

    except Exception as e:
        print(f"Error al actualizar el médico: {str(e)}")
        return jsonify({'message': str(e)}), 500


# ------------------------------- PACIENTES --------------------------------------------
@app.route('/api/pacientes', methods=['GET'])
def get_pacientes():
    cur = mysql.connection.cursor()
    query = """
        SELECT dni, nombre, edad, lugar_procedencia, diagnostico_inicial, sexo, 
               fecha_ingreso, fecha_salida, estado_actual 
        FROM pacientes
    """
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()

    pacientes = []
    for row in rows:
        paciente = {
            "dni": row[0],
            "nombre": row[1],
            "edad": row[2],
            "lugar_procedencia": row[3],
            "diagnostico_inicial": row[4],
            "sexo": row[5],
            "fecha_ingreso": row[6].strftime('%Y-%m-%d') if row[6] else None,
            "fecha_salida": row[7].strftime('%Y-%m-%d') if row[7] else None,
            "estado_actual": row[8]
        }
        pacientes.append(paciente)



    return jsonify(pacientes)


# ESTE PARA CREAR UN NUEVO REGISTRO DE PACIENTE
@app.route('/api/pacientes', methods=['POST'])
def registrar_paciente():
    user_data = obtener_usuario_desde_token()
    if not user_data:
        return jsonify({'message': 'Token inválido o expirado'}), 401

    data = request.get_json()
    try:
        dni = data.get('dni')
        nombre = data.get('nombre')
        edad = data.get('edad')
        sexo = data.get('sexo')
        lugar_procedencia = data.get('lugar_procedencia')
        diagnostico_inicial = data.get('diagnostico_inicial')
        estado_actual = data.get('estado_actual')
        medico_responsable = user_data['id']
        username_logeado = user_data['username']
        fecha_ingreso = datetime.datetime.utcnow()

        cur = mysql.connection.cursor()

        # 🔹 Verificar si el DNI ya existe
        cur.execute("SELECT id FROM pacientes WHERE dni = %s", (dni,))
        existing = cur.fetchone()
        if existing:
            return jsonify({'message': f'El DNI {dni} ya está registrado'}), 400

        # Insertar paciente
        cur.execute("""
            INSERT INTO pacientes (dni, nombre, edad, sexo, lugar_procedencia, diagnostico_inicial, estado_actual, medico_responsable, fecha_ingreso)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (dni, nombre, edad, sexo, lugar_procedencia, diagnostico_inicial, estado_actual, medico_responsable, fecha_ingreso))

        # Guardar detalles TCE si aplica
        if data.get("es_tce"):
            cur.execute("""
                INSERT INTO tce_detalles (dni, tipo_lesion, mecanismo_lesion, escala_glasgow_ingreso, escala_glasgow_evolucion, tac_inicial, complicaciones)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                dni,
                data.get("tipo_lesion"),
                data.get("mecanismo_lesion"),
                data.get("escala_glasgow_ingreso"),
                data.get("escala_glasgow_evolucion"),
                data.get("tac_inicial"),
                data.get("complicaciones")
            ))

        # Registrar en bitácora
        cur.execute("""
            INSERT INTO bitacora (usuario, accion, descripcion)
            VALUES (%s, %s, %s)
        """, (username_logeado, 'registrar_paciente', f'Usuario {username_logeado} registró al paciente "{nombre}" con DNI {dni}'))

        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Paciente registrado correctamente ✅'}), 201

    except Exception as e:
        print("Error:", e)
        return jsonify({'message': 'Error al registrar paciente'}), 500


    
    
    
    
    #----------------------- CITAS PARA PACIENTES ------------------------------------------------------
@app.route('/api/usuarios/medicos', methods=['GET'])
def obtener_medicos():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT id, nombre, especialidad 
            FROM medicos 
            WHERE rol_id = 2
            ORDER BY nombre ASC
        """)
        medicos = cur.fetchall()
        cur.close()

        medicos_list = [
            {'id': m[0], 'nombre': m[1], 'especialidad': m[2]} 
            for m in medicos
        ]
        return jsonify(medicos_list), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

@app.route('/api/citas/crear', methods=['POST'])
def crear_cita():
    user_data = obtener_usuario_desde_token()
    if not user_data:
        return jsonify({'message': 'Token inválido o expirado'}), 401
    
    data = request.get_json()
    
    # Obtener los campos necesarios
    paciente_id = data.get('paciente_id')
    medico_id = data.get('medico_id')
    especialidad = data.get('especialidad')
    fecha = data.get('fecha')
    hora = data.get('hora')
    motivo = data.get('motivo')
    estado = data.get('estado', 'Confirmada')  # opcional
    notas = data.get('notas', None)            # opcional
    username_logeado = user_data['username']   # Para la bitácora

    # Validar campos obligatorios
    if not paciente_id or not medico_id or not especialidad or not fecha or not hora:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    try:
        cur = mysql.connection.cursor()

        # Validar que el paciente exista y obtener su nombre
        cur.execute("SELECT nombre FROM pacientes WHERE dni=%s", (paciente_id,))
        paciente = cur.fetchone()
        if not paciente:
            return jsonify({'message': 'El paciente no existe'}), 400

        nombre = paciente[0]  # Aquí sí tenemos el nombre del paciente

        # Validar que el médico exista
        cur.execute("SELECT id FROM medicos WHERE id=%s", (medico_id,))
        medico = cur.fetchone()
        if not medico:
            return jsonify({'message': 'El médico no existe'}), 400

        # Validar disponibilidad del médico
        hora_mysql = hora
        if len(hora_mysql) == 5:  # HH:MM
            hora_mysql += ":00"

        cur.execute("""
            SELECT * FROM citas 
            WHERE medico_id=%s AND fecha=%s AND hora=%s
        """, (medico_id, fecha.strip(), hora_mysql.strip()))

        cita_existente = cur.fetchone()
        if cita_existente:
            return jsonify({
                'message': f'El médico ya tiene una cita el {fecha} a las {hora}'
            }), 400

        # Insertar la cita
        cur.execute("""
            INSERT INTO citas 
            (paciente_id, medico_id, especialidad, fecha, hora, motivo, estado, notas)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (paciente_id, medico_id, especialidad, fecha, hora, motivo, estado, notas))
        
        # Insertar en bitácora
        cur.execute("""
            INSERT INTO bitacora (usuario, accion, descripcion)
            VALUES (%s, %s, %s)
        """, (username_logeado, 'creacion_cita', f'Usuario {username_logeado} creó la cita al paciente "{nombre}" con DNI {paciente_id}'))
        
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Cita creada correctamente'}), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@app.route('/api/citas/<int:cita_id>/atender', methods=['PUT'])
def atender_cita(cita_id):
    data = request.get_json()
    usuario = data.get("usuario")

    cur = mysql.connection.cursor()
    # Cambiar estado a 'Atendida'
    cur.execute("UPDATE citas SET estado='Atendida' WHERE id=%s", (cita_id,))
    mysql.connection.commit()

    # Insertar en bitácora
    cur.execute(
        "INSERT INTO bitacora(usuario, accion, fecha) VALUES(%s, %s, NOW())",
        (usuario, f"Cambiado estado de cita ID {cita_id} a Atendida")
    )
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Cita actualizada"})



#--------------------------------------REPORTES DE PACIENTES-------------------------


@app.route('/api/pacientes/reporte/<dni>', methods=['GET'])
def reporte_paciente(dni):
    cur = mysql.connection.cursor()
    
    # Traer datos del paciente
    cur.execute("""
        SELECT dni, nombre, edad, sexo, lugar_procedencia, diagnostico_inicial, estado_actual,
               fecha_ingreso, fecha_salida
        FROM pacientes
        WHERE dni = %s
    """, (dni,))
    row = cur.fetchone()
    if not row:
        return jsonify({'message': 'Paciente no encontrado'}), 404

    paciente = {
        "dni": row[0],
        "nombre": row[1],
        "edad": row[2],
        "sexo": row[3],
        "lugar_procedencia": row[4],
        "diagnostico_inicial": row[5],
        "estado_actual": row[6],
        "fecha_ingreso": row[7].strftime('%Y-%m-%d') if row[7] else None,
        "fecha_salida": row[8].strftime('%Y-%m-%d') if row[8] else None
    }

    # Traer historial clínico del paciente
    cur.execute("""
    SELECT fecha, notas, medicacion
    FROM historial_clinico
    WHERE paciente_dni = %s
    ORDER BY fecha ASC
""", (dni,))
    historial_rows = cur.fetchall()

    historial = []
    for h in historial_rows:
        historial.append({
            "fecha": h[0].strftime('%Y-%m-%d %H:%M') if h[0] else None,
            "observacion": h[1] or "",
            "antecedentes": h[2] or ""
        })
    paciente["historial"] = historial

    cur.close()
    return jsonify(paciente)





# ---------------------- PERFIL MEDICO------------------------

def obtener_usuario_desde_token():
    """Extrae y valida el token JWT del header Authorization"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        token = auth_header.split(" ")[1]  # Formato: Bearer <token>
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        # Asegurarse de retornar los datos necesarios
        return {
            "id": decoded.get("id"),
            "username": decoded.get("username")
        }
    except Exception as e:
        print("Error al validar token:", e)
        return None



# === Obtener perfil del médico logueado ===
@app.route('/api/perfil', methods=['GET'])
def obtener_perfil():
    user_data = obtener_usuario_desde_token()
    if not user_data:
        return jsonify({'message': 'Token inválido o expirado'}), 401

    user_id = user_data['id']

    cur = mysql.connection.cursor()
    cur.execute("""
        SELECT id, nombre, username, correo, telefono, direccion, especialidad, horario 
        FROM medicos 
        WHERE id = %s
    """, (user_id,))
    result = cur.fetchone()
    cur.close()

    if not result:
        return jsonify({'message': 'Médico no encontrado'}), 404

    perfil = {
        'id': result[0],
        'nombre': result[1],
        'username': result[2],
        'correo': result[3],
        'telefono': result[4],
        'direccion': result[5],
        'especialidad': result[6],
        'horario': result[7],
    }

    return jsonify(perfil), 200


# === Modificar perfil del médico logueado ===
@app.route('/api/perfil', methods=['PUT'])
def actualizar_perfil():
    user_data = obtener_usuario_desde_token()
    if not user_data:
        return jsonify({'message': 'Token inválido o expirado'}), 401

    user_id = user_data['id']
    username_logeado = user_data['username']  # Para la bitácora
    data = request.get_json()

    nombre = data.get('nombre')
    correo = data.get('correo')
    telefono = data.get('telefono')
    direccion = data.get('direccion')
    especialidad = data.get('especialidad')
    horario = data.get('horario')

    if not nombre or not correo:
        return jsonify({'message': 'Nombre y correo son obligatorios'}), 400

    try:
        cur = mysql.connection.cursor()
        
        # Actualizar perfil
        cur.execute("""
            UPDATE medicos
            SET nombre = %s, correo = %s, telefono = %s, direccion = %s, 
                especialidad = %s, horario = %s
            WHERE id = %s
        """, (nombre, correo, telefono, direccion, especialidad, horario, user_id))

        # Insertar acción en bitácora
        cur.execute("""
            INSERT INTO bitacora (usuario, accion, descripcion)
            VALUES (%s, %s, %s)
        """, (username_logeado, 'actualizar_perfil', f'Usuario {username_logeado} actualizó su perfil'))

        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Perfil actualizado correctamente'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

    
    
    # ---------------------- CAMBIO DE PASSWORD------------------------------
@app.route('/api/cambiar-password', methods=['PUT'])
def cambiar_password():
    user_data = obtener_usuario_desde_token()
    if not user_data:
        return jsonify({'message': 'Token inválido o expirado'}), 401

    user_id = user_data['id']
    username_logeado = user_data['username']  # Para la bitácora
    data = request.get_json()

    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    if not old_password or not new_password:
        return jsonify({'message': 'Contraseñas requeridas'}), 400

    cur = mysql.connection.cursor()
    cur.execute("SELECT password FROM medicos WHERE id = %s", (user_id,))
    result = cur.fetchone()

    if not result:
        return jsonify({'message': 'Usuario no encontrado'}), 404

    hashed_password = result[0]

    # Validar contraseña actual
    if not check_password_hash(hashed_password, old_password):
        return jsonify({'message': 'La contraseña actual es incorrecta'}), 400

    # Actualizar con nueva contraseña encriptada
    new_hashed = generate_password_hash(new_password)

    try:
        cur.execute("""
            UPDATE medicos
            SET password = %s
            WHERE id = %s
        """, (new_hashed, user_id))

        # 🔹 Insertar acción en bitácora
        cur.execute("""
            INSERT INTO bitacora (usuario, accion, descripcion)
            VALUES (%s, %s, %s)
        """, (username_logeado, 'cambiar_password', f'Usuario {username_logeado} cambió su contraseña'))

        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Contraseña actualizada correctamente ✅'}), 200
    except Exception as e:
        print("Error al cambiar contraseña:", e)
        return jsonify({'message': 'Error en el servidor'}), 500




# -----------------------------HISTORIAL CLINICO-------------------------------
@app.route('/api/pacientes/<string:dni>/historial', methods=['GET'])
def obtener_historial(dni):
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM historial_clinico WHERE paciente_dni = %s ORDER BY fecha DESC", (dni,))
    result = cur.fetchall()
    cur.close()

    historial = []
    for row in result:
        historial.append({
            "id": row[0],
            "paciente_dni": row[1],
            "fecha": row[2],
            "antecedentes": row[3],
            "consultas": row[4],
            "medicacion": row[5],
            "laboratorio": row[6],
            "notas": row[7],
            "escala_glasgow": row[8],
            "evolucion_neuro": row[9],
            "tratamientos": row[10],
            "complicaciones": row[11],
        })
    return jsonify(historial), 200


# Registrar nueva entrada en historial por DNI
# Registrar nueva entrada en historial por DNI con bitácora
@app.route('/api/pacientes/<string:dni>/historial', methods=['POST'])
def registrar_historial(dni):
    user_data = obtener_usuario_desde_token()
    if not user_data:
        return jsonify({'message': 'Token inválido o expirado'}), 401

    username_logeado = user_data['username']  # Para la bitácora
    data = request.get_json()

    try:
        cur = mysql.connection.cursor()
        
        # Insertar en historial clínico
        cur.execute("""
            INSERT INTO historial_clinico (
                paciente_dni, antecedentes, consultas, medicacion, laboratorio, notas,
                escala_glasgow, evolucion_neuro, tratamientos, complicaciones
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            dni,
            data.get('antecedentes'),
            data.get('consultas'),
            data.get('medicacion'),
            data.get('laboratorio'),
            data.get('notas'),
            data.get('escala_glasgow'),
            data.get('evolucion_neuro'),
            data.get('tratamientos'),
            data.get('complicaciones')
        ))

        # 🔹 Insertar acción en bitácora
        cur.execute("""
            INSERT INTO bitacora (usuario, accion, descripcion)
            VALUES (%s, %s, %s)
        """, (
            username_logeado,
            'registrar_historial',
            f'Usuario {username_logeado} registró historial clínico para el paciente con DNI {dni}'
        ))

        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Historial registrado exitosamente ✅'}), 201

    except Exception as e:
        print("Error registrando historial:", e)
        return jsonify({'message': 'Error en el servidor'}), 500


#-------------------------------MONITOREO------------------------------------

""" @app.route('/api/monitoreo')
def monitoreo():
    try:
        # Simula datos
        datos = [
            {"paciente": "Juan Perez", "estado": "Estable", "ultima_actualizacion": "2025-10-02 08:00"},
            {"paciente": "Maria Lopez", "estado": "Critico", "ultima_actualizacion": "2025-10-02 09:30"}
        ]
        return jsonify(datos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500 """
        
@app.route('/api/monitoreo', methods=['GET'])
def monitoreo():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token faltante'}), 401

    try:
        # El token viene con "Bearer <token>", por eso separamos
        token = token.split()[1]
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        medico_id = data['id']  # id del médico logueado
    except Exception as e:
        return jsonify({'message': 'Token inválido', 'error': str(e)}), 401

    cur = mysql.connection.cursor()
    
    # 🔹 Pacientes asignados a este médico (tienen al menos una cita con él)
    cur.execute("""
        SELECT DISTINCT p.dni, p.nombre, p.edad, p.sexo, p.estado_actual, p.fecha_ingreso
        FROM pacientes p
        JOIN citas c ON c.paciente_id = p.dni
        WHERE c.medico_id = %s
        ORDER BY p.fecha_ingreso DESC
    """, (medico_id,))
    pacientes_rows = cur.fetchall()
    
    pacientes = []
    for row in pacientes_rows:
        pacientes.append({
            "dni": row[0],
            "nombre": row[1],
            "edad": row[2],
            "sexo": row[3],
            "estado_actual": row[4],
            "fecha_ingreso": row[5].strftime('%Y-%m-%d %H:%M')
        })
    
    # 🔹 Citas próximas para este médico
    cur.execute("""
   SELECT c.fecha, DATE_FORMAT(c.hora, '%%H:%%i') AS hora, p.nombre AS paciente, m.nombre AS medico, c.especialidad
   FROM citas c
   JOIN pacientes p ON c.paciente_id = p.dni
   JOIN medicos m ON c.medico_id = m.id
   WHERE c.estado = 'Confirmada' AND c.fecha >= CURDATE() AND c.medico_id = %s
   ORDER BY c.fecha, c.hora
""", (medico_id,))


    citas_rows = cur.fetchall()
    
    citas = []
    for row in citas_rows:
        citas.append({
            "fecha": row[0].strftime('%Y-%m-%d'),
            "hora": row[1],  # ya viene formateado como string desde MySQL
            "paciente": row[2],
            "medico": row[3],
            "especialidad": row[4]
        })

    
    cur.close()
    
    return jsonify({
        "pfrom ia.modelo_tce import predecir
import pandas as pd
import numpy as np

@app.route('/api/monitoreo', methods=['GET'])
def monitoreo():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token faltante'}), 401

    try:
        token = token.split()[1]  # "Bearer <token>"
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        medico_id = data['id']
    except Exception as e:
        return jsonify({'message': 'Token inválido', 'error': str(e)}), 401

    cur = mysql.connection.cursor()
    
    # 🔹 Pacientes asignados a este médico
    cur.execute("""
        SELECT DISTINCT p.dni, p.nombre, p.edad, p.sexo, p.estado_actual, p.fecha_ingreso
        FROM pacientes p
        JOIN citas c ON c.paciente_id = p.dni
        WHERE c.medico_id = %s
        ORDER BY p.fecha_ingreso DESC
    """, (medico_id,))
    pacientes_rows = cur.fetchall()
    
    pacientes = []
    for row in pacientes_rows:
        dni = row[0]

        # 🔹 Obtener detalles para la predicción de IA
        cur.execute("""
            SELECT tipo_lesion, mecanismo_lesion, escala_glasgow_ingreso, tac_inicial, complicaciones
            FROM tce_detalles
            WHERE dni = %s
            ORDER BY fecha_registro DESC
            LIMIT 1
        """, (dni,))
        detalle = cur.fetchone()

        if detalle:
            detalle_df = pd.DataFrame([{
                "tipo_lesion": detalle[0],
                "mecanismo_lesion": detalle[1],
                "escala_glasgow_ingreso": detalle[2],
                "tac_inicial": detalle[3],
                "complicaciones": detalle[4]
            }])
            prediccion = predecir(detalle_df)
            # Convertir a tipos nativos de Python para JSON
            if isinstance(prediccion, (np.integer, np.int64)):
                prediccion = int(prediccion)
            elif isinstance(prediccion, (np.floating, np.float64)):
                prediccion = float(prediccion)
            elif isinstance(prediccion, np.ndarray):
                prediccion = prediccion.tolist()
        else:
            prediccion = None

        pacientes.append({
            "dni": dni,
            "nombre": row[1],
            "edad": row[2],
            "sexo": row[3],
            "estado_actual": row[4],
            "fecha_ingreso": row[5].strftime('%Y-%m-%d %H:%M'),
            "prediccion_ia": prediccion
        })
    
    # 🔹 Citas próximas
    cur.execute("""
        SELECT c.fecha, DATE_FORMAT(c.hora, '%%H:%%i') AS hora, p.nombre AS paciente, m.nombre AS medico, c.especialidad
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.dni
        JOIN medicos m ON c.medico_id = m.id
        WHERE c.estado = 'Confirmada' AND c.fecha >= CURDATE() AND c.medico_id = %s
        ORDER BY c.fecha, c.hora
    """, (medico_id,))
    citas_rows = cur.fetchall()
    
    citas = []
    for row in citas_rows:
        citas.append({
            "fecha": row[0].strftime('%Y-%m-%d'),
            "hora": row[1],
            "paciente": row[2],
            "medico": row[3],
            "especialidad": row[4]
        })

    cur.close()
    
    return jsonify({
        "pacientes": pacientes,
        "citas": citas
    })
acientes": pacientes,
        "citas": citas
    })
    
    

    # 🔹 Alertas de IA (pueden ser sugerencias o alertas sobre pacientes críticos)
    """ from ia_module import generar_alertas
    alertas = generar_alertas()  # devuelve lista de alertas

    cur.close()
    return jsonify({
        "pacientes": pacientes,
        "citas": citas,
        "alertas": alertas
    }) """



#-------------------------DASHBOARD-------------------------------

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token faltante'}), 401

    try:
        token = token.split()[1]
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        medico_id = data['id']
    except Exception as e:
        return jsonify({'message': 'Token inválido', 'error': str(e)}), 401

    cur = mysql.connection.cursor()

    # Total pacientes ingresados en los últimos 3 días
    cur.execute("""
        SELECT COUNT(*) 
        FROM pacientes 
        WHERE fecha_ingreso >= CURDATE() - INTERVAL 3 DAY
    """)
    total_pacientes = cur.fetchone()[0]

    # Pacientes críticos ingresados en los últimos 3 días
    cur.execute("""
        SELECT COUNT(*) 
        FROM pacientes 
        WHERE estado_actual = 'Crítico' 
          AND fecha_ingreso >= CURDATE() - INTERVAL 3 DAY
    """)
    pacientes_criticos = cur.fetchone()[0]

    # Próximas citas del médico
    cur.execute("""
        SELECT c.fecha, c.hora, p.nombre AS paciente, c.especialidad
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.dni
        WHERE c.medico_id = %s AND c.estado = 'Confirmada' AND c.fecha >= CURDATE()
        ORDER BY c.fecha, c.hora
        LIMIT 5
    """, (medico_id,))
    citas_rows = cur.fetchall()
    proximas_citas = [{"fecha": r[0].strftime("%Y-%m-%d"), "hora": str(r[1]), "paciente": r[2], "especialidad": r[3]} for r in citas_rows]

    # Últimos pacientes ingresados en los últimos 3 días
    cur.execute("""
        SELECT dni, nombre, edad, sexo, estado_actual, fecha_ingreso
        FROM pacientes
        WHERE fecha_ingreso >= CURDATE() - INTERVAL 3 DAY
        ORDER BY fecha_ingreso DESC
        LIMIT 10
    """)
    ultimos_pacientes = []
    for row in cur.fetchall():
        ultimos_pacientes.append({
            "dni": row[0],
            "nombre": row[1],
            "edad": row[2],
            "sexo": row[3],
            "estado_actual": row[4],
            "fecha_ingreso": row[5].strftime("%Y-%m-%d %H:%M")
        })

    cur.close()

    return jsonify({
        "total_pacientes": total_pacientes,
        "pacientes_criticos": pacientes_criticos,
        "proximas_citas": proximas_citas,
        "ultimos_pacientes": ultimos_pacientes,
        "alertas": []  # vacía por ahora
    })



# -------------------- MAIN --------------------
if __name__ == '__main__':
    app.run(debug=True)
