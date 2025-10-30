from flask import Blueprint, jsonify
from flask_mysqldb import MySQL

# Se asume que mysql ya está configurado en app.py y registrado como extensión

roles_bp = Blueprint('roles_bp', __name__, url_prefix='/api/roles')

@roles_bp.route('/', methods=['GET'])

def get_roles():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT id, nombre FROM roles")
        roles = cur.fetchall()
        cur.close()

        # Convertir los resultados a una lista de diccionarios
        roles_list = [{'id': r[0], 'nombre': r[1]} for r in roles]
        
        # Retornar la lista de roles en formato JSON
        return jsonify(roles_list)
    
    except Exception as e:
        return jsonify({'message': 'Error al obtener roles', 'error': str(e)}), 500
 
"""
 @app.route('/api/roles', methods=['GET'])
def get_roles():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, nombre FROM roles")
    roles = cur.fetchall()
    cur.close()

    roles_list = [{'id': r[0], 'nombre': r[1]} for r in roles]
    return jsonify(roles_list)
"""