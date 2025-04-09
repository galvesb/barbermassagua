'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Trash2, X, Scissors, SprayCan, Brush, Bath, Wand2 } from 'lucide-react';
import { useAuth } from '../../../lib/useAuth';
import { supabase } from '../../../lib/supabaseClient';

export default function DeleteService() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Should never happen due to useEffect redirect
  }

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        const id = searchParams.get('id');
        if (!id) return;

        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setServiceData(data);
      } catch (error) {
        console.error('Error fetching service:', error);
        setError('Erro ao carregar serviço');
      }
    };

    fetchService();
  }, [searchParams]);

  const handleCancel = () => {
    router.push('/services/list');
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');

      if (!serviceData) throw new Error('Serviço não encontrado');

      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceData.id);

      if (deleteError) throw deleteError;

      setSuccess(true);
      setTimeout(() => router.push('/services/list'), 1000);
    } catch (err) {
      setError(err.message || 'Erro ao excluir serviço');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="flex flex-col items-center mb-6">
            <div className="flex w-full items-center mb-4">
              <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="text-green-500 w-12 h-12" />
                    </div>
                  </div>
                  <p className="text-sm text-green-400 font-semibold">
                    Serviço excluído com sucesso!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="flex flex-col items-center mb-6">
            <div className="flex w-full items-center mb-4">
              <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col items-center">
                  <div className="bg-red-600/10 p-3 rounded-lg mb-6 text-red-400 text-center">
                    {error}
                  </div>
                  <button 
                    onClick={handleCancel} 
                    className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors hover:bg-amber-600 mt-6"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="text-white">Carregando serviço...</div>
      </div>
    );
  }

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
                Cancelar
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
