import { LucideIcon } from 'lucide-react';

export interface WorkflowBlock {
    id: string;
    type: 'model' | 'logic' | 'output';
    name: string;
    icon: string;
    config: Record<string, any>;
}

export const AVAILABLE_BLOCKS = [
    { id: 'detection', name: 'Detección de Objetos', type: 'model' as const, icon: 'Eye', description: 'Detectar objetos en frames' },
    { id: 'classification', name: 'Clasificación', type: 'model' as const, icon: 'LayoutGrid', description: 'Categorizar toda la imagen' },
    { id: 'crop', name: 'Recorte', type: 'logic' as const, icon: 'Crop', description: 'Recortar resultados de detección' },
    { id: 'filter', name: 'Filtro de Confianza', type: 'logic' as const, icon: 'SlidersHorizontal', description: 'Eliminar resultados de baja confianza' },
    { id: 'visualize', name: 'Visualizar Bounding Box', type: 'output' as const, icon: 'Image', description: 'Dibujar recuadros en la imagen' },
    { id: 'webhook', name: 'Webhook', type: 'output' as const, icon: 'Send', description: 'Enviar datos a una URL externa' },
];

export interface WorkflowState {
    nodes: WorkflowBlock[];
    selectedNodeId: string | null;
}
