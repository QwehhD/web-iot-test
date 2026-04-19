"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    // 1. Ambil data awal
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) setLogs(data);
    };

    fetchInitialData();

    // 2. Setup Realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sensor_logs' },
        (payload) => {
          // Log ini tetap ada buat jaga-jaga kalau mau cek data di F12
          console.log('Update diterima:', payload.new);

          setLogs((prev) => 
            prev.map((item) => 
              item.id === payload.new.id ? { ...item, ...payload.new } : item
            )
          );
        }
      )
      .subscribe((status) => {
        setStatus(status);
      });

    // Cleanup: Matikan semua koneksi saat pindah halaman
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto">
        
        {/* Header - Lebih Clean */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`h-2 w-2 rounded-full ${status === 'SUBSCRIBED' ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
                {status === 'SUBSCRIBED' ? 'System Live' : 'System Offline'}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic">
              DASHBOARD<span className="text-cyan-400 not-italic">_IO</span>
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-700 text-[10px] font-bold tracking-widest uppercase">
              Malang // {new Date().getFullYear()}
            </p>
          </div>
        </header>

        {/* List Sensor */}
        <div className="grid gap-4">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="group bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center transition-all hover:bg-slate-900 hover:border-cyan-500/50"
            >
              <div>
                <p className="text-cyan-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
                  Channel 0{log.id}
                </p>
                <h2 className="text-2xl font-bold text-slate-300 uppercase tracking-tight">
                  {log.sensor_type || "Sensor Unit"}
                </h2>
              </div>

              <div className="flex items-baseline gap-2">
                {/* Efek transisi halus saat angka berubah */}
                <span className="text-7xl font-black tabular-nums transition-all duration-500 ease-out group-hover:text-cyan-400">
                  {log.value}
                </span>
                <span className="text-xl font-bold text-slate-700">%</span>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-20 opacity-20 hover:opacity-100 transition-opacity text-center">
          <p className="text-[9px] uppercase tracking-[0.5em] text-slate-500">
            Realtime Data via Supabase Walrus Engine
          </p>
        </footer>
      </div>
    </div>
  );
}