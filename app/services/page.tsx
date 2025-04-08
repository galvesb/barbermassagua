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

      const durationValue = serviceDuration.replace('min', '').split(':').map(Number);
      if (isNaN(durationValue[0]) || isNaN(durationValue[1]) || durationValue[0] < 0 || durationValue[1] < 0 || durationValue[1] >= 60) {
        throw new Error('Por favor, insira um valor válido para a duração');
      }

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
            <input
              type="text"
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Nome do serviço"
              className="w-full pl-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
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
                  
                  if (cleanValue === '') {
                    setServicePrice('');
                    return;
                  }

                  // Remove all non-numeric characters except comma
                  const numbersOnly = cleanValue.replace(/[\D]/g, '');
                  
                  if (numbersOnly.length > 0) {
                    // Format the number from right to left
                    // First, add decimal point for cents
                    let formatted = numbersOnly.slice(0, -2) + ',' + numbersOnly.slice(-2);
                    
                    // Add thousands separator if needed
                    if (formatted.includes(',')) {
                      const parts = formatted.split(',');
                      const integerPart = parts[0];
                      if (integerPart.length > 3) {
                        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                        formatted = formattedInteger + ',' + parts[1];
                      }
                    }
                    
                    setServicePrice(`R$ ${formatted}`);
                  } else {
                    setServicePrice('');
                  }
                }}
                placeholder="R$ 0,00"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="serviceDuration" className="block text-sm font-medium text-gray-300 mb-2">
              Duração do Serviço
            </label>
            <input
              type="tel"
              id="serviceDuration"
              value={serviceDuration}
              onChange={(e) => {
                const value = e.target.value;
                // Remove "min" if present
                const cleanValue = value.replace('min', '').trim();
                
                // Remove all non-numeric characters
                const numbersOnly = cleanValue.replace(/[\D]/g, '');
                
                // Handle backspace or deletion
                if (value.length < serviceDuration.length) {
                  if (numbersOnly.length <= 2) {
                    setServiceDuration('');
                    return;
                  }
                  
                  // Remove last character and reformat
                  const newNumbers = numbersOnly.slice(0, -1);
                  let formatted = newNumbers;
                  if (newNumbers.length > 2) {
                    // Remove leading zeros from hours
                    const hours = newNumbers.slice(0, -2).replace(/^0+/, '');
                    formatted = hours + ':' + newNumbers.slice(-2);
                  } else {
                    formatted = '0:' + newNumbers.padStart(2, '0');
                  }
                  
                  setServiceDuration(formatted);
                  return;
                }

                // For regular input
                if (cleanValue === '') {
                  setServiceDuration('');
                  return;
                }

                if (numbersOnly.length > 0) {
                  // Format the number from right to left
                  let formatted = numbersOnly;
                  if (numbersOnly.length > 2) {
                    // Remove leading zeros from hours
                    const hours = numbersOnly.slice(0, -2).replace(/^0+/, '');
                    formatted = hours + ':' + numbersOnly.slice(-2);
                  } else {
                    formatted = '0:' + numbersOnly.padStart(2, '0');
                  }
                  
                  setServiceDuration(formatted);
                } else {
                  setServiceDuration('');
                }
              }}
              placeholder="0:00"
              className="w-full pl-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
            
            {serviceDuration && (
              <p className="text-xs text-gray-400 mt-1">
                {(() => {
                  const [hours, minutes] = serviceDuration.split(':');
                  const hoursNum = parseInt(hours) || 0;
                  const minutesNum = parseInt(minutes) || 0;
                  
                  if (hoursNum === 0 && minutesNum === 0) return '';
                  
                  if (hoursNum === 0) {
                    return `${minutesNum} minuto${minutesNum !== 1 ? 's' : ''}`;
                  } else if (minutesNum === 0) {
                    return `${hoursNum} hora${hoursNum !== 1 ? 's' : ''}`;
                  }
                  return `${hoursNum} hora${hoursNum !== 1 ? 's' : ''} e ${minutesNum} minuto${minutesNum !== 1 ? 's' : ''}`;
                })()}
              </p>
            )}
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
