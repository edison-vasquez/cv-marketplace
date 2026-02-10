# -*- coding: utf-8 -*-
"""
Script para exportar modelos YOLOv8 a formato ONNX
y preparar modelos para VisionHub
"""

import os
import sys
import json
from pathlib import Path

# Fix encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Directorio de salida
MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

def export_yolov8_models():
    """Exporta modelos YOLOv8 a ONNX"""
    from ultralytics import YOLO

    models_to_export = [
        {
            "id": "yolov8n-coco",
            "pt_name": "yolov8n.pt",
            "name": "YOLOv8n COCO Detection",
            "industry": "General",
            "category": "Multi-purpose",
            "technical": "Detection",
            "description": "Modelo de deteccion de objetos YOLOv8 nano entrenado en COCO (80 clases). Ultra rapido y ligero, ideal para dispositivos edge.",
            "mAP": 0.373,
            "inferenceMs": 25,
            "labels": ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]
        },
        {
            "id": "yolov8n-seg",
            "pt_name": "yolov8n-seg.pt",
            "name": "YOLOv8n Instance Segmentation",
            "industry": "Industrial",
            "category": "Industrial",
            "technical": "Segmentation",
            "description": "Segmentacion de instancias con mascaras pixel-perfect. Ideal para control de calidad, manufactura y analisis industrial.",
            "mAP": 0.307,
            "inferenceMs": 35,
            "labels": ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"]
        },
        {
            "id": "yolov8n-pose",
            "pt_name": "yolov8n-pose.pt",
            "name": "YOLOv8n Pose Estimation",
            "industry": "Healthcare",
            "category": "Healthcare",
            "technical": "Detection",
            "description": "Estimacion de pose humana con 17 keypoints corporales. Aplicaciones en fisioterapia, deportes, ergonomia y rehabilitacion.",
            "mAP": 0.501,
            "inferenceMs": 28,
            "labels": ["person"]
        }
    ]

    results = []

    for model_info in models_to_export:
        print(f"\n{'='*50}")
        print(f"[MODEL] Exportando: {model_info['name']}")
        print(f"   Archivo: {model_info['pt_name']}")

        try:
            # Cargar modelo
            model = YOLO(model_info['pt_name'])

            # Exportar a ONNX
            onnx_path = model.export(
                format='onnx',
                imgsz=640,
                simplify=False,
                opset=12
            )

            # Mover al directorio de modelos
            onnx_filename = f"{model_info['id']}.onnx"
            dest_path = MODELS_DIR / onnx_filename

            if os.path.exists(onnx_path):
                import shutil
                shutil.move(onnx_path, dest_path)
                size = dest_path.stat().st_size
                print(f"   [OK] Exportado: {onnx_filename} ({size/1024/1024:.2f} MB)")

                results.append({
                    **model_info,
                    "filename": onnx_filename,
                    "sizeBytes": size,
                    "inputShape": {"width": 640, "height": 640, "channels": 3},
                    "status": "success"
                })
            else:
                print(f"   [ERROR] No se encontro el archivo exportado")
                results.append({**model_info, "status": "failed"})

        except Exception as e:
            print(f"   [ERROR] {str(e)}")
            results.append({**model_info, "status": "failed", "error": str(e)})

    return results


def main():
    print("VisionHub ONNX Model Exporter")
    print("=" * 50)

    all_results = []

    # Exportar modelos YOLOv8
    print("\nExportando modelos YOLOv8...")
    yolo_results = export_yolov8_models()
    all_results.extend(yolo_results)

    # Agregar modelos ya descargados (face detection, mobilenet)
    existing_models = [
        {
            "id": "face-detection-yunet",
            "name": "YuNet Face Detector",
            "industry": "Security",
            "category": "Security",
            "technical": "Detection",
            "description": "Detector de rostros ultra-rapido y ligero. Ideal para control de acceso, seguridad, retail analytics y sistemas de vigilancia.",
            "mAP": 0.89,
            "inferenceMs": 8,
            "labels": ["face"],
            "inputShape": {"width": 320, "height": 320, "channels": 3},
            "filename": "face-detection-yunet.onnx"
        },
        {
            "id": "mobilenetv2-imagenet",
            "name": "MobileNetV2 Classifier",
            "industry": "General",
            "category": "Multi-purpose",
            "technical": "Classification",
            "description": "Clasificador de imagenes eficiente entrenado en ImageNet (1000 clases). Optimizado para dispositivos moviles y edge computing.",
            "mAP": 0.718,
            "inferenceMs": 12,
            "labels": [],
            "inputShape": {"width": 224, "height": 224, "channels": 3},
            "filename": "mobilenetv2-imagenet.onnx"
        }
    ]

    for model in existing_models:
        path = MODELS_DIR / model["filename"]
        if path.exists():
            model["sizeBytes"] = path.stat().st_size
            model["status"] = "exists"
            all_results.append(model)
            print(f"\n[OK] Modelo existente: {model['name']} ({model['sizeBytes']/1024/1024:.2f} MB)")

    # Guardar metadata completa
    metadata_path = MODELS_DIR / "metadata.json"
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*50}")
    print("RESUMEN")
    print(f"{'='*50}")

    success = len([r for r in all_results if r.get('status') in ['success', 'exists']])
    failed = len([r for r in all_results if r.get('status') == 'failed'])
    total_size = sum(r.get('sizeBytes', 0) for r in all_results)

    print(f"[OK] Exitosos: {success}")
    print(f"[X] Fallidos: {failed}")
    print(f"[SIZE] Tamano total: {total_size/1024/1024:.2f} MB")
    print(f"\nModelos en: {MODELS_DIR}")
    print(f"Metadata en: {metadata_path}")


if __name__ == "__main__":
    main()
