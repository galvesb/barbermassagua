'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, PlusCircle, Clock, Sun, Moon, Pencil, Trash, User, Phone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barber, setBarber] = useState({
    name: '',
    phone: '',
    cpf: ''
  });

  // Função auxiliar para garantir que o dia seja um número válido
  const getValidDayOfWeek = (day: number) => {
    if (typeof day === 'number' && day >= 0 && day <= 6) {
      return day;
    }
    return 0; // Domingo como padrão
  };

  const [schedules, setSchedules] = useState([
    { day: 0, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 1, start_time: '08:00', end_time: '18:00', is_active: true },
    { day: 2, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 3, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 4, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 5, start_time: '08:00', end_time: '18:00', is_active: false },
    { day: 6, start_time: '08:00', end_time: '18:00', is_active: false }
  ]);

  useEffect(() => {
    const profileId = searchParams?.get('id');
    const isEditing = !!profileId;

    if (isEditing) {
      // Buscar dados do barbeiro
      const fetchBarber = async () => {
        try {
          const { data: barberData, error: barberError } = await supabase
            .from('barbers')
            .select('*, profiles!inner(*)')  // Buscando os dados do perfil relacionado
            .eq('profile_id', profileId)
            .single();

          if (barberError) throw barberError;

          setBarber({
            name: barberData?.profiles?.name || '',
            phone: barberData?.phone || '',
            cpf: barberData?.cpf || ''
          });

          // Buscar horários do barbeiro
          const { data: scheduleData, error: scheduleError } = await supabase
            .from('barber_schedules')
            .select('*')
            .eq('barber_id', barberData?.id);

          if (scheduleError) throw scheduleError;

          // Se não houver horários, usar os padrões
          if (!scheduleData || scheduleData.length === 0) {
            setSchedules([
              { day: 0, start_time: '08:00', end_time: '18:00', is_active: false },
              { day: 1, start_time: '08:00', end_time: '18:00', is_active: false },
              { day: 2, start_time: '08:00', end_time: '18:00', is_active: false },
              { day: 3, start_time: '08:00', end_time: '18:00', is_active: false },
              { day: 4, start_time: '08:00', end_time: '18:00', is_active: false },
              { day: 5, start_time: '08:00', end_time: '18:00', is_active: false },
              { day: 6, start_time: '08:00', end_time: '18:00', is_active: false }
            ]);
            return;
          }

          // Se houver horários, usar os dados do banco
          const schedules = scheduleData.map(s => ({
            day: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            is_active: s.is_active
          }));

          // Garantir que temos todos os dias da semana
          const allDays = [
            { day: 0, start_time: '08:00', end_time: '18:00', is_active: false },
            { day: 1, start_time: '08:00', end_time: '18:00', is_active: true },
            { day: 2, start_time: '08:00', end_time: '18:00', is_active: false },
            { day: 3, start_time: '08:00', end_time: '18:00', is_active: false },
            { day: 4, start_time: '08:00', end_time: '18:00', is_active: false },
            { day: 5, start_time: '08:00', end_time: '18:00', is_active: false },
            { day: 6, start_time: '08:00', end_time: '18:00', is_active: false }
          ];

          // Atualizar os dias que têm horários cadastrados
          schedules.forEach(s => {
            const dayIndex = allDays.findIndex(d => d.day === s.day);
            if (dayIndex !== -1) {
              allDays[dayIndex] = s;
            }
          });

          setSchedules(allDays);

        } catch (error) {
          console.error('Erro ao buscar dados do barbeiro:', error);
          setError('Erro ao carregar dados do barbeiro');
        }
      };

      fetchBarber();
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!barber.name) {
      setError('Por favor, preencha o nome do barbeiro');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileId = searchParams?.get('id');
      const isEditing = !!profileId;

      if (isEditing) {
        try {
          // Primeiro garantir que o barbeiro existe
          const { data: barberData, error: barberError } = await supabase
            .from('barbers')
            .select('*, profiles!inner(*)')  // Buscando os dados do perfil relacionado
            .eq('profile_id', profileId);

          if (barberError) throw new Error('Erro ao buscar barbeiro');
          if (!barberData || barberData.length === 0) throw new Error('Barbeiro não encontrado');

          // Atualizar perfil (nome)
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              name: barber.name
            })
            .eq('id', profileId);

          if (profileError) {
            console.error('Erro ao atualizar perfil:', profileError);
            throw new Error('Erro ao atualizar perfil');
          }


          // Atualizar dados do barbeiro (apenas telefone)
          const { error: barberUpdateError } = await supabase
            .from('barbers')
            .update({
              phone: barber.phone.trim()
            })
            .eq('profile_id', profileId);

          if (barberUpdateError) throw new Error('Erro ao atualizar dados do barbeiro');

          // Atualizar horários
          if (schedules.length > 0) {
            const validSchedules = schedules
              .filter(s => s.is_active && s.start_time && s.end_time)
              .map(schedule => ({
                barber_id: barberData[0].id,
                day_of_week: getValidDayOfWeek(schedule.day),
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                is_active: schedule.is_active
              }));

            console.log('Horários a serem atualizados:', validSchedules);

            // Primeiro deletar todos os horários existentes
            const { error: deleteError } = await supabase
              .from('barber_schedules')
              .delete()
              .eq('barber_id', barberData[0].id);

            if (deleteError) throw new Error('Erro ao deletar horários existentes');

            // Depois inserir os novos horários
            if (validSchedules.length > 0) {
              const { error: insertError } = await supabase
                .from('barber_schedules')
                .insert(validSchedules);

              if (insertError) throw new Error('Erro ao inserir novos horários');
            }
          }

          // Sucesso na atualização
          router.push('/barbers');
        } catch (error) {
          console.error('Erro na atualização:', error);
          setError(error instanceof Error ? error.message : 'Erro ao atualizar barbeiro');
        }
      } else {
        // Criar novo usuário no Supabase Auth
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

        // Criar o perfil manualmente usando o mesmo ID do auth
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

        // Criar o registro no barbers usando o ID do perfil
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

        // Verificar se o barbeiro foi criado com sucesso
        if (!barberData?.id) {
          throw new Error('Erro ao criar registro do barbeiro');
        }

        // Criar os horários usando o ID do barbeiro retornado
        const validSchedules = schedules
          .filter(s => s.is_active && s.start_time && s.end_time)
          .map(schedule => ({
            barber_id: barberData.id,
            day_of_week: getValidDayOfWeek(schedule.day),
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            is_active: schedule.is_active
          }));

        console.log('Horários a serem inseridos:', validSchedules);

        // Inserir os horários
        if (validSchedules.length > 0) {
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
      }

      router.refresh();
      router.push('/barbers/list');
    } catch (error) {
      console.error('Erro ao processar barbeiro:', error);
      setError(isEditing ? 'Erro ao atualizar barbeiro' : 'Erro ao cadastrar barbeiro');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/barbers/list');
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

  const profileId = searchParams?.get('id');
  const isEditing = !!profileId;

  return (
    <div className="min-h-screen bg-[#2a2a38] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-md sm:h-[80vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{searchParams?.get('id') ? 'Editar' : 'Cadastro de'} Barbeiro</h1>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              <ArrowLeft className="text-amber-500" size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col w-full h-[calc(100%-120px)]">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Nome do Barbeiro"
                  value={barber.name}
                  onChange={(e) => setBarber(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setBarber(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#3a3a48] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  placeholder="CPF"
                  value={barber.cpf}
                  onChange={(e) => setBarber(prev => ({ ...prev, cpf: e.target.value }))}
                  className={`w-full bg-[#3a3a48] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${isEditing ? 'bg-gray-500/10 cursor-not-allowed' : ''}`}
                  disabled={isEditing}
                  required
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
                          onChange={(e) => setSchedules(prev => prev.map(s => s.day === schedule.day ? { ...s, is_active: e.target.checked } : s))}
                          className="w-4 h-4 text-amber-500 bg-gray-100 rounded border-gray-300 focus:ring-amber-500"
                        />
                        <span className="text-sm">Ativo</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) => setSchedules(prev => prev.map(s => s.day === schedule.day ? { ...s, start_time: e.target.value } : s))}
                        className="flex-1 bg-[#4a4a58] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder="08:00"
                      />
                      <span className="text-gray-400">às</span>
                      <input
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) => setSchedules(prev => prev.map(s => s.day === schedule.day ? { ...s, end_time: e.target.value } : s))}
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
                  <span>{searchParams?.get('id') ? 'Atualizando...' : 'Cadastrando...'}</span>
                </div>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2 inline-block" /> {searchParams?.get('id') ? 'Salvar Alterações' : 'Cadastrar Barbeiro'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
