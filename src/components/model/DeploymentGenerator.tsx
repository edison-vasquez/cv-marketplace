"use client";

import { useState } from 'react';
import { Copy, CheckCircle2, Code, Terminal, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeploymentGeneratorProps {
    modelId: string;
    modelName: string;
}

type CodeTab = 'python' | 'javascript' | 'curl';

export default function DeploymentGenerator({ modelId, modelName }: DeploymentGeneratorProps) {
    const [activeTab, setActiveTab] = useState<CodeTab>('python');
    const [copied, setCopied] = useState(false);

    const codeSnippets: Record<CodeTab, string> = {
        python: `import requests
import base64

# VisionHub API - ${modelName}
API_KEY = "tu_api_key_aqui"
MODEL_ID = "${modelId}"

# Leer imagen y convertir a base64
with open("imagen.jpg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode()

# Ejecutar inferencia
response = requests.post(
    "https://visionhub.com/api/premium/inference",
    headers={
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    },
    json={
        "image": image_base64,
        "modelId": MODEL_ID
    }
)

result = response.json()
print(f"Detectados: {len(result['predictions'])} objetos")

for pred in result['predictions']:
    print(f"  - {pred['class']}: {pred['confidence']*100:.1f}%")`,

        javascript: `// VisionHub API - ${modelName}
const API_KEY = "tu_api_key_aqui";
const MODEL_ID = "${modelId}";

async function runInference(imageFile) {
  // Convertir imagen a base64
  const base64 = await fileToBase64(imageFile);

  const response = await fetch(
    "https://visionhub.com/api/premium/inference",
    {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image: base64,
        modelId: MODEL_ID
      })
    }
  );

  const result = await response.json();
  console.log(\`Detectados: \${result.predictions.length} objetos\`);
  return result;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });
}`,

        curl: `# VisionHub API - ${modelName}
curl -X POST https://visionhub.com/api/premium/inference \\
  -H "X-API-Key: tu_api_key_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image": "BASE64_DE_TU_IMAGEN",
    "modelId": "${modelId}"
  }'`
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(codeSnippets[activeTab]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs: { id: CodeTab; label: string; icon: typeof Code }[] = [
        { id: 'python', label: 'Python', icon: Terminal },
        { id: 'javascript', label: 'JavaScript', icon: FileJson },
        { id: 'curl', label: 'cURL', icon: Code },
    ];

    return (
        <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#dadce0]">
                <h3 className="text-sm font-bold text-[#202124]">Integración API</h3>
                <p className="text-xs text-[#5f6368] mt-1">
                    Usa la API de VisionHub para integrar este modelo en tu aplicación
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#dadce0]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 px-4 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-2",
                            activeTab === tab.id
                                ? "bg-[#e8f0fe] text-[#1a73e8] border-b-2 border-[#1a73e8]"
                                : "text-[#5f6368] hover:bg-[#f8f9fa]"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Code Block */}
            <div className="relative">
                <pre className="p-4 text-xs font-mono text-[#202124] bg-[#f8f9fa] overflow-x-auto max-h-64">
                    <code>{codeSnippets[activeTab]}</code>
                </pre>
                <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-2 bg-white border border-[#dadce0] rounded-lg hover:bg-[#f1f3f4] transition-colors"
                    title="Copiar código"
                >
                    {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4 text-[#5f6368]" />
                    )}
                </button>
            </div>

            {/* API Key Info */}
            <div className="p-4 bg-[#e8f0fe] border-t border-[#dadce0]">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#1a73e8] rounded-lg flex items-center justify-center shrink-0">
                        <Code className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[#202124]">
                            Necesitas una API Key
                        </p>
                        <p className="text-xs text-[#5f6368] mt-0.5">
                            Genera tu API key en{' '}
                            <a href="/dashboard/api-keys" className="text-[#1a73e8] hover:underline">
                                Mi Dashboard → API Keys
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
