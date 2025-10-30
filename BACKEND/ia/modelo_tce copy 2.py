import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import mysql.connector

# --- Conectar con la base de datos ---
def cargar_datos():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="simd-tce"
    )

    # Consulta tal como la tenías
    df = pd.read_sql("""
        SELECT tipo_lesion, mecanismo_lesion, escala_glasgow_ingreso, 
               escala_glasgow_evolucion, tac_inicial, complicaciones 
        FROM tce_detalles
    """, conn)

    conn.close()
    return df

# --- Entrenamiento del modelo ---
def entrenar_modelo():
    df = cargar_datos()

    # 🔹 Limpiar espacios y normalizar texto
    df['escala_glasgow_evolucion'] = df['escala_glasgow_evolucion'].str.strip()
    df['tipo_lesion'] = df['tipo_lesion'].str.strip()
    df['mecanismo_lesion'] = df['mecanismo_lesion'].fillna('Desconocido')
    df['tac_inicial'] = df['tac_inicial'].fillna('Normal')
    df['complicaciones'] = df['complicaciones'].fillna('Ninguna')

    # 🔹 Mapear escala Glasgow evolución a valores numéricos
    # Si aparece un valor inesperado, se asigna un valor por defecto (12 = moderado)
    mapeo_glasgow = {
        'Leve': 15,
        'Moderado': 12,
        'Grave': 8
    }
    df['escala_glasgow_evolucion'] = df['escala_glasgow_evolucion'].map(lambda x: mapeo_glasgow.get(x, 12))

    # 🔹 Convertir columnas de texto a variables dummy
    df = pd.get_dummies(df, drop_first=False)

    # 🔹 Separar X e y
    X = df.drop("escala_glasgow_evolucion", axis=1)
    y = df["escala_glasgow_evolucion"]

    # 🔹 Dividir en entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 🔹 Entrenar RandomForest
    modelo = RandomForestClassifier(n_estimators=100, random_state=42)
    modelo.fit(X_train, y_train)

    # 🔹 Guardar modelo junto con columnas de entrenamiento
    modelo_info = {"modelo": modelo, "columnas": X_train.columns.tolist()}
    joblib.dump(modelo_info, "ia/modelo_tce.pkl")
    print("✅ Modelo entrenado y guardado con éxito.")

# --- Cargar modelo ya entrenado ---
def cargar_modelo():
    return joblib.load("ia/modelo_tce.pkl")

# --- Usar el modelo para predecir ---
def predecir(datos_paciente, modelo_info=None):
    if modelo_info is None:
        modelo_info = cargar_modelo()

    modelo = modelo_info["modelo"]
    columnas = modelo_info["columnas"]

    # 🔹 Convertir None a 0
    for k in datos_paciente:
        if datos_paciente[k] is None:
            datos_paciente[k] = 0

    df = pd.DataFrame([datos_paciente])
    df = pd.get_dummies(df)

    # 🔹 Asegurar todas las columnas y orden correcto
    for col in columnas:
        if col not in df.columns:
            df[col] = 0
    df = df[columnas]

    prediccion = modelo.predict(df)[0]
    return prediccion

if __name__ == "__main__":
    entrenar_modelo()
