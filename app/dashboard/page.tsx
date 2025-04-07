'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const handleAddBarber = () => {
    // TODO: Implement barber registration page
    console.log('Adicionar barbeiro');
  };

  const handleAddService = () => {
    router.push('/services');
  };

  return (
    <div className="space-y-6">

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#2a2a38] p-4 rounded-xl">
          <p className="text-sm text-gray-400">Agendamentos</p>
          <h2 className="text-2xl font-bold text-amber-400">12</h2>
        </div>
        <div className="bg-[#2a2a38] p-4 rounded-xl">
          <p className="text-sm text-gray-400">Faturamento</p>
          <h2 className="text-2xl font-bold text-amber-400">R$ 1.240</h2>
        </div>
        <div className="bg-[#2a2a38] p-4 rounded-xl">
          <p className="text-sm text-gray-400">Contas a pagar</p>
          <h2 className="text-2xl font-bold text-red-500">R$ 1.700</h2>
        </div>
        <div className="bg-[#2a2a38] p-4 rounded-xl">
          <p className="text-sm text-gray-400">Novos clientes</p>
          <h2 className="text-2xl font-bold text-emerald-400">5</h2>
        </div>
      </div>

      {/* Listagem dos barbeiros */}
      <div className="bg-[#2a2a38] p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm">Barbeiros</h3>
          <button 
            onClick={handleAddBarber}
            className="text-amber-500 text-sm font-medium flex items-center hover:text-amber-600"
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Adicionar
          </button>
        </div>

        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Carlos Oliveira</p>
              <p className="text-xs text-gray-400">2 agendamentos</p>
            </div>
            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Ativo</span>
          </li>
          <li className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">João Souza</p>
              <p className="text-xs text-gray-400">1 agendamento</p>
            </div>
            <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">Ausente</span>
          </li>
        </ul>
      </div>

      {/* Serviços */}
      <div className="bg-[#2a2a38] p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm">Serviços</h3>
          <button 
            onClick={handleAddService}
            className="text-amber-500 text-sm font-medium flex items-center hover:text-amber-600"
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Adicionar
          </button>
        </div>

        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Corte Masculino</p>
              <p className="text-xs text-gray-400">R$ 40,00</p>
            </div>
            <span className="text-xs bg-amber-600 text-black px-2 py-0.5 rounded-full">Ativo</span>
          </li>
          <li className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Barba</p>
              <p className="text-xs text-gray-400">R$ 25,00</p>
            </div>
            <span className="text-xs bg-amber-600 text-black px-2 py-0.5 rounded-full">Ativo</span>
          </li>
        </ul>
      </div>

      {/* Agendamentos futuros */}
      <div className="bg-[#2a2a38] p-4 rounded-xl">
        <h3 className="font-bold text-sm mb-3">Próximos horários</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span>10:00</span>
            <span className="text-gray-400">João Pedro - Corte</span>
          </li>
          <li className="flex justify-between">
            <span>11:00</span>
            <span className="text-gray-400">Rafael Lima - Barba</span>
          </li>
          <li className="flex justify-between">
            <span>13:30</span>
            <span className="text-gray-400">Lucas Rocha - Corte + Barba</span>
          </li>
        </ul>
      </div>
    </div>
  );
}