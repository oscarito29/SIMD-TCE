""" # app.py (Flask)
from flask import Flask, render_template, make_response
import pdfkit

app = Flask(__name__)

@app.route('/reportes/pdf')
def reporte_pdf():
    # Renderiza la plantilla HTML con datos
    rendered = render_template('reporte.html', datos=[{"nombre": "Paciente A", "edad": 30}, {"nombre": "Paciente B", "edad": 25}])

    # Convierte HTML a PDF
    pdf = pdfkit.from_string(rendered, False)

    # Devuelve PDF como respuesta
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=reporte.pdf'
    return response

if __name__ == '__main__':
    app.run(debug=True)
 """
 
""" """   """ """
""" from flask import Blueprint, render_template, make_response
import pdfkit
""" """  """ """
reportes_bp = Blueprint('reportes_bp', __name__, url_prefix='/api/reportes')
""" """  """ """
@reportes_bp.route('/pdf')
def reporte_pdf():
    rendered = render_template('reporte.html', datos=[
        {"nombre": "Paciente A", "edad": 30},
        {"nombre": "Paciente B", "edad": 25}
    ])
    pdf = pdfkit.from_string(rendered, False)
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=reporte.pdf'
    return response """
    
import pdfkit
from flask import Blueprint, render_template, make_response

reportes_bp = Blueprint('reportes_bp', __name__, url_prefix='/api/reportes')

@reportes_bp.route('/pdf', methods=['GET'])
def reporte_pdf():
    rendered = render_template('reporte.html', datos=[
        {"nombre": "Paciente A", "edad": 30},
        {"nombre": "Paciente B", "edad": 25}
    ])

    # ✅ Ruta al ejecutable
    path_wkhtmltopdf = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
    config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)

    # ✅ Generar el PDF
    pdf = pdfkit.from_string(rendered, False, configuration=config)

    # ✅ Enviar como respuesta
    response = make_response(pdf)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'inline; filename=reporte.pdf'
    return response
    
