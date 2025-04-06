'use client';

import React from 'react';
import Image from 'next/image';

export default function Confirmation() {
  const handleNewAppointment = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center text-white">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Agendamento Concluído!</h1>
        <p className="text-gray-300 mb-8">Seu horário foi agendado com sucesso.</p>
        <button
          onClick={handleNewAppointment}
          className="bg-amber-500 text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-amber-600 transition-colors"
        >
          Novo Agendamento
        </button>
      </div>
    </div>
  );
}
