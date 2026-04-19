import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let name = searchParams.get('name');

  if (name && name.startsWith('eq.')) {
    name = name.split('.')[1];
  }

  const { data, error } = await supabase
    .from('actuators')
    .select('*')
    .eq('name', name);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  let name = searchParams.get('name');
  const body = await request.json();

  if (name && name.startsWith('eq.')) {
    name = name.split('.')[1];
  }

  const { data, error } = await supabase
    .from('actuators')
    .update(body)
    .eq('name', name)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data);
}