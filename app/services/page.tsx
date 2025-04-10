'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PlusCircle, X, CheckCircle, Scissors, SprayCan, Brush, Bath, Wand2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { supabase } from '../../lib/supabaseClient';

export default function Services() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Scissors');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceData, setServiceData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch service data for editing
  const fetchService = async (id) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setServiceData(data);
      setServiceName(data.name);
      setServicePrice(`R$ ${data.price.toFixed(2).replace('.', ',')}`);
      
      // Convert minutes to HH:MM format
      const hours = Math.floor(data.duration_minutes / 60);
      const minutes = data.duration_minutes % 60;
      setServiceDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      
      setSelectedIcon(data.icon);
    } catch (err) {
      console.error('Error fetching service:', err);
      router.push('/services/list');
    }
  };

  // Check if we're in edit mode
  useEffect(() => {
    const id = searchParams?.get('id');
    if (id) {
      setIsEditing(true);
      fetchService(id);
    }
  }, [searchParams]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      if (!serviceName.trim() || !servicePrice.trim() || !serviceDuration.trim()) {
        throw new Error('Por favor, preencha todos os campos');
      }

      const priceValue = parseFloat(servicePrice.replace('R$', '').replace('.', '').replace(',', '.'));
      if (isNaN(priceValue)) {
        throw new Error('Por favor, insira um valor válido para o preço');
      }

      const durationValue = serviceDuration.replace('min', '').split(':').map(Number);
      if (isNaN(durationValue[0]) || isNaN(durationValue[1]) || durationValue[0] < 0 || durationValue[1] < 0 || durationValue[1] >= 60) {
        throw new Error('Por favor, insira um valor válido para a duração');
      }

      if (isEditing) {
        // Update existing service
        if (!serviceData) throw new Error('Serviço não encontrado');
        
        const { error: updateError } = await supabase
          .from('services')
          .update({
            name: serviceName,
            price: priceValue,
            duration_minutes: durationValue[0] * 60 + durationValue[1],
            icon: selectedIcon
          })
          .eq('id', serviceData.id);

        if (updateError) throw updateError;
      } else {
        // Create new service
        const { data, error: insertError } = await supabase
          .from('services')
          .insert([
            {
              name: serviceName,
              price: priceValue,
              duration_minutes: durationValue[0] * 60 + durationValue[1],
              created_by: user.id,
              icon: selectedIcon
            }
          ])
          .select();

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setServiceName('');
      setServicePrice('');
      setServiceDuration('');
      setSelectedIcon('Scissors');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        router.push('/services/list');
      }, 500);
    } catch (error) {
      setError(error.message || (isEditing ? 'Erro ao atualizar serviço' : 'Erro ao cadastrar serviço'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className={`fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[90vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl md:h-[95vh] lg:h-[95vh]`}>
        <div className="flex flex-col items-center mb-6">
          <div className="flex w-full items-center mb-4">
            <button 
              onClick={() => router.push('/services/list')} 
              className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-500" />
            </button>
            <div className="flex-1 flex justify-center items-center">
              <h1 className="text-3xl font-bold mb-2">{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-4 h-[calc(100%-120px)]">
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg mb-4">
                Serviço {isEditing ? 'atualizado' : 'cadastrado'} com sucesso!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  id="serviceName"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-[#2a2a38] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Digite o nome do serviço"
                  required
                />
              </div>

              <div>
                <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-300 mb-2">
                  Preço
                </label>
                <input
                  type="text"
                  id="servicePrice"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="w-full bg-[#2a2a38] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="R$ 0,00"
                  required
                />
              </div>

              <div>
                <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-300 mb-2">
                  Duração (HH:MM)
                </label>
                <input
                  type="text"
                  id="serviceDuration"
                  value={serviceDuration}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9:]/g, '');
                    if (value.length <= 5 && value.match(/^(\d{0,2}):(\d{0,2})$/)) {
                      setServiceDuration(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                      return;
                    }
                    if (e.key !== ':' && !/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="00:00"
                  className="w-full pl-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="serviceIcon" className="block text-sm font-medium text-gray-300 mb-2">
                  Ícone do Serviço
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('Scissors')}
                    className={`p-3 rounded-lg transition-colors ${selectedIcon === 'Scissors' ? 'bg-amber-500' : 'hover:bg-amber-500/20'}`}
                  >
                    <Scissors size={24} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('SprayCan')}
                    className={`p-3 rounded-lg transition-colors ${selectedIcon === 'SprayCan' ? 'bg-amber-500' : 'hover:bg-amber-500/20'}`}
                  >
                    <SprayCan size={24} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('Brush')}
                    className={`p-3 rounded-lg transition-colors ${selectedIcon === 'Brush' ? 'bg-amber-500' : 'hover:bg-amber-500/20'}`}
                  >
                    <Brush size={24} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('Bath')}
                    className={`p-3 rounded-lg transition-colors ${selectedIcon === 'Bath' ? 'bg-amber-500' : 'hover:bg-amber-500/20'}`}
                  >
                    <Bath size={24} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon('Wand2')}
                    className={`p-3 rounded-lg transition-colors ${selectedIcon === 'Wand2' ? 'bg-amber-500' : 'hover:bg-amber-500/20'}`}
                  >
                    <Wand2 size={24} className="text-white" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-600'
                }`}
              >
                {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : isEditing ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
