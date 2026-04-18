"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

// Inisialisasi Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil data awal
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: true }); // Urutkan berdasarkan ID saja

      if (!error && data) {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchInitialData();

    // 2. Setup Realtime Listener untuk UPDATE
    const channel = supabase
      .channel('realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Menangkap INSERT, UPDATE, maupun DELETE
          schema: 'public',
          table: 'sensor_logs',
        },
        (payload) => {
          console.log('Perubahan terdeteksi:', payload);

          if (payload.eventType === 'INSERT') {
            // Jika ada data baru, tambahkan ke list
            setLogs((prev) => [payload.new, ...prev]);
          } 
          else if (payload.eventType === 'UPDATE') {
            // Jika data di-update, cari ID yang cocok dan ganti nilainya
            setLogs((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-950 items-center justify-center text-cyan-500">
      <p className="animate-bounce">Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="p-8 font-sans bg-slate-950 min-h-screen text-white">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Smart <span className="text-cyan-400">Monitor</span>
            </h1>
            <p className="text-slate-500 text-sm">Update Mode: Enabled</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-green-500 uppercase">Live Connection</span>
          </div>
        </header>

        <div className="grid gap-4">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center hover:border-cyan-500/50 transition-all shadow-lg"
            >
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
                  Sensor ID: {log.id}
                </p>
                <h2 className="text-xl font-bold text-slate-200">{log.sensor_type}</h2>
                <p className="text-[10px] text-slate-600 mt-2">
                  Last Sync: {new Date(log.created_at).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="text-right">
                <span className="text-5xl font-black text-cyan-400 tabular-nums">
                  {log.value}
                </span>
                <span className="text-cyan-900 ml-1 font-bold">%</span>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-600 text-sm">Tidak ada baris data ditemukan di database.</p>
            <p className="text-slate-700 text-xs mt-1">Pastikan ID 1 sudah dibuat secara manual.</p>
          </div>
        )}
      </div>
    </div>
  );
}