from flask import Blueprint, jsonify

pacientes_bp = Blueprint('pacientes', __name__)
mysql = None  # Aquí se inyectará la instancia desde app.py

@pacientes_bp.record_once
def on_load(state):
    global mysql
    mysql = state.app.extensions.get('mysql')

@pacientes_bp.route('/', methods=['GET'])
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
