'use client';

import React, { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // TODO: Implement registration logic
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1f1f29] rounded-3xl p-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-gray-400">Cadastre-se para agendar seus serviços</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Digite seu nome"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme sua senha"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors"
          >
            Criar Conta
          </button>

          <div className="text-center text-gray-400">
            <p>Já tem uma conta? <a href="/login" className="text-amber-500 hover:text-amber-600">Entrar</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}
