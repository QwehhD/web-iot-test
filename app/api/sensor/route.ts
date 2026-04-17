import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    // 2. Validasi API Key (Gembok)
    const apiKey = request.headers.get('x-api-key')
    
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Akses ditolak: Key tidak valid" }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, val } = body

    const { error } = await supabase
      .from('sensor_logs')
      .insert([{ sensor_type: type, value: val }])

    if (error) throw error

    return NextResponse.json({ message: "Data berhasil masuk!" }, { status: 200 })

  } catch (err: any) {
    
    return NextResponse.json(
      { message: "Terjadi kesalahan internal", error: err.message }, 
      { status: 500 }
    )
  }
}