'use client';

import React, { useState, useRef, useEffect } from "react";
import { Menu, Scissors, SprayCan, CheckCircle, PlusCircle, Brush, ChevronLeft, ChevronRight, Wand2, Bath, Smile, ChevronUp, ChevronDown, X, Power } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/useAuth';
import { supabase } from '../lib/supabaseClient';

// Função auxiliar para obter ícone baseado no nome do ícone
const getIconForService = (iconName: string) => {
  switch (iconName) {
    case 'Scissors':
      return <Scissors />;
    case 'SprayCan':
      return <SprayCan />;
    case 'Brush':
      return <Brush />;
    case 'Bath':
      return <Bath />;
    case 'Wand2':
      return <Wand2 />;
    default:
      return <Scissors />;
  }
};

function MainContent() {
  // Definindo constantes para os tabs
  const TAB_SERVICES = 'SERVICES';
  const TAB_BARBERS = 'BARBERS';
  const TAB_CALENDAR = 'CALENDAR';
  const TAB_TIMES = 'TIMES';
  const TAB_SUMMARY = 'SUMMARY';

  // Estados da aplicação
  const [activeTab, setActiveTab] = useState(TAB_SERVICES);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [barberSchedules, setBarberSchedules] = useState<{[key: number]: {is_active: boolean, start_time: string, end_time: string}}>({});
  const [isBarberSchedulesLoaded, setIsBarberSchedulesLoaded] = useState(false);

  // Função para buscar serviços do banco de dados
  const fetchServices = async () => {
    try {
      const { data: servicesData, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedServices = servicesData.map(service => ({
        name: service.name,
        price: `R$${service.price.toFixed(2).replace('.', ',')}`,
        value: service.price,
        icon: getIconForService(service.icon),
        selected: false,
        duration: service.duration
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para buscar barbeiros do banco de dados
  const fetchBarbers = async () => {
    try {
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('*, profiles!inner(*)')
        .order('created_at', { ascending: false });

      if (barberError) throw barberError;

      // Transformar os dados para o formato esperado
      const formattedBarbers = barberData?.map(barber => ({
        id: barber.id,
        name: barber.profiles.name,
        role: barber.profiles.role || "Barbeiro",
        icon: <Menu />,
        selected: false
      })) || [];

      setBarbers(formattedBarbers);
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBarbers();
  }, []);

  useEffect(() => {
    const sum = services.reduce((acc, item) => item.selected ? acc + item.value : acc, 0);
    setTotal(sum);
    setHasSelected(services.some(service => service.selected));
  }, [services]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(profileData);
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const loadBarberSchedules = async () => {
      if (!selectedBarber) return;

      try {
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('barber_schedules')
          .select('*')
          .eq('barber_id', selectedBarber);

        if (scheduleError) throw scheduleError;

        const schedulesByDay = {};
        // Inicializar todos os dias da semana como inativos (0-6)
        for (let i = 0; i <= 6; i++) { 
          schedulesByDay[i] = {
            is_active: false,
            start_time: '00:00',
            end_time: '00:00'
          };
        }

        // Atualizar apenas os dias que o barbeiro trabalha
        scheduleData?.forEach(schedule => {
          schedulesByDay[schedule.day_of_week] = {
            is_active: schedule.is_active,
            start_time: schedule.start_time,
            end_time: schedule.end_time
          };
        });

        setBarberSchedules(schedulesByDay);
        setIsBarberSchedulesLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        setIsBarberSchedulesLoaded(true);
      }
    };

    loadBarberSchedules();
  }, [selectedBarber]);

  const isDayAvailable = (date: Date) => {
    if (!selectedBarber) return false;

    const dayOfWeek = date.getDay();
    // Sem ajuste necessário, já está no formato correto (0-6)
    const schedule = barberSchedules[dayOfWeek];
    
    return schedule?.is_active ?? false;
  };

  const renderTimes = () => {
    if (!selectedBarber) return null;

    const dayOfWeek = selectedDate.getDay();
    // Sem ajuste necessário, já está no formato correto (0-6)
    const schedule = barberSchedules[dayOfWeek];
    
    if (!schedule?.is_active) {
      return (
        <div className="text-center text-gray-600 py-4">
          Sem horários disponíveis neste dia
        </div>
      );
    }

    const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
    const [endHour, endMinute] = schedule.end_time.split(':').map(Number);
    
    const times = [];
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      times.push(time);

      if (currentMinute === 30) {
        currentHour++;
        currentMinute = 0;
      } else {
        currentMinute = 30;
      }
    }

    return (
      <div className="grid grid-cols-4 gap-2 text-center text-black text-sm mb-4">
        {times.map((time) => {
          const isSelected = selectedTime === time;

          return (
            <div
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`rounded-full py-2 px-3 cursor-pointer transition whitespace-nowrap text-white text-sm text-center ${
                isSelected
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-[#1f1f29] hover:bg-amber-500'
              }`}
            >
              {time}
            </div>
          );
        })}
      </div>
    );
  };

  const toggleService = (index) => {
    const updated = [...services];
    updated[index].selected = !updated[index].selected;
    setServices(updated);
  };

  const toggleBarber = (index) => {
    const updated = barbers.map((barber, i) => ({
      ...barber,
      selected: i === index ? !barber.selected : false,
    }));
    setBarbers(updated);
  };

  const hasSelectedBarber = barbers.some(b => b.selected);

  const handleFinalizar = () => {
    setActiveTab(TAB_SUMMARY);
  };

  const canShowSummary = selectedDate && selectedTime;

  const handleBarberSelect = (barberId: string) => {
    setSelectedBarber(barberId);
    setBarbers(barbers.map(barber => ({
      ...barber,
      selected: barber.id === barberId ? true : false
    })));
  };

  const renderContent = () => {
    if (activeTab === TAB_SUMMARY) {
      return (
        <div className="bg-[#2a2a38] p-4 rounded-xl text-white text-sm h-full flex flex-col">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Resumo do Agendamento</h2>
            <div className="bg-amber-500 w-16 h-1 mx-auto"></div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none md:scrollbar-thin md:scrollbar-thumb-gray-600 md:scrollbar-track-transparent pr-2">
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3 className="font-semibold mb-2">Serviços Selecionados</h3>
                <div className="space-y-2">
                  {services
                    .filter(service => service.selected)
                    .map((service, index) => (
                      <div key={index} className="flex items-center justify-between bg-[#1f1f29] p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-amber-500">{service.icon}</div>
                          <span className="text-sm">{service.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-500 text-sm">{service.price}</span>
                          <button
                            onClick={() => {
                              const updated = [...services];
                              updated[index].selected = false;
                              setServices(updated);
                              setHasSelected(services.some(service => service.selected));
                            }}
                            className="p-1 text-gray-400 hover:text-amber-500 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold">Total</span>
                  <span className="text-amber-500 font-bold">R${total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="font-semibold mb-2">Barbeiro</h3>
                <div className="flex items-center bg-[#1f1f29] p-3 rounded-lg">
                  <div className="text-amber-500 mr-3">{barbers.find(b => b.selected)?.icon}</div>
                  <span className="text-sm">{barbers.find(b => b.selected)?.name}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="font-semibold mb-2">Data e Horário</h3>
                <div className="flex flex-col bg-[#1f1f29] p-3 rounded-lg">
                  <span className="text-sm">{selectedDate ? `${selectedDate.getDate()}/${new Date().toLocaleString('default', { month: 'long' })}/${new Date().getFullYear()}` : 'Data não selecionada'}</span>
                  <span className="text-sm mt-1">{selectedTime || 'Horário não selecionado'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => {
                setHasSelected(false);
                setServices(services.map(service => ({
                  ...service,
                  selected: false
                })));
                setBarbers(barbers.map(barber => ({
                  ...barber,
                  selected: false
                })));
                setSelectedDate(new Date());
                setSelectedTime(null);
                setActiveTab(TAB_SERVICES);
                window.location.href = '/confirmation';
              }}
              className="w-full font-bold text-sm py-3 rounded-full bg-amber-500 text-black hover:bg-amber-600 transition"
            >
              Agendar
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === TAB_SERVICES) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-4 pr-2 overflow-y-auto scrollbar-none md:scrollbar-thin md:scrollbar-thumb-gray-600 md:scrollbar-track-transparent">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() => toggleService(index)}
                className="flex items-center justify-between bg-[#2a2a38] p-4 rounded-xl mb-3 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-amber-500">{service.icon}</div>
                  <div>
                    <h2 className="font-bold text-sm">{service.name.toUpperCase()}</h2>
                    <p className="text-xs text-gray-400">{service.price}</p>
                  </div>
                </div>
                <div>
                  {service.selected ? (
                    <CheckCircle className="text-amber-500" />
                  ) : (
                    <PlusCircle className="text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              disabled={!hasSelected}
              onClick={() => hasSelected && setActiveTab(TAB_BARBERS)}
              className={`w-full font-bold text-sm py-3 rounded-full transition-colors duration-300 ${
                hasSelected ? 'bg-amber-500 text-black' : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              ESCOLHA O BARBEIRO
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === TAB_BARBERS) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-4 pr-2 overflow-y-auto scrollbar-none md:scrollbar-thin md:scrollbar-thumb-gray-600 md:scrollbar-track-transparent">
            {barbers.map((barber, index) => (
              <div
                key={index}
                onClick={() => handleBarberSelect(barber.id)}
                className="flex items-center justify-between bg-[#2a2a38] p-4 rounded-xl mb-3 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-amber-500">{barber.icon}</div>
                  <div>
                    <h2 className="font-bold text-sm">{barber.name.toUpperCase()}</h2>
                    <p className="text-xs text-gray-400">{barber.role}</p>
                  </div>
                </div>
                <div>
                  {barber.selected ? (
                    <CheckCircle className="text-amber-500" />
                  ) : (
                    <PlusCircle className="text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              disabled={!selectedBarber}
              onClick={() => {
                if (selectedBarber) {
                  setActiveTab(TAB_CALENDAR);
                }
              }}
              className={`w-full font-bold text-sm py-3 rounded-full transition-colors duration-300 ${
                selectedBarber ? 'bg-amber-500 text-black' : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              SELECIONAR DATA E HORA
            </button>
          </div>
        </div>
      );
    }
    if (activeTab === TAB_CALENDAR) {
      const today = new Date();
      const currentMonth = today.toLocaleString('default', { month: 'long' });
      const currentYear = today.getFullYear();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDay = startDate.getDay();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

      const calendarCells = [];
      for (let i = 0; i < startDay; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="text-gray-600"> </div>);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        const isToday = day === today.getDate();
        const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
        const isAvailable = isDayAvailable(date);

        calendarCells.push(
          <div
            key={day}
            onClick={() => {
              if (isAvailable) {
                setSelectedDate(date);
              }
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
              isSelected
                ? 'bg-green-600 text-white'
                : isToday
                  ? 'bg-amber-700 text-black'
                  : isAvailable
                    ? 'text-white hover:bg-amber-600 hover:text-black'
                    : 'text-gray-600'
            } ${!isAvailable ? 'cursor-not-allowed' : ''}`}
          >
            {day}
          </div>
        );
      }

      return (
        <div className="bg-[#2a2a38] p-4 rounded-xl text-white text-sm h-full flex flex-col">
          <div className="mb-4">
            <div className="text-center font-bold text-base mb-4">
              {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-2 text-xs font-semibold">
              {selectedBarber ? (
                ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((dayName, index) => {
                  const isDayAvailable = barberSchedules[index]?.is_active;
                  
                  return (
                    <div 
                      key={dayName}
                      className={`px-1 py-0.5 rounded ${
                        isDayAvailable ? 'bg-amber-500 text-black' : 'bg-gray-600 text-white'
                      }`}
                    >
                      {dayName}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-7 text-center text-gray-600 py-4">
                  Selecione um barbeiro para ver os horários disponíveis
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 overflow-y-auto scrollbar-none md:scrollbar-thin md:scrollbar-thumb-gray-600 md:scrollbar-track-transparent">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {calendarCells}
              </div>
            </div>
          </div>
          {selectedDate && (
            <div className="mt-auto">
              <button
                onClick={() => setActiveTab(TAB_TIMES)}
                className="w-full font-bold text-sm py-3 rounded-full bg-amber-500 text-black hover:bg-amber-600 transition"
              >
                SELECIONAR HORÁRIO
              </button>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === TAB_TIMES) {
      return (
        <div className="bg-[#2a2a38] p-4 rounded-xl text-white text-sm h-full flex flex-col">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">Dia selecionado:</p>
                <p className="text-lg font-bold">{selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setActiveTab(TAB_CALENDAR);
                }}
                className="text-gray-400 hover:text-amber-500 transition"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 overflow-y-auto scrollbar-none md:scrollbar-thin md:scrollbar-thumb-gray-600 md:scrollbar-track-transparent">
              <div className="space-y-2">
                <p className="text-center text-sm font-bold mb-2">Horários disponíveis:</p>
                {renderTimes()}
              </div>
            </div>
          </div>
          {selectedTime && (
            <div className="mt-auto">
              <button
                onClick={handleFinalizar}
                className="w-full font-bold text-sm py-3 rounded-full bg-amber-500 text-black hover:bg-amber-600 transition"
              >
                FINALIZAR
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const isMobileChrome = typeof navigator !== 'undefined' && 
    /Chrome/.test(navigator.userAgent) && 
    /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div 
        className={`fixed inset-0 bg-[#1f1f29] p-6 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl ${isMobileChrome ? 'mt-[60px]' : ''}`}
      >
        {activeTab === TAB_SERVICES && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-lg text-amber-500 font-semibold">Bem-vindo</p>
              <h1 className="text-xl font-bold">{profile?.name || 'Usuário'}</h1>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={async () => {
                  try {
                    // Sign out from Supabase
                    await supabase.auth.signOut();
                    // Clear any local storage if needed
                    localStorage.removeItem('supabase.auth.token');
                    // Redirect to login page
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Error during logout:', error);
                    window.location.href = '/login';
                  }
                }}
                className="p-1.5 bg-transparent hover:bg-red-500 hover:text-white rounded-full transition-colors duration-200"
              >
                <Power className="text-red-500" size={18} />
              </button>
              <div className="text-right">
                <p className="text-sm text-amber-400">Total: R${total.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between bg-[#2a2a38] rounded-full p-1 mb-4">
          {[
            TAB_SERVICES,
            TAB_BARBERS,
            TAB_CALENDAR,
            TAB_TIMES,
            ...(canShowSummary ? [TAB_SUMMARY] : [])
          ].map(tab => (
            <button
              key={tab}
              onClick={() => {
                if (tab === TAB_BARBERS && !hasSelected) return;
                if (tab === TAB_CALENDAR && !hasSelectedBarber) return;
                if (tab === TAB_TIMES && !selectedDate) return;
                setActiveTab(tab);
              }}
              className={`flex-1 py-2 rounded-full text-[0.7rem] font-bold ${
                activeTab === tab ? 'bg-amber-500 text-black' : 'text-white'
              }`}
            >
              {tab === TAB_SERVICES ? 'SERVIÇOS' :
               tab === TAB_BARBERS ? 'BARBEIROS' :
               tab === TAB_CALENDAR ? 'DATA' :
               tab === TAB_TIMES ? 'HORÁRIOS' :
               'RESUMO'}
            </button>
          ))}
        </div>

        {activeTab === TAB_CALENDAR || activeTab === TAB_TIMES ? (
          <div className="flex-1">
            {renderContent()}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Se não estiver logado, redireciona para o login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Verifica se é admin e redireciona
    if (!loading && user) {
      const fetchUserRole = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar perfil do usuário:', error);
          return;
        }

        // Se for admin, redireciona para /dashboard
        if (profile?.is_admin) {
          router.push('/dashboard');
        }
        // Se não for admin, mantém na página inicial
        else {
          router.push('/');
        }
      };

      fetchUserRole();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return <MainContent />;
}
