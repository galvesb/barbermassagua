import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function registerUser({ email, password, name }: { email: string; password: string; name: string }) {
  // Primeiro, cria o usuário
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })

  if (authError) throw authError

  // Agora cria o perfil do usuário
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user?.id,
      name
    })

  if (profileError) throw profileError

  return authData
}

export async function login({ email, password }: { email: string; password: string }) {
  console.log('Iniciando processo de login...');
  
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Erro no login:', error);
    throw error;
  }

  if (!session) {
    console.error('Sessão não criada após login bem-sucedido');
    throw new Error('Erro ao criar sessão');
  }

  console.log('Login bem-sucedido, sessão criada');
  return session;
}
