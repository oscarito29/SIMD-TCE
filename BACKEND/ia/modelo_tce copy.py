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
        database="simd_tce"
    )
    df = pd.read_sql("SELECT tipo_lesion, mecanismo_lesion, escala_glasgow_ingreso, escala_glasgow_evolucion, tac_inicial, complicaciones FROM tce_detalles", conn)
    conn.close()
    return df

# --- Entrenamiento del modelo ---
def entrenar_modelo():
    df = cargar_datos()

    # Convertir texto a números (simplificado)
    df = pd.get_dummies(df, drop_first=True)

    X = df.drop("escala_glasgow_evolucion", axis=1)
    y = df["escala_glasgow_evolucion"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    modelo = RandomForestClassifier(n_estimators=100, random_state=42)
    modelo.fit(X_train, y_train)

    # Guardar el modelo entrenado
    joblib.dump(modelo, "ia/modelo_tce.pkl")
    print("✅ Modelo entrenado y guardado con éxito.")

# --- Usar el modelo para predecir ---
def predecir(datos_paciente):
    modelo = joblib.load("ia/modelo_tce.pkl")

    df = pd.DataFrame([datos_paciente])
    df = pd.get_dummies(df)
    # Asegurar columnas compatibles con el modelo
    modelo_cols = modelo.feature_names_in_
    for col in modelo_cols:
        if col not in df.columns:
            df[col] = 0

    prediccion = modelo.predict(df[modelo_cols])[0]
    return prediccion

if __name__ == "__main__":
    entrenar_modelo()
