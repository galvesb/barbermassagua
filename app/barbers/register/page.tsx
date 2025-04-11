'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, PlusCircle, Clock, Sun, Moon, Pencil, Trash, User, Phone } from 'lucide-react';

// Supabase client configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
    },
  }
);

export default function RegisterBarber() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barber, setBarber] = useState<any>({
    name: '',
    phone: '',
    cpf: ''
  });
  const [schedules, setSchedules] = useState<any[]>([
    { day: 0, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 1, start_time: '08:00', end_time: '18:00', is_active: true },
    { day: 2, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 3, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 4, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 5, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 6, start_time: '08:00', end_time: '18:00', is_active: false }
  ]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBarber(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (day: number, field: string, value: string | boolean) => {
    setSchedules(prev => prev.map(schedule =>
      schedule.day === day
        ? { ...schedule, [field]: value }
        : schedule
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barber.name) {
      setError('Por favor, preencha o nome do barbeiro');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Criar um novo usuário no Supabase Auth
      const email = `${barber.cpf}@barbermassagua.com`;
      const password = '123456';

      // Criar um novo cliente do Supabase apenas para este registro
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          auth: {
            persistSession: false, // Não persistir sessão
          },
        }
      );

      // Primeiro criar o usuário
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: barber.name,
            is_barber: true
          }
        }
      });

      if (authError) throw authError;

      // 2. Criar o perfil manualmente usando o mesmo ID do auth
      const { error: profileError } = await tempSupabase
        .from('profiles')
        .insert([{
          id: authData.user.id, // Usando o mesmo ID do auth
          name: barber.name,
          is_barber: true
        }])
        .select('*')
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw profileError;
      }

      // 3. Criar o registro no barbers usando o ID do perfil
      const { data: barberData, error: barberError } = await tempSupabase
        .from('barbers')
        .insert([{
          profile_id: authData.user.id, // Usando o ID do perfil
          phone: barber.phone,
          cpf: barber.cpf
        }])
        .select()
        .single();

      if (barberError) throw barberError;

      // 4. Criar os horários usando o ID do barbeiro retornado
      if (barberData?.id) {
        const validSchedules = schedules
          .filter(s => s.is_active && s.start_time && s.end_time)
          .map(schedule => ({
            barber_id: barberData.id,
            day_of_week: schedule.day,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            is_active: schedule.is_active
          }));

        const { error: scheduleError } = await tempSupabase
          .from('barber_schedules')
          .insert(validSchedules);

        if (scheduleError) throw scheduleError;
      }

      // Limpar formulário após sucesso
      setBarber({ name: '', phone: '', cpf: '' });
      setSchedules([
        { day: 0, start_time: '08:00', end_time: '18:00', is_active: false },
        { day: 1, start_time: '08:00', end_time: '18:00', is_active: true },
        { day: 2, start_time: '08:00', end_time: '18:00', is_active: false },
        { day: 3, start_time: '08:00', end_time: '18:00', is_active: false },
        { day: 4, start_time: '08:00', end_time: '18:00', is_active: false },
        { day: 5, start_time: '08:00', end_time: '18:00', is_active: false },
        { day: 6, start_time: '08:00', end_time: '18:00', is_active: false }
      ]);

      router.refresh();
      router.push('/barbers/list');
    } catch (error) {
      console.error('Erro ao cadastrar barbeiro:', error);
      setError('Erro ao cadastrar barbeiro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
  ];

  return (
    <div className="min-h-screen bg-[#2a2a38] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-md sm:h-[80vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Cadastro de Barbeiro</h1>
            <button
              onClick={() => router.push('/barbers/list')}
              className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              <ArrowLeft className="text-amber-500" size={20} />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col w-full h-[calc(100%-120px)]">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {error && (
                  <div className="mb-4 p-4 bg-red-500/20 rounded-lg text-red-500">
                    {error}
                  </div>
                )}
                
                <div className="mb-6">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome do Barbeiro"
                    value={barber.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#3a3a48] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                  />
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Telefone"
                    value={barber.phone}
                    onChange={handleInputChange}
                    className="w-full bg-[#3a3a48] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={barber.cpf}
                    onChange={handleInputChange}
                    className="w-full bg-[#3a3a48] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <h2 className="text-xl font-bold mb-4">Horários de Atendimento</h2>
                
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <div key={schedule.day} className="bg-[#3a3a48] p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="text-amber-500" size={16} />
                          <span className="font-medium">{daysOfWeek[index]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={schedule.is_active}
                            onChange={(e) => handleScheduleChange(schedule.day, 'is_active', e.target.checked)}
                            className="w-4 h-4 text-amber-500 bg-gray-100 rounded border-gray-300 focus:ring-amber-500"
                          />
                          <span className="text-sm">Ativo</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={schedule.start_time}
                          onChange={(e) => handleScheduleChange(schedule.day, 'start_time', e.target.value)}
                          className="flex-1 bg-[#4a4a58] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          placeholder="08:00"
                        />
                        <span className="text-gray-400">às</span>
                        <input
                          type="time"
                          value={schedule.end_time}
                          onChange={(e) => handleScheduleChange(schedule.day, 'end_time', e.target.value)}
                          className="flex-1 bg-[#4a4a58] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          placeholder="18:00"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 text-black py-3 rounded-lg font-bold text-sm transition-colors hover:bg-amber-600 mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-900 mr-2"></div>
                    <span>Cadastrando...</span>
                  </div>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2 inline-block" /> Cadastrar Barbeiro
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
