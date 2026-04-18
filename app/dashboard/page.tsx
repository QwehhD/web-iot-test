"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
      timeout: 30000, // Kita kasih waktu napas lebih lama (30 detik)
    }
  }
);

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    // 1. Ambil Data Awal
    const getData = async () => {
      const { data } = await supabase.from('sensor_logs').select('*').order('id', { ascending: true });
      if (data) setLogs(data);
    };
    getData();

    // 2. Setup Realtime
    const channel = supabase
      .channel('db_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sensor_logs' }, 
        (payload) => {
          console.log("Change received!", payload);
          if (payload.eventType === 'UPDATE') {
            setLogs((prev) => prev.map(item => item.id === payload.new.id ? payload.new : item));
          } else if (payload.eventType === 'INSERT') {
            setLogs((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe((status) => {
        setStatus(status);
        console.log("Realtime status:", status);
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-cyan-400">DASHBOARD_IO</h1>
            <p className="text-slate-500 text-xs mt-1">Status: <span className={status === 'SUBSCRIBED' ? 'text-green-500' : 'text-red-500'}>{status}</span></p>
          </div>
          <div className="text-right text-[10px] text-slate-700 font-mono">
            SMK TELKOM MALANG // 2026
          </div>
        </div>

        <div className="grid gap-6">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex justify-between items-center backdrop-blur-sm shadow-2xl shadow-cyan-500/5">
              <div>
                <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest">{log.sensor_type}</h2>
                <p className="text-slate-600 text-[10px] mt-1 font-mono">ID: {log.id} // LAST_UPDATE: {new Date(log.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-7xl font-black tabular-nums tracking-tighter">{log.value}</span>
                <span className="text-cyan-600 font-bold ml-2">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}