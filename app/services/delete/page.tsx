'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Trash2, X, CheckCircle, ArrowLeft, Scissors, SprayCan, Brush, Bath, Wand2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DeleteService() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [serviceData, setServiceData] = useState(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      fetchService(id);
    }
  }, [searchParams]);

  const fetchService = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setServiceData(data);
    } catch (error) {
      setError('Erro ao carregar serviço');
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');

      if (!serviceData) throw new Error('Serviço não encontrado');

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceData.id);

      if (error) throw error;

      setSuccess(true);
      
      // Redirect back to list after success
      setTimeout(() => {
        router.push('/services/list');
      }, 1000);
    } catch (error) {
      setError(error.message || 'Erro ao excluir serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/services/list');
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className={`fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl`}>
        <div className="flex flex-col items-center mb-6">
          <div className="flex w-full items-center mb-4">
            <div className="flex-1 flex justify-center items-center">
              <div className="flex flex-col items-center">
                {success ? (
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="text-green-500 w-12 h-12" />
                      </div>
                    </div>
                    <p className="text-sm text-green-400 font-semibold">
                      Serviço excluído com sucesso!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                      <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/30 flex items-center justify-center">
                          <Trash2 className="text-red-500 w-10 h-10" />
                        </div>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Excluir Serviço</h1>
                    <div className="text-gray-400 text-center max-w-md">
                      <p className="mb-2">
                        <span className="font-medium">Atenção!</span> Esta ação não pode ser desfeita.
                      </p>
                      <p className="text-sm">
                        Tem certeza que deseja excluir este serviço?
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/10 p-3 rounded-lg mb-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {!success && serviceData && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-[#3a3a48] rounded-2xl p-6 w-full">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                  {serviceData.icon === 'Scissors' && <Scissors className="text-amber-500" size={24} />}
                  {serviceData.icon === 'SprayCan' && <SprayCan className="text-amber-500" size={24} />}
                  {serviceData.icon === 'Brush' && <Brush className="text-amber-500" size={24} />}
                  {serviceData.icon === 'Bath' && <Bath className="text-amber-500" size={24} />}
                  {serviceData.icon === 'Wand2' && <Wand2 className="text-amber-500" size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-1">{serviceData.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>R${serviceData.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3.5 px-5 bg-gray-600/50 rounded-2xl hover:bg-gray-600 transition-colors text-white font-medium text-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="w-4 h-4 text-gray-400" />
                  <span>Cancelar</span>
                </div>
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 px-5 bg-red-500/50 rounded-2xl hover:bg-red-500 transition-colors text-white font-medium text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Excluindo...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Excluir</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
