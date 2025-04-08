'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Scissors, PlusCircle, SprayCan, Brush, Bath, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        <div className="fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Erro</h1>
            <p className="text-gray-400">{error}</p>
          </div>
          <button
            onClick={fetchServices}
            className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors hover:bg-amber-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Serviços</h1>
          <p className="text-gray-400">Lista de serviços disponíveis</p>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-[#2a2a38] rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  {service.icon === 'Scissors' && <Scissors className="text-amber-500" size={20} />}
                  {service.icon === 'SprayCan' && <SprayCan className="text-amber-500" size={20} />}
                  {service.icon === 'Brush' && <Brush className="text-amber-500" size={20} />}
                  {service.icon === 'Bath' && <Bath className="text-amber-500" size={20} />}
                  {service.icon === 'Wand2' && <Wand2 className="text-amber-500" size={20} />}
                </div>
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-gray-400">{service.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-500 font-medium">R${service.price}</p>
              </div>
            </div>
          ))}
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
