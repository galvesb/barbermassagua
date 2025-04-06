'use client';

import React, { useState, useRef, useEffect } from "react";
import { Menu, Scissors, CheckCircle, PlusCircle, SprayCan, User, Brush, ChevronLeft, ChevronRight, Wand2, Bath, Smile, ChevronUp, ChevronDown, X } from "lucide-react";

const initialServices = [
  { name: "Corte de Cabelo", price: "R$40,00", value: 40, icon: <Scissors />, selected: false },
  { name: "Barbear", price: "R$25,00", value: 25, icon: <SprayCan />, selected: true },
  { name: "Tratamento", price: "R$35,00", value: 35, icon: <SprayCan />, selected: false },
  { name: "Cuidado com a Barba", price: "R$30,00", value: 30, icon: <User />, selected: false },
  { name: "Estilo de Cabelo", price: "R$45,00", value: 45, icon: <Brush />, selected: false },
  { name: "Limpeza Facial", price: "R$50,00", value: 50, icon: <Smile />, selected: false },
  { name: "Massagem", price: "R$60,00", value: 60, icon: <Bath />, selected: false },
  { name: "Finalização", price: "R$20,00", value: 20, icon: <Wand2 />, selected: false },
];

const initialBarbers = [
  { name: "Carlos Oliveira", role: "Especialista em cortes", icon: <User />, selected: false },
  { name: "Marcos Silva", role: "Barbeiro tradicional", icon: <User />, selected: false },
  { name: "João Souza", role: "Fade e navalhado", icon: <User />, selected: false },
  { name: "Pedro Lima", role: "Designer de barba", icon: <User />, selected: false },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("SERVIÇOS");
  const [services, setServices] = useState(initialServices);
  const [barbers, setBarbers] = useState(initialBarbers);
  const [total, setTotal] = useState(0);
  const [hasSelected, setHasSelected] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const sum = services.reduce((acc, item) => item.selected ? acc + item.value : acc, 0);
    setTotal(sum);
    setHasSelected(services.some(service => service.selected));
  }, [services]);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Check if it's mobile
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    }

    // Cleanup on unmount
    return () => {
      body.style.overflow = '';
      html.style.overflow = '';
    };
  }, []);

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
    setActiveTab("RESUMO");
  };

  const canShowSummary = selectedDay && selectedHour;

  const renderContent = () => {
    if (activeTab === "RESUMO") {
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
                  <span className="text-sm">{selectedDay ? `${selectedDay}/${new Date().toLocaleString('default', { month: 'long' })}/${new Date().getFullYear()}` : 'Data não selecionada'}</span>
                  <span className="text-sm mt-1">{selectedHour || 'Horário não selecionado'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => {
                setActiveTab("SERVIÇOS");
                setHasSelected(false);
                setServices(initialServices);
                setBarbers(initialBarbers);
                setSelectedDay(null);
                setSelectedHour(null);
              }}
              className="w-full font-bold text-sm py-3 rounded-full bg-amber-500 text-black hover:bg-amber-600 transition"
            >
              Agendar
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "SERVIÇOS") {
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
              onClick={() => hasSelected && setActiveTab("BARBEIROS")}
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

    if (activeTab === "BARBEIROS") {
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-4 pr-2 overflow-y-auto scrollbar-none md:scrollbar-thin md:scrollbar-thumb-gray-600 md:scrollbar-track-transparent">
            {barbers.map((barber, index) => (
              <div
                key={index}
                onClick={() => toggleBarber(index)}
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
              disabled={!hasSelectedBarber}
              onClick={() => hasSelectedBarber && setActiveTab("CALENDÁRIO")}
              className={`w-full font-bold text-sm py-3 rounded-full transition-colors duration-300 ${
                hasSelectedBarber ? 'bg-amber-500 text-black' : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              AGENDAR
            </button>
          </div>
        </div>
      );
    }
    if (activeTab === "CALENDÁRIO") {
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
        const isToday = day === today.getDate();
        calendarCells.push(
          <div
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
              selectedDay === day ? 'bg-green-600 text-white' : isToday ? 'bg-amber-700 text-black' : 'text-white hover:bg-amber-600 hover:text-black'
            }`}
          >
            {day}
          </div>
        );
      }

      return (
        <div className="bg-[#2a2a38] p-4 rounded-xl text-white text-sm h-full flex flex-col">
          <div className="text-center font-bold text-base mb-4">
            {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-amber-500 mb-2 text-xs font-semibold">
            <div>DOM</div><div>SEG</div><div>TER</div><div>QUA</div><div>QUI</div><div>SEX</div><div>SAB</div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {calendarCells}
          </div>

          {selectedDay && (
            <>
              <p className="text-center text-sm font-bold mb-2">Horários disponíveis:</p>
              <div className="grid grid-cols-4 gap-1 text-center text-black text-xs mb-4">
                {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((hour, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedHour(hour)}
                    className={`rounded-full py-1 px-2 cursor-pointer transition whitespace-nowrap text-white text-xs text-center ${
                      selectedHour === hour ? 'bg-green-600' : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    {hour}
                  </div>
                ))}
              </div>
              {selectedHour && (
                <button
                  onClick={handleFinalizar}
                  className="w-full font-bold text-sm py-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                >
                  FINALIZAR
                </button>
              )}
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-[80vh] bg-[#1f1f29] rounded-3xl p-6 text-white flex flex-col -mt-20">
        {showSummary ? (
          renderContent()
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-lg text-amber-500 font-semibold">Bem-vindo</p>
                <h1 className="text-xl font-bold">Guilherme!</h1>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-400">Total: R${total.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            <div className="flex justify-between bg-[#2a2a38] rounded-full p-1 mb-4">
              {[
                "SERVIÇOS",
                "BARBEIROS",
                "CALENDÁRIO",
                ...(canShowSummary ? ["RESUMO"] : [])
              ].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "BARBEIROS" && !hasSelected) return;
                    if (tab === "CALENDÁRIO" && !hasSelectedBarber) return;
                    setActiveTab(tab);
                  }}
                  className={`flex-1 py-2 rounded-full text-xs font-bold ${
                    activeTab === tab ? 'bg-amber-500 text-black' : 'text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              {renderContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
