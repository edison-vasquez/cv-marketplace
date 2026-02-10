import os
from ultralytics import YOLO
import boto3
from botocore.client import Config

# --- CONFIGURACIÓN ---
# Reemplaza con tus credenciales de Cloudflare R2
R2_ACCOUNT_ID = 'tu_account_id'
R2_ACCESS_KEY = 'tu_access_key'
R2_SECRET_KEY = 'tu_secret_key'
R2_BUCKET_NAME = 'visionhub-models'
R2_PUBLIC_URL = f'https://pub-xxx.r2.dev' # Tu dominio/URL pública de R2

# Modelos a procesar (ejemplo)
MODELS_TO_EXPORT = [
    'yolov8n.pt',
    'yolov11n.pt',
    'yolov8n-seg.pt',
    'yolov8n-pose.pt'
]

def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def export_and_upload():
    s3 = get_r2_client()
    
    for model_name in MODELS_TO_EXPORT:
        print(f"--- Procesando {model_name} ---")
        
        # 1. Cargar y Exportar
        model = YOLO(model_name)
        onnx_path = model.export(format='onnx', imgsz=640, simplify=True)
        
        # 2. Renombrar (opcional)
        final_filename = os.path.basename(onnx_path)
        
        # 3. Subir a R2
        print(f"Subiendo {final_filename} a R2...")
        try:
            s3.upload_file(onnx_path, R2_BUCKET_NAME, final_filename)
            print(f"✅ Éxito: {R2_PUBLIC_URL}/{final_filename}")
            
            # 4. Generar Snippet SQL
            # Aquí podrías imprimir o guardar el SQL necesario para D1
            print(f"SQL Snippet:")
            print(f"UPDATE models SET onnx_model_url = '{R2_PUBLIC_URL}/{final_filename}' WHERE slug = '{model_name.split('.')[0]}';")
            
        except Exception as e:
            print(f"❌ Error subiendo a R2: {e}")

if __name__ == "__main__":
    # Asegúrate de instalar las dependencias:
    # pip install ultralytics boto3
    export_and_upload()
