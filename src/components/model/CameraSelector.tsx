"use client";

import { useState } from 'react';
import { SwitchCamera, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraSelectorProps {
    cameras: MediaDeviceInfo[];
    currentFacingMode: 'user' | 'environment';
    onSwitch: (facingMode: 'user' | 'environment', deviceId?: string) => void;
}

export default function CameraSelector({ cameras, currentFacingMode, onSwitch }: CameraSelectorProps) {
    const [showDropdown, setShowDropdown] = useState(false);

    // If only 1 camera, don't show selector
    if (cameras.length <= 1) return null;

    // Simple toggle for 2 cameras (typical mobile)
    if (cameras.length === 2) {
        return (
            <button
                onClick={() => onSwitch(currentFacingMode === 'user' ? 'environment' : 'user')}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#202124]/70 hover:bg-[#202124]/90 text-white rounded-full text-xs font-medium backdrop-blur-sm transition-all"
                title={currentFacingMode === 'user' ? 'Cambiar a cámara trasera' : 'Cambiar a cámara frontal'}
            >
                <SwitchCamera className="w-4 h-4" />
                <span className="hidden sm:inline">
                    {currentFacingMode === 'user' ? 'Frontal' : 'Trasera'}
                </span>
            </button>
        );
    }

    // Dropdown for 3+ cameras (rare, desktop with multiple cameras)
    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#202124]/70 hover:bg-[#202124]/90 text-white rounded-full text-xs font-medium backdrop-blur-sm transition-all"
            >
                <SwitchCamera className="w-4 h-4" />
                <span className="hidden sm:inline">Cámara</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", showDropdown && "rotate-180")} />
            </button>

            {showDropdown && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-[#dadce0] overflow-hidden z-20">
                    {cameras.map((camera, index) => (
                        <button
                            key={camera.deviceId}
                            onClick={() => {
                                onSwitch(currentFacingMode, camera.deviceId);
                                setShowDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-[#202124] hover:bg-[#f8f9fa] transition-colors truncate"
                        >
                            {camera.label || `Cámara ${index + 1}`}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
