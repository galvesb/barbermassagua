'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, Clock, Sun, Moon, Pencil, Trash, ArrowLeft, PlusCircle } from 'lucide-react';

// Supabase client configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
    },
  }
);

export default function BarbersList() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loadingBarbers, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check if user is admin
  useEffect(() => {
    if (user) {
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
          } else if (!profile?.is_admin) {
            router.push('/');
          }
        } catch (error) {
          console.error('Erro ao verificar admin:', error);
          router.push('/');
        }
      };

      checkAdmin();
    }
  }, [user, router]);

  useEffect(() => {
    fetchBarbers();
  }, []);

  async function fetchBarbers() {
    try {
      setLoading(true);
      setError(null);

      // First get all barbers
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (barberError) throw barberError;

      // Then get their profiles
      const barberIds = barberData?.map(b => b.profile_id) || [];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', barberIds);

      if (profileError) throw profileError;

      // Combine the data
      const combinedData = barberData?.map(barber => {
        const profile = profileData?.find(p => p.id === barber.profile_id);
        return {
          ...barber,
          ...profile
        };
      }) || [];

      setBarbers(combinedData);
    } catch (err) {
      setError('Erro ao carregar barbeiros');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loadingBarbers) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Barbeiros</h1>
            <p className="text-gray-400">Lista de barbeiros cadastrados</p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Erro</h1>
            <p className="text-gray-400">{error}</p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <button
              onClick={fetchBarbers}
              className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors hover:bg-amber-600"
            >
              <PlusCircle className="w-4 h-4 mr-2 inline-block" />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-sm sm:h-[80vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
        <div className="flex flex-col w-full space-y-4 h-[calc(100%-100px)]">
          <div className="flex items-center justify-between mb-6">
          <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              <ArrowLeft className="text-amber-500" size={20} />
            </button>
            <h1 className="text-3xl font-bold text-center">Barbeiros</h1>

          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar barbeiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3a3a48] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              <div className="flex items-center justify-between bg-[#3a3a48] p-2.5 border-b border-[#4a4a58] sticky top-0 z-10">
                <div className="w-1/4 text-left">
                  <p className="text-sm font-medium">Nome</p>
                </div>
                <div className="w-1/4 text-left">
                  <p className="text-sm font-medium">Telefone</p>
                </div>
                <div className="flex-1 flex justify-center gap-4">
                  <p className="text-sm font-medium">Ações</p>
                </div>
              </div>

              {barbers.filter((barber) => barber.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((barber, index) => (
                <div 
                  key={barber.id}
                  className={`flex items-center justify-between ${
                    index % 2 === 0 ? 'bg-[#2a2a38]' : 'bg-[#3a3a48]'
                  } p-2.5 border-b border-[#4a4a58]`}
                >
                  <div className="w-1/4 text-left">
                    <p className="text-sm font-medium">{barber.name}</p>
                  </div>
                  <div className="w-1/4 text-left">
                    <p className="text-sm">{barber.phone}</p>
                  </div>
                  <div className="flex-1 flex justify-center gap-4">
                    <button 
                      onClick={() => router.push(`/barbers?id=${barber.id}`)} 
                      className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
                    >
                      <Pencil className="text-amber-500" size={16} />
                    </button>
                    <button 
                      onClick={() => router.push(`/barbers/delete?id=${barber.id}`)}
                      className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash className="text-red-500" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => router.push('/barbers/register')}
            className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors hover:bg-amber-600 mt-6"
          >
            <PlusCircle className="w-4 h-4 mr-2 inline-block" />
            Adicionar Barbeiro
          </button>
        </div>
      </div>
    </div>
  );
}
