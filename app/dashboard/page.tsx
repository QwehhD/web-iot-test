"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Inisialisasi Supabase dengan config tambahan untuk stabilitas realtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    }
  }
);

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    // 1. Ambil data awal saat pertama kali load
    const fetchInitialData = async () => {
      console.log("Mengambil data awal...");
      const { data, error } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("Gagal ambil data awal:", error.message);
      } else if (data) {
        setLogs(data);
      }
    };

    fetchInitialData();

    // 2. Setup Realtime Listener
    // Kita kasih nama channel unik 'iot_monitor'
    const channel = supabase
      .channel('iot_monitor')
      .on(
        'postgres_changes',
        { 
          event: '*', // Menangkap INSERT, UPDATE, dan DELETE
          schema: 'public', 
          table: 'sensor_logs' 
        },
        (payload) => {
          console.log('ADA SINYAL MASUK DARI DATABASE:', payload);

          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const dataBaru = payload.new;
            
            setLogs((prev) => {
              // Cek apakah ID data yang masuk sudah ada di layar?
              const isExist = prev.find(item => item.id === dataBaru.id);

              if (isExist) {
                // Jika sudah ada (UPDATE), ganti baris yang lama dengan yang baru
                return prev.map((item) => 
                  item.id === dataBaru.id ? { ...item, ...dataBaru } : item
                );
              } else {
                // Jika ID baru (INSERT), tambahkan ke daftar
                return [...prev, dataBaru];
              }
            });
          }
        }
      )
      .subscribe((status) => {
        setStatus(status);
        console.log("Status Koneksi Realtime:", status);
      });

    // Cleanup saat user pindah halaman atau refresh
    return () => {
      console.log("Menutup koneksi realtime...");
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              IOT_<span className="text-cyan-400">DASHBOARD</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-2 rounded-full ${status === 'SUBSCRIBED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Network Status: <span className={status === 'SUBSCRIBED' ? 'text-green-400' : 'text-red-400'}>{status}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-700 text-[10px] font-bold tracking-widest uppercase">
              SMK Telkom Malang // Student Project
            </p>
          </div>
        </header>

        {/* Monitoring Cards */}
        <div className="grid gap-6">
          {logs.length === 0 ? (
            <div className="p-10 border-2 border-dashed border-slate-800 rounded-3xl text-center">
              <p className="text-slate-600 animate-pulse">Menunggu data dari database...</p>
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] flex justify-between items-center transition-all hover:border-cyan-500/30 hover:bg-slate-900/60 shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 text-[10px] font-bold border border-cyan-500/20 uppercase">
                      ID: {log.id}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-200 uppercase tracking-tight">
                    {log.sensor_type || "Unknown Sensor"}
                  </h2>
                  <p className="text-slate-600 text-[10px] mt-2 font-mono">
                    SYNC_TIME: {new Date(log.created_at).toLocaleTimeString('id-ID')}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-7xl font-black tabular-nums text-white group-hover:text-cyan-400 transition-colors">
                    {log.value}
                  </span>
                  <span className="text-xl font-bold text-slate-700">%</span>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="mt-12 text-center text-slate-700 text-[9px] uppercase tracking-[0.2em]">
          Data terupdate secara otomatis melalui Supabase Realtime Engine
        </footer>
      </div>
    </div>
  );
}