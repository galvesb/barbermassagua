import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isHomePage = request.nextUrl.pathname === '/';

  // Se estiver na página de login e já estiver logado, redireciona para home
  if (isLoginPage) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Não precisamos verificar a sessão na página inicial, isso é feito na página principal
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
