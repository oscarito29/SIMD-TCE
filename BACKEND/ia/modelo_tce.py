import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils import shuffle
import joblib
import mysql.connector
import datetime

# -----------------------------
# 1️⃣ Datos de ejemplo TCE
# -----------------------------
def datos_ejemplo():
    datos = [
        # Casos Leves
        {"tipo_lesion": "Contusión", "mecanismo_lesion": "Caída", "escala_glasgow_ingreso": 14, "escala_glasgow_evolucion": "Leve", "tac_inicial": "Normal", "complicaciones": "Ninguna"},
        {"tipo_lesion": "Contusión", "mecanismo_lesion": "Golpe", "escala_glasgow_ingreso": 13, "escala_glasgow_evolucion": "Leve", "tac_inicial": "Normal", "complicaciones": "Ninguna"},
        
        # Casos Moderados
        {"tipo_lesion": "Hemorragia subdural", "mecanismo_lesion": "Accidente vehicular", "escala_glasgow_ingreso": 10, "escala_glasgow_evolucion": "Moderado", "tac_inicial": "Anormal", "complicaciones": "Convulsiones"},
        {"tipo_lesion": "Contusión profunda", "mecanismo_lesion": "Caída", "escala_glasgow_ingreso": 11, "escala_glasgow_evolucion": "Moderado", "tac_inicial": "Anormal", "complicaciones": "Edema cerebral"},

        # Casos Graves
        {"tipo_lesion": "Fractura craneal", "mecanismo_lesion": "Golpe fuerte", "escala_glasgow_ingreso": 7, "escala_glasgow_evolucion": "Grave", "tac_inicial": "Anormal", "complicaciones": "Hematoma"},
        {"tipo_lesion": "Hemorragia epidural", "mecanismo_lesion": "Accidente vehicular", "escala_glasgow_ingreso": 6, "escala_glasgow_evolucion": "Grave", "tac_inicial": "Anormal", "complicaciones": "Hernia cerebral"},
        {"tipo_lesion": "Hemorragia subaracnoidea", "mecanismo_lesion": "Caída de altura", "escala_glasgow_ingreso": 5, "escala_glasgow_evolucion": "Grave", "tac_inicial": "Anormal", "complicaciones": "Coma"},

        # Casos adicionales
        {"tipo_lesion": "Contusión", "mecanismo_lesion": "Accidente laboral", "escala_glasgow_ingreso": 12, "escala_glasgow_evolucion": "Moderado", "tac_inicial": "Normal", "complicaciones": "Edema leve"},
        {"tipo_lesion": "Contusión", "mecanismo_lesion": "Caída", "escala_glasgow_ingreso": 15, "escala_glasgow_evolucion": "Leve", "tac_inicial": "Normal", "complicaciones": "Ninguna"},
    ]
    df = pd.DataFrame(datos)
    df = shuffle(df, random_state=42)  # Mezclar para entrenamiento
    return df

# -----------------------------
# 2️⃣ Cargar datos reales + ejemplo
# -----------------------------
def cargar_datos():
    try:
        conn = mysql.connector.connect(
            host="3.133.0.79",
            user="ogomez",
            password="oscarito",
            database="simd_tce"
        )
        df_real = pd.read_sql("""
            SELECT tipo_lesion, mecanismo_lesion, escala_glasgow_ingreso, 
                   escala_glasgow_evolucion, tac_inicial, complicaciones
            FROM tce_detalles
        """, conn)
        conn.close()

        if df_real.empty:
            print("⚠️ Base de datos vacía, usando datos de ejemplo.")
            return datos_ejemplo()
        else:
            # Combinar reales + ejemplos
            df = pd.concat([df_real, datos_ejemplo()], ignore_index=True)
            df = shuffle(df, random_state=42)
            return df

    except Exception as e:
        print("❌ Error al cargar datos de la base de datos:", e)
        print("Usando datos de ejemplo.")
        return datos_ejemplo()

# -----------------------------
# 3️⃣ Entrenar modelo
# -----------------------------
def entrenar_modelo():
    df = cargar_datos()
    if df.empty:
        print("❌ No hay datos para entrenar.")
        return None

    # Limpiar y rellenar valores faltantes
    df['escala_glasgow_evolucion'] = df['escala_glasgow_evolucion'].str.strip()
    df['tipo_lesion'] = df['tipo_lesion'].str.strip()
    df['mecanismo_lesion'] = df['mecanismo_lesion'].fillna('Desconocido')
    df['tac_inicial'] = df['tac_inicial'].fillna('Normal')
    df['complicaciones'] = df['complicaciones'].fillna('Ninguna')

    # Mapear Glasgow a valor numérico
    mapeo_glasgow = {'Leve': 15, 'Moderado': 12, 'Grave': 8}
    df['escala_glasgow_evolucion'] = df['escala_glasgow_evolucion'].map(lambda x: mapeo_glasgow.get(x, 12))

    # One-hot encoding de variables categóricas
    df = pd.get_dummies(df, drop_first=False)

    # Separar X e y
    X = df.drop("escala_glasgow_evolucion", axis=1)
    y = df["escala_glasgow_evolucion"]

    # Dividir datos
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Modelo Random Forest
    modelo = RandomForestClassifier(n_estimators=100, random_state=42)
    modelo.fit(X_train, y_train)

    # Guardar modelo + columnas
    modelo_info = {"modelo": modelo, "columnas": X_train.columns.tolist()}
    joblib.dump(modelo_info, "modelo_tce.pkl")
    print("✅ Modelo entrenado y guardado con éxito.")
    return modelo_info

# -----------------------------
# 4️⃣ Cargar modelo
# -----------------------------
def cargar_modelo():
    try:
        modelo_info = joblib.load("ia/modelo_tce.pkl")
        print("✅ Modelo cargado correctamente.")
        return modelo_info
    except Exception as e:
        print("❌ Error al cargar el modelo:", e)
        return None

# -----------------------------
# 5️⃣ Predecir paciente
# -----------------------------
def predecir(datos_paciente, modelo_info=None):
    if modelo_info is None:
        modelo_info = cargar_modelo()
        if modelo_info is None:
            return "❌ No hay modelo disponible para predecir."

    modelo = modelo_info["modelo"]
    columnas = modelo_info["columnas"]

    # Reemplazar None por 0
    for k in datos_paciente:
        if datos_paciente[k] is None:
            datos_paciente[k] = 0

    df = pd.DataFrame([datos_paciente])
    df = pd.get_dummies(df)

    # Alinear columnas
    for col in columnas:
        if col not in df.columns:
            df[col] = 0
    df = df[columnas]

    prediccion = modelo.predict(df)[0]
    return prediccion

# -----------------------------
# 6️⃣ Entrenamiento rápido
# -----------------------------
if __name__ == "__main__":
    entrenar_modelo()
