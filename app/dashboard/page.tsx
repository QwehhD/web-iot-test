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
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) setLogs(data);
    };

    fetchInitialData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sensor_logs' },
        (payload) => {
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

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  // Fungsi untuk update warna RGB ke database
  const handleColorChange = async (hex: string) => {
    // Konversi HEX ke RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    setIsUpdating(true);
    const { error } = await supabase
      .from('sensor_logs')
      .update({ red_val: r, green_val: g, blue_val: b })
      .eq('id', 1); // Asumsi sensor ID 1 adalah unit ESP32 kamu

    if (error) console.error("Gagal update warna:", error.message);
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-3xl mx-auto">
        
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
              SMK TELKOM MALANG // 2026
            </p>
          </div>
        </header>

        <div className="grid gap-4 mb-12">
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
                <span className="text-7xl font-black tabular-nums transition-all duration-500 ease-out group-hover:text-cyan-400">
                  {log.value}
                </span>
                <span className="text-xl font-bold text-slate-700">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* --- KONTROL RGB LED --- */}
        <div className="bg-slate-900/80 border border-cyan-500/20 p-8 rounded-[2.5rem] backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight uppercase">Room Lighting Control</h3>
            {isUpdating && <span className="text-[10px] text-cyan-400 animate-pulse uppercase font-mono">Syncing...</span>}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input 
                type="color" 
                className="w-24 h-24 rounded-full bg-transparent cursor-pointer border-4 border-slate-800 transition-transform hover:scale-105"
                defaultValue="#00ffff"
                onChange={(e) => handleColorChange(e.target.value)}
              />
              <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl -z-10 group-hover:bg-cyan-500/40 transition-all"></div>
            </div>
            
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-2">Pilih warna untuk mengubah suasana ruangan secara realtime.</p>
              <div className="flex gap-2">
                {['#ff0000', '#00ff00', '#0000ff', '#ffffff'].map((color) => (
                  <button 
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-8 h-8 rounded-lg border border-white/10 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 opacity-20 hover:opacity-100 transition-opacity text-center pb-12">
          <p className="text-[9px] uppercase tracking-[0.5em] text-slate-500">
            Realtime Data via Supabase Walrus Engine
          </p>
        </footer>
      </div>
    </div>
  );
}