'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { createClient } from '@supabase/supabase-js';
import { Scissors, PlusCircle, SprayCan, Brush, Bath, Wand2, Pencil, Trash, ArrowLeft } from 'lucide-react';

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

export default function Services() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoading] = useState(true);
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
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      setError('Erro ao carregar serviços');
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
    return null; // Should never happen due to useEffect redirect
  }

  if (loadingServices) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Serviços</h1>
            <p className="text-gray-400">Lista de serviços disponíveis</p>
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
              onClick={fetchServices}
              className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors hover:bg-amber-600"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className={`fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[90vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl md:h-[95vh] lg:h-[95vh]`}>
        <div className="flex flex-col items-center mb-6">
          <div className="flex w-full items-center mb-4">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-500" />
            </button>
            <div className="flex-1 flex justify-center items-center">
              <h1 className="text-3xl font-bold mb-2">Serviços</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-4 h-[calc(100%-120px)]">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Buscar serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3a3a48] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              <div className="flex items-center justify-between bg-[#3a3a48] p-2.5 border-b border-[#4a4a58] sticky top-0 z-10">
                <div className="w-1/6 text-center">
                  <p className="text-sm font-medium">Icone</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium">Nome</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium">Preço</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium">Ações</p>
                </div>
              </div>

              {services.filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase())).map((service, index) => (
                <div 
                  key={service.id}
                  className={`flex items-center justify-between ${
                    index % 2 === 0 ? 'bg-[#2a2a38]' : 'bg-[#3a3a48]'
                  } p-2.5 border-b border-[#4a4a58]`}
                >
                  <div className="w-1/6 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      {service.icon === 'Scissors' && <Scissors className="text-amber-500" size={18} />}
                      {service.icon === 'SprayCan' && <SprayCan className="text-amber-500" size={18} />}
                      {service.icon === 'Brush' && <Brush className="text-amber-500" size={18} />}
                      {service.icon === 'Bath' && <Bath className="text-amber-500" size={18} />}
                      {service.icon === 'Wand2' && <Wand2 className="text-amber-500" size={18} />}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm font-medium">{service.name}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-sm text-amber-500 font-medium">R${service.price}</p>
                  </div>
                  <div className="flex-1 flex justify-center gap-2">
                    <button 
                      onClick={() => router.push(`/services?id=${service.id}`)} 
                      className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
                    >
                      <Pencil className="text-amber-500" size={16} />
                    </button>
                    <button 
                      onClick={() => router.push(`/services/delete?id=${service.id}`)}
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
            onClick={() => router.push('/services')}
            className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors hover:bg-amber-600 mt-6"
          >
            <PlusCircle className="w-4 h-4 mr-2 inline-block" /> Adicionar serviço
          </button>
        </div>
      </div>
    </div>
  );
}
