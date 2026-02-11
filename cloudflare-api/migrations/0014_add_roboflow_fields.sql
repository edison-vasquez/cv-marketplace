-- Migración 0014: Agregar campos adicionales para Roboflow
ALTER TABLE models ADD COLUMN roboflow_version INTEGER DEFAULT 1;
ALTER TABLE models ADD COLUMN roboflow_model_type TEXT;
