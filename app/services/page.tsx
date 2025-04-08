'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlusCircle, X, CheckCircle, Scissors, SprayCan, Brush, Bath, Wand2 } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { supabase } from '../../lib/supabaseClient';
import InputMask from 'react-input-mask';

export default function Services() {
  const router = useRouter();
  const { user } = useAuth();
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Scissors');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const durationValue = Math.floor(parseInt(serviceDuration));
      if (isNaN(durationValue) || durationValue <= 0) {
        throw new Error('Por favor, insira um valor válido para a duração');
      }

      const { data, error: insertError } = await supabase
        .from('services')
        .insert([
          {
            name: serviceName,
            price: priceValue,
            duration_minutes: durationValue,
            created_by: user.id,
            icon: selectedIcon
          }
        ])
        .select();

      if (insertError) throw insertError;

      setSuccess(true);
      setServiceName('');
      setServicePrice('');
      setServiceDuration('');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Erro ao cadastrar serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className={`fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl`}>
        <div className="flex flex-col items-center mb-6">
          {success ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="text-green-500 w-8 h-8 mb-2" />
              <p className="text-sm text-green-400 font-semibold">Serviço cadastrado com sucesso!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-sm text-amber-500 font-semibold">Novo Serviço</p>
              <h1 className="text-base font-bold">Cadastro de Serviço</h1>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-600/10 p-3 rounded-lg mb-6 text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 flex-1">
          <div>
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Serviço
            </label>
            <div className="relative">
              <PlusCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Digite o nome do serviço"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-300 mb-2">
              Preço
            </label>
            <div className="relative">
              <input
                type="text"
                id="servicePrice"
                value={servicePrice}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove R$ if present
                  const cleanValue = value.replace('R$', '').trim();
                  // Allow numbers, dots, and commas
                  let formatted = cleanValue.replace(/[^\d.,]/g, '');
                  
                  // Split by comma and limit decimal places to 2
                  const parts = formatted.split(',');
                  if (parts.length > 1) {
                    // Keep only first 2 decimal places
                    parts[1] = parts[1].slice(0, 2);
                    formatted = parts.join(',');
                  }
                  
                  setServicePrice(`R$ ${formatted}`);
                }}
                placeholder="R$ 0,00"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-300 mb-2">
              Duração do Serviço (em minutos)
            </label>
            <div className="relative">
              <input
                type="number"
                id="serviceDuration"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                placeholder="Ex: 30 para 30 minutos, 60 para 1 hora"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
                required
                min="1"
                step="1"
              />
            </div>
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
            {loading ? 'Cadastrando...' : 'Cadastrar Serviço'}
          </button>
        </form>
      </div>
    </div>
  );
}
