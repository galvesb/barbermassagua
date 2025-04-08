'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Scissors, PlusCircle, SprayCan, Brush, Bath, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Services() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Serviços</h1>
          <p className="text-gray-400">Lista de serviços disponíveis</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1">
            <div className="flex items-center justify-between bg-[#3a3a48] p-2.5 border-b border-[#4a4a58]">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium">Icone</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium">Nome</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-sm font-medium">Preço</p>
              </div>
              <div className="w-1/4 text-center">
                <p className="text-sm font-medium">Duração</p>
              </div>
            </div>

            {services.map((service, index) => (
              <div 
                key={service.id}
                className={`flex items-center justify-between ${
                  index % 2 === 0 ? 'bg-[#2a2a38]' : 'bg-[#3a3a48]'
                } p-2.5 border-b border-[#4a4a58]`}
              >
                <div className="flex-1 flex items-center justify-center">
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
                <div className="w-1/4 text-center">
                  <p className="text-sm font-medium">{service.duration} min</p>
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
  );
}
