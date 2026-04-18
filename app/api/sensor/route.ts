import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const isAuthorized = (req: Request) => {
  const apiKey = req.headers.get('x-api-key')
  return apiKey === process.env.API_KEY
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 401 })
    }

    const { type, val } = await request.json()

    const { error } = await supabase
      .from('sensor_logs')
      .insert([{ sensor_type: type, value: val }])

    if (error) throw error
    return NextResponse.json({ message: "Data baru berhasil masuk!" }, { status: 200 })

  } catch (err: any) {
    return NextResponse.json({ message: "Gagal POST", error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    
    const id = idParam ? idParam.replace('eq.', '') : null

    if (!id) {
      return NextResponse.json({ message: "ID tidak ditemukan di URL" }, { status: 400 })
    }

    const { value } = await request.json()

    const { error } = await supabase
      .from('sensor_logs')
      .update({ value: value })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ message: "Data berhasil di-update!" }, { status: 200 })

  } catch (err: any) {
    return NextResponse.json({ message: "Gagal PATCH", error: err.message }, { status: 500 })
  }
}