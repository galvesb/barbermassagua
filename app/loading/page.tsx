'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/useAuth';

export default function LoadingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkAdmin = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          router.push('/');
          return;
        }

        router.push(profile?.is_admin ? '/dashboard' : '/');
      } catch (error) {
        console.error('Erro:', error);
        router.push('/');
      }
    };

    checkAdmin();
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="bg-[#1f1f29] p-8 rounded-3xl text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    </div>
  );
}
