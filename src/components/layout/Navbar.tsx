"use client"

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, ChevronDown, LayoutDashboard, Key, Settings, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#dadce0]">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-[#1a73e8] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">V</span>
                        </div>
                        <span className="text-xl font-semibold text-[#202124]">VisionHub</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/" className="px-4 py-2 text-sm font-medium text-[#1a73e8] bg-[#e8f0fe] rounded-full">
                            Marketplace
                        </Link>
                        <Link href="/docs" className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f8f9fa] rounded-full transition-colors">
                            Documentación
                        </Link>
                        <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-[#5f6368] hover:bg-[#f8f9fa] rounded-full transition-colors">
                            Precios
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    {status === 'loading' ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    ) : session ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f8f9fa] transition-colors"
                            >
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="w-8 h-8 rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <span className="hidden md:block text-sm font-medium text-[#202124]">
                                    {session.user?.name || session.user?.email?.split('@')[0]}
                                </span>
                                <ChevronDown className="w-4 h-4 text-[#5f6368]" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#dadce0] overflow-hidden">
                                    <div className="px-4 py-3 border-b border-[#dadce0]">
                                        <p className="text-sm font-medium text-[#202124]">
                                            {session.user?.name || 'Usuario'}
                                        </p>
                                        <p className="text-xs text-[#5f6368]">
                                            {session.user?.email}
                                        </p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#202124] hover:bg-[#f8f9fa] transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-[#5f6368]" />
                                            Mi Dashboard
                                        </Link>
                                        <Link
                                            href="/dashboard/api-keys"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#202124] hover:bg-[#f8f9fa] transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Key className="w-4 h-4 text-[#5f6368]" />
                                            Mis API Keys
                                        </Link>
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#202124] hover:bg-[#f8f9fa] transition-colors border-t border-[#dadce0]"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <Shield className="w-4 h-4 text-[#5f6368]" />
                                            Panel Admin
                                        </Link>
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="flex items-center gap-3 px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-[#dadce0]"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/auth/signin"
                            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors no-underline"
                        >
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
