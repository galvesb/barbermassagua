'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Trash2, X, User, Phone } from 'lucide-react';
import { useAuth } from '../../../lib/useAuth';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabaseClient';

export default function DeleteBarber() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [barberData, setBarberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch barber data
  const fetchBarber = async () => {
    try {
      const profileId = searchParams.get('id');
      if (!profileId) {
        setError('ID do barbeiro não encontrado');
        console.error('ID do barbeiro não fornecido na URL');
        return;
      }

      console.log('Fetching barber with profile_id:', profileId);

      // First get barber data using profile_id
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (barberError) {
        console.error('Error fetching barber:', barberError);
        if (barberError.code === 'PGRST116') {
          setError('Barbeiro não encontrado com este ID');
        } else {
          setError('Erro ao carregar barbeiro');
        }
        return;
      }

      console.log('Barber data found:', {
        id: barberData.id,
        profile_id: barberData.profile_id,
        name: barberData.name
      });

      // Then get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Erro ao carregar perfil do barbeiro');
        return;
      }

      console.log('Profile data found:', {
        id: profileData.id,
        name: profileData.name
      });

      setBarberData({ ...barberData, ...profileData });
    } catch (error) {
      console.error('Error in fetchBarber:', error);
      setError('Erro ao carregar barbeiro');
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check if user is admin
  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Erro ao verificar perfil:', error);
            router.push('/');
          } else if (!profile?.is_admin) {
            router.push('/');
          }
        } catch (error) {
          console.error('Erro ao verificar admin:', error);
          router.push('/');
        }
      };

      checkAdmin();
    }
  }, [user, router]);

  // Fetch barber data when search params change
  useEffect(() => {
    fetchBarber();
  }, [searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleCancel = () => {
    router.push('/barbers/list');
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');

      if (!barberData) throw new Error('Barbeiro não encontrado');

      console.log('Attempting to delete with:', {
        barberId: barberData.id,
        profileId: barberData.profile_id,
        barberName: barberData.name
      });

      // 1. Delete profile (cascade will handle barbers and schedules)
      const { data: profileDataDeleted, error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', barberData.profile_id)
        .select();

      if (profileError) throw new Error(`Erro ao deletar perfil: ${profileError.message}`);
      console.log('Perfil deletado:', profileDataDeleted?.length);

      setSuccess(true);
      setTimeout(() => router.push('/barbers/list'), 1000);
    } catch (err) {
      console.error('Erro completo:', err);
      setError(err.message || 'Erro ao excluir barbeiro');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2a2a38] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[#1f1f29] p-8 text-white flex flex-col sm:max-w-sm sm:h-[75vh] sm:rounded-3xl sm:fixed sm:inset-0 sm:mx-auto sm:my-auto md:rounded-3xl">
        <div className="flex flex-col items-center mb-6">
          <div className="flex w-full items-center mb-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              <ArrowLeft className="text-amber-500" size={20} />
            </button>
            <div className="flex-1 flex justify-center items-center">
              {success ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="text-green-500 w-12 h-12" />
                    </div>
                  </div>
                  <p className="text-sm text-green-400 font-semibold">
                    Barbeiro excluído com sucesso!</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-500/30 flex items-center justify-center">
                        <Trash2 className="text-red-500 w-10 h-10" />
                      </div>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Excluir Barbeiro</h1>
                  <div className="text-gray-400 text-center max-w-md">
                    <p className="mb-2">
                      <span className="font-medium">Atenção!</span> Esta ação não pode ser desfeita.
                    </p>
                    <p className="text-sm">
                      Tem certeza que deseja excluir este barbeiro?
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/10 p-3 rounded-lg mb-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {!success && barberData && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-[#3a3a48] rounded-2xl p-6 w-full">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <User className="text-amber-500" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium mb-1">{barberData.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone className="text-amber-500" size={16} />
                    <span>{barberData.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3.5 px-5 bg-gray-600/50 rounded-2xl hover:bg-gray-600 transition-colors text-white font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 px-5 bg-red-500/50 rounded-2xl hover:bg-red-500 transition-colors text-white font-medium text-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Excluindo...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Excluir</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
