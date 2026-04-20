"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("Connecting...");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 1. Ambil Data Awal dari Supabase
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) console.error("Supabase Error:", error);
      if (data) {
        console.log("Data Awal Supabase:", data);
        setLogs(data);
      }
    };
    fetchInitialData();

    // 2. Koneksi MQTT
    const mqttClient = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_URL!, {
      username: process.env.NEXT_PUBLIC_MQTT_USER,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
      clientId: `nextjs_client_${Math.random().toString(16).slice(3)}`,
      clean: true,
      connectTimeout: 10000,
      reconnectPeriod: 1000,
    });

    mqttClient.on("connect", () => {
      console.log("✅ MQTT Connected!");
      setStatus("SUBSCRIBED");
      mqttClient.subscribe("monitor/sensor/pot");
    });

    mqttClient.on("error", (err) => {
      console.error("❌ MQTT Connection Error:", err);
      setStatus("ERROR");
    });

    // 3. Logika Terima Pesan - DIPERBAIKI
    mqttClient.on("message", (topic, message) => {
      const rawPayload = message.toString();
      console.log(`📩 Pesan masuk di [${topic}]:`, rawPayload);

      if (topic === "monitor/sensor/pot") {
        try {
          const data = JSON.parse(rawPayload);
          
          setLogs((prev) => {
            return prev.map((item) => {
              // Pakai .toLowerCase() & .trim() supaya aman dari salah ketik di database
              const dbSensorType = (item.sensor_type || "").toLowerCase().trim();
              if (dbSensorType === "potentiometer") {
                console.log("🎯 Match! Mengupdate UI ke:", data.value);
                return { ...item, value: data.value };
              }
              return item;
            });
          });
        } catch (e) {
          console.error("⚠️ Format pesan bukan JSON valid:", rawPayload);
        }
      }
    });

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  const handleColorChange = async (hex: string) => {
    if (!hex.startsWith('#')) return;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    setIsUpdating(true);
    
    try {
      // PERINGATAN: Pastikan API Route kamu sudah menggunakan 
      // variabel env TANPA NEXT_PUBLIC_ agar tidak Error 500
      const res = await fetch("/api/mqtt/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "monitor/actuator/rgb",
          message: { red_val: r, green_val: g, blue_val: b }
        }),
      });
      
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);
      console.log("✅ RGB Published successfully");
    } catch (error) {
      console.error("❌ RGB Publish Error:", error);
    } finally {
      setIsUpdating(false);
    }
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
        </header>

        <div className="grid gap-4 mb-12">
          {logs.length === 0 ? (
            <p className="text-slate-500 font-mono text-xs">Loading sensors from database...</p>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className="group bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center transition-all hover:bg-slate-900 hover:border-cyan-500/50"
              >
                <div>
                  <p className="text-cyan-500 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
                    Channel 0{log.id}
                  </p>
                  <h2 className="text-2xl font-bold text-slate-300 uppercase tracking-tight">
                    {log.sensor_type || "Unknown Unit"}
                  </h2>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black tabular-nums transition-all duration-500 ease-out group-hover:text-cyan-400">
                    {log.value ?? 0}
                  </span>
                  <span className="text-xl font-bold text-slate-700">%</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-900/80 border border-cyan-500/20 p-8 rounded-[2.5rem] backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold tracking-tight uppercase">Room Lighting Control</h3>
            {isUpdating && <span className="text-[10px] text-cyan-400 animate-pulse uppercase font-mono">Syncing...</span>}
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input 
                type="color" 
                className="w-24 h-24 rounded-full bg-transparent cursor-pointer border-4 border-slate-800 transition-transform hover:scale-105 overflow-hidden"
                defaultValue="#00ffff"
                onInput={(e) => handleColorChange((e.target as HTMLInputElement).value)}
              />
              <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl -z-10 group-hover:bg-cyan-500/40 transition-all"></div>
            </div>
            
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-2">Pilih warna untuk mengubah suasana ruangan secara realtime.</p>
              <div className="flex gap-2 flex-wrap">
                {['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#ffa500'].map((color) => (
                  <button 
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-8 h-8 rounded-lg border border-white/10 hover:scale-110 active:scale-95 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 opacity-20 hover:opacity-100 transition-opacity text-center pb-12">
          <p className="text-[9px] uppercase tracking-[0.5em] text-slate-500">
            Realtime Data via MQTT WebSocket Engine
          </p>
        </footer>
      </div>
    </div>
  );
}