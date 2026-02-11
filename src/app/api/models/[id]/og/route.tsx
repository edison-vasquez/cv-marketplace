import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://visionhub-api.edison-985.workers.dev'

const categoryConfig: Record<string, { icon: string; grad1: string; grad2: string }> = {
    'Industrial': { icon: 'INDUSTRIAL', grad1: '#1a237e', grad2: '#283593' },
    'Security': { icon: 'SECURITY', grad1: '#b71c1c', grad2: '#c62828' },
    'Healthcare': { icon: 'HEALTH', grad1: '#1b5e20', grad2: '#2e7d32' },
    'Agriculture': { icon: 'AGRO', grad1: '#33691e', grad2: '#558b2f' },
    'Energy': { icon: 'ENERGY', grad1: '#e65100', grad2: '#f57c00' },
    'Logistics': { icon: 'LOGISTICS', grad1: '#0d47a1', grad2: '#1565c0' },
    'Construction': { icon: 'BUILD', grad1: '#4a148c', grad2: '#6a1b9a' },
    'Retail': { icon: 'RETAIL', grad1: '#880e4f', grad2: '#ad1457' },
    'Manufacturing': { icon: 'MFG', grad1: '#006064', grad2: '#00838f' },
    'Corporate': { icon: 'CORP', grad1: '#37474f', grad2: '#455a64' },
    'Mining': { icon: 'MINING', grad1: '#3e2723', grad2: '#4e342e' },
    'Infrastructure': { icon: 'INFRA', grad1: '#1a237e', grad2: '#303f9f' },
    'Finance': { icon: 'FINANCE', grad1: '#004d40', grad2: '#00695c' },
    'Forestry': { icon: 'FOREST', grad1: '#1b5e20', grad2: '#388e3c' },
    'Food Industry': { icon: 'FOOD', grad1: '#bf360c', grad2: '#e64a19' },
    'Sustainability': { icon: 'ECO', grad1: '#2e7d32', grad2: '#43a047' },
    'General': { icon: 'CV', grad1: '#1a73e8', grad2: '#4285f4' },
    'Automotive': { icon: 'AUTO', grad1: '#263238', grad2: '#37474f' },
    'Multi-purpose': { icon: 'MULTI', grad1: '#1a73e8', grad2: '#4285f4' },
}

const technicalColors: Record<string, string> = {
    'Detection': '#1a73e8',
    'Classification': '#34a853',
    'Segmentation': '#9334e9',
    'Keypoint': '#ff6d01',
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        let model: any = null
        try {
            const res = await fetch(`${API_URL}/api/models/${id}`, {
                headers: { 'Accept': 'application/json' },
            })
            if (res.ok) model = await res.json()
        } catch (e) {
            // Fallback to slug-based info
        }

        const title = model?.title || id.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
        const category = model?.category || 'General'
        const technical = model?.technical || 'Detection'
        const creator = model?.creator || 'VisionHub'
        const mAPValue = model?.mAP ? `${(model.mAP * 100).toFixed(0)}%` : ''

        const config = categoryConfig[category] || { icon: 'CV', grad1: '#202124', grad2: '#3c4043' }
        const techBg = technicalColors[technical] || '#1a73e8'

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '48px',
                        background: `linear-gradient(135deg, ${config.grad1} 0%, ${config.grad2} 60%, #000000 100%)`,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px 20px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.15)',
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '16px',
                                fontWeight: 700,
                                letterSpacing: '2px',
                            }}
                        >
                            {config.icon}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 20px',
                                borderRadius: '999px',
                                background: techBg,
                                color: '#ffffff',
                                fontSize: '18px',
                                fontWeight: 700,
                            }}
                        >
                            {technical}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div
                            style={{
                                fontSize: title.length > 30 ? '36px' : '48px',
                                fontWeight: 900,
                                color: '#ffffff',
                                lineHeight: 1.1,
                                marginBottom: '12px',
                            }}
                        >
                            {title}
                        </div>
                        <div
                            style={{
                                fontSize: '20px',
                                color: 'rgba(255,255,255,0.65)',
                                fontWeight: 500,
                            }}
                        >
                            {`by ${creator} · ${category}`}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid rgba(255,255,255,0.2)',
                            paddingTop: '20px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: '#1a73e8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontWeight: 900,
                                    fontSize: '18px',
                                    marginRight: '10px',
                                }}
                            >
                                V
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', fontWeight: 600 }}>
                                VisionHub
                            </span>
                        </div>

                        {mAPValue !== '' && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.15)',
                                }}
                            >
                                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginRight: '8px' }}>mAP</span>
                                <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: 900 }}>{mAPValue}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.4)', marginRight: '4px' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', marginRight: '4px' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', marginRight: '4px' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.4)', marginRight: '4px' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', marginRight: '4px' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', marginRight: '4px' }} />
                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.4)' }} />
                        </div>
                    </div>
                </div>
            ),
            {
                width: 800,
                height: 450,
            }
        )
    } catch (e) {
        // Fallback: return a simple colored image
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 900,
                                fontSize: '36px',
                                marginBottom: '16px',
                            }}
                        >
                            V
                        </div>
                        <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700 }}>
                            VisionHub
                        </span>
                    </div>
                </div>
            ),
            { width: 800, height: 450 }
        )
    }
}
