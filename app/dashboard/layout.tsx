'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Verifica se o usuário é admin
  useEffect(() => {
    if (!loading && user) {
      supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data?.is_admin) {
            router.push('/');
          }
        });
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#2a2a38] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1f1f29] rounded-3xl p-6 text-white flex flex-col h-full">
          {/* Content with scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}