'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../lib/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Verifica se o usuário é admin
  // useEffect(() => {
  //   if (!loading && user) {
  //     supabase
  //       .from('profiles')
  //       .select('is_admin')
  //       .eq('id', user.id)
  //       .single()
  //       .then(({ data, error }) => {
  //         if (error) {
  //           console.error('Erro ao verificar admin:', error);
  //           return;
  //         }
  //       });
  //   }
  // }, [user, loading, router]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#2a2a38] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1f1f29] rounded-3xl p-6 text-white flex flex-col h-full">
          {/* Header com menu */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-amber-500">Painel Administrativo</h1>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-[#2a2a38] rounded-full transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Menu */}
          {isMenuOpen && (
            <div 
              ref={menuRef}
              className="bg-[#2a2a38] rounded-lg p-4 mb-6"
            >
              <div className="space-y-2">
                <button
                  onClick={() => {
                    router.push('/dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2"
                >
                  Início
                </button>
                <button
                  onClick={() => {
                    router.push('/services/list');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2"
                >
                  Serviços
                </button>
                <button
                  onClick={() => {
                    router.push('/dashboard/barbers');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2"
                >
                  Barbeiros
                </button>
                <button
                  onClick={() => {
                    router.push('/dashboard/schedule');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2"
                >
                  Agendamentos
                </button>
                <button
                  onClick={() => {
                    router.push('/dashboard/reports');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2"
                >
                  Relatórios
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm text-red-500 hover:text-red-600 transition-colors p-2"
                >
                  Sair
                </button>
              </div>
            </div>
          )}

          {/* Content with scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}