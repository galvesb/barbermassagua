'use client';

import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Implement login logic
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1f1f29] rounded-3xl p-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo</h1>
          <p className="text-gray-400">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2a2a38] border border-gray-600 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-500"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors"
          >
            Entrar
          </button>

          <div className="text-center text-gray-400">
            <p>Não tem uma conta? <a href="/register" className="text-amber-500 hover:text-amber-600">Cadastre-se</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}
