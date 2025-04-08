'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PlusCircle, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { supabase } from '../../lib/supabaseClient';

export default function Services() {
  const router = useRouter();
  const { user } = useAuth();
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
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

      const priceValue = parseFloat(servicePrice.replace('R$', '').replace(',', '.'));
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
            created_by: user.id
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg text-amber-500 font-semibold">Novo Serviço</p>
            <h1 className="text-xl font-bold">Cadastro de Serviço</h1>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1.5 bg-transparent hover:bg-red-500 hover:text-white rounded-full transition-colors duration-200"
          >
            <X className="text-red-500" size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-600/10 p-3 rounded-lg mb-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-600/10 p-3 rounded-lg mb-6 text-green-400 text-center">
            Serviço cadastrado com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => setServicePrice(e.target.value)}
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
